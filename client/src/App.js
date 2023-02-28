import React, { useState } from 'react';
import './App.css';
import { Login } from './login';
import { Register } from './register';
import Game from './components/Game/index';

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
          <Game />
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
