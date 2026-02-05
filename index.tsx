
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

try {
  root.render(
    <React.StrictMode>
      {isPresentationMode ? <StakeholderPresentation /> : <App />}
    </React.StrictMode>
  );
} catch (error) {
  console.error("Render Error:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif; background: white; min-height: 100vh;">
      <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 16px;">Application Render Error</h1>
      <p style="font-size: 16px; margin-bottom: 24px;">The application failed to start. This might be due to a configuration error or a conflict in the deployment environment.</p>
      <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 16px; border-radius: 8px;">
        <pre style="white-space: pre-wrap; font-size: 14px; margin: 0;">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
      </div>
    </div>
  `;
}
