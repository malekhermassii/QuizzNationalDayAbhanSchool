const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
    score: { type: Number, default: 0 },
    moves: { type: Number, default: 0 },
    timeInSeconds: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    cardsMatched: { type: Number, default: 0 },
    difficulty: { type: String, default: 'medium' },
    screenResolution: { type: String, default: '' },
    deviceInfo: {
        userAgent: String,
        screenResolution: String,
        isMobile: Boolean
    }
}, {
    timestamps: true
});

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: Number,
        required: true,
        min: 1,
        max: 11
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true
    },
    gameSessions: [gameSessionSchema],
    statistics: {
        totalGamesPlayed: { type: Number, default: 0 },
        totalGamesCompleted: { type: Number, default: 0 },
        bestScore: { type: Number, default: 0 },
        bestTime: { type: Number, default: null },
        averageScore: { type: Number, default: 0 },
        lastPlayed: { type: Date, default: Date.now }
    },
    preferences: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    metadata: {
        registrationIP: String,
        userAgent: String,
        referrer: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for completion rate
studentSchema.virtual('completionRate').get(function() {
    if (this.statistics.totalGamesPlayed === 0) return 0;
    return (this.statistics.totalGamesCompleted / this.statistics.totalGamesPlayed) * 100;
});

// Method to add game session
studentSchema.methods.addGameSession = function(sessionData) {
    this.gameSessions.push(sessionData);
    this.updateStatistics();
    return this.gameSessions[this.gameSessions.length - 1];
};

// Method to update statistics
studentSchema.methods.updateStatistics = function() {
    const sessions = this.gameSessions;
    
    this.statistics.totalGamesPlayed = sessions.length;
    this.statistics.totalGamesCompleted = sessions.filter(s => s.completed).length;
    this.statistics.lastPlayed = new Date();
    
    if (sessions.length > 0) {
        this.statistics.bestScore = Math.max(...sessions.map(s => s.score));
        
        const completedSessions = sessions.filter(s => s.completed);
        if (completedSessions.length > 0) {
            this.statistics.bestTime = Math.min(...completedSessions.map(s => s.timeInSeconds));
        }
        
        const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
        this.statistics.averageScore = Math.round(totalScore / sessions.length);
    }
};

// Static method to get grade statistics
studentSchema.statics.getGradeStatistics = async function() {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$grade',
                totalStudents: { $sum: 1 },
                totalGamesPlayed: { $sum: '$statistics.totalGamesPlayed' },
                averageScore: { $avg: '$statistics.averageScore' }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

// Method to get recent sessions
studentSchema.methods.getRecentSessions = function(limit = 5) {
    return this.gameSessions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
};

// Index for better performance
studentSchema.index({ name: 1, grade: 1 });
studentSchema.index({ 'statistics.bestScore': -1 });
studentSchema.index({ grade: 1, 'statistics.bestScore': -1 });

module.exports = mongoose.model('Student', studentSchema);