import React, { useState, useEffect } from 'react';
import './App.css';
import { Login } from './login';
import { Register } from './register';
import { ForgotPassword } from './forgotPassword';
import Game from './components/Game/index';
import {LeaderboardPage} from './leaderboard';
import MenuBar from './menuBar';
import NotFound from './notFound';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


export default function App() {
  const [userData, setUserData] = useState({ name: 'Anonymous', email: 'Anonymous' });
  let storedName = localStorage.getItem('name');

  //This function store the logged in user name and email. 
  const handleLogin = (name, email) => {
    setUserData({ name, email });
    localStorage.setItem('name', name);
  }

  //We want to logout the user if the browser close or user leave the game. 
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const storedEmail = localStorage.getItem('emailStart');
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
  //Our database need to be updated to change the active status to indecate that user is not logged in. 
  const LogoutUserAPI = async () =>{
    const storedEmail = localStorage.getItem('emailStart');
    try{
      const response = await fetch(process.env.REACT_APP_HOST_URL + "/user/logout", {
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
  //Ensure that user logout procedure is followed when browser close. 
  const handleLogout = async () => {
    const result = await LogoutUserAPI();
    if (result){
      localStorage.removeItem('emailStart'); 
      localStorage.removeItem('name'); 
    }else{
      console.log("Could not logout!")
    }
    window.location.reload();
  };

  
  return (
    <Router>
        <div style={{ textAlign: 'center' }}>
          <h1>Amidst Ourselves</h1>
          <MenuBar userData = {userData}/>
          <Switch>
            <Route exact path="/">
              <Login onLogin={handleLogin} />
            </Route>
            <Route path="/register" component={ Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/game" render={() => <Game userData={userData} />} />
            <Route path="/leaderboard" component={LeaderboardPage} />
            <Route path="*" component={NotFound} />
          </Switch>
        </div>
    </Router>
  );
}
