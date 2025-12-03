import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('App is starting...');
console.log('Env vars:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.slice(0, 5) + '...',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);