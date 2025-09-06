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

# Import models for user profile, scenario, and media
from models import UserProfile, Scenario, Media


# Import AI media generation functions
from ai_media import (
    generate_dalle_image, generate_sd_image, generate_pika_video, 
    generate_synthesia_video, generate_life_movie, generate_avatar_image, 
    create_vision_board
)
from database import (
    db_manager, save_user, get_user_by_email, save_simulation as db_save_simulation,
    get_user_simulations, get_analytics_data, User, Simulation
)

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))


# AI Image Generation Endpoint
@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    data = request.json
    prompt = data.get('prompt', '')
    model = data.get('model', 'dalle')
    user_context = data.get('user_context', {})
    
    if model == 'dalle':
        result = generate_dalle_image(prompt, user_context)
    elif model == 'sd':
        result = generate_sd_image(prompt, user_context)
    else:
        return jsonify({'error': 'Invalid model'}), 400
    return jsonify(result)

# AI Video Generation Endpoint
@app.route('/api/generate-video', methods=['POST'])
def generate_video():
    data = request.json
    prompt = data.get('prompt', '')
    model = data.get('model', 'pika')
    user_context = data.get('user_context', {})
    
    if model == 'pika':
        result = generate_pika_video(prompt, user_context)
    elif model == 'synthesia':
        script = data.get('script', prompt)
        result = generate_synthesia_video(script, user_context)
    else:
        return jsonify({'error': 'Invalid model'}), 400
    return jsonify(result)


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
        avatar_data = generate_3d_avatar_data({**data, 'score': score})
        
        # Additional insights
        insights = {
            'career_growth_potential': 'High' if score >= 80 else 'Medium' if score >= 60 else 'Needs Development',
            'time_to_success': '2-3 years' if score >= 80 else '3-5 years' if score >= 60 else '5+ years',
            'risk_level': 'Low' if score >= 80 else 'Medium' if score >= 60 else 'High',
            'confidence_level': 'Very High' if score >= 85 else 'High' if score >= 70 else 'Medium' if score >= 55 else 'Low'
        }
        
        # Generate AI media if requested
        media_results = {}
        if data.get('generate_image', False):
            image_prompt = f"Show {data.get('name', 'person')} as a successful {data.get('dreamCareer', 'professional')} in the year 2030"
            media_results['image'] = generate_dalle_image(image_prompt, data)
        
        if data.get('generate_video', False):
            media_results['life_movie'] = generate_life_movie([data], data)
        
        if data.get('generate_avatar', False):
            media_results['avatar'] = generate_avatar_image(data)
        
        if data.get('create_vision_board', False):
            goals = {
                'personal': data.get('personal_goals', []),
                'professional': data.get('professional_goals', [])
            }
            media_results['vision_board'] = create_vision_board({**data, 'score': score}, goals)
        
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
            "media": media_results,
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

# User Profile Endpoints
@app.route('/api/profile', methods=['POST'])
def create_profile():
    data = request.json
    result = UserProfile.create(data)
    return jsonify({'inserted_id': str(result.inserted_id)}), 201

@app.route('/api/profile/<user_id>', methods=['GET'])
def get_profile(user_id):
    profile = UserProfile.get(user_id)
    if profile:
        profile['_id'] = str(profile['_id'])
        return jsonify(profile)
    return jsonify({'error': 'Profile not found'}), 404

@app.route('/api/profile/<user_id>', methods=['PUT'])
def update_profile(user_id):
    data = request.json
    UserProfile.update(user_id, data)
    return jsonify({'status': 'updated'})

# Community Features Endpoints
@app.route('/api/community/scenarios', methods=['GET'])
def get_community_scenarios():
    """Get publicly shared scenarios"""
    try:
        scenarios = [
            {
                "title": "Software Engineer → AI Researcher",
                "description": "Transitioning from traditional software development to AI research",
                "views": 1250,
                "likes": 89,
                "comments": 23,
                "success_rate": 78,
                "user": "Anonymous",
                "timestamp": "2024-01-15T10:30:00Z",
                "tags": ["technology", "ai", "research"]
            },
            {
                "title": "Teacher → Educational Technology Entrepreneur", 
                "description": "Leaving classroom teaching to build EdTech solutions",
                "views": 980,
                "likes": 67,
                "comments": 15,
                "success_rate": 85,
                "user": "EduTech_Dreamer",
                "timestamp": "2024-01-14T14:22:00Z",
                "tags": ["education", "entrepreneurship", "technology"]
            },
            {
                "title": "Marketing Manager → UX Designer",
                "description": "Pivoting from marketing to user experience design",
                "views": 756,
                "likes": 54,
                "comments": 12,
                "success_rate": 82,
                "user": "DesignMinded",
                "timestamp": "2024-01-13T09:15:00Z",
                "tags": ["design", "ux", "career-change"]
            },
            {
                "title": "Doctor → Digital Health Startup Founder",
                "description": "From practicing medicine to revolutionizing healthcare with technology",
                "views": 1100,
                "likes": 95,
                "comments": 31,
                "success_rate": 73,
                "user": "HealthTech_MD",
                "timestamp": "2024-01-12T16:45:00Z",
                "tags": ["healthcare", "startups", "technology"]
            },
            {
                "title": "Financial Analyst → Sustainable Finance Consultant",
                "description": "Specializing in ESG investing and green finance",
                "views": 642,
                "likes": 41,
                "comments": 8,
                "success_rate": 79,
                "user": "GreenFinance",
                "timestamp": "2024-01-11T11:20:00Z",
                "tags": ["finance", "sustainability", "consulting"]
            }
        ]
        
        return jsonify({
            "scenarios": scenarios,
            "total_count": len(scenarios),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics/dashboard', methods=['GET'])
def get_analytics_dashboard():
    """Get analytics for dashboard"""
    try:
        analytics = get_analytics_data()
        
        # Add trending insights
        analytics.update({
            "trending_careers": [
                {"career": "AI/ML Engineer", "growth": "+45%", "avg_score": 82},
                {"career": "UX Designer", "growth": "+32%", "avg_score": 78},
                {"career": "Data Scientist", "growth": "+28%", "avg_score": 80},
                {"career": "Product Manager", "growth": "+25%", "avg_score": 75},
                {"career": "Digital Marketer", "growth": "+22%", "avg_score": 73}
            ],
            "user_satisfaction": 94.5,
            "avg_success_score": 77.2,
            "total_scenarios_run": 50000,
            "active_users": 2500,
            "success_stories": 1850
        })
        
        return jsonify(analytics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/scenarios/<user_id>', methods=['GET'])
def get_user_scenario_history(user_id):
    """Get user's simulation history"""
    try:
        scenarios = get_user_simulations(user_id, limit=50)
        
        return jsonify({
            "scenarios": scenarios,
            "total_count": len(scenarios),
            "user_id": user_id
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/community/share', methods=['POST'])
def share_scenario():
    """Share a scenario with the community"""
    try:
        data = request.json
        scenario_id = data.get('scenario_id')
        public = data.get('public', False)
        
        # Mock implementation - in real app, update database
        return jsonify({
            "success": True,
            "message": "Scenario shared successfully!",
            "scenario_id": scenario_id,
            "public": public
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get user notifications"""
    try:
        notifications = [
            {
                "id": "notif_1",
                "type": "success",
                "title": "Simulation Complete!",
                "message": "Your AI-generated career path simulation is ready to view.",
                "timestamp": datetime.now().isoformat(),
                "read": False
            },
            {
                "id": "notif_2", 
                "type": "community",
                "title": "New Community Insight",
                "message": "Check out the latest trending career transitions this week!",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                "read": False
            }
        ]
        
        return jsonify({
            "notifications": notifications,
            "unread_count": sum(1 for n in notifications if not n['read'])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Parallel You API",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
