import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * MatchHistory Component
 * 
 * This page displays a detailed list of past match records retrieved from the database.
 * It features collapsible cards to toggle inline scorecard details for each innings,
 * a date formatter, deletion capabilities to remove individual match files, and links
 * back to the primary landing page.
 */
function MatchHistory() {
  const navigate = useNavigate()
  
  // States to hold the match collection, loading indicators, errors and active card toggle IDs
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedMatchId, setExpandedMatchId] = useState(null) // Stores database ID of card currently open

  /**
   * Effect Hook: Fetches match records from the database on component mount.
   */
  useEffect(() => {
    fetch('/api/matches')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch match history')
        }
        return response.json()
      })
      .then(data => {
        setMatches(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching matches:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  /**
   * Delete Match action handler.
   * Calls the DELETE endpoint on the backend and filters the deleted item from local state.
   */
  const deleteMatch = (id, e) => {
    // Prevent the click event from bubble-triggering card expand toggles
    e.stopPropagation()
    
    if (!window.confirm('Are you sure you want to delete this match record?')) {
      return
    }

    // Call DELETE API mapping to native MongoDB handlers
    fetch(`/api/matches/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete match')
        }
        // Remove item from UI state upon successful database deletion
        setMatches(prev => prev.filter(m => m._id !== id))
        
        // Collapse card if the deleted match was currently expanded
        if (expandedMatchId === id) {
          setExpandedMatchId(null)
        }
      })
      .catch(err => {
        alert(err.message)
      })
  }

  /**
   * Toggles the display of expanded inline stats scorecard for the clicked card.
   */
  const toggleExpand = (id) => {
    setExpandedMatchId(prev => prev === id ? null : id)
  }

  /**
   * Date parsing formatter helper.
   * Converts standard ISO string representations into readable US locales.
   */
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  /**
   * Sub-table rendering helper.
   * Generates localized batter run stats and bowler overs/wickets tables.
   */
  const renderStatsTable = (title, batTeam, score, wickets, balls, totalOvers, batStats, bowlStats) => {
    // Translate raw balls count into over.balls representation
    const currentOvers = Math.floor(balls / 6)
    const currentBalls = balls % 6
    const oversDisplay = `${currentOvers}.${currentBalls}`

    return (
      <div className='history-stats-section'>
        {/* Innings Title */}
        <h4 style={{ color: 'gold', marginTop: '15px', marginBottom: '8px', fontSize: '18px' }}>{title}</h4>
        
        {/* Innings overall score overview */}
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontSize: '14px' }}>
          <strong>{batTeam}</strong> - {score}/{wickets} ({oversDisplay} / {totalOvers} Overs)
        </p>

        {/* Batting details table mapping */}
        {batStats.length > 0 ? (
          <div style={{ overflowX: 'auto', marginBottom: '10px' }}>
            <table className='stats-table history-table'>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Batter</th>
                  <th>R</th>
                  <th>B</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                </tr>
              </thead>
              <tbody>
                {batStats.map((s, i) => {
                  const sr = s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={`bat-${i}`}>
                      <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{s.name}</td>
                      <td>{s.runs}</td>
                      <td>{s.balls}</td>
                      <td>{s.fours}</td>
                      <td>{s.sixes}</td>
                      <td>{sr}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'gray', fontStyle: 'italic', fontSize: '13px', margin: '5px 0' }}>No batting stats recorded.</p>
        )}

        {/* Bowling details table mapping */}
        {bowlStats.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className='stats-table history-table'>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Bowler</th>
                  <th>O</th>
                  <th>R</th>
                  <th>W</th>
                  <th>E</th>
                </tr>
              </thead>
              <tbody>
                {bowlStats.map((s, i) => {
                  return (
                    <tr key={`bowl-${i}`}>
                      <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{s.name}</td>
                      <td>{s.overs}</td>
                      <td>{s.runs}</td>
                      <td>{s.wickets}</td>
                      <td>{s.extras}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'gray', fontStyle: 'italic', fontSize: '13px', margin: '5px 0' }}>No bowling stats recorded.</p>
        )}
      </div>
    )
  }

  return (
    <div className='match-page'>
      <div className='container history-container'>
        
        {/* Header containing title and navigation back link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', color: 'gold' }}>Match History</h1>
          <button className='view-stats-btn' onClick={() => navigate('/')} style={{ marginTop: 0 }}>
            ← Home
          </button>
        </div>

        {/* Render matches according to request lifecycle state */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'white', fontSize: '20px' }}>
             Loading match history...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#e74c3c', background: 'rgba(231,76,60,0.1)', borderRadius: '10px' }}>
            ⚠ Error loading history: {error}
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>
            No matches played and stored yet. Go play a match!
          </div>
        ) : (
          <div className='match-list' style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Map each match onto its own interactive summary card */}
            {matches.map((match) => {
              const isExpanded = expandedMatchId === match._id;
              return (
                <div key={match._id} className={`history-card ${isExpanded ? 'expanded' : ''}`} onClick={() => toggleExpand(match._id)}>
                  
                  {/* Card Header displaying basic details and actions */}
                  <div className='history-card-header'>
                    <div className='header-left'>
                      <div className='teams-title'>
                        {match.team1} <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>vs</span> {match.team2}
                      </div>
                      <div className='match-meta-text'>
                        {formatDate(match.createdAt)} | {match.overs} Overs
                      </div>
                    </div>
                    <div className='header-right'>
                      <span className='expand-arrow'>{isExpanded ? 'see less' : 'see more'}</span>
                      {/* Delete button action trigger */}
                      <button className='delete-match-btn' onClick={(e) => deleteMatch(match._id, e)} title="Delete match from history">
                        🗑
                      </button>
                    </div>
                  </div>

                  {/* Highlight text showing final winner outcome summary */}
                  <div className='match-result-summary'>
                     {match.result}
                  </div>

                  {/* Collapsible card body rendering detailed stats table layouts */}
                  {isExpanded && (
                    <div className='history-card-body' onClick={(e) => e.stopPropagation()}>
                      
                      {/* Innings 1 stats scorecard layout */}
                      {renderStatsTable(
                        "Innings 1",
                        match.innings1.battingTeam,
                        match.innings1.score,
                        match.innings1.wickets,
                        match.innings1.balls,
                        match.overs,
                        match.innings1.batterStats,
                        match.innings1.bowlerStats
                      )}
                      
                      {/* Visual separator line between innings */}
                      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', margin: '20px 0 10px 0' }} />

                      {/* Innings 2 stats scorecard layout */}
                      {renderStatsTable(
                        "Innings 2",
                        match.innings2.battingTeam,
                        match.innings2.score,
                        match.innings2.wickets,
                        match.innings2.balls,
                        match.overs,
                        match.innings2.batterStats,
                        match.innings2.bowlerStats
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Footer credit branding */}
      <div className='footer' style={{ marginTop: '30px' }}>
        DONE BY CHANDAN S PES1PG25CA269
      </div>
    </div>
  )
}
export default MatchHistory
