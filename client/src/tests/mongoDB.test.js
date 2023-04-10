
const randomWords = require('random-words');

console.log("MongoDB.test.js need the server to be running.");

//Testing all API endpoints.
describe("Endpoints", () => {
    
    test("Login Successfull", async () => {
      const email = "alan@ualberta.ca";
      const password = "alan";

      const response = await fetch(`${process.env.REACT_APP_HOST_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: password })
      });

      const data = await response.json();

      expect(data.message).toBe("match");
      expect(data.name).toBe("alan");
      expect(data.email).toBe("alan@ualberta.ca");
    });

    test("Already logged in", async () => {
        const email = "alan@ualberta.ca";
        const password = "alan";
  
        const response = await fetch(`${process.env.REACT_APP_HOST_URL}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password: password })
        });
  
        const data = await response.json();
  
        expect(data.message).toBe("nomatch");
      });

    test("Login Successfull", async () => {
        const email = "alan@ualberta.ca";
        const password = "wongpass";
  
        const response = await fetch(`${process.env.REACT_APP_HOST_URL}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password: password })
        });
  
        const data = await response.json();
  
        expect(data.message).toBe("nomatch");
      });

    test("Logout Successfull", async () => {
    const response = await fetch(process.env.REACT_APP_HOST_URL + "/user/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: "alan@ualberta.ca"
        }),
    });

    const data = await response.json();

    expect(data.message).toBe("logout");
    });


    test("Register Unsuccessful", async () => {

        const user = {
            name: "Alan",
            username : "alan@ualberta.ca",
            password : "alan",
            question: "alan",
            wins: 0,
            totalgames: 0,
            activestatus: "false"
        };


        const response = await fetch(process.env.REACT_APP_HOST_URL + "/user/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
    
        const data = await response.json();
    
        expect(data.message).toBe("exist");
    });

    test("Register Successful", async () => {

        let username = randomWords();
        username = username+"@test.ca";

        const user = {
            name: "Test",
            username : username,
            password : "alan",
            question: "alan",
            wins: 0,
            totalgames: 0,
            activestatus: "false"
        };


        const response = await fetch(process.env.REACT_APP_HOST_URL + "/user/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
    
        const data = await response.json();
    
        expect(data.message).toBe("added");
    });

    test("Reset Password Succesfull", async () => {

        const user = {
            username : "alan@ualberta.ca",
            newpassword : "alan",
            question: "alan"
        };


        const response = await fetch(process.env.REACT_APP_HOST_URL + "/user/forgotpassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
    
        const data = await response.json();
    
        expect(data.message).toBe("updated");
    });

    test("Leaderboard data Succesfull", async () => {

        fetch(process.env.REACT_APP_HOST_URL + '/user/leaderboard')
        .then((response) => response.json())
        .then((data) => {
            expect(data).toBeDefined();
        })
    
    });
});
   
