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
  const [userData, setUserData] = useState({ name: '', email: '' });
  let storedName = localStorage.getItem('name');

  const handleLogin = (name, email) => {
    setUserData({ name, email });
    localStorage.setItem('name', name);
  }

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
        return false;
    }
  }

  const handleLogout = async () => {
    const result = await LogoutUserAPI();
    if (result){
      localStorage.removeItem('email'); 
      localStorage.removeItem('name'); 
    }else{
      console.log("Could not logout!")
    }
    
  };

  return (
    <Router>
        <div style={{ textAlign: 'center' }}>
          <h1>Amidst Ourselves</h1>
          <MenuBar />
          {storedName ? <h3>Logged-In as {storedName}</h3> : null}
          <Switch>
            <Route exact path="/">
              <Login onLogin={handleLogin} />
            </Route>
            <Route path="/register" component={ Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/game" render={() => <Game />} />
            <Route path="/leaderboard" component={LeaderboardPage} />
          </Switch>
        </div>
    </Router>
  );
}
