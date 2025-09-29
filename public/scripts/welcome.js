        class StudentValidator {
            constructor() {
                this.form = document.getElementById('studentForm');
                this.nameInput = document.getElementById('studentName');
                this.gradeSelect = document.getElementById('gradeLevel');
                this.submitBtn = document.getElementById('submitBtn');
                this.buttonText = document.getElementById('buttonText');
                
                this.nameError = document.getElementById('nameError');
                this.gradeError = document.getElementById('gradeError');
                
                this.isValid = {
                    name: false,
                    grade: false
                };
                
                this.initializeEventListeners();
            }

            initializeEventListeners() {
                // Real-time validation
                this.nameInput.addEventListener('input', () => this.validateName());
                this.nameInput.addEventListener('blur', () => this.validateName());
                
                this.gradeSelect.addEventListener('change', () => this.validateGrade());
                this.gradeSelect.addEventListener('blur', () => this.validateGrade());
                
                // Form submission
                this.form.addEventListener('submit', (e) => this.handleSubmit(e));
                
                // Prevent spaces at the beginning of name
                this.nameInput.addEventListener('keydown', (e) => {
                    if (e.target.value === '' && e.code === 'Space') {
                        e.preventDefault();
                    }
                });
            }

            validateName() {
                const name = this.nameInput.value.trim();
                const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]+$/; // Arabic and English letters + spaces
                
                // Clear previous states
                this.nameInput.classList.remove('error', 'success');
                this.nameError.classList.remove('show');
                
                if (name === '') {
                    this.showError(this.nameInput, this.nameError, 'Name is required / الاسم مطلوب');
                    this.isValid.name = false;
                    return false;
                }
                
                if (name.length < 2) {
                    this.showError(this.nameInput, this.nameError, 'Name must be at least 2 characters / الاسم يجب أن يكون حرفين على الأقل');
                    this.isValid.name = false;
                    return false;
                }
                
                if (!nameRegex.test(name)) {
                    this.showError(this.nameInput, this.nameError, 'Name can only contain letters and spaces / الاسم يجب أن يحتوي على حروف ومسافات فقط');
                    this.isValid.name = false;
                    return false;
                }
                
                // Success state
                this.nameInput.classList.add('success');
                this.isValid.name = true;
                this.updateSubmitButton();
                return true;
            }

            validateGrade() {
                const grade = this.gradeSelect.value;
                
                // Clear previous states
                this.gradeSelect.classList.remove('error', 'success');
                this.gradeError.classList.remove('show');
                
                if (grade === '') {
                    this.showError(this.gradeSelect, this.gradeError, 'Please select your grade / يرجى اختيار صفك الدراسي');
                    this.isValid.grade = false;
                    return false;
                }
                
                // Success state
                this.gradeSelect.classList.add('success');
                this.isValid.grade = true;
                this.updateSubmitButton();
                return true;
            }

            showError(input, errorElement, message) {
                input.classList.add('error');
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }

            updateSubmitButton() {
                const allValid = this.isValid.name && this.isValid.grade;
                this.submitBtn.disabled = !allValid;
                
                if (allValid) {
                    this.submitBtn.style.opacity = '1';
                    this.submitBtn.style.cursor = 'pointer';
                } else {
                    this.submitBtn.style.opacity = '0.6';
                    this.submitBtn.style.cursor = 'not-allowed';
                }
            }

            async handleSubmit(e) {
                e.preventDefault();
                
                // Validate all fields
                const nameValid = this.validateName();
                const gradeValid = this.validateGrade();
                
                if (!nameValid || !gradeValid) {
                    return;
                }
                
                // Show loading state
                this.showLoadingState();
                
                try {
                    // Prepare student data
                    const studentData = {
                        name: this.nameInput.value.trim(),
                        grade: parseInt(this.gradeSelect.value),
                        registrationTime: new Date().toISOString()
                    };
                    
                    // Save to backend
                    await this.saveStudentData(studentData);
                    
                    // Save to local storage for game access
                    localStorage.setItem('currentStudent', JSON.stringify(studentData));
                    
                    // Show success animation
                    this.form.classList.add('form-success');
                    
                    // Navigate to game after delay
                    setTimeout(() => {
                        this.navigateToGame();
                    }, 1500);
                    
                } catch (error) {
                    console.error('Error saving student data:', error);
                    this.showError(this.submitBtn, this.gradeError, 'Connection error. Please try again / خطأ في الاتصال. يرجى المحاولة مرة أخرى');
                    this.hideLoadingState();
                }
            }

        async saveStudentData(studentData) {
    try {
        // Add API base URL
        const API_BASE_URL = 'https://quizznationaldayabhanschool-1.onrender.com/';
        
        const response = await fetch(`${API_BASE_URL}/api/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Student registered successfully:', result);
        
        // Store student ID for future reference
        studentData.id = result.data.studentId || result.data.student._id;
        localStorage.setItem('currentStudent', JSON.stringify(studentData));
        
    } catch (error) {
        // If backend is not available, continue with local storage only
        console.warn('Backend not available, using local storage only:', error);
    }
}

            showLoadingState() {
                this.submitBtn.disabled = true;
                this.buttonText.innerHTML = '<span class="loading"></span>Preparing your game...';
            }

            hideLoadingState() {
                this.submitBtn.disabled = false;
                this.buttonText.textContent = 'Start Playing / ابدأ اللعب';
            }

            navigateToGame() {
                // Check if flipGame.html exists, otherwise use current page integration
                window.location.href = 'flipGame.html';
            }
        }

        // Initialize the validator when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new StudentValidator();
            
            // Check if student is already registered
            const existingStudent = localStorage.getItem('currentStudent');
            if (existingStudent) {
                const student = JSON.parse(existingStudent);
                const welcomeHeader = document.querySelector('.welcome-header');
                welcomeHeader.innerHTML = `
                    <div class="flag-emoji">🇸🇦</div>
                    <h1 class="welcome-title">Welcome back, ${student.name}!</h1>
                    <div class="arabic-subtitle">أهلاً وسهلاً بك مرة أخرى ${student.name}</div>
                    <p class="welcome-subtitle">Grade ${student.grade} • Ready to continue your Saudi Vision 2030 journey?</p>
                    <button onclick="continueToGame()" class="submit-btn" style="margin-top: 20px; width: auto; padding: 12px 25px;">
                        Continue to Game / متابعة اللعبة
                    </button>
                    <button onclick="registerNewStudent()" style="background: transparent; border: 2px solid #006C35; color: #006C35; margin-top: 10px; width: auto; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: 600;">
                        Register Different Student
                    </button>
                `;
            }
        });

        // Helper functions for existing student
        function continueToGame() {
            window.location.href = 'flipGame.html';
        }

        function registerNewStudent() {
            localStorage.removeItem('currentStudent');
            location.reload();
        }

        // Add welcome message personalization
        function personalizeWelcome(studentName, grade) {
            const welcomeTitle = document.querySelector('.welcome-title');
            const arabicSubtitle = document.querySelector('.arabic-subtitle');
            
            welcomeTitle.textContent = `Welcome, ${studentName}!`;
            arabicSubtitle.textContent = `أهلاً وسهلاً بك ${studentName} - الصف ${grade}`;
        }