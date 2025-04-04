import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from react-dom/client
import App from './App'; // Importing App from app.js

const root = ReactDOM.createRoot(document.getElementById('app')); // Create a root
root.render(<App />); // Render the App component