import React, { useState } from "react";
import { useHistory } from 'react-router-dom';

/*
  FR03 - Login.User
  This file allow the user to login into the game by entering
  the valid username/email and password combination. 
  The page also has options to enable the user to go to forget password,
  register or play the game anonymously. 
*/
export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const response = await fetch(process.env.REACT_APP_HOST_URL + "/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: email,
                    password: pass,
                }),
            });
            const data = await response.json();

            //If server return match, then we store the email of the user and
            //later use the email to updat the score at end of the game. 
            if (data.message === "match") {
                console.log(data.message);
                props.onLogin(data.name, data.email);
                localStorage.setItem('email', data.email);
                localStorage.setItem('emailStart', data.email);
                history.push('/game');
            } else {
                console.log(data.message);
                setErrorMessage("Invalid username/password or User already logged in.");
            }
        }catch{
            console.log("Error Occured in fetch");
        }
        
        return;

    }

    return (
        <div className="auth-form-container">
            <h2>Login</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)}type="email" placeholder="youremail@gmail.com" id="email" name="email" required/>
                <br></br> <p></p>
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" required/>
                <br></br> <p></p>
                <button type="submit">Log In</button>
                {errorMessage && (
                    <div className="Display Error Message" role="Error">
                        {errorMessage}
                    </div>
                )}
            </form>
            <p></p>
            <p className="link-btn" onClick={() => history.push('/game')}>Play Anonymously.</p>
            <p className="link-btn" onClick={() => history.push('/forgot-password')}>Forgot Password?</p>
            <p className="link-btn" onClick={() => history.push('/register')}>Don't have an account? Register here.</p>

        </div>
    )
}