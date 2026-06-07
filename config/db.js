const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async() => {
    try {
        let uri = process.env.MONGO_URI;

        // Use in-memory MongoDB for local testing without installation
        if (uri && uri.includes('127.0.0.1:27017')) {
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            console.log(`Using In-Memory MongoDB: ${uri}`);
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;