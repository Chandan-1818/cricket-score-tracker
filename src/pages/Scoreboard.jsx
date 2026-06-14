import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { saveMatch } from '../services/api'

/**
 * Scoreboard Component
 * 
 * This is the core engine of the Cricket Score Tracker application.
 * It manages the scoring state machine, tracks batting/bowling statistics, handles
 * striker/non-striker transitions (including rotation on odd runs or over changes),
 * manages active bowler rotation, and posts final match details directly to the database
 * once the second innings completes.
 */
function Scoreboard() {
  const location = useLocation()
  const navigate = useNavigate()

  // Retrieve setting state from location navigation history or supply default attributes
  const matchState = location.state || {}
  const { team1 = "Team 1", team2 = "Team 2", overs = 5, tossWinner, decision, players = { team1: [], team2: [] } } = matchState

  /**
   * Determine initial batting/bowling teams based on toss winner selection.
   * If toss winner chose to Bat, they bat first; otherwise they bowl first.
   */
  const initialBattingId = tossWinner === team1 
    ? (decision === 'Bat' ? 'team1' : 'team2') 
    : (decision === 'Bat' ? 'team2' : 'team1')

  const initialBowlingId = initialBattingId === 'team1' ? 'team2' : 'team1'

  // Match progression state tracking
  const [innings, setInnings] = useState(1)                // Active innings: 1 or 2
  const [targetScore, setTargetScore] = useState(null)      // Target score set for Innings 2 (Innings 1 score + 1)
  const [currentBattingId, setCurrentBattingId] = useState(initialBattingId) // 'team1' or 'team2' currently batting
  const [currentBowlingId, setCurrentBowlingId] = useState(initialBowlingId) // 'team1' or 'team2' currently fielding

  const battingFirst = currentBattingId === 'team1' ? team1 : team2
  const bowlingFirst = currentBowlingId === 'team1' ? team1 : team2

  // Derive player name list arrays for current batting/bowling configurations
  const battingPlayers = useMemo(() => players[currentBattingId] || [], [players, currentBattingId]);
  const bowlingPlayers = useMemo(() => players[currentBowlingId] || [], [players, currentBowlingId]);

  // General scoreboard counters
  const [score, setScore] = useState(0)      // Total runs scored in the current innings
  const [wickets, setWickets] = useState(0)  // Total wickets fallen in the current innings
  const [balls, setBalls] = useState(0)      // Total valid balls bowled in the current innings

  // Database operation states
  const [dbSaveStatus, setDbSaveStatus] = useState('idle')  // 'idle', 'saving', 'saved', or 'error'
  const [dbError, setDbError] = useState(null)              // API error messages
  const [hasSaved, setHasSaved] = useState(false)            // Lock variable to prevent duplicate POST requests

  // Roster index trackers for active participants
  const [strikerIndex, setStrikerIndex] = useState(null)      // Index of batter facing the bowler
  const [nonStrikerIndex, setNonStrikerIndex] = useState(null)  // Index of batter at the opposite end
  const [bowlerIndex, setBowlerIndex] = useState(null)          // Index of current active bowler

  // Operational state checks to trigger selection panels instead of scoreboard inputs
  const [isSelectingOpeners, setIsSelectingOpeners] = useState(true)     // Opener picker step active?
  const [openerSelectionStep, setOpenerSelectionStep] = useState(1)       // 1 = Pick Striker, 2 = Pick Non-Striker
  const [isSelectingNextBatter, setIsSelectingNextBatter] = useState(false) // Picker active when a wicket falls
  const [slotToFill, setSlotToFill] = useState('striker')                 // Target assignment slot
  const [isSelectingBowler, setIsSelectingBowler] = useState(false)       // Picker active at the end of an over
  const [battedPlayers, setBattedPlayers] = useState([])                 // Tracks players who entered the pitch

  // Stats Modal presentation toggle
  const [isViewingStats, setIsViewingStats] = useState(false)
  const [innings1Data, setInnings1Data] = useState(null)                  // Holds final dataset of Innings 1

  // Arrays map player index to batting/bowling statistics
  const [batterStats, setBatterStats] = useState(
    Array(20).fill(null).map(() => ({ runs: 0, balls: 0, fours: 0, sixes: 0 }))
  )

  const [bowlerStats, setBowlerStats] = useState(
    Array(20).fill(null).map(() => ({ balls: 0, runs: 0, wickets: 0, extras: 0 }))
  )

  // Max wickets corresponds to number of players minus 1 (since you need 2 players to bat)
  const maxWickets = battingPlayers.length > 1 ? battingPlayers.length - 1 : 10;

  // Convert raw ball counter into traditional "Overs.Balls" format
  const currentOvers = Math.floor(balls / 6)
  const currentBalls = balls % 6
  const oversDisplay = `${currentOvers}.${currentBalls}`
  
  // Game ending conditions
  const isTargetChased = innings === 2 && targetScore && score >= targetScore;
  const isMatchOver = currentOvers >= Number(overs) || wickets >= maxWickets || isTargetChased;

  /**
   * Effect Hook: Automatically saves final match dataset to MongoDB when the match terminates.
   * Runs only when target conditions are met and restricts calls using `hasSaved` lock.
   */
  useEffect(() => {
    if (isMatchOver && innings === 2 && !hasSaved) {
      setHasSaved(true);
      setDbSaveStatus('saving');

      // Helper filters to strip out unused player index rows from the database payload
      const hasBatStats = (s) => !(s.balls === 0 && s.runs === 0 && s.fours === 0 && s.sixes === 0);
      const hasBowlStats = (s) => !(s.balls === 0 && s.runs === 0 && s.extras === 0);

      // Map batting statistics for Innings 1
      const innings1BatterStats = innings1Data ? innings1Data.batterStats
        .map((s, i) => {
          if (!hasBatStats(s)) return null;
          return {
            name: innings1Data.battingPlayers[i] || `Batter ${i + 1}`,
            runs: s.runs,
            balls: s.balls,
            fours: s.fours,
            sixes: s.sixes
          };
        })
        .filter(Boolean) : [];

      // Map bowling statistics for Innings 1
      const innings1BowlerStats = innings1Data ? innings1Data.bowlerStats
        .map((s, i) => {
          if (!hasBowlStats(s)) return null;
          return {
            name: innings1Data.bowlingPlayers[i] || `Bowler ${i + 1}`,
            overs: `${Math.floor(s.balls / 6)}.${s.balls % 6}`,
            runs: s.runs,
            wickets: s.wickets,
            extras: s.extras
          };
        })
        .filter(Boolean) : [];

      // Map batting statistics for Innings 2
      const innings2BatterStats = batterStats
        .map((s, i) => {
          if (!hasBatStats(s)) return null;
          return {
            name: battingPlayers[i] || `Batter ${i + 1}`,
            runs: s.runs,
            balls: s.balls,
            fours: s.fours,
            sixes: s.sixes
          };
        })
        .filter(Boolean);

      // Map bowling statistics for Innings 2
      const innings2BowlerStats = bowlerStats
        .map((s, i) => {
          if (!hasBowlStats(s)) return null;
          return {
            name: bowlingPlayers[i] || `Bowler ${i + 1}`,
            overs: `${Math.floor(s.balls / 6)}.${s.balls % 6}`,
            runs: s.runs,
            wickets: s.wickets,
            extras: s.extras
          };
        })
        .filter(Boolean);

      // Formulate textual final result summary
      let finalResult = '';
      if (score >= targetScore) {
        const remainingWickets = maxWickets - wickets;
        finalResult = `${battingFirst} won by ${remainingWickets} wicket${remainingWickets !== 1 ? 's' : ''}!`;
      } else if (score < targetScore - 1) {
        const runDifference = (targetScore - 1) - score;
        finalResult = `${bowlingFirst} won by ${runDifference} run${runDifference !== 1 ? 's' : ''}!`;
      } else {
        finalResult = "Match Tied!";
      }

      // Compile final payload to match expected structure in database collection
      const matchPayload = {
        team1,
        team2,
        overs: Number(overs),
        tossWinner,
        decision,
        players,
        innings1: {
          battingTeam: innings1Data ? innings1Data.battingTeam : battingFirst,
          bowlingTeam: innings1Data ? innings1Data.bowlingTeam : bowlingFirst,
          score: innings1Data ? innings1Data.score : 0,
          wickets: innings1Data ? innings1Data.wickets : 0,
          balls: innings1Data ? innings1Data.balls : 0,
          batterStats: innings1BatterStats,
          bowlerStats: innings1BowlerStats
        },
        innings2: {
          battingTeam: battingFirst,
          bowlingTeam: bowlingFirst,
          score: score,
          wickets: wickets,
          balls: balls,
          batterStats: innings2BatterStats,
          bowlerStats: innings2BowlerStats
        },
        result: finalResult
      };

      // POST final match records to backend API using native driver handlers
      saveMatch(matchPayload)
        .then(() => {
          setDbSaveStatus('saved');
        })
        .catch(err => {
          console.error('Error saving match:', err);
          setDbSaveStatus('error');
          setDbError(err.message);
        });
    }
  }, [
    isMatchOver,
    innings,
    hasSaved,
    team1,
    team2,
    overs,
    tossWinner,
    decision,
    players,
    innings1Data,
    batterStats,
    bowlerStats,
    battingPlayers,
    bowlingPlayers,
    battingFirst,
    bowlingFirst,
    score,
    wickets,
    balls,
    maxWickets,
    targetScore
  ]);

  /**
   * Selection: Assigns batter indices.
   * Handles striker/non-striker open assignments and next batter replacements.
   */
  const handleSelectBatter = (idx) => {
    setBattedPlayers(prev => [...prev, idx])
    
    if (isSelectingOpeners) {
      if (openerSelectionStep === 1) {
        setStrikerIndex(idx)
        setOpenerSelectionStep(2)
      } else {
        setNonStrikerIndex(idx)
        setIsSelectingOpeners(false)
        setIsSelectingBowler(true) // Openers set, prompt to select initial bowler
      }
    } else if (isSelectingNextBatter) {
      if (slotToFill === 'striker') setStrikerIndex(idx)
      else setNonStrikerIndex(idx)
      
      setIsSelectingNextBatter(false)
      
      // If wicket fell on over boundary, choose bowler next
      if (balls % 6 === 0 && !isMatchOver) {
        setIsSelectingBowler(true)
      }
    }
  }

  /**
   * Selection: Assign bowler index.
   */
  const selectBowler = (index) => {
    setBowlerIndex(index)
    setIsSelectingBowler(false)
  }

  /**
   * Action: Accumulate runs scored on a valid delivery.
   * Updates scores, ball count, player statistics and shifts strike configurations.
   */
  const addRuns = (runs) => {
    setScore(prev => prev + runs)
    setBalls(prev => prev + 1)
    
    // Update active striker's stats (runs, balls faced, boundary counts)
    setBatterStats(prev => {
      const newStats = [...prev]
      newStats[strikerIndex] = {
        runs: newStats[strikerIndex].runs + runs,
        balls: newStats[strikerIndex].balls + 1,
        fours: newStats[strikerIndex].fours + (runs === 4 ? 1 : 0),
        sixes: newStats[strikerIndex].sixes + (runs === 6 ? 1 : 0),
      }
      return newStats
    })

    // Update active bowler's stats (balls bowled, runs conceded)
    setBowlerStats(prev => {
      const newStats = [...prev]
      newStats[bowlerIndex] = {
        ...newStats[bowlerIndex],
        runs: newStats[bowlerIndex].runs + runs,
        balls: newStats[bowlerIndex].balls + 1
      }
      return newStats
    })

    let nextStriker = strikerIndex
    let nextNonStriker = nonStrikerIndex

    // Odd runs swap batsman strike position
    if (runs % 2 !== 0) {
      nextStriker = nonStrikerIndex
      nextNonStriker = strikerIndex
    }

    // Over boundary (6 valid balls) rotation
    if ((balls + 1) % 6 === 0) {
      // Swaps strike positions at the end of the over
      const temp = nextStriker
      nextStriker = nextNonStriker
      nextNonStriker = temp

      const updatedOvers = Math.floor((balls + 1) / 6)
      const updatedScore = score + runs;
      const willBeChased = innings === 2 && targetScore && updatedScore >= targetScore;

      // Ask for a new bowler if over complete and match has not resolved
      if (updatedOvers < Number(overs) && wickets < maxWickets && !willBeChased) {
        setIsSelectingBowler(true)
      }
    }

    setStrikerIndex(nextStriker)
    setNonStrikerIndex(nextNonStriker)
  }

  /**
   * Action: Record wicket event.
   * Increment wicket tallies and update stats. Prompt selection for replacement batter.
   */
  const addWicket = () => {
    if (wickets < maxWickets) {
      setWickets(prev => prev + 1)
      setBalls(prev => prev + 1)
      
      // Striker faced the ball, increment their balls count
      setBatterStats(prev => {
        const newStats = [...prev]
        newStats[strikerIndex] = {
          ...newStats[strikerIndex],
          balls: newStats[strikerIndex].balls + 1
        }
        return newStats
      })

      // Bowler gains a wicket and registers ball count
      setBowlerStats(prev => {
        const newStats = [...prev]
        newStats[bowlerIndex] = {
          ...newStats[bowlerIndex],
          balls: newStats[bowlerIndex].balls + 1,
          wickets: newStats[bowlerIndex].wickets + 1
        }
        return newStats
      })

      let emptySlot = 'striker'
      let keptBatter = nonStrikerIndex

      // If wicket occurs on final ball of the over, rotation shifts kept batter to striker for next over
      if ((balls + 1) % 6 === 0) {
        emptySlot = 'nonStriker' 
        setStrikerIndex(keptBatter) 
      } else {
        setNonStrikerIndex(keptBatter) 
      }

      const updatedOvers = Math.floor((balls + 1) / 6)
      
      // Prompt selection for next batsman if team is not all-out and overs remain
      if (wickets + 1 < maxWickets && updatedOvers < Number(overs)) {
        setSlotToFill(emptySlot)
        setIsSelectingNextBatter(true)
      }
    }
  }

  /**
   * Action: Record extra run delivery (Wide / No Ball).
   * Runs increments by 1, bowler registers run and extra count. Ball counter remains unchanged.
   */
  const addExtra = (type) => {
    setScore(prev => prev + 1) 
    
    setBowlerStats(prev => {
      const newStats = [...prev]
      newStats[bowlerIndex] = {
        ...newStats[bowlerIndex],
        runs: newStats[bowlerIndex].runs + 1,
        extras: newStats[bowlerIndex].extras + 1
      }
      return newStats
    })
  }

  /**
   * Text helper: Format batter score summary
   */
  const getBatterStr = (idx) => {
    if (idx === null) return "Waiting..."
    const stats = batterStats[idx] || {runs:0, balls:0, fours:0, sixes:0}
    const sr = stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : "0.0"
    return `${stats.runs} (${stats.balls}) | SR: ${sr} | 4s: ${stats.fours} | 6s: ${stats.sixes}`
  }

  /**
   * Text helper: Format bowler stats summary
   */
  const getBowlerStr = (idx) => {
    if (idx === null) return "Waiting..."
    const stats = bowlerStats[idx] || {balls:0, runs:0, wickets:0, extras:0}
    const o = Math.floor(stats.balls / 6)
    const b = stats.balls % 6
    return `Overs: ${o}.${b} | Runs: ${stats.runs} | Wickets: ${stats.wickets} | Extras: ${stats.extras}`
  }

  /**
   * State update: transition match into Innings 2.
   * Caches Innings 1 scorecard details and resets scoring states for the chasing team.
   */
  const startNextInnings = () => {
    setInnings1Data({
      battingTeam: battingFirst,
      bowlingTeam: bowlingFirst,
      score,
      wickets,
      balls,
      overs,
      batterStats: [...batterStats],
      bowlerStats: [...bowlerStats],
      battingPlayers: [...battingPlayers],
      bowlingPlayers: [...bowlingPlayers]
    })

    setTargetScore(score + 1)
    setCurrentBattingId(currentBowlingId) // Invert batting and bowling teams
    setCurrentBowlingId(currentBattingId)
    setInnings(2)
    setScore(0)
    setWickets(0)
    setBalls(0)
    
    // Clear selection models
    setStrikerIndex(null)
    setNonStrikerIndex(null)
    setBowlerIndex(null)
    setBattedPlayers([])
    
    // Reset stats maps
    setBatterStats(Array(20).fill(null).map(() => ({ runs: 0, balls: 0, fours: 0, sixes: 0 })))
    setBowlerStats(Array(20).fill(null).map(() => ({ balls: 0, runs: 0, wickets: 0, extras: 0 })))
    
    // Force user to pick openers and initial bowler again
    setIsSelectingOpeners(true)
    setOpenerSelectionStep(1)
    setIsSelectingBowler(false)
  }

  /**
   * Text helper: compute final outcome message
   */
  const getFinalResult = () => {
    if (score >= targetScore) {
      const remainingWickets = maxWickets - wickets;
      return `${battingFirst} won by ${remainingWickets} wicket${remainingWickets !== 1 ? 's' : ''}!`;
    } else if (score < targetScore - 1) {
      const runDifference = (targetScore - 1) - score;
      return `${bowlingFirst} won by ${runDifference} run${runDifference !== 1 ? 's' : ''}!`;
    } else {
      return "Match Tied!";
    }
  }

  /**
   * Helper JSX: Renders scorecard tables inside the stats modal overlay
   */
  const renderStatsTable = (title, batTeam, bowlTeam, batStats, bowlStats, matchBalls, matchScore, matchWickets) => (
    <div className='stats-section'>
      <h3 style={{color:'gold', marginTop: '20px'}}>{title}</h3>
      <p style={{color:'white', marginBottom: '10px'}}>{batTeam} - {matchScore}/{matchWickets} ({Math.floor(matchBalls/6)}.{matchBalls%6} Overs)</p>
      
      <div style={{overflowX: 'auto'}}>
        <table className='stats-table'>
          <thead>
            <tr>
              <th>Batter</th>
              <th>R</th>
              <th>B</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
          </thead>
          <tbody>
            {batStats.map((s, i) => {
              if (s.balls === 0 && s.runs === 0 && s.fours === 0 && s.sixes === 0) return null;
              const sr = s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : "0.0";
              return (
                <tr key={`bat-${i}`}>
                  <td>{battingPlayers[i] || `Batter ${i+1}`}</td>
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

      <div style={{overflowX: 'auto', marginTop: '15px'}}>
        <table className='stats-table'>
          <thead>
            <tr>
              <th>Bowler</th>
              <th>O</th>
              <th>R</th>
              <th>W</th>
              <th>E</th>
            </tr>
          </thead>
          <tbody>
            {bowlStats.map((s, i) => {
              if (s.balls === 0 && s.runs === 0 && s.extras === 0) return null;
              return (
                <tr key={`bowl-${i}`}>
                  <td>{bowlingPlayers[i] || `Bowler ${i+1}`}</td>
                  <td>{Math.floor(s.balls/6)}.{s.balls%6}</td>
                  <td>{s.runs}</td>
                  <td>{s.wickets}</td>
                  <td>{s.extras}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className='match-page'>
      {/* Full scorecard overlay dialog */}
      {isViewingStats && (
        <div className='stats-modal'>
          <div className='stats-modal-content'>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h2>Match Scorecard</h2>
              <button className='close-btn' onClick={() => setIsViewingStats(false)}>✕</button>
            </div>
            
            {/* Render Innings 1 scorecard details if completed */}
            {innings1Data && renderStatsTable(
              "Innings 1", 
              innings1Data.battingTeam, 
              innings1Data.bowlingTeam, 
              innings1Data.batterStats, 
              innings1Data.bowlerStats, 
              innings1Data.balls, 
              innings1Data.score, 
              innings1Data.wickets
            )}

            {/* Render active innings stats */}
            {renderStatsTable(
              innings === 1 ? "Innings 1 (Current)" : "Innings 2 (Current)", 
              battingFirst, 
              bowlingFirst, 
              batterStats, 
              bowlerStats, 
              balls, 
              score, 
              wickets
            )}
          </div>
        </div>
      )}

      {/* Main Scoreboard workspace */}
      <div className='container scoreboard-container'>
        <div className='scoreboard-header'>
          <h2>{battingFirst} <span style={{color:'rgba(255,255,255,0.5)', fontSize: '20px'}}>vs</span> {bowlingFirst}</h2>
          <div className='header-info'>
            <p className='match-info'>Overs: {oversDisplay} / {overs}</p>
            {targetScore && <p className='match-info target-info'>Target: {targetScore}</p>}
          </div>
        </div>

        {/* Live Score tallies and current run rate calculations */}
        <div className='score-display'>
          <h1 className='main-score'>{score}-{wickets}</h1>
          <p className='crr-text'>CRR: {balls > 0 ? ((score / balls) * 6).toFixed(1) : '0.0'}</p>
          <button className='view-stats-btn' onClick={() => setIsViewingStats(true)}>View Full Stats</button>
        </div>

        {/* Active batsman and bowler information boxes */}
        <div className='active-players'>
          <div className='batters'>
            <div className='player-row'>
              <span className='player-name'>{strikerIndex !== null ? battingPlayers[strikerIndex] || `Batter ${strikerIndex + 1}` : "Striker"}</span>
              <span className='player-status'></span>
            </div>
            <div className='player-stats-row'>
              {strikerIndex !== null && getBatterStr(strikerIndex)}
            </div>

            <div className='player-row' style={{marginTop: '15px'}}>
              <span className='player-name'>{nonStrikerIndex !== null ? battingPlayers[nonStrikerIndex] || `Batter ${nonStrikerIndex + 1}` : "Non-Striker"}</span>
            </div>
            <div className='player-stats-row'>
              {nonStrikerIndex !== null && getBatterStr(nonStrikerIndex)}
            </div>
          </div>

          <div className='bowler'>
            <div className='player-row' style={{justifyContent: 'flex-end'}}>
              <span className='player-status'></span>
              <span className='player-name'>{bowlerIndex !== null ? bowlingPlayers[bowlerIndex] || `Bowler ${bowlerIndex + 1}` : "Bowler"}</span>
            </div>
            <div className='player-stats-row' style={{textAlign: 'right'}}>
              {bowlerIndex !== null && getBowlerStr(bowlerIndex)}
            </div>
          </div>
        </div>

        {/* Conditional interaction grids based on scoring phases */}
        {!isMatchOver ? (
          isSelectingOpeners ? (
            <div className='selection-panel'>
              <h3>Select {openerSelectionStep === 1 ? 'Striker' : 'Non-Striker'}</h3>
              <div className='selection-grid'>
                {battingPlayers.map((player, idx) => (
                  !battedPlayers.includes(idx) && (
                    <button key={`batter-${idx}`} className='select-btn' onClick={() => handleSelectBatter(idx)}>
                      {player || `Batter ${idx + 1}`}
                    </button>
                  )
                ))}
              </div>
            </div>
          ) : isSelectingNextBatter ? (
            <div className='selection-panel'>
              <h3>Select Next Batter</h3>
              <div className='selection-grid'>
                {battingPlayers.map((player, idx) => (
                  !battedPlayers.includes(idx) && (
                    <button key={`batter-${idx}`} className='select-btn' onClick={() => handleSelectBatter(idx)}>
                      {player || `Batter ${idx + 1}`}
                    </button>
                  )
                ))}
              </div>
            </div>
          ) : isSelectingBowler ? (
            <div className='selection-panel'>
              <h3>Select Bowler for Next Over</h3>
              <div className='selection-grid'>
                {bowlingPlayers.map((player, idx) => (
                  <button key={`bowler-${idx}`} className='select-btn' onClick={() => selectBowler(idx)}>
                    {player || `Bowler ${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Scoring panel containing standard run inputs and extra actions
            <div className='scoring-actions'>
              <div className='runs-grid'>
                {[0, 1, 2, 3, 4, 6].map(run => (
                  <button key={`run-${run}`} className='run-btn' onClick={() => addRuns(run)}>
                    {run}
                  </button>
                ))}
              </div>
              
              <div className='extras-grid'>
                <button className='wicket-btn' onClick={addWicket}>W</button>
                <button className='extra-btn' onClick={() => addExtra('WD')}>WD</button>
                <button className='extra-btn' onClick={() => addExtra('NB')}>NB</button>
              </div>
            </div>
          )
        ) : (
          // Final match display screen with database output markers
          <div className='result-display'>
            {innings === 1 ? (
              <>
                <h3>Innings Complete</h3>
                <p style={{color:'white', fontSize:'20px', marginBottom:'20px'}}>Target for {bowlingFirst}: <strong>{score + 1}</strong></p>
                <button className='start-btn' onClick={startNextInnings}>Start Next Innings</button>
              </>
            ) : (
              <>
                <h3>Match Complete</h3>
                <p style={{color:'gold', fontSize:'26px', fontWeight:'bold', marginTop:'10px'}}>{getFinalResult()}</p>
                
                {/* Database Save Status Indicator */}
                <div style={{ marginTop: '15px', marginBottom: '15px', fontSize: '18px' }}>
                  {dbSaveStatus === 'saving' && <p style={{ color: '#3498db' }}>⏳ Saving match details to MongoDB...</p>}
                  {dbSaveStatus === 'saved' && <p style={{ color: '#2ecc71', fontWeight: 'bold' }}>✓ Match details saved to MongoDB!</p>}
                  {dbSaveStatus === 'error' && <p style={{ color: '#e74c3c' }}>⚠ Error saving match: {dbError}</p>}
                </div>

                <button className='start-btn' onClick={() => navigate('/')} style={{marginTop: '20px'}}>Play Again</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Credit footer */}
      <div className='footer' style={{ marginTop: 'auto', paddingTop: '20px' }}>
        DONE BY CHANDAN S PES1PG25CA269
      </div>
    </div>
  )
}

export default Scoreboard
