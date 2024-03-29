import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

/*
  FR04 - Change.Password
  This file allow the user to go to forget password page and then change the password
  but entering the email ID and sequerity question answer along with new desired password.
*/
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
        const response = await fetch(process.env.REACT_APP_HOST_URL + "/user/forgotpassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        const data = await response.json();
        //If the password is updated then we send the user back to login page. 
        if (data.message === "updated") {
            console.log(data.message);
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
        <label htmlFor="email">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)}type="email" placeholder="youremail@gmail.com" id="email" name="email" required />
        <br></br> <p></p>
        <label htmlFor="question">Name your favourite city?</label>
        <input value={question} onChange={(e) => setQues(e.target.value)}type="question" placeholder="" id="question" name="question" required />
        <br></br> <p></p>
        <label htmlFor="newpassword">New Password</label>
        <input value={newpassword} onChange={(e) => setNewPass(e.target.value)}type="newpassword" placeholder="******" id="newpassword" name="newpassword" required />
        <br></br> <p></p>
        <button type="submit">Reset Password</button>
        {errorMessage && (
          <div className="Display Error Message" role="Error">
              {errorMessage}
          </div>
        )}
      </form>
      <p className="link-btn" onClick={() => history.push('/')}>Already have an account? Login here.</p>
    </div>
  );
};