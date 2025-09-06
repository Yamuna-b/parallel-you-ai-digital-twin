from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import random
import json
import uuid
import os
import hashlib
import secrets
from functools import wraps
from database import (
    db_manager, save_user, get_user_by_email, save_simulation as db_save_simulation, 
    get_user_simulations, get_analytics_data, User, Simulation
)

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))

# Database connection using DatabaseManager
print("🔗 Initializing database connection...")
print(f"Database Status: {db_manager.get_stats()}")

# Legacy collections for backward compatibility
users_collection = db_manager.get_collection('users')
simulations_collection = db_manager.get_collection('simulations')
scenarios_collection = db_manager.get_collection('scenarios')

# Career success factors and predictions
CAREER_FACTORS = {
    'software_engineer': {'base_score': 85, 'growth': 'high', 'salary': 'high'},
    'doctor': {'base_score': 90, 'growth': 'medium', 'salary': 'very_high'},
    'teacher': {'base_score': 75, 'growth': 'medium', 'salary': 'medium'},
    'entrepreneur': {'base_score': 70, 'growth': 'very_high', 'salary': 'variable'},
    'artist': {'base_score': 60, 'growth': 'variable', 'salary': 'variable'},
    'scientist': {'base_score': 80, 'growth': 'medium', 'salary': 'high'},
    'lawyer': {'base_score': 85, 'growth': 'medium', 'salary': 'very_high'},
    'designer': {'base_score': 75, 'growth': 'high', 'salary': 'medium'},
    'consultant': {'base_score': 80, 'growth': 'high', 'salary': 'high'},
    'writer': {'base_score': 65, 'growth': 'variable', 'salary': 'variable'}
}

EDUCATION_BONUS = {
    'high-school': 0,
    'associate': 5,
    'bachelor': 10,
    'master': 15,
    'phd': 20,
    'other': 5
}

HABIT_BONUSES = {
    'Exercise regularly': 8,
    'Read daily': 6,
    'Meditate': 5,
    'Learn new skills': 10,
    'Network actively': 7,
    'Save money': 6,
    'Travel frequently': 4,
    'Volunteer': 3
}

def calculate_success_score(data):
    """Calculate success score based on various factors"""
    base_score = 50
    
    # Career factor
    dream_career = data.get('dreamCareer', '').lower()
    career_key = None
    for key in CAREER_FACTORS:
        if key in dream_career or dream_career in key:
            career_key = key
            break
    
    if career_key:
        base_score = CAREER_FACTORS[career_key]['base_score']
    else:
        base_score = 70  # Default for unknown careers
    
    # Education bonus
    education = data.get('education', '')
    base_score += EDUCATION_BONUS.get(education, 0)
    
    # Age factor (younger = more potential)
    age = int(data.get('age', 25))
    if age < 25:
        base_score += 10
    elif age < 30:
        base_score += 5
    elif age > 50:
        base_score -= 5
    
    # Habits bonus
    habits = data.get('habits', [])
    for habit in habits:
        base_score += HABIT_BONUSES.get(habit, 0)
    
    # Add some randomness for realism
    base_score += random.randint(-5, 10)
    
    return min(100, max(0, base_score))

def generate_personalized_message(data, score):
    """Generate personalized message based on user data"""
    name = data.get('name', 'User')
    age = data.get('age', '25')
    dream_career = data.get('dreamCareer', 'your chosen field')
    education = data.get('education', '')
    habits = data.get('habits', [])
    
    # Base message
    if score >= 90:
        message = f"🌟 Excellent! {name}, your path to becoming a {dream_career} looks incredibly promising!"
    elif score >= 80:
        message = f"🚀 Great potential! {name}, you have strong prospects in {dream_career}."
    elif score >= 70:
        message = f"💪 Good foundation! {name}, with some focused effort, {dream_career} is definitely achievable."
    elif score >= 60:
        message = f"📈 Room for growth! {name}, {dream_career} is possible with dedication and planning."
    else:
        message = f"🎯 Consider alternatives! {name}, you might want to explore related fields or build more experience first."
    
    # Add age-specific advice
    if int(age) < 25:
        message += " Your youth gives you time to build the perfect foundation!"
    elif int(age) < 35:
        message += " You're at a great age to make this career transition!"
    else:
        message += " Your experience is valuable - leverage it strategically!"
    
    return message

def generate_recommendations(data, score):
    """Generate actionable recommendations"""
    recommendations = []
    dream_career = data.get('dreamCareer', '').lower()
    education = data.get('education', '')
    habits = data.get('habits', [])
    
    # Education recommendations
    if education in ['high-school', 'associate'] and 'bachelor' not in dream_career:
        recommendations.append("Consider pursuing higher education or specialized certifications")
    
    # Skill development
    if 'Learn new skills' not in habits:
        recommendations.append("Start learning new skills relevant to your target career")
    
    # Networking
    if 'Network actively' not in habits:
        recommendations.append("Build your professional network in your target industry")
    
    # Experience building
    if not data.get('currentCareer'):
        recommendations.append("Gain relevant work experience through internships or projects")
    
    # Financial planning
    if 'Save money' not in habits:
        recommendations.append("Build a financial safety net for career transition")
    
    # Health and wellness
    if 'Exercise regularly' not in habits:
        recommendations.append("Maintain physical and mental health for peak performance")
    
    # Career-specific advice
    if 'entrepreneur' in dream_career:
        recommendations.append("Start with a side project to test your business ideas")
    elif 'artist' in dream_career or 'writer' in dream_career:
        recommendations.append("Build a portfolio and online presence to showcase your work")
    elif 'doctor' in dream_career or 'lawyer' in dream_career:
        recommendations.append("Research specific requirements and prerequisites for your field")
    
    return recommendations[:5]  # Limit to 5 recommendations

# Authentication functions
def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify password against hash"""
    return hash_password(password) == hashed

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def generate_ar_vr_content(data, score):
    """Generate AR/VR content suggestions"""
    dream_career = data.get('dreamCareer', '').lower()
    suggestions = []
    
    # AR/VR career-specific content
    if 'engineer' in dream_career or 'developer' in dream_career:
        suggestions.extend([
            "🥽 Use AR to visualize code architecture in 3D space",
            "🎮 Practice coding in VR environments like CodeCombat VR",
            "📱 Try AR apps to see how your software would look in real world",
            "🎯 Use VR to simulate debugging complex systems"
        ])
    elif 'doctor' in dream_career or 'medical' in dream_career:
        suggestions.extend([
            "🩺 Practice surgery in VR medical simulators",
            "🧠 Use AR to study human anatomy in 3D",
            "💊 Visualize drug interactions in VR molecular models",
            "🏥 Experience hospital workflows in VR training"
        ])
    elif 'artist' in dream_career or 'designer' in dream_career:
        suggestions.extend([
            "🎨 Create 3D art in VR using Tilt Brush or Gravity Sketch",
            "🏗️ Design buildings in AR using Magic Leap or HoloLens",
            "🎭 Experience your art installations in VR before building",
            "📐 Use AR to visualize designs in real-world spaces"
        ])
    elif 'entrepreneur' in dream_career:
        suggestions.extend([
            "🏢 Present your business ideas in VR boardrooms",
            "📊 Visualize market data in 3D AR dashboards",
            "🌍 Explore global markets in VR environments",
            "🤝 Practice investor pitches in AR meeting rooms"
        ])
    
    # General AR/VR suggestions
    suggestions.extend([
        "🌍 Explore your future workplace in VR",
        "👥 Practice networking in virtual conferences",
        "📚 Learn new skills in immersive VR classrooms",
        "🏠 Visualize your future home in AR"
    ])
    
    return suggestions[:6]

def generate_3d_avatar_data(data):
    """Generate 3D avatar data for AR/VR"""
    return {
        "avatar_id": f"avatar_{uuid.uuid4().hex[:8]}",
        "personality_traits": {
            "confidence": min(100, data.get('score', 50) + 20),
            "creativity": 75 if 'artist' in data.get('dreamCareer', '').lower() else 60,
            "analytical": 85 if 'engineer' in data.get('dreamCareer', '').lower() else 70,
            "social": 80 if 'Network actively' in data.get('habits', []) else 60
        },
        "appearance": {
            "style": "professional" if data.get('education') in ['master', 'phd'] else "casual",
            "age_group": "young_adult" if int(data.get('age', 25)) < 30 else "adult"
        },
        "voice_settings": {
            "pitch": "medium",
            "speed": "normal",
            "accent": "neutral"
        }
    }

def save_simulation(user_id, simulation_data, result):
    """Save simulation to database using Simulation model"""
    try:
        simulation = Simulation.create(user_id, simulation_data, result, simulation_data.get('scenario_type', 'general'))
        db_save_simulation(simulation)
        return result
    except Exception as e:
        print(f"Failed to save simulation: {e}")
        return result

def generate_ai_journal_entry(data, score):
    """Generate AI-powered journal entry for the simulation"""
    name = data.get('name', 'User')
    dream_career = data.get('dreamCareer', 'your chosen field')
    age = data.get('age', '25')
    
    journal_entries = {
        'high': f"Dear {name},\n\nToday I explored the path to becoming a {dream_career}. The simulation shows incredible potential - a {score}% success rate! At {age}, you're perfectly positioned to make this transition. The data suggests that your current habits and education are strong foundations for this career change.\n\nI can already envision you thriving in this new role, making meaningful contributions and finding deep satisfaction in your work. The journey ahead looks promising, and I'm excited to see how this unfolds in reality.\n\nKeep pushing forward - the future you is counting on it!\n\n- Your Digital Twin",
        
        'medium': f"Dear {name},\n\nI've been analyzing your potential path to {dream_career}, and the results are encouraging with a {score}% success rate. While there are some challenges ahead, your determination and the right preparation can definitely make this happen.\n\nAt {age}, you have valuable experience to build upon. The simulation suggests focusing on skill development and networking will be key to your success. I believe in your ability to overcome any obstacles and create the future you envision.\n\nRemember, every expert was once a beginner. Your digital twin is here to support you every step of the way.\n\n- Your Digital Twin",
        
        'low': f"Dear {name},\n\nThe simulation for becoming a {dream_career} shows a {score}% success rate, which means this path will require significant effort and strategic planning. But don't let this discourage you - some of the most rewarding journeys are the most challenging ones.\n\nAt {age}, you have time to build the necessary skills and experience. Consider this an opportunity to grow and develop in ways you never imagined. The simulation suggests focusing on education, gaining relevant experience, and building a strong network.\n\nYour digital twin believes in your potential to achieve anything you set your mind to. Let's create a plan together!\n\n- Your Digital Twin"
    }
    
    if score >= 80:
        return journal_entries['high']
    elif score >= 60:
        return journal_entries['medium']
    else:
        return journal_entries['low']

def generate_multimedia_suggestions(data, score):
    """Generate multimedia content suggestions"""
    dream_career = data.get('dreamCareer', '').lower()
    suggestions = []
    
    # Career-specific multimedia suggestions
    if 'engineer' in dream_career or 'developer' in dream_career:
        suggestions.extend([
            "📱 Create a coding portfolio website",
            "🎥 Record coding tutorials on YouTube",
            "📸 Document your coding journey on Instagram",
            "🎵 Listen to coding-focused podcasts during commutes"
        ])
    elif 'artist' in dream_career or 'designer' in dream_career:
        suggestions.extend([
            "🎨 Build an online art portfolio",
            "📹 Create time-lapse videos of your creative process",
            "📱 Share daily sketches on social media",
            "🎵 Create playlists that inspire your creativity"
        ])
    elif 'entrepreneur' in dream_career:
        suggestions.extend([
            "📹 Start a business vlog documenting your journey",
            "🎙️ Record podcast interviews with successful entrepreneurs",
            "📸 Create visual business plans and pitch decks",
            "🎵 Listen to business and startup podcasts"
        ])
    
    # General suggestions based on score
    if score >= 80:
        suggestions.extend([
            "🎉 Create a vision board with your career goals",
            "📹 Record a 'future self' video message",
            "📸 Take professional headshots for your new career"
        ])
    
    return suggestions[:6]  # Return top 6 suggestions

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json or {}
        user_id = data.get('user_id', str(uuid.uuid4()))
        
        # Calculate success score
        score = calculate_success_score(data)
        
        # Generate personalized message
        message = generate_personalized_message(data, score)
        
        # Generate recommendations
        recommendations = generate_recommendations(data, score)
        
        # Generate AI journal entry
        journal_entry = generate_ai_journal_entry(data, score)
        
        # Generate multimedia suggestions
        multimedia_suggestions = generate_multimedia_suggestions(data, score)
        
        # Generate AR/VR content suggestions
        ar_vr_suggestions = generate_ar_vr_content(data, score)
        
        # Generate 3D avatar data
        avatar_data = generate_3d_avatar_data(data)
        
        # Additional insights
        insights = {
            'career_growth_potential': 'High' if score >= 80 else 'Medium' if score >= 60 else 'Needs Development',
            'time_to_success': '2-3 years' if score >= 80 else '3-5 years' if score >= 60 else '5+ years',
            'risk_level': 'Low' if score >= 80 else 'Medium' if score >= 60 else 'High',
            'confidence_level': 'Very High' if score >= 85 else 'High' if score >= 70 else 'Medium' if score >= 55 else 'Low'
        }
        
        # Enhanced result with new features
        result = {
            "message": message,
            "score": score,
            "recommendations": recommendations,
            "insights": insights,
            "journal_entry": journal_entry,
            "multimedia_suggestions": multimedia_suggestions,
            "ar_vr_suggestions": ar_vr_suggestions,
            "avatar_data": avatar_data,
            "simulation_id": f"sim_{random.randint(10000, 99999)}",
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id
        }
        
        # Save simulation to database
        save_simulation(user_id, data, result)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "message": "Error processing your simulation. Please try again.",
            "score": 0,
            "error": str(e)
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        "service": "Parallel You: AI-Generated Personalized Reality Simulator",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "predict": "/predict (POST)",
            "scenarios": "/scenarios",
            "community": "/community/insights",
            "chat": "/ai/chat (POST)",
            "simulations": "/simulations/<user_id>"
        },
        "documentation": "https://github.com/parallelyou/api-docs",
        "frontend": "http://localhost:5174"
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "Parallel You API"})

@app.route('/simulations/<user_id>', methods=['GET'])
def get_user_simulations_endpoint(user_id):
    """Get all simulations for a user"""
    try:
        simulations = get_user_simulations(user_id)
        return jsonify({"simulations": simulations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/scenarios', methods=['GET'])
def get_scenarios():
    """Get available life scenarios"""
    scenarios = [
        {
            'id': 'career_change',
            'name': 'Career Change',
            'description': 'Explore switching to a completely different field',
            'icon': '💼',
            'difficulty': 'Medium'
        },
        {
            'id': 'education_path',
            'name': 'Education Path',
            'description': 'Simulate different educational choices and their impact',
            'icon': '🎓',
            'difficulty': 'Easy'
        },
        {
            'id': 'location_move',
            'name': 'Location Change',
            'description': 'See how moving to a new city affects your career',
            'icon': '🌍',
            'difficulty': 'Hard'
        },
        {
            'id': 'entrepreneurship',
            'name': 'Start a Business',
            'description': 'Simulate starting your own company or side hustle',
            'icon': '🚀',
            'difficulty': 'Hard'
        },
        {
            'id': 'work_life_balance',
            'name': 'Work-Life Balance',
            'description': 'Explore different work arrangements and lifestyle choices',
            'icon': '⚖️',
            'difficulty': 'Easy'
        }
    ]
    return jsonify({"scenarios": scenarios})

@app.route('/community/insights', methods=['GET'])
def get_community_insights():
    """Get aggregated community insights"""
    try:
        insights = get_analytics_data()
        return jsonify(insights)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/multimedia/upload', methods=['POST'])
def upload_multimedia():
    """Handle multimedia uploads (placeholder for now)"""
    return jsonify({
        "message": "Multimedia upload feature coming soon!",
        "supported_formats": ["jpg", "png", "mp4", "mp3", "wav"],
        "max_size": "10MB"
    })

@app.route('/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.json or {}
        email = data.get('email', '').lower()
        password = data.get('password', '')
        name = data.get('name', '')
        
        if not email or not password or not name:
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        # Check if user already exists
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({'error': 'User already exists'}), 409
        
        # Create user using User model
        user = User.create(email, name, hash_password(password))
        
        # Save to database
        if save_user(user):
            # Set session
            session['user_id'] = user.user_id
            session['email'] = email
            session['name'] = name
            
            return jsonify({
                'message': 'User registered successfully',
                'user': user.to_dict()
            })
        else:
            return jsonify({'error': 'Failed to save user'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.json or {}
        email = data.get('email', '').lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Get user from database
        user = get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Update last login
        if users_collection:
            users_collection.update_one(
                {'email': email},
                {'$set': {'last_login': datetime.now()}}
            )
        
        user_id = user.user_id
        
        # Set session
        session['user_id'] = user_id
        session['email'] = email
        
        return jsonify({
            'message': 'Login successful',
            'user_id': user_id,
            'email': email
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    session.clear()
    return jsonify({'message': 'Logout successful'})

@app.route('/auth/status', methods=['GET'])
def auth_status():
    """Check authentication status"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user_id': session['user_id'],
            'email': session.get('email', '')
        })
    return jsonify({'authenticated': False})

@app.route('/ar-vr/content', methods=['POST'])
def ar_vr_content():
    """Generate AR/VR content for user"""
    try:
        data = request.json or {}
        user_id = data.get('user_id', session.get('user_id', str(uuid.uuid4())))
        
        # Get user's latest simulation
        if simulations_collection:
            latest_sim = simulations_collection.find_one(
                {'user_id': user_id},
                sort=[('timestamp', -1)]
            )
            if latest_sim:
                sim_data = latest_sim['input_data']
                score = latest_sim['result'].get('score', 50)
            else:
                sim_data = data
                score = 50
        else:
            sim_data = data
            score = 50
        
        ar_vr_suggestions = generate_ar_vr_content(sim_data, score)
        avatar_data = generate_3d_avatar_data(sim_data)
        
        return jsonify({
            'ar_vr_suggestions': ar_vr_suggestions,
            'avatar_data': avatar_data,
            'user_id': user_id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ai/chat', methods=['POST'])
def ai_chat():
    """AI chat endpoint for digital twin conversations"""
    try:
        data = request.json or {}
        message = data.get('message', '')
        user_id = data.get('user_id', session.get('user_id', str(uuid.uuid4())))
        
        # Simple AI responses based on keywords
        responses = {
            'hello': "Hello! I'm your digital twin. I'm here to help you explore different life paths and make informed decisions. What would you like to know about your future?",
            'career': "I can help you explore different career paths! Try running a simulation with your dream job to see how likely you are to succeed.",
            'help': "I can help you with career simulations, life path analysis, and personalized recommendations. What specific area interests you?",
            'future': "The future is full of possibilities! Let's explore some scenarios together. What career or life change are you considering?",
            'ar': "AR technology can help you visualize your future in 3D! Try using AR apps to see how your career choices would look in the real world.",
            'vr': "VR simulations can let you experience different career paths before committing. It's like a test drive for your future!",
            'avatar': "I can generate a 3D avatar based on your personality and career goals. This avatar can represent you in virtual environments."
        }
        
        # Find matching response
        response = "I'm here to help you explore your potential futures! Try asking about careers, life changes, AR/VR experiences, or run a simulation to see what's possible."
        for keyword, resp in responses.items():
            if keyword in message.lower():
                response = resp
                break
        
        return jsonify({
            "response": response,
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
