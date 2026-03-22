import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import './styl.css';

import Symulation from './symulation.jsx';
import Explenation from './explenation.jsx';

function App() {
  return (
    <div className="app-layout">
      
      <div className="simulation-panel">
        <Symulation />
      </div>

      <div className="sidebar-panel">
        <Explenation />
      </div>

    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);