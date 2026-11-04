from flask import Flask, request, jsonify, abort
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import bcrypt
from functools import wraps
from src.backend.brand_ops_user_management.models import BrandOpsUser
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Replace with your trusted origins

def require_role(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user = request.headers.get('X-User-Role')
            if current_user != role:
                abort(403)  # Forbidden
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_user_data(data):
    errors = {}
    if not data.get('name'):
        errors['name'] = 'Name is required'
    if not data.get('email'):
        errors['email'] = 'Email is required'
    elif '@' not in data['email']:
        errors['email'] = 'Invalid email format'
    if not data.get('password'):
        errors['password'] = 'Password is required'
    if not data.get('role'):
        errors['role'] = 'Role is required'
    return errors

@app.route('/brand_ops_users', methods=['POST'])
def create_user():
    data = request.get_json()
    errors = validate_user_data(data)
    if errors:
        return jsonify({'errors': errors}), 400

    try:
        password_hash = generate_password_hash(data['password'], method='bcrypt', salt_rounds=12)

        new_user = BrandOpsUser(
            name=data['name'],
            email=data['email'],
            password=password_hash,
            role=data['role'],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        new_user.save()
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/brand_ops_users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = BrandOpsUser.get_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Add authorization check here if needed

    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at,
        'updated_at': user.updated_at
    })

@app.route('/brand_ops_users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    errors = validate_user_data(data)
    if errors:
        return jsonify({'errors': errors}), 400

    user = BrandOpsUser.get_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Authorization check: Only allow admins to update other users
    current_user_role = request.headers.get('X-User-Role')
    if current_user_role != 'Administrator' and user.id != int(request.headers.get('X-User-Id')):
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        if data.get('password'):
            user.password = generate_password_hash(data['password'], method='bcrypt', salt_rounds=12)
        user.name = data.get('name', user.name)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        user.updated_at = datetime.now()
        user.save()
        return jsonify({'message': 'User updated successfully'})
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/brand_ops_users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = BrandOpsUser.get_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Authorization check: Only allow admins to delete users
    current_user_role = request.headers.get('X-User-Role')
    if current_user_role != 'Administrator':
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        user.delete()
        return jsonify({'message': 'User deleted successfully'})
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/admin/users', methods=['GET'])
@require_role('Administrator')
def list_users():
    users = BrandOpsUser.get_all()
    user_list = []
    for user in users:
        user_list.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        })
    return jsonify(user_list)