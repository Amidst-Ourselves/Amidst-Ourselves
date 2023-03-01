import React, { useState } from "react";
import axios from 'axios';

export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        props.onLogin(); // add this line to set loggedIn to true
        console.log(email);

        try {
            const response = await axios.post('/api/login', {
                email,
                pass
            });
      
            alert(response.data.message);
          } catch (error) {
            alert(error.response.data.error);
        }
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
            </form>
            <p></p>
            <p className="link-btn" onClick={() => props.onFormSwitch('register')}>Don't have an account? Register here.</p>

        </div>
    )
}