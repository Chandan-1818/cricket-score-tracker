import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Match from './pages/Match';
import TeamRoster from './pages/TeamRoster'; // Import our new TeamRoster component
import Scoreboard from './pages/Scoreboard';
import MatchHistory from './pages/MatchHistory'; // Import MatchHistory component

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the landing page */}
        <Route path="/" element={<Home />} />
        {/* Route for the match settings page */}
        <Route path="/match" element={<Match />} />
        {/* Route for the team roster page to enter player names */}
        <Route path="/roster" element={<TeamRoster />} />
        {/* Route for the actual scoreboard page */}
        <Route path="/scoreboard" element={<Scoreboard />} />
        {/* Route for the match history page */}
        <Route path="/history" element={<MatchHistory />} />
      </Routes>
    </Router>
  );
}

export default App;