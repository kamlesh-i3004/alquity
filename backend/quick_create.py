"""
Quick User Creator for AI-QUITY
Simple script to create users quickly.
"""

from app.database import SessionLocal, User
from app.utils.security import get_password_hash

def create_user(email: str, password: str, name: str):
    """Create a new user."""
    db = SessionLocal()
    try:
        user = User(
            email=email,
            full_name=name,
            hashed_password=get_password_hash(password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Created user: {user.email} ({user.full_name})")
        return True
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()

# Quick examples - uncomment and modify as needed
if __name__ == "__main__":
    # Create test users
    create_user("kamleshmali9029@gmail.com", "password123", "rayquazaa")
    create_user("admin@example.com", "password123", "Admin User")
    create_user("test@example.com", "password123", "Test User")
if __name__ == "__main__":
    # Create test users
    create_user("admin@example.com", "password123", "Admin User")
    create_user("test@example.com", "password123", "Test User")
    create_user("user@example.com", "password123", "Regular User")</content>
<parameter name="filePath">c:\Users\RONAK\OneDrive\Documents\SEM V\project\backend\quick_create.py