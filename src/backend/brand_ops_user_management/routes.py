from flask import Flask, request, jsonify, abort
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import bcrypt
from functools import wraps
import os

from src.backend.brand_ops_user_management.controllers import (
    get_user_by_id,
    create_user,
    update_user,
    delete_user,
    get_all_users
)

app = Flask(__name__)

# CORS configuration (replace with your trusted domains)
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '*').split(',')  # Default to '*' if not set
from flask_cors import CORS
CORS(app, resources="*", origins=CORS_ALLOWED_ORIGINS)  # Apply CORS to all routes

# RBAC Decorator
def require_role(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = request.headers.get('X-User-Role')
            if user != role:
                abort(403, description="Insufficient permissions")
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Routes

@app.route('/users', methods=['POST'])
def create_user_route():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'Standard')  # Default to Standard role

        if not name or not email or not password:
            return jsonify({'error': 'Name, email, and password are required'}), 400

        # Hash the password
        cost = 12  # Minimum cost factor
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(cost))

        user = create_user(name, email, hashed_password, role)
        return jsonify(user), 201

    except Exception as e:
        print(f"Error creating user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/users', methods=['GET'])
def get_all_users_route():
    try:
        users = get_all_users()
        return jsonify(users), 200
    except Exception as e:
        print(f"Error getting all users: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user_route(user_id):
    try:
        user = get_user_by_id(user_id)
        if user:
            return jsonify(user), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f"Error getting user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/users/<int:user_id>', methods=['PUT'])
@require_role('Administrator')
def update_user_route(user_id):
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if not name or not email:
            return jsonify({'error': 'Name and email are required'}), 400

        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Update password if provided
        if password:
            cost = 12
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(cost))
            update_user(user_id, name, email, hashed_password, role)
        else:
            update_user(user_id, name, email, user['password'], role) #Keep existing password

        updated_user = get_user_by_id(user_id)
        return jsonify(updated_user), 200

    except Exception as e:
        print(f"Error updating user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/users/<int:user_id>', methods=['DELETE'])
@require_role('Administrator')
def delete_user_route(user_id):
    try:
        delete_user(user_id)
        return jsonify({'message': 'User deleted'}), 200
    except Exception as e:
        print(f"Error deleting user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Admin routes (protected by RBAC)
@app.route('/admin/users', methods=['GET'])
@require_role('Administrator')
def get_admin_users_route():
    try:
        users = get_all_users()
        return jsonify(users), 200
    except Exception as e:
        print(f"Error getting admin users: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)