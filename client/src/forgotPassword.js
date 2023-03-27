import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

export const ForgotPassword = (props) => {
  const [email, setEmail] = useState('');
  const [question, setQues] = useState('');
  const [newpassword, setNewPass] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();


  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
        username : email,
        newpassword : newpassword,
        question: question
    };

    try{
        const response = await fetch("http://localhost:3000/user/forgotpassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        const data = await response.json();
        if (data.message === "updated") {
            console.log(data.message);
            //props.onFormSwitch('login')
            history.push('/');
        } else if (data.message === "notupdated"){
            console.log(data.message);
            setErrorMessage("Invalid Input, can't change password.");
        }else{
            console.log(data.message);
            setErrorMessage("Error Occured");
        }
    }catch{
        console.log("Error Occured in fetch");
    }

  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <label htmlFor="email">Email:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)}type="email" placeholder="youremail@gmail.com" id="email" name="email" required />
        <br></br> <p></p>
        <label htmlFor="question">Name your favourite city?</label>
        <input value={question} onChange={(e) => setQues(e.target.value)}type="question" placeholder="" id="question" name="question" required />
        <br></br> <p></p>
        <label htmlFor="newpassword">new Password</label>
        <input value={newpassword} onChange={(e) => setNewPass(e.target.value)}type="newpassword" placeholder="******" id="newpassword" name="newpassword" required />
        <br></br> <p></p>
        <button type="submit">Reset Password</button>
        {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
        )}
      </form>
      <p className="link-btn" onClick={() => history.push('/')}>Already have an account? Login here.</p>
    </div>
  );
};