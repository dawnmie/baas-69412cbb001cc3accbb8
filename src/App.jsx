import React from 'react';
import EarthGlobe from './components/EarthGlobe';
import './App.css';

function App() {
  return (
    <div className="app">
      <EarthGlobe />
      <div className="info-overlay">
        <h1>3D Earth Globe</h1>
        <p>Drag to rotate • Scroll to zoom • Explore our planet in 3D</p>
        <div className="controls-info">
          <span>🖱️ Drag to rotate</span>
          <span>🔍 Scroll to zoom</span>
          <span>📱 Touch to rotate</span>
        </div>
      </div>
    </div>
  );
}

export default App;