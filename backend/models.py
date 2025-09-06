from pymongo import MongoClient
from bson.objectid import ObjectId
import os

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db = client['parallel_you']

# User Profile Model
class UserProfile:
    def __init__(self, data):
        self.data = data

    @staticmethod
    def create(profile_data):
        return db.user_profiles.insert_one(profile_data)

    @staticmethod
    def get(user_id):
        return db.user_profiles.find_one({'_id': ObjectId(user_id)})

    @staticmethod
    def update(user_id, update_data):
        return db.user_profiles.update_one({'_id': ObjectId(user_id)}, {'$set': update_data})

# Scenario Model
class Scenario:
    def __init__(self, data):
        self.data = data

    @staticmethod
    def create(scenario_data):
        return db.scenarios.insert_one(scenario_data)

    @staticmethod
    def get_all(user_id):
        return list(db.scenarios.find({'user_id': user_id}))

# Media Model
class Media:
    def __init__(self, data):
        self.data = data

    @staticmethod
    def log(media_data):
        return db.media.insert_one(media_data)

    @staticmethod
    def get_all(user_id):
        return list(db.media.find({'user_id': user_id}))
