import React, { useState, useEffect } from 'react';
import Phaser from 'phaser';
import './App.css';
import titleScene from './amidstOurselvesGame/scenes/titleScene';
import loadGameScene from './amidstOurselvesGame/scenes/loadGameScene';
import gameScene from './amidstOurselvesGame/scenes/gameScene';

import { Login } from './login';
import { Register } from './register';

const SPRITE_WIDTH = 84;
const SPRITE_HEIGHT = 128;
const PLAYER_WIDTH = 34;
const PLAYER_HEIGHT = 46;
const SERVER_ADDRESS = 'http://localhost:3000';

function MyGame() {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: [titleScene, loadGameScene, gameScene],
    parent: 'game-container',
  };

  const game = new Phaser.Game(config);

  useEffect(() => {
    return () => {
      game.destroy(true);
    };
  }, [game]);

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
