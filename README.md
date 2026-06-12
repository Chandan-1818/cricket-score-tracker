<!-- Line 1: Main Project Title -->
# Cricket Score Tracker - Full Stack Database Edition

<!-- Line 2: Description of the project's purpose and functionality -->
A full-stack React-Express-MongoDB application designed to create, track, score, and persist cricket matches in real-time.

<!-- Line 3: Section heading for Project Architecture -->
## Project Architecture

<!-- Line 4: Description of the React frontend role -->
- **Client (Frontend)**: React 19 app structured with reusable page components and React Router (v7) navigation.
<!-- Line 5: Description of the Express backend server role -->
- **Server (Backend)**: Express API server acting as the bridge between the client and the database.
<!-- Line 6: Description of the database persistence layer -->
- **Database (Persistence)**: MongoDB database utilizing Mongoose for schema declaration and validation.

<!-- Line 7: Section heading for Tech Stack -->
## Tech Stack

<!-- Line 8: Technical details of Frontend technologies -->
- **Frontend**: React, React Router DOM, Vanilla CSS (Glassmorphism design tokens)
<!-- Line 9: Technical details of Backend technologies -->
- **Backend**: Node.js, Express, Mongoose, CORS, nodemon
<!-- Line 10: Technical details of Database configuration -->
- **Database**: MongoDB (Local server instance running on port `2004`)
<!-- Line 11: Technical details of Dev environment utility -->
- **Dev Tooling**: `concurrently` (boots up client and server servers in parallel with a single command)

<!-- Line 12: Section heading for Database Schema Details -->
## MongoDB Schema Description

<!-- Line 13: Introduction to the Match document schema structure -->
Matches are stored as structured documents in the `matches` collection under the `cricket_tracker` database:

<!-- Line 14: Bullet point explaining basic match meta information -->
- **Match Setup Info**: Team names, total overs, toss winner name, toss decision ('Bat'/'Bowl'), player rosters.
<!-- Line 15: Bullet point explaining scorecard statistics structure -->
- **Innings 1 & 2 Details**: Runs, wickets, balls, and list of player statistics.
<!-- Line 16: Bullet point explaining batter details -->
  - **Batters**: Runs scored, balls faced, fours hit, sixes hit, strike rate.
<!-- Line 17: Bullet point explaining bowler details -->
  - **Bowlers**: Overs bowled, runs conceded, wickets taken, extras conceded.
<!-- Line 18: Bullet point explaining match outcome -->
- **Result Description**: Summary of victory margins (e.g. "India won by 4 wickets!").

<!-- Line 19: Section heading for Backend API Endpoints -->
## API Endpoints

<!-- Line 20: Express route mapping for creating a match -->
- `POST /api/matches`: Persists a completed match document to the database.
<!-- Line 21: Express route mapping for listing matches -->
- `GET /api/matches`: Retrieves all recorded matches from history, sorted by creation timestamp (newest first).
<!-- Line 22: Express route mapping for deleting a match -->
- `DELETE /api/matches/:id`: Removes a specific match log from the database collection.

<!-- Line 23: Section heading for Setup & Running instructions -->
## Getting Started

<!-- Line 24: Pre-requisites notice for local MongoDB service -->
### Prerequisites
<!-- Line 25: Warning to ensure local MongoDB server is active -->
Ensure MongoDB is running locally on your system. By default, it connects to:
<!-- Line 26: Connection URL definition for MongoDB -->
`mongodb://127.0.0.1:2004/cricket_tracker`

<!-- Line 27: Heading for installing package dependencies -->
### Installation
<!-- Line 28: Instruction to install workspace modules -->
Install all required package dependencies in the workspace root directory:
<!-- Line 29: Command block showing standard npm install -->
```bash
npm install
```

<!-- Line 30: Heading for booting development server environments -->
### Running the Application
<!-- Line 31: Instruction to run the dev script -->
Launch both the Express backend and React frontend concurrently in development mode:
<!-- Line 32: Command block showing npm start -->
```bash
npm start
```
<!-- Line 33: Explanation of port assignments for dev servers -->
The frontend will open at [http://localhost:3000](http://localhost:3000), and the backend server runs at [http://localhost:5000](http://localhost:5000).

<!-- Line 34: Section heading for file and directory structure -->
## File Structure

<!-- Line 35: File structure outline block -->
```text
cricket/
├── server.js               # Express application entrypoint and DB configuration
├── server/
│   └── models/
│       └── Match.js        # Mongoose database schemas (Match and Innings)
├── src/
│   ├── App.js              # React Router route registry
│   ├── App.css             # Unified CSS design systems and page styles
│   └── pages/
│       ├── Home.jsx        # Landing page with Start Match and Match History buttons
│       ├── Match.jsx       # Match parameters builder configuration
│       ├── TeamRoster.jsx  # Player names entries for both squads
│       ├── Scoreboard.jsx  # Over-by-over scorer with auto-save MongoDB hook
│       └── MatchHistory.jsx# Database explorer with scorecard accordion lists
└── package.json            # Scripts and package dependency declarations
```

<!-- Line 36: Footer citation of author/student -->
**Project Creator**: Chandan S (PES1PG25CA269)
