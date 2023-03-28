import React, { useState, useEffect } from 'react';
import './App.css';
import { Login } from './login';
import { Register } from './register';
import { ForgotPassword } from './forgotPassword';
import Game from './components/Game/index';
import {LeaderboardPage} from './leaderboard';
import MenuBar from './menuBar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


export default function App() {
  const [currentForm, setCurrentForm] = useState('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleBeforeUnload = async () => {
      const storedEmail = localStorage.getItem('email');
      console.log(storedEmail);
      if(storedEmail){
        const sss = await handleLogout();
      }
        
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  

  const toggleForm = (formName) => {
    if (formName === 'forgotPassword') {
      setForgotPassword(true);
    } else {
      setCurrentForm(formName);
      setForgotPassword(false); 
    }
  };
  
  const handleLogin = (name, email) => {
    setLoggedIn(true);
    setUsername(name);
    setEmail(email);
    localStorage.setItem('email', email);
  };


  const LogoutUserAPI = async () =>{
    const storedEmail = localStorage.getItem('email');
    try{
      const response = await fetch("http://localhost:3000/user/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              username: storedEmail
          }),
      });
      const data = await response.json();

      if (data.message === "logout") {
          console.log(data.message);
          return true;
      } else {
          console.log(data.message);
          return false;
      }
    }catch(error){
        console.log("Error Occured in fetch",error);
    }
  }

  const handleLogout = async () => {
    setShowLeaderboard(false);
    const result = await LogoutUserAPI();
    if (result){
      setLoggedIn(false);
      setUsername('');
      setEmail('');
      localStorage.removeItem('email'); 
    }else{
      console.log("Could not logout!")
    }
    
  };

  
  const handleLeaderboardClick = () => {
    setShowLeaderboard(true);
  };
  const handleLeaderboardClose = () => {
    setShowLeaderboard(false);
  };
  function hideLeaderBoardMenuBar() {
    console.log("game clicked")
    //setScore(score + 1);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Amidst Ourselves</h1>
      {loggedIn && <p>Logged in as {username}</p>}
        <MenuBar 
          loggedIn={loggedIn}
          onShowLeaderboardClick={() => setShowLeaderboard(true)} 
          onLogoutClick={handleLogout}
          onReturnToGameClick={() => setShowLeaderboard(false)} 
          showLeaderboard={showLeaderboard}
        />
      {loggedIn ? (
        <>
        {showLeaderboard ? (
          <LeaderboardPage onClose={handleLeaderboardClose} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} id="game-container">
            <Game onButtonClick={hideLeaderBoardMenuBar}/>
          </div>
        )}
        <br></br> <p></p>
      </>
      ) : (
        <>
          {showLeaderboard ? (
            <LeaderboardPage onClose={handleLeaderboardClose} />
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
        </>
      )}
      
    </div>
  );
}
