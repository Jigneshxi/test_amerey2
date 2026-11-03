from datetime import datetime
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous.url_safe_serializer import URLSafeSerializer

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///brand_ops.db'  # Use a more robust database in production
db = SQLAlchemy(app)

# Define roles
class Role:
    ADMIN = 'administrator'
    STANDARD = 'standard'

class BrandOpsUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default=Role.STANDARD, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='bcrypt', salt_length=16, cost_factor=12)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
# Example Usage (for testing/initialization)
with app.app_context():
    db.create_all()

    # Create an admin user if one doesn't exist
    admin_user = BrandOpsUser.query.filter_by(role=Role.ADMIN).first()
    if not admin_user:
        admin = BrandOpsUser(name="Admin", email="admin@example.com")
        admin.set_password("password")
        admin.role = Role.ADMIN
        db.session.add(admin)
        db.session.commit()