
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StakeholderPresentation from './components/StakeholderPresentation';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Simple logic to allow standalone presentation access via URL parameter ?mode=presentation
const urlParams = new URLSearchParams(window.location.search);
const isPresentationMode = urlParams.get('mode') === 'presentation';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isPresentationMode ? <StakeholderPresentation /> : <App />}
  </React.StrictMode>
);
