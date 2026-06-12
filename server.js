const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from the frontend dev server
app.use(cors());

// Parse incoming request bodies containing JSON payload
app.use(express.json());

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cricket_tracker';

// Instantiate the MongoClient with default options. 
// This client manages the connection pool to our MongoDB instance.
const client = new MongoClient(MONGODB_URI);

let db;

// Establish database connection asynchronously
async function connectDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and cache reference to the target database
    db = client.db();
    console.log('Successfully connected to MongoDB using native driver.');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit process on critical database connection failure
  }
}

// Invoke connection procedure
connectDB();

/**
 * Route: POST /api/matches
 * Purpose: Save completed match details and statistics
 */
app.post('/api/matches', async (req, res) => {
  try {
    const matchData = req.body;
    
    // Ensure the createdAt timestamp is explicitly set as a Date object.
    // In native MongoDB, we must manually handle defaults like timestamps.
    if (!matchData.createdAt) {
      matchData.createdAt = new Date();
    } else {
      matchData.createdAt = new Date(matchData.createdAt);
    }
    
    // Insert the match data payload directly into the 'matches' collection
    const result = await db.collection('matches').insertOne(matchData);
    
    // Construct the response object reflecting the newly created record with its database-assigned ObjectId
    const savedMatch = { _id: result.insertedId, ...matchData };
    res.status(201).json(savedMatch);
  } catch (error) {
    console.error('Error saving match:', error);
    res.status(400).json({ message: 'Error saving match details', error: error.message });
  }
});

/**
 * Route: GET /api/matches
 * Purpose: Fetch all recorded match summaries from newest to oldest
 */
app.get('/api/matches', async (req, res) => {
  try {
    // Find all matches, sort them by creation timestamp descending, and convert cursor results to an array
    const matches = await db.collection('matches')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
      
    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching match history', error: error.message });
  }
});

/**
 * Route: DELETE /api/matches/:id
 * Purpose: Delete a specific match record from the database by its ID
 */
app.delete('/api/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate if the ID matches the correct MongoDB 24-character hex string format before attempting a query
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid match ID format' });
    }
    
    // Perform deletion using the parsed ObjectId
    const result = await db.collection('matches').deleteOne({ _id: new ObjectId(id) });
    
    // Check if a document was actually deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.status(200).json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: 'Error deleting match', error: error.message });
  }
});

// Start Express listening on the designated PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
