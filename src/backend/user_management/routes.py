from flask import Flask, request, jsonify, current_app
from src.backend.user_management.controllers import register_user, login_user, get_account, update_account
from flask_jwt_extended import jwt_required, get_jwt_identity
import bcrypt
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/users/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Input validation (basic example, expand as needed)
        if not isinstance(email, str) or not isinstance(password, str):
            return jsonify({'error': 'Email and password must be strings'}), 400
        
        # Password hashing
        cost = 12  # Minimum cost factor
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(cost))

        # Register user using the controller
        user_id, token = register_user(email, hashed_password)

        if user_id is None:  # Assuming controller returns None on error (e.g., email exists)
            return jsonify({'error': 'Email already exists'}), 409

        return jsonify({'id': user_id, 'token': token}), 201

    except Exception as e:
        logger.error(f"Error during registration: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Validate input
        if not isinstance(email, str) or not isinstance(password, str):
            return jsonify({'error': 'Email and password must be strings'}), 400

        token = login_user(email, password)

        if token is None:
            return jsonify({'error': 'Invalid credentials'}), 401

        return jsonify({'token': token}), 200

    except Exception as e:
        logger.error(f"Error during login: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/account', methods=['GET', 'PUT'])
@jwt_required()
def account():
    try:
        if request.method == 'GET':
            user_id = get_jwt_identity()
            account_data = get_account(user_id)
            if account_data:
                return jsonify(account_data), 200
            else:
                return jsonify({'error': 'Account not found'}), 404

        elif request.method == 'PUT':
            user_id = get_jwt_identity()
            data = request.get_json()
            # Input validation for PUT request (example)
            if not isinstance(data, dict):
                return jsonify({'error': 'Invalid request body'}), 400

            updated_account = update_account(user_id, data)

            if updated_account:
                return jsonify(updated_account), 200
            else:
                return jsonify({'error': 'Account not found or update failed'}), 404

    except Exception as e:
        logger.error(f"Error accessing account: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)