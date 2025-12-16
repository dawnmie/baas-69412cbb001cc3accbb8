import React from 'react';
import EarthGlobe from './components/EarthGlobe';
import './App.css';

function App() {
  return (
    <div className="app">
      <EarthGlobe />
      <div className="info-overlay">
        <h1>3D Earth Globe</h1>
        <p>Drag to rotate the globe • Explore our planet in 3D</p>
        <div className="controls-info">
          <span>🖱️ Click and drag to rotate</span>
          <span>📱 Touch and drag on mobile</span>
        </div>
      </div>
    </div>
  );
}

export default App;