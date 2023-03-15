import React, { useState } from "react";
import axios from 'axios';

export const Register = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [ques, setQues] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const user = {
        name: name,
        username : email,
        password : pass,
        question: ques,
        wins: 0,
        totalgames: 0,
        activestatus: "false"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch("http://localhost:3000/user/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            const data = await response.json();

            if (data.message === "added") {
                console.log(data.message);
                props.onFormSwitch('login')
            } else if (data.message === "exist"){
                console.log(data.message);
                setErrorMessage("User already exist.");
            }else{
                console.log(data.message);
                setErrorMessage("Error Occured");
            }
        }catch{
            console.log("Error Occured in fetch");
        }
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
            <label htmlFor="question">Name your favourite city?</label>
            <input value={ques} onChange={(e) => setQues(e.target.value)} type="question" placeholder="" id="question" name="question" />
            <br></br> <p></p>
            <button type="submit">Register</button>
            {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
            )}
        </form>
        <p className="link-btn" onClick={() => props.onFormSwitch('login')}>Already have an account? Login here.</p>
    </div>
    )
}