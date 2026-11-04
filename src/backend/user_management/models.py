from datetime import datetime
import bcrypt

class User:
    def __init__(self, id, email, password_hash, created_at=None, updated_at=None):
        self.id = id
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def __repr__(self):
        return f"<User {self.email}>"

    def verify_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def hash_password(self, password):
        cost = 12  # Cost factor for bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(cost))
        return hashed_password.decode('utf-8')