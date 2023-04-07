import React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';


const MenuBar = ({ userData }) => {
  const location = useLocation();
  const history = useHistory();

  const LogoutUserAPI = async () =>{
    //const storedEmail = localStorage.getItem('email');
    const storedEmail = userData.email;
    if(storedEmail){
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
            return true;
        }
      }catch(error){
          console.log("Error Occured in fetch",error);
      }
    }else{
      console.log("Anonymour user logout")
      return true;
    }
    
  }
  
  const handleLogout = async () => {
    
    const result = await LogoutUserAPI();
    if (result){
      localStorage.removeItem('email'); 
      localStorage.removeItem('name'); 
        history.push('/');
        window.location.reload();
      
    }else{
      console.log("Could not logout!")
    }
    window.location.reload();
  };

  const reloadHandle = async () => {
    // history.push('/leaderboard');
    // window.location.reload();
  };

  

  return (
    <div className="menu-bar">
      <ul>
        {location.pathname !== '/game' && location.pathname !== '/leaderboard' &&(
          <li>
            <Link to="/">Login</Link>
          </li>
        )}
        {location.pathname !== '/game' && location.pathname !== '/leaderboard'  &&(
          <li>
            <Link to="/register">Register</Link>
          </li>
        )}
        {location.pathname !== '/game' && location.pathname !== '/leaderboard'  &&(
          <li>
            <Link to="/forgot-password">Forgot Password</Link>
          </li>
        )}

        {location.pathname !== '/' && location.pathname !== '/register' && location.pathname !== '/forgot-password' &&(
          <li>
            <Link to="/game">Game</Link>
          </li>
        )}
        {location.pathname !== '/' && location.pathname !== '/register' && location.pathname !== '/forgot-password' &&(
          <li>
            <Link to="/leaderboard" onClick={reloadHandle}>Leaderboard</Link>
          </li>
        )}
        {location.pathname !== '/' && location.pathname !== '/register' && location.pathname !== '/forgot-password' &&(
          <li>
            <Link to="/" onClick={handleLogout}>Logout</Link>
          </li>
        )}
      </ul>
      <style jsx>{`
        .menu-bar {
          background-color: #333;
          color: #fff;
          display: flex;
          justify-content: center; /* center items horizontally */
          align-items: center;
          padding: 10px;
        }
        ul {
          list-style-type: none;
          margin: 0;
          padding: 0;
          display: flex;
        }
        li {
          margin: 0 10px;
        }
        a {
          color: #fff;
          text-decoration: none;
          font-size: 18px;
        }
        a:hover {
          color: #ddd;
        }
      `}</style>
    </div>
  );
}

export default MenuBar;
