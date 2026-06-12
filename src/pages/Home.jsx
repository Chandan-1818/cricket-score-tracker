/**
 * Home Component
 * 
 * This serves as the landing/welcome page of the Cricket Score Tracker application.
 * It provides users with quick navigation to either start a new match configuration
 * or view past match histories from the database.
 */

// Import Link component from react-router-dom for SPA-friendly navigation
import { Link } from 'react-router-dom'

function Home() {
  return (
    // Main wrapper layout class for custom home screen animations and CSS styles
    <div className='home'>

      {/* Hero container that showcases the primary value proposition and call-to-action */}
      <div className='hero'>

        {/* The main branding headline for the tracker */}
        <h1>Cricket Score Tracker</h1>

        {/* A brief tagline describing the functionality of the app */}
        <p>Create and track cricket matches easily</p>

        {/* Navigation action bar grouping redirect buttons */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          {/* Action button to initialize the match setup form */}
          <Link to='/Match'>
            <button className='btn'>Start Match</button>
          </Link>
          
          {/* Action button to view details of previously stored matches */}
          <Link to='/history'>
            <button className='btn' style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'gold', border: '1px solid gold' }}>
              Match History
            </button>
          </Link>
        </div>
      </div>

      {/* Footer credits containing project author details */}
      <div className='footer'>
        DONE BY CHANDAN S PES1PG25CA269
      </div>
    </div>
  )
}

// Export Home component to be integrated into App routes
export default Home