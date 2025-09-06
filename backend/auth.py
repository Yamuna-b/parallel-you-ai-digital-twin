import jwt
import datetime
import os
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')

# Generate JWT token
def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

# Decorator to require JWT auth
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = data['user_id']
        except Exception as e:
            return jsonify({'error': 'Token is invalid!', 'details': str(e)}), 401
        return f(user_id, *args, **kwargs)
    return decorated
