import React from 'react';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Weather App</h1>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item"><a href="/">Current Weather</a></li>
        <li className="nav-item"><a href="/about">Weather App</a></li>
        <li className="nav-item"><a href="/services">Compare?</a></li>
      </ul>
    </nav>
  );
};

export default NavBar;