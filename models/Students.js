const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
    score: { type: Number, default: 0 },
    moves: { type: Number, default: 0 },
    timeInSeconds: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    cardsMatched: { type: Number, default: 0 }
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
    gameSessions: [gameSessionSchema],
    statistics: {
        totalGamesPlayed: { type: Number, default: 0 },
        totalGamesCompleted: { type: Number, default: 0 },
        bestScore: { type: Number, default: 0 },
        bestTime: { type: Number, default: null },
        averageScore: { type: Number, default: 0 },
        lastPlayed: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
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

module.exports = mongoose.model('Student', studentSchema);