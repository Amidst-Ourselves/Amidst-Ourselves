import React, { useState, useEffect } from 'react';
import Phaser from 'phaser';
import './App.css';
import { Login } from './login';
import { Register } from './register';
import { config } from './amidstOurselvesGame/constants';

function MyGame() {
  useEffect(() => {
    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
    
  }, []);

  return null;
}

export default function App() {
  const [currentForm, setCurrentForm] = useState('login');
  const [loggedIn, setLoggedIn] = useState(false);

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  const handleLogin = () => {
    setLoggedIn(true);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Amidst Ourselves</h1>
      {loggedIn ? (
        <div
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          id="game-container"
        >
          <MyGame />
        </div>
      ) : (
        <div className="App">
          {currentForm === 'login' ? (
            <Login onFormSwitch={toggleForm} onLogin={handleLogin} />
          ) : (
            <Register onFormSwitch={toggleForm} onLogin={handleLogin} />
          )}
        </div>
      )}
    </div>
  );
}
