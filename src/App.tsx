import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import InfoBar from './components/InfoBar';
import GasChromatogram from './components/GasChromatogram';

function App() {
  const [bgColor, setBgColor] = useState('#ffffff');

  return (
    <div className="app-container">
      <Header />
      <InfoBar bgColor={bgColor} onBgColorChange={setBgColor} />
      <GasChromatogram bgColor={bgColor} />
    </div>
  );
}

export default App;
