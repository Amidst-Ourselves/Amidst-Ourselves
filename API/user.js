const express = require("express");
const bcrypt = require('bcrypt');
const userRoutes = express.Router();
const dbo = require("../connect");

// This section will help you get a list of all the records.
const getAllRecord = async (req) => {
  let databaseConnect = dbo.getDb();
  const record = await databaseConnect.collection("Users").find().toArray();
  return record;
};
userRoutes.route("/user/leaderboard").get(async function (req, res) {
  try {
    const record = await getAllRecord(req);
    res.json(record);
  } catch (error) {
    res.json({ message: error });
  }

});


// This section will help you update active status to true when user log in
const getUserRecord = async (req) => {
  let databaseConnect = dbo.getDb();
  let myquery = { username: req.body.username.toString() };
  const record = await databaseConnect.collection("Users").findOne(myquery);
  return record;
};
const updateActiveStatus = async (req) => {
  let databaseConnect = dbo.getDb();
  return new Promise(async (resolve, reject) => {
    const filter = { username: req.body.username.toString() };
    const update = { $set: { activestatus: "true" } };
    const result = await databaseConnect.collection("Users").updateOne(filter, update);
    resolve(result.modifiedCount);
  });
};
userRoutes.route("/user/login").post(async function (req, res) {
  try {
    const record = await getUserRecord(req);
    if( await bcrypt.compare(req.body.password, record.password) && record.activestatus === "false"){
      const record2 = await updateActiveStatus(req);
      if(record2 > 0){
        res.json({ message: "match", name:record.name, email:record.username });
      }else {
        res.json({ message: "nomatch" });
      }
    }else {
      res.json({ message: "nomatch" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});


// This section will help you update active status to false when user log out
const updateActiveStatusToLogout = async (req) => {
  let databaseConnect = dbo.getDb();
  return new Promise(async (resolve, reject) => {
    const filter = { username: req.body.username };
    const update = { $set: { activestatus: "false" } };
    const result = await databaseConnect.collection("Users").updateOne(filter, update);
    resolve(result.modifiedCount);
  });
};
userRoutes.route("/user/logout").post(async function (req, res) {
  try {
    const record2 = await updateActiveStatusToLogout(req);
    if(record2 > 0){
      res.json({ message: "logout" });
    }else {
      res.json({ message: "notlogout" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});


// This section will help you update password
const updatePassword = async (req) => {
  let databaseConnect = dbo.getDb();
  const saltRounds = 10;
  const password = req.body.newpassword.toString();
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      if (err) {
        reject(err);
        return;
      }
      const filter = { username: req.body.username.toString(), question: req.body.question.toString() };
      const update = { $set: { password: hash } };
      const result = await databaseConnect.collection("Users").updateOne(filter, update);
      resolve(result.modifiedCount);
    });
  });
};
userRoutes.route("/user/forgotpassword").post(async function (req, res) {
  try {
    const record = await updatePassword(req);
    if(record > 0){
      res.json({ message: "updated" });
    }else {
      res.json({ message: "notupdated" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});


// This section will help you create a new record.
const addUserRecord = async (myobj) => {
  let databaseConnect = dbo.getDb();
  const record = await databaseConnect.collection("Users").insertOne(myobj);

  return record.acknowledged;
};
userRoutes.route("/user/add").post(async function (req, response) {
  const saltRounds = 10;
  const password = req.body.password;
  try {
    const record = await getUserRecord(req);
    if (record) {
      response.json({ message: "exist" });
    } else {
      bcrypt.hash(password, saltRounds, async function(err, hash) {
        if (err) throw err;
        let myobj = {
          name: req.body.name,
          username: req.body.username,
          password: hash,
          question: req.body.question,
          wins: req.body.wins,
          totalgames: req.body.totalgames,
          activestatus: req.body.activestatus
        };
        const record2 = await addUserRecord(myobj);
        if(record2){
          response.json({ message: "added" });
        }else{
          response.json({ message: "notadded" });
        }
      });
    }
  } catch (error) {
    response.json({ message: error });
  }
});


module.exports = userRoutes;
