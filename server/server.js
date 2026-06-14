const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const matchRoutes = require('./routes/matchRoutes');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Connect to Database
connectDB();

const app = express();

// ---------------------------------------------------------------------------
// CORS — must be applied BEFORE any routes so that preflight OPTIONS requests
// are handled and never hit the route layer (which would 404/405 them).
// ---------------------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:3000',
  'https://cricket-score-tracker-rho.vercel.app',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Handle every OPTIONS preflight before anything else
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ---------------------------------------------------------------------------
// Body parsers — must come before route handlers
// ---------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/matches', matchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Root
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Cricket Score Tracker Backend API is running' });
});

// ---------------------------------------------------------------------------
// Centralised error handler (must be last)
// ---------------------------------------------------------------------------
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
