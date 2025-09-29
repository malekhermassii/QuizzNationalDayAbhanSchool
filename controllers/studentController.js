const Student = require('../models/Students');
const { validationResult } = require('express-validator');

/**
 * Student Controller
 * Handles all student-related operations
 */
class StudentController {
    
    /**
     * Create a new student
     * POST /api/students
     */
    static async createStudent(req, res, next) {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { name, grade, studentId, preferences, metadata } = req.body;

            // Check if student with same name and grade already exists (optional duplicate check)
            const existingStudent = await Student.findOne({ 
                name: name.trim(), 
                grade, 
                isActive: true 
            });

            if (existingStudent) {
                return res.status(200).json({
                    success: true,
                    message: 'Student already exists, returning existing record',
                    data: {
                        studentId: existingStudent._id,
                        student: {
                            name: existingStudent.name,
                            grade: existingStudent.grade,
                            studentId: existingStudent.studentId,
                            statistics: existingStudent.statistics,
                            lastPlayed: existingStudent.statistics.lastPlayed
                        }
                    }
                });
            }

            // Create new student
            const studentData = {
                name: name.trim(),
                grade: parseInt(grade),
                preferences: preferences || {},
                metadata: {
                    ...metadata,
                    registrationIP: req.ip,
                    userAgent: req.get('User-Agent'),
                    referrer: req.get('Referer')
                }
            };

            if (studentId) {
                studentData.studentId = studentId;
            }

            const student = new Student(studentData);
            await student.save();

            res.status(201).json({
                success: true,
                message: 'Student registered successfully',
                data: {
                    studentId: student._id,
                    student: {
                        name: student.name,
                        grade: student.grade,
                        studentId: student.studentId,
                        statistics: student.statistics,
                        createdAt: student.createdAt
                    }
                }
            });

        } catch (error) {
            if (error.code === 11000) {
                // Duplicate key error
                const field = Object.keys(error.keyPattern)[0];
                return res.status(409).json({
                    success: false,
                    message: `Student with this ${field} already exists`,
                    error: 'DUPLICATE_ENTRY'
                });
            }
            next(error);
        }
    }

    /**
     * Get student by ID
     * GET /api/students/:id
     */
    static async getStudent(req, res, next) {
        try {
            const { id } = req.params;

            const student = await Student.findById(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            res.json({
                success: true,
                data: {
                    student: {
                        _id: student._id,
                        name: student.name,
                        grade: student.grade,
                        studentId: student.studentId,
                        statistics: student.statistics,
                        completionRate: student.completionRate,
                        preferences: student.preferences,
                        recentSessions: student.getRecentSessions(5),
                        createdAt: student.createdAt,
                        lastUpdated: student.updatedAt
                    }
                }
            });

        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID format'
                });
            }
            next(error);
        }
    }

    /**
     * Update student information
     * PUT /api/students/:id
     */
    static async updateStudent(req, res, next) {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const updateData = req.body;

            // Remove fields that shouldn't be updated directly
            delete updateData.statistics;
            delete updateData.gameSessions;
            delete updateData._id;
            delete updateData.createdAt;
            delete updateData.updatedAt;

            const student = await Student.findByIdAndUpdate(
                id, 
                updateData, 
                { new: true, runValidators: true }
            );

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            res.json({
                success: true,
                message: 'Student updated successfully',
                data: { student }
            });

        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID format'
                });
            }
            next(error);
        }
    }

    /**
     * Add a game session for a student
     * POST /api/students/:id/sessions
     */
    static async addGameSession(req, res, next) {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const sessionData = req.body;

            const student = await Student.findById(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            // Add device info if available
            sessionData.deviceInfo = {
                userAgent: req.get('User-Agent'),
                screenResolution: sessionData.screenResolution,
                isMobile: /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent'))
            };

            const session = student.addGameSession(sessionData);
            await student.save();

            res.status(201).json({
                success: true,
                message: 'Game session added successfully',
                data: {
                    session,
                    updatedStatistics: student.statistics
                }
            });

        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID format'
                });
            }
            next(error);
        }
    }

    /**
     * Get students by grade
     * GET /api/students/grade/:grade
     */
    static async getStudentsByGrade(req, res, next) {
        try {
            const { grade } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
            const skip = (page - 1) * limit;

            const gradeNum = parseInt(grade);
            if (gradeNum < 1 || gradeNum > 11) {
                return res.status(400).json({
                    success: false,
                    message: 'Grade must be between 1 and 11'
                });
            }

            const students = await Student.find({ grade: gradeNum, isActive: true })
                .select('name grade studentId statistics createdAt')
                .sort({ 'statistics.lastPlayed': -1 })
                .skip(skip)
                .limit(limit);

            const total = await Student.countDocuments({ grade: gradeNum, isActive: true });

            res.json({
                success: true,
                data: {
                    students,
                    pagination: {
                        current: page,
                        pages: Math.ceil(total / limit),
                        total,
                        limit
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get top performing students
     * GET /api/students/leaderboard
     */
    static async getLeaderboard(req, res, next) {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            const grade = req.query.grade ? parseInt(req.query.grade) : null;

            let query = { isActive: true };
            if (grade && grade >= 1 && grade <= 11) {
                query.grade = grade;
            }

            const students = await Student.find(query)
                .select('name grade studentId statistics')
                .sort({ 
                    'statistics.bestScore': -1, 
                    'statistics.bestTime': 1,
                    'statistics.totalGamesCompleted': -1
                })
                .limit(limit);

            res.json({
                success: true,
                data: {
                    leaderboard: students.map((student, index) => ({
                        rank: index + 1,
                        name: student.name,
                        grade: student.grade,
                        studentId: student.studentId,
                        bestScore: student.statistics.bestScore,
                        bestTime: student.statistics.bestTime,
                        gamesCompleted: student.statistics.totalGamesCompleted,
                        completionRate: student.completionRate
                    }))
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get overall statistics
     * GET /api/students/statistics
     */
    static async getStatistics(req, res, next) {
        try {
            const totalStudents = await Student.countDocuments({ isActive: true });
            const gradeStats = await Student.getGradeStatistics();
            
            const overallStats = await Student.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalGamesPlayed: { $sum: '$statistics.totalGamesPlayed' },
                        totalGamesCompleted: { $sum: '$statistics.totalGamesCompleted' },
                        averageScore: { $avg: '$statistics.averageScore' },
                        totalPlayTime: { $sum: '$statistics.totalPlayTime' },
                        highestScore: { $max: '$statistics.bestScore' }
                    }
                }
            ]);

            res.json({
                success: true,
                data: {
                    overview: {
                        totalStudents,
                        totalGamesPlayed: overallStats[0]?.totalGamesPlayed || 0,
                        totalGamesCompleted: overallStats[0]?.totalGamesCompleted || 0,
                        averageScore: Math.round(overallStats[0]?.averageScore || 0),
                        totalPlayTimeHours: Math.round((overallStats[0]?.totalPlayTime || 0) / 3600),
                        highestScore: overallStats[0]?.highestScore || 0
                    },
                    gradeBreakdown: gradeStats
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Search students by name
     * GET /api/students/search
     */
    static async searchStudents(req, res, next) {
        try {
            const { q: query, grade, limit = 10 } = req.query;

            if (!query || query.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters long'
                });
            }

            let searchCriteria = {
                isActive: true,
                $text: { $search: query }
            };

            if (grade && parseInt(grade) >= 1 && parseInt(grade) <= 11) {
                searchCriteria.grade = parseInt(grade);
            }

            const students = await Student.find(searchCriteria)
                .select('name grade studentId statistics')
                .limit(parseInt(limit))
                .sort({ score: { $meta: 'textScore' }, 'statistics.lastPlayed': -1 });

            res.json({
                success: true,
                data: {
                    students,
                    query,
                    total: students.length
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete/Deactivate a student
     * DELETE /api/students/:id
     */
    static async deleteStudent(req, res, next) {
        try {
            const { id } = req.params;
            const { permanent } = req.query;

            if (permanent === 'true') {
                // Permanent deletion (use with caution)
                const student = await Student.findByIdAndDelete(id);
                if (!student) {
                    return res.status(404).json({
                        success: false,
                        message: 'Student not found'
                    });
                }

                res.json({
                    success: true,
                    message: 'Student permanently deleted'
                });
            } else {
                // Soft deletion (deactivation)
                const student = await Student.findByIdAndUpdate(
                    id, 
                    { isActive: false }, 
                    { new: true }
                );

                if (!student) {
                    return res.status(404).json({
                        success: false,
                        message: 'Student not found'
                    });
                }

                res.json({
                    success: true,
                    message: 'Student deactivated successfully',
                    data: { student }
                });
            }

        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID format'
                });
            }
            next(error);
        }
    }

    /**
     * Get student's game sessions
     * GET /api/students/:id/sessions
     */
    static async getStudentSessions(req, res, next) {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            const skip = (page - 1) * limit;

            const student = await Student.findById(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const sessions = student.gameSessions
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(skip, skip + limit);

            const total = student.gameSessions.length;

            res.json({
                success: true,
                data: {
                    sessions,
                    pagination: {
                        current: page,
                        pages: Math.ceil(total / limit),
                        total,
                        limit
                    },
                    student: {
                        name: student.name,
                        grade: student.grade,
                        statistics: student.statistics
                    }
                }
            });

        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID format'
                });
            }
            next(error);
        }
    }
}

module.exports = StudentController;