from flask import Flask, request, jsonify, current_app
import bcrypt
import jwt
import datetime
from src.backend.user_management.models import User

app = Flask(__name__)

def hash_password(password):
    """Hashes the password using bcrypt."""
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(cost=12))
    return hashed.decode('utf-8')

def verify_password(password, hashed_password):
    """Verifies the password against the hashed password."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token(user_id):
    """Generates a JWT token for the user."""
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

def validate_jwt(token):
    """Validates the JWT token."""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

@app.route('/users/register', methods=['POST'])
def register():
    """Registers a new user."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Check for duplicate email
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 409

        # Hash the password
        hashed_password = hash_password(password)

        # Create a new user
        new_user = User(email=email, password_hash=hashed_password)
        new_user.save()

        # Generate a token
        token = generate_token(new_user.id)

        return jsonify({'id': new_user.id, 'token': token}), 201

    except Exception as e:
        print(e) # Log the error
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    """Logs in an existing user."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Retrieve the user
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        # Verify the password
        if not verify_password(password, user.password_hash):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Generate a token
        token = generate_token(user.id)

        return jsonify({'token': token}), 200

    except Exception as e:
        print(e)  # Log the error
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/account', methods=['GET'])
def get_account():
    """Retrieves the current user's account."""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        user_id = validate_jwt(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Return account information (replace with actual data)
        return jsonify({}), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/account', methods=['PUT'])
def update_account():
    """Updates the current user's account."""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        user_id = validate_jwt(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Update account information (replace with actual logic)
        return jsonify({}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500