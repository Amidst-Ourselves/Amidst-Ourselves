import React, { useState } from "react";
import axios from 'axios';

export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const response = await fetch("http://localhost:3000/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: email,
                    password: pass,
                }),
            });
            const data = await response.json();

            if (data.message === "match") {
                console.log(data.message);
                props.onLogin();
            } else {
                console.log(data.message);
                setErrorMessage("Invalid username or password.");
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
                <input value={email} onChange={(e) => setEmail(e.target.value)}type="email" placeholder="youremail@gmail.com" id="email" name="email" />
                <br></br> <p></p>
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
                <br></br> <p></p>
                <button type="submit">Log In</button>
                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}
            </form>
            <p></p>
            <p className="link-btn" onClick={() => props.onLogin()}>Play Anonymously.</p>
            <p className="link-btn" onClick={() => props.onFormSwitch('forgotPassword')}>Forgot Password?</p>
            <p className="link-btn" onClick={() => props.onFormSwitch('register')}>Don't have an account? Register here.</p>

        </div>
    )
}