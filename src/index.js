// index.js
// This is the root file where React attaches the entire application to the HTML DOM.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import our main App component

// Find the HTML element with id="root" and create a React root there
const root = ReactDOM.createRoot(
  document.getElementById('root')
);

// Render the App component into the root
root.render(
  // StrictMode helps highlight potential problems in an application during development
  <React.StrictMode>
    <App />
  </React.StrictMode>
);