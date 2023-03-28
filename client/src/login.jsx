import React, { useState } from "react";
import { useHistory } from 'react-router-dom';


export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const history = useHistory();

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
                props.onLogin(data.name, data.email);
                localStorage.setItem('email', data.email);
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
            <p className="link-btn" onClick={() => history.push('/game')}>Play Anonymously.</p>
            <p className="link-btn" onClick={() => history.push('/forgot-password')}>Forgot Password?</p>
            <p className="link-btn" onClick={() => history.push('/register')}>Don't have an account? Register here.</p>

        </div>
    )
}