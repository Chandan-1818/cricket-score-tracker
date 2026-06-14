/**
 * Centralised API service for Cricket Score Tracker.
 *
 * REACT_APP_API_URL must be set as an environment variable in Vercel to:
 *   https://cricket-score-tracker-backend.onrender.com
 *
 * In local development, CRA's proxy (package.json "proxy") handles it,
 * so an empty string routes through the proxy to localhost:5000.
 */

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://cricket-score-tracker-backend.onrender.com'
    : '');

/**
 * Fetch all matches
 * GET /api/matches
 */
export const fetchMatches = async () => {
  const response = await fetch(`${BASE_URL}/api/matches`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch matches: ${response.status} ${text}`);
  }
  return response.json();
};

/**
 * Save a completed match
 * POST /api/matches
 * @param {Object} matchPayload - Full match data object
 */
export const saveMatch = async (matchPayload) => {
  const response = await fetch(`${BASE_URL}/api/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matchPayload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to save match: ${response.status} ${text}`);
  }
  return response.json();
};

/**
 * Delete a match by ID
 * DELETE /api/matches/:id
 * @param {string} id - MongoDB document _id
 */
export const deleteMatchById = async (id) => {
  const response = await fetch(`${BASE_URL}/api/matches/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete match: ${response.status} ${text}`);
  }
  return response.json();
};

/**
 * Update a match by ID
 * PUT /api/matches/:id
 * @param {string} id - MongoDB document _id
 * @param {Object} data - Updated match data
 */
export const updateMatchById = async (id, data) => {
  const response = await fetch(`${BASE_URL}/api/matches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update match: ${response.status} ${text}`);
  }
  return response.json();
};
