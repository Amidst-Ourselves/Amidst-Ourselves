const { MongoClient } = require("mongodb");
                                                                                                                                 
const url = "mongodb+srv://admin:adminadminadmin@amidstourselves.hrghn2l.mongodb.net/AmidstOurselves?retryWrites=true&w=majority";
const client = new MongoClient(url); 
const dbName = "Game";

var _db;
module.exports = {
  connectToServer: function (callback) {
      client.connect();
      console.log("Connected correctly to server");
      _db = client.db(dbName);
  },
  getDb: function () {
    return _db;
  },
};





