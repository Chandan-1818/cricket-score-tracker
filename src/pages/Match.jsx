import { useState } from 'react'
// Import useNavigate to allow programmatically routing to subsequent setup steps
import { useNavigate } from 'react-router-dom'

/**
 * Match Component
 * 
 * This page functions as the initial setup form where a match is configured.
 * Users define the teams playing, the total overs, who won the toss, and their selection (Bat/Bowl).
 * The input is validated, a visual summary is rendered, and details are navigated forward to the roster page.
 */
function Match() {
  // Access react-router navigation controller
  const navigate = useNavigate()

  // Unified React state hook tracking the form's user configuration input
  const [matchDetails, setMatchDetails] = useState({
    team1: '',      // Name of Team 1 (string)
    team2: '',      // Name of Team 2 (string)
    overs: '',      // Number of overs for the match (positive integer)
    tossWinner: '', // Name of the team that won the coin toss
    decision: ''    // Toss selection decision: 'Bat' or 'Bowl'
  })
  
  // State storing the text summary preview of the match setup details
  const [result, setResult] = useState('')

  /**
   * Handle text and number inputs.
   * Dynamically tracks target name fields and merges new values into matchDetails state.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMatchDetails(prev => ({ ...prev, [name]: value }))
  }

  /**
   * Handle selections made via clickable UI cards (e.g. tossWinner, decision).
   * Writes values directly to the specified key in the state.
   */
  const handleCardSelect = (field, value) => {
    setMatchDetails(prev => ({ ...prev, [field]: value }))
  }

  /**
   * Validates form configuration.
   * If all inputs are valid, compiles and displays a human-readable match summary.
   */
  const startMatch = () => {
    const { team1, team2, overs, tossWinner, decision } = matchDetails
    
    // Ensure that all required properties have been specified
    if (!team1 || !team2 || !overs || !tossWinner || !decision) {
      alert('Please fill all details')
      return
    }

    // Generate and render the summarized configuration details block
    setResult(
      `Match: ${team1} vs ${team2}\n\nOvers: ${overs}\n\nToss Winner: ${tossWinner}\n\nDecision: ${decision}\n\nStatus: Ready To Start`
    )
  }

  /**
   * Navigates users to the roster creation page.
   * Passes current matchDetails config inside react-router navigation state.
   */
  const goToRoster = () => {
    navigate('/roster', { state: matchDetails })
  }

  // Destructure state variables for easier binding in JSX elements
  const { team1, team2, overs, tossWinner, decision } = matchDetails

  return (
    <div className='match-page'>
      {/* Form container styled with glassmorphism visual aesthetics */}
      <div className='container'>
        <h1>Create Match</h1>

        {/* Input field: Team 1 name */}
        <div className='input-group'>
          <label>Team 1</label>
          <input
            type='text'
            name='team1'
            placeholder='Enter Team 1 Name'
            value={team1}
            onChange={handleInputChange}
          />
        </div>

        {/* Input field: Team 2 name */}
        <div className='input-group'>
          <label>Team 2</label>
          <input
            type='text'
            name='team2'
            placeholder='Enter Team 2 Name'
            value={team2}
            onChange={handleInputChange}
          />
        </div>

        {/* Input field: Total match overs */}
        <div className='input-group'>
          <label>Total Overs</label>
          <input
            type='number'
            name='overs'
            placeholder='Enter Overs'
            value={overs}
            onChange={handleInputChange}
          />
        </div>

        {/* Input selection: Toss Winner card choices */}
        <div className='input-group'>
          <div className='section-title'>Who Won The Toss?</div>
          <div className='card-container'>
            {/* Card representing Team 1. Only selectable if name is provided */}
            <div
              className={`card ${tossWinner === team1 && team1 ? 'selected' : ''}`}
              onClick={() => team1 && handleCardSelect('tossWinner', team1)}
            >
              {team1 || 'Team 1'}
            </div>
            {/* Card representing Team 2. Only selectable if name is provided */}
            <div
              className={`card ${tossWinner === team2 && team2 ? 'selected' : ''}`}
              onClick={() => team2 && handleCardSelect('tossWinner', team2)}
            >
              {team2 || 'Team 2'}
            </div>
          </div>
        </div>

        {/* Input selection: Toss choice (Batting or Bowling first) */}
        <div className='input-group'>
          <div className='section-title'>What Did They Choose?</div>
          <div className='card-container'>
            {/* Bat card selection */}
            <div
              className={`card ${decision === 'Bat' ? 'selected' : ''}`}
              onClick={() => handleCardSelect('decision', 'Bat')}
            >
              Bat
            </div>
            {/* Bowl card selection */}
            <div
              className={`card ${decision === 'Bowl' ? 'selected' : ''}`}
              onClick={() => handleCardSelect('decision', 'Bowl')}
            >
              Bowl
            </div>
          </div>
        </div>

        {/* Button to confirm setup and generate preview */}
        <button className='start-btn' onClick={startMatch}>
          Start Match
        </button>

        {/* Conditional section displaying match configuration and link to roster */}
        {result && (
          <div className='result'>
            <pre>{result}</pre>
            <button
              className='action-btn'
              onClick={goToRoster}
              style={{ marginTop: '20px' }}
            >
              Next: Enter Player Names
            </button>
          </div>
        )}
      </div>

      {/* Author and registration credit footer */}
      <div className='footer' style={{ marginTop: 'auto', paddingTop: '20px' }}>
        DONE BY CHANDAN S PES1PG25CA269
      </div>
    </div>
  )
}

export default Match