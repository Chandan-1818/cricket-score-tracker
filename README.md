# Cricket Score Tracker - MERN Full Stack Edition

A production-ready full-stack MERN application built with React, Node.js, Express, and MongoDB (Atlas & Mongoose) to create, track, score, and persist cricket matches in real-time.

Features a responsive glassmorphic UI, custom batting/bowling statistics tracking, automated target chasing logic, and historical match logs with collapsible scorecard accordions.

---

## 1. Project Architecture

The project is structured as a decoupled client-server architecture:

- **Client (Frontend)**: React 19 single-page application styled using custom CSS tokens (Glassmorphic design). Uses React Router (v7) for application routing and navigation.
- **Server (Backend)**: Production Express.js server hosted under `server/` providing secure RESTful API endpoints, request validation, and global error handling.
- **Database (Persistence)**: MongoDB instance (local or MongoDB Atlas Cloud) using Mongoose for object modeling, type-safety, and validation schemas.

---

## 2. Tech Stack

- **Frontend**: React 19, React Router DOM v7, CSS Custom Properties (harmonious dark/glassmorphic color palette)
- **Backend**: Node.js, Express.js, Mongoose, CORS, Dotenv, nodemon
- **Database**: MongoDB (Atlas Cloud for production, local `mongodb://127.0.0.1:27017/cricket_tracker` for development)
- **Dev Tooling**: `concurrently` (runs frontend client and backend server in parallel with a single command)

---

## 3. Directory Structure

```text
cricket/
├── build/                       # Production React build directory
├── public/                      # Static client assets
├── server/                      # Express Backend Subsystem
│   ├── config/
│   │   └── db.js                # Database connection using Mongoose
│   ├── controllers/
│   │   └── matchController.js   # Match REST route handlers
│   ├── middleware/
│   │   └── errorHandler.js      # Centralized JSON error response handler
│   ├── models/
│   │   └── Match.js             # Mongoose match, innings, and stats schemas
│   ├── routes/
│   │   └── matchRoutes.js       # Match routes mapping
│   ├── utils/
│   │   └── validators.js        # Payload schema validation helpers
│   ├── .env.example             # Environment variable template
│   ├── package.json             # Backend dependencies and scripts
│   └── server.js                # Express entry point
├── src/                         # React Frontend Subsystem
│   ├── pages/
│   │   ├── Home.jsx             # Welcome & navigation page
│   │   ├── Match.jsx            # Teams and settings setup
│   │   ├── TeamRoster.jsx       # Player list builder
│   │   ├── Scoreboard.jsx       # Real-time over scorer & automated DB saving
│   │   └── MatchHistory.jsx     # Accordion scoreboard database explorer
│   ├── App.css                  # UI Styles (tokens, layout, responsive grid)
│   ├── App.js                   # Application client routes
│   └── index.js                 # Frontend entry point
├── package.json                 # Monorepo/Root scripts & dev dependencies
└── README.md                    # Main Project Documentation
```

---

## 4. Database Schema

Matches are saved in the `matches` collection under a structured document model:

- **Match Meta**: Team names, total overs, toss winner name, toss choice (`Bat` or `Bowl`), player rosters (`players.team1` and `players.team2` arrays).
- **Innings (1 & 2)**: Total runs, wickets, valid balls bowled, and statistical lists.
  - **Batter Stats**: Name, runs scored, balls faced, fours hit, sixes hit, strike rate (derived).
  - **Bowler Stats**: Name, overs bowled (format `O.B`), runs conceded, wickets taken, extras conceded.
- **Outcome Summary**: Formulated text string detailing the victory margins or ties.
- **Timestamps**: Match creation timestamp (`createdAt`).

---

## 5. REST API Endpoints

Base URL: `/api/matches`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/matches` | Get all recorded matches sorted by `createdAt` descending |
| **GET** | `/api/matches/:id` | Retrieve detailed statistics of a single match by ID |
| **POST** | `/api/matches` | Save completed match statistics (validates payload) |
| **PUT** | `/api/matches/:id` | Update an existing match record by ID |
| **DELETE** | `/api/matches/:id` | Delete a match record from database history |

---

## 6. Environment Variables

### Backend Configuration (`server/.env`)
Create a `.env` file in the `server/` directory:
```ini
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cricket_tracker?retryWrites=true&w=majority
FRONTEND_URL=https://cricket-score-tracker-rho.vercel.app
```

### Frontend Configuration
Vercel dashboard or root environment variable:
```ini
REACT_APP_API_URL=https://cricket-score-tracker-backend.onrender.com
```

---

## 7. Getting Started (Local Development)

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally. The default connection URI is:
  `mongodb://127.0.0.1:27017/cricket_tracker`

### 2. Installation
Install root dependencies and backend dependencies:
```bash
# Install root (concurrently, nodemon) and React frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Running the App
Start both frontend and backend servers concurrently:
```bash
npm start
```
- **Frontend** runs on [http://localhost:3000](http://localhost:3000)
- **Backend API** runs on [http://localhost:5000](http://localhost:5000)

---

## 8. Deployment Settings

### Database (MongoDB Atlas)
1. Set up a cluster on MongoDB Atlas.
2. Whitelist connection IP addresses (`0.0.0.0/0` for cloud deployment compatibility).
3. Copy connection driver URI and use as `MONGO_URI` environment variable.

### Backend (Render)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- Set env variables: `MONGO_URI`, `FRONTEND_URL`, and `NODE_ENV`.

### Frontend (Vercel)
- **Framework Preset**: `Create React App`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- Add environment variable: `REACT_APP_API_URL` (set to Render backend URL).

---

**Project Creator**: Chandan S (PES1PG25CA269)
