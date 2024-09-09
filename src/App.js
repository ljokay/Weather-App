import React from 'react';
import './App.css';
import WeatherDisplay from './Components/WeatherDisplay';
import NavBar from './Components/Nav';

function App() {
  return (
    <div>
      <NavBar />
      <WeatherDisplay />
    </div>
  );
}

export default App;
