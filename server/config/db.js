const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cricket_tracker';
    const conn = await mongoose.connect(dbURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
