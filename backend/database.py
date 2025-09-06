"""
MongoDB Database Configuration and Models
Parallel You: AI-Generated Personalized Reality Simulator
"""

from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from typing import Optional, Dict, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.collections = {}
        self.connect()

    def connect(self):
        """Connect to MongoDB with fallback options"""
        try:
            # Try different connection methods
            connection_strings = [
                os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/'),
                'mongodb://localhost:27017/',
                'mongodb://127.0.0.1:27017/',
                'mongodb://mongo:27017/'  # Docker container name
            ]
            
            for conn_str in connection_strings:
                try:
                    self.client = MongoClient(conn_str, serverSelectionTimeoutMS=5000)
                    # Test connection
                    self.client.admin.command('ping')
                    self.db = self.client['parallel_you']
                    logger.info(f"✅ Connected to MongoDB at {conn_str}")
                    break
                except Exception as e:
                    logger.warning(f"Failed to connect to {conn_str}: {e}")
                    continue
            
            if not self.client:
                raise Exception("Could not connect to any MongoDB instance")
                
            self._setup_collections()
            self._create_indexes()
            
        except Exception as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            logger.info("Using in-memory storage as fallback")
            self.client = None
            self.db = None

    def _setup_collections(self):
        """Initialize database collections"""
        if self.db is None:  # <-- FIXED
            return
            
        self.collections = {
            'users': self.db['users'],
            'simulations': self.db['simulations'],
            'scenarios': self.db['scenarios'],
            'analytics': self.db['analytics'],
            'feedback': self.db['feedback'],
            'sessions': self.db['sessions']
        }
        logger.info("📊 Database collections initialized")

    def _create_indexes(self):
        """Create database indexes for performance"""
        if self.db is None:  # <-- FIXED
            return
            
        try:
            # User indexes
            self.collections['users'].create_index("email", unique=True)
            self.collections['users'].create_index("user_id", unique=True)
            self.collections['users'].create_index("created_at")
            
            # Simulation indexes
            self.collections['simulations'].create_index("user_id")
            self.collections['simulations'].create_index("timestamp")
            self.collections['simulations'].create_index("simulation_id", unique=True)
            self.collections['simulations'].create_index([("user_id", 1), ("timestamp", -1)])
            
            # Analytics indexes
            self.collections['analytics'].create_index("event_type")
            self.collections['analytics'].create_index("timestamp")
            self.collections['analytics'].create_index("user_id")
            
            logger.info("🔍 Database indexes created")
        except Exception as e:
            logger.warning(f"Index creation failed: {e}")

    def get_collection(self, collection_name: str):
        """Get a collection by name"""
        return self.collections.get(collection_name)

    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.client is not None

    def get_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        if not self.is_connected():
            return {"status": "disconnected", "message": "Using in-memory storage"}
        
        try:
            stats = {
                "status": "connected",
                "database": self.db.name,
                "collections": {}
            }
            
            for name, collection in self.collections.items():
                stats["collections"][name] = collection.count_documents({})
            
            return stats
        except Exception as e:
            return {"status": "error", "message": str(e)}

# Global database instance
db_manager = DatabaseManager()

# Collection getters for easy access
def get_users_collection():
    return db_manager.get_collection('users')

def get_simulations_collection():
    return db_manager.get_collection('simulations')

def get_scenarios_collection():
    return db_manager.get_collection('scenarios')

def get_analytics_collection():
    return db_manager.get_collection('analytics')

def get_feedback_collection():
    return db_manager.get_collection('feedback')

def get_sessions_collection():
    return db_manager.get_collection('sessions')

# Data Models
class User:
    def __init__(self, user_data: Dict[str, Any]):
        self.user_id = user_data.get('user_id')
        self.email = user_data.get('email')
        self.name = user_data.get('name')
        self.created_at = user_data.get('created_at', datetime.now())
        self.last_login = user_data.get('last_login')
        self.preferences = user_data.get('preferences', {})
        self.subscription_tier = user_data.get('subscription_tier', 'free')

    @classmethod
    def create(cls, email: str, name: str, password_hash: str) -> 'User':
        """Create a new user"""
        user_data = {
            'user_id': f"user_{datetime.now().strftime('%Y%m%d%H%M%S')}_{hash(email) % 10000}",
            'email': email.lower(),
            'name': name,
            'password_hash': password_hash,
            'created_at': datetime.now(),
            'last_login': None,
            'preferences': {
                'theme': 'dark',
                'notifications': True,
                'privacy_level': 'medium'
            },
            'subscription_tier': 'free'
        }
        return cls(user_data)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'user_id': self.user_id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at,
            'last_login': self.last_login,
            'preferences': self.preferences,
            'subscription_tier': self.subscription_tier
        }

class Simulation:
    def __init__(self, simulation_data: Dict[str, Any]):
        self.simulation_id = simulation_data.get('simulation_id')
        self.user_id = simulation_data.get('user_id')
        self.input_data = simulation_data.get('input_data', {})
        self.result = simulation_data.get('result', {})
        self.timestamp = simulation_data.get('timestamp', datetime.now())
        self.scenario_type = simulation_data.get('scenario_type', 'general')
        self.confidence_score = simulation_data.get('confidence_score', 0)

    @classmethod
    def create(cls, user_id: str, input_data: Dict[str, Any], result: Dict[str, Any], scenario_type: str = 'general') -> 'Simulation':
        """Create a new simulation record"""
        simulation_data = {
            'simulation_id': f"sim_{datetime.now().strftime('%Y%m%d%H%M%S')}_{hash(str(input_data)) % 10000}",
            'user_id': user_id,
            'input_data': input_data,
            'result': result,
            'timestamp': datetime.now(),
            'scenario_type': scenario_type,
            'confidence_score': result.get('score', 0)
        }
        return cls(simulation_data)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'simulation_id': self.simulation_id,
            'user_id': self.user_id,
            'input_data': self.input_data,
            'result': self.result,
            'timestamp': self.timestamp,
            'scenario_type': self.scenario_type,
            'confidence_score': self.confidence_score
        }

# Database utility functions
def save_user(user: User) -> bool:
    """Save user to database"""
    collection = get_users_collection()
    if collection is None:  # <-- FIXED
        logger.warning("No database connection, user not saved")
        return False
    
    try:
        collection.insert_one(user.to_dict())
        logger.info(f"User {user.email} saved to database")
        return True
    except Exception as e:
        logger.error(f"Failed to save user: {e}")
        return False

def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email"""
    collection = get_users_collection()
    if collection is None:  # <-- FIXED
        return None
    
    try:
        user_data = collection.find_one({'email': email.lower()})
        return User(user_data) if user_data else None
    except Exception as e:
        logger.error(f"Failed to get user: {e}")
        return None

def save_simulation(simulation: Simulation) -> bool:
    """Save simulation to database"""
    collection = get_simulations_collection()
    if collection is None:  # <-- FIXED
        logger.warning("No database connection, simulation not saved")
        return False
    
    try:
        collection.insert_one(simulation.to_dict())
        logger.info(f"Simulation {simulation.simulation_id} saved to database")
        return True
    except Exception as e:
        logger.error(f"Failed to save simulation: {e}")
        return False

def get_user_simulations(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Get user's simulation history"""
    collection = get_simulations_collection()
    if collection is None:  # <-- FIXED
        return []
    
    try:
        simulations = list(collection.find(
            {'user_id': user_id},
            {'_id': 0, 'timestamp': 1, 'result.score': 1, 'simulation_id': 1, 'input_data.dreamCareer': 1, 'scenario_type': 1}
        ).sort('timestamp', -1).limit(limit))
        return simulations
    except Exception as e:
        logger.error(f"Failed to get simulations: {e}")
        return []

def get_analytics_data() -> Dict[str, Any]:
    """Get aggregated analytics data"""
    simulations_collection = get_simulations_collection()
    if simulations_collection is None:  # <-- FIXED
        return {"error": "Database not connected"}
    
    try:
        # Popular career choices
        pipeline = [
            {'$group': {'_id': '$input_data.dreamCareer', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        popular_careers = list(simulations_collection.aggregate(pipeline))
        
        # Education impact analysis
        education_scores = {}
        for doc in simulations_collection.find({}, {'input_data.education': 1, 'result.score': 1}):
            edu = doc.get('input_data', {}).get('education', 'unknown')
            score = doc.get('result', {}).get('score', 0)
            if edu not in education_scores:
                education_scores[edu] = []
            education_scores[edu].append(score)
        
        avg_scores = {edu: sum(scores)/len(scores) for edu, scores in education_scores.items()}
        
        # Total statistics
        total_simulations = simulations_collection.count_documents({})
        total_users = get_users_collection().count_documents({}) if get_users_collection() else 0
        
        return {
            "popular_careers": popular_careers,
            "education_impact": avg_scores,
            "total_simulations": total_simulations,
            "total_users": total_users,
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get analytics: {e}")
        return {"error": str(e)}

# Initialize database on import
if __name__ == "__main__":
    print("Database Manager Status:")
    print(db_manager.get_stats())
