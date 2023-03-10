const express = require("express");
const bcrypt = require('bcrypt');

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const userRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../connect");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;


// This section will help you get a list of all the records.
userRoutes.route("/users").get(function (req, res) {
  let db_connect = dbo.getDb("game");
  db_connect
    .collection("Users")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});


const getUserRecord = async (req) => {
  let db_connect = dbo.getDb();
  let myquery = { username: req.body.username.toString() };

  const record = await db_connect.collection("Users").findOne(myquery);

  return record;
};



userRoutes.route("/user/login").post(async function (req, res) {

  try {
    const record = await getUserRecord(req);

    if( await bcrypt.compare(req.body.password, record.password)){
      res.json({ message: "match" });
    }else {
      res.json({ message: "nomatch" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});



const updatePassword = async (req) => {
  let db_connect = dbo.getDb();
  const saltRounds = 10;
  const password = req.body.newpassword.toString();

  bcrypt.hash(password, saltRounds, async function(err, hash) {
    if (err) throw err;

    const filter = { username: req.body.username.toString(), question: req.body.question.toString() };
    const update = { $set: { password: hash } };

    const record = await db_connect.collection("Users").updateOne(filter, update);

    return record;

  });

};



userRoutes.route("/user/forgotpassword").post(async function (req, res) {

  try {
    const record = await updatePassword(req);

    if( record){
      res.json({ message: "updated" });
    }else {
      res.json({ message: "notupdated" });
    }
  } catch (error) {
    res.json({ message: error });
  }
});



const addUserRecord = async (myobj) => {
  let db_connect = dbo.getDb();
  const record = await db_connect.collection("Users").insertOne(myobj);

  return record.acknowledged;
};


// This section will help you create a new record.
userRoutes.route("/user/add").post(async function (req, response) {
  const saltRounds = 10;
  const password = req.body.password;
  const username = req.body.username;

  try {
    const record = await getUserRecord(req);

    if (record) {
      response.json({ message: "exist" });
    } else {
      bcrypt.hash(password, saltRounds, async function(err, hash) {
        if (err) throw err;

        let db_connect = dbo.getDb();
        let myobj = {
          name: req.body.name,
          username: req.body.username,
          password: hash,
          question: req.body.question,
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
