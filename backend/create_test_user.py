"""
Super Quick User Creator
Run this to create a test user instantly.
"""

from app.database import SessionLocal, User
from app.utils.security import get_password_hash

db = SessionLocal()
user = User(
    email="test@example.com",
    full_name="Test User",
    hashed_password=get_password_hash("password123"),
)
db.add(user)
db.commit()
db.close()

print("✅ Test user created: test@example.com / password123")</content>
<parameter name="filePath">c:\Users\RONAK\OneDrive\Documents\SEM V\project\backend\create_test_user.py