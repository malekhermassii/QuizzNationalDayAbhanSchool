const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        // MongoDB connection options (updated for newer versions)
        const options = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        // Get MongoDB URI from environment variables
        const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/student-flip-game';

        // Connect to MongoDB
        const connection = await mongoose.connect(mongoURI, options);

        console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
        console.log(`📊 Database: ${connection.connection.name}`);

        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('📡 Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('📡 Mongoose disconnected from MongoDB');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('📡 Mongoose connection closed through app termination');
                process.exit(0);
            } catch (error) {
                console.error('Error closing mongoose connection:', error);
                process.exit(1);
            }
        });

        return connection;

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        
        // In development, provide helpful error messages
        if (process.env.NODE_ENV === 'development') {
            if (error.message.includes('ECONNREFUSED')) {
                console.log('💡 Make sure MongoDB is running on your system:');
                console.log('   - Start MongoDB service');
                console.log('   - Or use MongoDB Atlas cloud database');
                console.log('   - Check your MONGODB_URI in .env file');
            }
        }
        
        // Exit process with failure
        process.exit(1);
    }
};

const disconnectDatabase = async () => {
    try {
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
};

// Database health check
const checkDatabaseHealth = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            // Connected
            await mongoose.connection.db.admin().ping();
            return {
                status: 'healthy',
                readyState: mongoose.connection.readyState,
                host: mongoose.connection.host,
                name: mongoose.connection.name
            };
        } else {
            return {
                status: 'unhealthy',
                readyState: mongoose.connection.readyState,
                message: 'Database not connected'
            };
        }
    } catch (error) {
        return {
            status: 'error',
            readyState: mongoose.connection.readyState,
            error: error.message
        };
    }
};

// Get database statistics
const getDatabaseStats = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }

        const stats = await mongoose.connection.db.stats();
        return {
            collections: stats.collections,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexes: stats.indexes,
            indexSize: stats.indexSize,
            objects: stats.objects
        };
    } catch (error) {
        throw new Error(`Failed to get database stats: ${error.message}`);
    }
};

module.exports = {
    connectDatabase,
    disconnectDatabase,
    checkDatabaseHealth,
    getDatabaseStats
};