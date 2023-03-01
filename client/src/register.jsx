import React, { useState } from "react";
import axios from 'axios';




export const Register = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');

    const user = {
        name: name,
        username : email,
        password : pass
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        props.onLogin(); // add this line to set loggedIn to true
        console.log(email);

        await fetch("http://localhost:3000/user/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
        })
        .catch(error => {
        window.alert(error);
        return;
        });



        // try {
        //     const response = await axios.post('http://localhost:4000/user/add', {
        //         user
        //     });
      
        //     alert(response.data.message);
        //   } catch (error) {
        //     alert(error.response.data.error);
        //   }
    }

    return (
        <div className="auth-form-container">
            <h2>Register</h2>
        <form className="register-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Full name</label>
            <input value={name} name="name" onChange={(e) => setName(e.target.value)} id="name" placeholder="Full Name" />
            <br></br> <p></p>
            <label htmlFor="email">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)}type="email" placeholder="youremail@gmail.com" id="email" name="email" />
            <br></br> <p></p>
            <label htmlFor="password">Password</label>
            <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
            <br></br> <p></p>
            <button type="submit">Register</button>
        </form>
        <p className="link-btn" onClick={() => props.onFormSwitch('login')}>Already have an account? Login here.</p>
    </div>
    )
}