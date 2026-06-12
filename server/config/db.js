const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the MONGO_URI environment variable.
 * Validates the presence of MONGO_URI, prevents any localhost/127.0.0.1 fallback,
 * and implements a retry connection mechanism.
 * 
 * @param {number} retryCount Number of connection attempts before failing
 * @param {number} delayMs Delay between retries in milliseconds
 */
const connectDB = async (retryCount = 5, delayMs = 5000) => {
  // 1. Strict Validation: Validate MONGO_URI exists before connecting
  if (!process.env.MONGO_URI) {
    console.error("Database connection configuration error: MONGO_URI environment variable is missing.");
    process.exit(1);
  }

  // 2. Prevent any local connection under any circumstances in production mode
  if (process.env.NODE_ENV === 'production' && (process.env.MONGO_URI.includes('localhost') || process.env.MONGO_URI.includes('127.0.0.1'))) {
    console.error("Database connection configuration error: Localhost or 127.0.0.1 connection strings are forbidden in production.");
    process.exit(1);
  }

  // 3. Retry connection loop
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`Attempting MongoDB connection (Attempt ${attempt}/${retryCount})...`);
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return; // Connection succeeded, exit loop
    } catch (error) {
      console.error(`MongoDB Connection Error (Attempt ${attempt}/${retryCount}): ${error.message}`);
      
      // If we've exhausted all retry attempts, gracefully terminate
      if (attempt === retryCount) {
        console.error("All MongoDB connection attempts failed. Gracefully terminating process.");
        process.exit(1);
      }

      console.log(`Retrying connection in ${delayMs / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

module.exports = connectDB;
