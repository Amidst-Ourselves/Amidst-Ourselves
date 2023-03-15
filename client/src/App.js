import React, { useState } from 'react';
import './App.css';
import { Login } from './login';
import { Register } from './register';
import { ForgotPassword } from './forgotPassword';
import Game from './components/Game/index';
import LeaderboardPage from './leaderboard';


export default function App() {
  const [currentForm, setCurrentForm] = useState('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const toggleForm = (formName) => {
    if (formName === 'forgotPassword') {
      setForgotPassword(true);
    } else {
      setCurrentForm(formName);
      setForgotPassword(false); 
    }
  };
  
  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLeaderboardClick = () => {
    setShowLeaderboard(true);
  };
  const handleLeaderboardClose = () => {
    setShowLeaderboard(false);
  };


  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Amidst Ourselves</h1>
      {loggedIn ? (
        <>
        {showLeaderboard ? (
          <LeaderboardPage onClose={handleLeaderboardClose} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} id="game-container">
            <Game/>
          </div>
        )}
        <br></br> <p></p>
        {!showLeaderboard && <button onClick={handleLeaderboardClick}>Show Leaderboard</button>}
      </>
      ) : (
        <div className="App">
          {forgotPassword ? (
            <ForgotPassword onFormSwitch={toggleForm} />
          ) : currentForm === 'login' ? (
            <Login onFormSwitch={toggleForm} onLogin={handleLogin} />
          ) : (
            <Register onFormSwitch={toggleForm} onLogin={handleLogin} />
          )}
        </div>
      )}
      
    </div>
  );
}
