const express = require('express');
const Student = require('../models/Students');

const router = express.Router();

// Create student
router.post('/', async (req, res) => {
    try {
        const { name, grade } = req.body;
        
        if (!name || !grade) {
            return res.status(400).json({
                success: false,
                message: 'Name and grade are required'
            });
        }

        // Check if student exists
        const existingStudent = await Student.findOne({ 
            name: name.trim(), 
            grade: parseInt(grade)
        });

        if (existingStudent) {
            return res.status(200).json({
                success: true,
                message: 'Student found',
                data: {
                    studentId: existingStudent._id,
                    student: existingStudent
                }
            });
        }

        // Create new student
        const student = new Student({
            name: name.trim(),
            grade: parseInt(grade)
        });

        await student.save();

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: {
                studentId: student._id,
                student
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get student by ID
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            data: { student }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Add game session
router.post('/:id/sessions', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const sessionData = {
            score: req.body.score || 0,
            moves: req.body.moves || 0,
            timeInSeconds: req.body.timeInSeconds || 0,
            completed: req.body.completed || false,
            cardsMatched: req.body.cardsMatched || 0
        };

        student.addGameSession(sessionData);
        await student.save();

        res.status(201).json({
            success: true,
            message: 'Session added successfully',
            data: {
                statistics: student.statistics
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;