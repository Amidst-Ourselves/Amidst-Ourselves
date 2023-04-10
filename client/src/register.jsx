import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import badWords from 'bad-words';

/*
  FR01 - Register.User
  FR02 - Register.Profane
  This file allow the user to create a new account i.e. register and
  then after successful registeration the user get redirected to the home page. 
  We also implement profanity check on name to ensure that no bad word is 
  registered as user name as the username is public.
*/
export const Register = (props) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [ques, setQues] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const history = useHistory();

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

        const badwords = new badWords();
        if (badwords.isProfane(name)) {
            setErrorMessage("Name contains profanity words. Please try with another name.");
            return;
        }
        try{
            const response = await fetch(process.env.REACT_APP_HOST_URL + "/user/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            const data = await response.json();
            if (data.message === "added") {
                console.log(data.message);
                history.push('/');
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
            <label htmlFor="name">Full Name</label>
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
                <div className="Display Error Message" role="Error">
                    {errorMessage}
                </div>
            )}
        </form>
        <p className="link-btn" onClick={() => history.push('/')}>Already have an account? Login here.</p>
    </div>
    )
}