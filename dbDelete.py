import pymongo
from pymongo import MongoClient

# Replace the connection string with your MongoDB Atlas connection string
client = MongoClient("mongodb+srv://admin:adminadminadmin@amidstourselves.hrghn2l.mongodb.net/AmidstOurselves?retryWrites=true&w=majority")

# Replace "my_database" and "my_collection" with your database and collection names
db = client["Game"]
collection = db["Users"]

# Delete all documents from the collection
result = collection.delete_many({})

print(f"{result.deleted_count} documents deleted from the collection.")
