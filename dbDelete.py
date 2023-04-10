import pymongo
from pymongo import MongoClient

#this script is used to clear the database from all user info. 
client = MongoClient("mongodb+srv://admin:adminadminadmin@amidstourselves.hrghn2l.mongodb.net/AmidstOurselves?retryWrites=true&w=majority")
db = client["Game"]
collection = db["Users"]
result = collection.delete_many({})
print("Documents deleted from the collection.")
