import { useState } from 'react'
// Import hooks to retrieve passed router state and navigate to the scoreboard page
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * TeamRoster Component
 * 
 * This page handles input for the names of players representing each team.
 * The configuration (overs, toss details, team names) is passed via the navigation state.
 * To maintain structural balance, the component synchronizes player list arrays:
 * adding or removing a player row alters the roster size of BOTH teams simultaneously.
 */
function TeamRoster() {
  const location = useLocation()
  const navigate = useNavigate()

  // Safely extract the match details object from the router's state, providing defaults
  const { team1 = "Team 1", team2 = "Team 2", overs, tossWinner, decision } = location.state || {}

  // React state storing lists of player names. Starts with a single empty string row for each team.
  const [players, setPlayers] = useState({
    team1: [''],
    team2: ['']
  })

  /**
   * Updates a specific player's name string at a given index.
   * Modifies only the designated team's copy, keeping array references clean.
   */
  const handlePlayerChange = (teamId, index, value) => {
    setPlayers(prev => {
      const updatedTeam = [...prev[teamId]]
      updatedTeam[index] = value
      return { ...prev, [teamId]: updatedTeam }
    })
  }

  /**
   * Appends a new blank input row to BOTH teams.
   * This maintains a symmetrical count of players (symmetric team sizes).
   */
  const addPlayerRow = () => {
    setPlayers(prev => ({
      team1: [...prev.team1, ''],
      team2: [...prev.team2, '']
    }))
  }

  /**
   * Removes a player input row at a specified index from BOTH teams.
   * Keeps teams balanced and prevents removal if only one row remains.
   */
  const removePlayerRow = (index) => {
    // Prevent removing when only one player row is present
    if (players.team1.length <= 1) return

    setPlayers(prev => {
      const newTeam1 = [...prev.team1]
      const newTeam2 = [...prev.team2]
      
      // Symmetrically slice out the element at the target index
      newTeam1.splice(index, 1)
      newTeam2.splice(index, 1)
      
      return { team1: newTeam1, team2: newTeam2 }
    })
  }

  /**
   * Form validation and transition.
   * Ensures all input boxes have non-empty text, then routes to /scoreboard
   * while transmitting match configuration and player arrays.
   */
  const finishSetup = () => {
    // Check if any text box contains only whitespace characters
    const isTeam1Empty = players.team1.some(p => p.trim() === '')
    const isTeam2Empty = players.team2.some(p => p.trim() === '')

    if (isTeam1Empty || isTeam2Empty) {
      alert('Please fill in names for all players on both teams before continuing.')
      return
    }

    // Finalize the match state and pass it down to the active Scoreboard component
    navigate('/scoreboard', { state: { team1, team2, overs, tossWinner, decision, players } })
  }

  return (
    <div className='match-page'>
      <div className='container roster-container'>
        <h1>Enter Player Names</h1>

        <div className='teams-wrapper'>
          
          {/* ----- TEAM 1 COLUMN ----- */}
          <div className='team-column'>
            <div className='section-title'>{team1}</div>
            
            {/* Map and render input fields for each player slot */}
            {players.team1.map((player, index) => (
              <div key={`team1-${index}`} className='player-input-group'>
                <input
                  type='text'
                  placeholder={`Player ${index + 1} Name`}
                  value={player}
                  onChange={(e) => handlePlayerChange('team1', index, e.target.value)}
                />
                
                {/* Show the remove button only if there is more than 1 player row */}
                {players.team1.length > 1 && (
                  <button
                    className='remove-btn'
                    onClick={() => removePlayerRow(index)}
                    title="Remove this row for both teams"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ----- TEAM 2 COLUMN ----- */}
          <div className='team-column'>
            <div className='section-title'>{team2}</div>
            
            {/* Map and render input fields for each player slot */}
            {players.team2.map((player, index) => (
              <div key={`team2-${index}`} className='player-input-group'>
                <input
                  type='text'
                  placeholder={`Player ${index + 1} Name`}
                  value={player}
                  onChange={(e) => handlePlayerChange('team2', index, e.target.value)}
                />
                
                {/* Show the remove button only if there is more than 1 player row */}
                {players.team2.length > 1 && (
                  <button
                    className='remove-btn'
                    onClick={() => removePlayerRow(index)}
                    title="Remove this row for both teams"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global actions: Add player row and finish setup */}
        <button className='action-btn' onClick={addPlayerRow} style={{ marginBottom: '20px' }}>
          + Add Player to Both Teams
        </button>

        <button className='start-btn' onClick={finishSetup}>
          Finish Setup
        </button>
      </div>

      {/* Credit footer */}
      <div className='footer'>
        DONE BY CHANDAN S PES1PG25CA269
      </div>
    </div>
  )
}

export default TeamRoster
