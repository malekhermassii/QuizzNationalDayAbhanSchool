        // Game state
        let gameBoard = document.getElementById('gameBoard');
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let score = 0;
        let gameTime = 0;
        let gameTimer;
        let gameStarted = false;

        // Saudi Vision 2030 themed cards with detailed descriptions
        const cardPairs = [
            {
                image: 'https://economysaudiarabia.com/wp-content/uploads/sites/2/2024/07/NEOM.jpg',
                title: 'NEOM Smart City',
                id: 'neom',
                description: 'NEOM is a $500 billion mega-city project in northwestern Saudi Arabia, spanning 26,500 square kilometers. This futuristic smart city aims to be powered entirely by renewable energy and will feature flying cars, artificial moons, and robot maids. As part of Saudi Vision 2030, NEOM represents the kingdom\'s commitment to innovation and sustainable development.'
            },
            {
                image: 'https://hoteletlodge.fr/wp-content/uploads/2023/02/habitas-alula-tanveer-badal-pool-13k%C2%A9-Tanveer-Badal-scaled.jpg',
                title: 'AlUla Heritage',
                id: 'alula',
                description: 'AlUla is a living museum in Saudi Arabia, home to ancient civilizations dating back over 200,000 years. This UNESCO World Heritage site features the spectacular Hegra (Mada\'in Salih), the largest preserved Nabatean city south of Petra. The region showcases Saudi Arabia\'s rich cultural heritage while becoming a world-class tourism destination.'
            },
            {
                image: 'https://saudipedia.com/fr/saudipediafr/uploads/images/2024/11/28/thumbs/600x600/120001.jpg',
                title: 'Red Sea Project',
                id: 'redsea',
                description: 'The Red Sea Project is a luxury tourism destination covering 28,000 square kilometers along Saudi Arabia\'s western coast. This ambitious development will feature 50 resorts, luxury hotels, and residential properties across 22 islands and six inland sites. The project emphasizes environmental sustainability and will be powered entirely by renewable energy.'
            },
            {
                image: 'https://sm.mashable.com/t/mashable_me/photo/default/33-2_6p52.1248.jpg',
                title: 'Solar Energy Initiative',
                id: 'solar',
                description: 'Saudi Arabia is investing heavily in solar energy as part of its Vision 2030. The kingdom aims to generate 50% of its electricity from renewable sources by 2030. Major projects include the Mohammed bin Rashid Al Maktoum Solar Park and various photovoltaic installations across the country, positioning Saudi Arabia as a global leader in clean energy transition.'
            },
            {
                image: 'https://mrajhi.com.sa/wp-content/uploads/2024/05/Towards-a-sustainable-future_-Saudi-Arabias-Green-Initiative-and-its-role-in-sustainable-development.jpg',
                title: 'Saudi Green Initiative',
                id: 'green',
                description: 'The Saudi Green Initiative aims to plant 10 billion trees across the kingdom and reduce carbon emissions by 50% by 2030. This comprehensive environmental program focuses on combating desertification, protecting biodiversity, and establishing Saudi Arabia as a global leader in environmental conservation and climate action.'
            },
            {
                image: 'https://tbywordpress.s3.eu-west-2.amazonaws.com/wp-content/uploads/2023/06/29112116/shutterstock_2172275371.jpg',
                title: 'Smart Cities Development',
                id: 'smart',
                description: 'Saudi Arabia is developing multiple smart cities integrated with AI, IoT, and sustainable technologies. These urban centers feature intelligent transportation systems, smart governance, and digital infrastructure. The initiative supports the kingdom\'s digital transformation goals and aims to improve quality of life for citizens through technology-driven solutions.'
            },
            {
                image: 'https://economysaudiarabia.com/wp-content/uploads/sites/2/2023/09/Saudi-renewable.jpg',
                title: 'Renewable Energy Program',
                id: 'renewable',
                description: 'The Saudi Renewable Energy Program is one of the world\'s most ambitious clean energy initiatives. With a target of 58.7 GW of renewable capacity by 2030, the program includes solar PV, wind, and concentrated solar power projects. This transformation will diversify the energy mix and create thousands of jobs in the renewable sector.'
            },
            {
                image: 'https://saudihelplinegroup.com/wp-content/uploads/2024/11/World-Expo-2030.jpeg',
                title: 'Riyadh Expo 2030',
                id: 'expo',
                description: 'Riyadh will host the World Expo 2030 under the theme "The Era of Change: Together for a Foresighted Tomorrow." This global event will showcase innovations in sustainability, technology, and human development. The Expo will feature pavilions from over 190 countries and is expected to attract 40 million visitors, highlighting Saudi Arabia\'s position as a global hub for innovation.'
            }
        ];

        // Create the game cards array with duplicates
        let gameCards = [];

        // Initialize game
        function initGame() {
            createGameCards();
            shuffleArray(gameCards);
            createCards();
            resetGameStats();
        }

        // Create game cards with pairs
        function createGameCards() {
            gameCards = [];
            cardPairs.forEach((pair, index) => {
                gameCards.push({...pair, pairIndex: index});
                gameCards.push({...pair, pairIndex: index});
            });
        }

        // Shuffle array function
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // Create cards
        function createCards() {
            gameBoard.innerHTML = '';
            cards = [];
            
            gameCards.forEach((cardData, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="card-inner">
                        <div class="card-front"></div>
                        <div class="card-back">
                            <img src="${cardData.image}" alt="${cardData.title}" class="card-image" />
                            <div class="card-title">${cardData.title}</div>
                        </div>
                    </div>
                `;
                card.addEventListener('click', () => flipCard(card, cardData, index));
                gameBoard.appendChild(card);
                cards.push(card);
            });
        }

        // Create firework effect
        function createFirework(x, y) {
            for (let i = 0; i < 15; i++) {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.left = x + 'px';
                firework.style.top = y + 'px';
                firework.style.background = `hsl(${Math.random() * 60 + 40}, 100%, 50%)`;
                
                const angle = (i / 15) * 2 * Math.PI;
                const velocity = Math.random() * 100 + 50;
                const deltaX = Math.cos(angle) * velocity;
                const deltaY = Math.sin(angle) * velocity;
                
                firework.style.setProperty('--dx', deltaX + 'px');
                firework.style.setProperty('--dy', deltaY + 'px');
                
                document.body.appendChild(firework);
                
                setTimeout(() => {
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                }, 1000);
            }
        }

        // Show information card
        function showInfoCard(cardData) {
            document.getElementById('infoTitle').textContent = cardData.title;
            document.getElementById('infoImage').src = cardData.image;
            document.getElementById('infoImage').alt = cardData.title;
            document.getElementById('infoDescription').textContent = cardData.description;
            
            document.getElementById('infoOverlay').classList.add('show');
            document.getElementById('infoCard').classList.add('show');
        }

        // Close information card
        function closeInfoCard() {
            document.getElementById('infoOverlay').classList.remove('show');
            document.getElementById('infoCard').classList.remove('show');
        }

        // Flip card function
        function flipCard(card, cardData, index) {
            if (!gameStarted) {
                startTimer();
                gameStarted = true;
            }

            if (card.classList.contains('flipped') || 
                card.classList.contains('matched') || 
                flippedCards.length >= 2) {
                return;
            }

            card.classList.add('flipped');
            flippedCards.push({ card, cardData, index });

            if (flippedCards.length === 2) {
                moves++;
                document.getElementById('moves').textContent = moves;
                checkForMatch();
            }
        }

        // Check for match
        function checkForMatch() {
            const [first, second] = flippedCards;
            
            setTimeout(() => {
                if (first.cardData.id === second.cardData.id && first.index !== second.index) {
                    // Match found!
                    first.card.classList.add('matched');
                    second.card.classList.add('matched');
                    matchedPairs++;
                    score += 100;
                    document.getElementById('score').textContent = score;
                    
                    // Create firework effect at the center of matched cards
                    const rect1 = first.card.getBoundingClientRect();
                    const rect2 = second.card.getBoundingClientRect();
                    const centerX = (rect1.left + rect1.right + rect2.left + rect2.right) / 4;
                    const centerY = (rect1.top + rect1.bottom + rect2.top + rect2.bottom) / 4;
                    createFirework(centerX, centerY);
                    
                    // Show information card about the matched pair
                    setTimeout(() => {
                        showInfoCard(first.cardData);
                    }, 800);
                    
                    // Check if game is won
                    if (matchedPairs === cardPairs.length) {
                        setTimeout(showWinMessage, 1500);
                        stopTimer();
                    }
                } else {
                    // No match - flip back
                    first.card.classList.remove('flipped');
                    second.card.classList.remove('flipped');
                }
                
                flippedCards = [];
            }, 1000);
        }

        // Timer functions
        function startTimer() {
            gameTimer = setInterval(() => {
                gameTime++;
                updateTimeDisplay();
            }, 1000);
        }

        function stopTimer() {
            clearInterval(gameTimer);
        }

        function updateTimeDisplay() {
            const minutes = Math.floor(gameTime / 60);
            const seconds = gameTime % 60;
            document.getElementById('time').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Reset game stats
        function resetGameStats() {
            moves = 0;
            score = 0;
            gameTime = 0;
            matchedPairs = 0;
            flippedCards = [];
            gameStarted = false;
            
            document.getElementById('moves').textContent = moves;
            document.getElementById('score').textContent = score;
            document.getElementById('time').textContent = '00:00';
            
            stopTimer();
        }

        // Start new game
        function startNewGame() {
            resetGameStats();
            createGameCards();
            shuffleArray(gameCards);
            createCards();
        }

        // Reset current game
        function resetGame() {
            resetGameStats();
            cards.forEach(card => {
                card.classList.remove('flipped', 'matched');
            });
        }

        // Show win message
       // Show win message
function showWinMessage() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalTime').textContent = document.getElementById('time').textContent;
    
    // Save game session to backend
    const sessionData = {
        score: score,
        moves: moves,
        timeInSeconds: gameTime,
        completed: true,
        cardsMatched: matchedPairs,
        difficulty: 'medium', // You can make this dynamic
        screenResolution: `${window.screen.width}x${window.screen.height}`
    };
    
    saveGameSession(sessionData);
    
    // Create celebration fireworks
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createFirework(x, y);
        }, i * 200);
    }
    
    document.getElementById('overlay').classList.add('show');
    document.getElementById('winMessage').classList.add('show');
}
// Add this function after the game state variables (around line 15)
async function saveGameSession(sessionData) {
    try {
        const API_BASE_URL = 'https://quizznationaldayabhanschool-1.onrender.com';
        const currentStudent = JSON.parse(localStorage.getItem('currentStudent') || '{}');
        
        if (!currentStudent.id) {
            console.warn('No student ID found, cannot save session');
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/students/${currentStudent.id}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Game session saved:', result);
        } else {
            console.warn('Failed to save game session:', response.status);
        }
    } catch (error) {
        console.warn('Could not save game session:', error);
    }
}
        // Close win message
        function closeWinMessage() {
            document.getElementById('overlay').classList.remove('show');
            document.getElementById('winMessage').classList.remove('show');
            startNewGame();
        }

        // Add enhanced CSS animations for fireworks
        const style = document.createElement('style');
        style.textContent = `
            .firework {
                animation: fireworkExplode 1s ease-out forwards;
            }
            
            @keyframes fireworkExplode {
                0% {
                    opacity: 1;
                    transform: scale(1) translate(0, 0);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.1) translate(var(--dx, 0), var(--dy, 0));
                }
            }
        `;
        document.head.appendChild(style);

        // Initialize game on load
        window.addEventListener('load', initGame);

        // Add click event to close info card when clicking overlay
        document.getElementById('infoOverlay').addEventListener('click', closeInfoCard);

        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.getElementById('infoCard').classList.contains('show')) {
                    closeInfoCard();
                } else if (document.getElementById('winMessage').classList.contains('show')) {
                    closeWinMessage();
                }
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (document.getElementById('infoCard').classList.contains('show')) {
                    closeInfoCard();
                }
            }
        });