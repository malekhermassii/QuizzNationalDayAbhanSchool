
const express = require('express');
const StudentController = require('../controllers/studentController');

const router = express.Router();

// Apply to all routes
router.use((req, res, next) => {
    console.log(`📝 Student API: ${req.method} ${req.path}`, req.body);
    next();
});

// Create student
router.post('/students', StudentController.createStudent);

// Get student by ID
router.get('/:id', StudentController.getStudent);

// Add game session
router.post('/:id/sessions', StudentController.addGameSession);

// Get students by grade
router.get('/grade/:grade', StudentController.getStudentsByGrade);

// Get leaderboard
router.get('/leaderboard/top', StudentController.getLeaderboard);

// Get statistics
router.get('/stats/overview', StudentController.getStatistics);

// Search students
router.get('/search/all', StudentController.searchStudents);

// Get student sessions
router.get('/:id/sessions/all', StudentController.getStudentSessions);

// Update student
router.put('/:id', StudentController.updateStudent);

// Delete student
router.delete('/:id', StudentController.deleteStudent);

module.exports = router;