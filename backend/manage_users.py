"""
User Management Script for AI-QUITY Backend
Allows creating new users and updating existing user names via command line.
"""

import sys
from app.database import SessionLocal, User
from app.utils.security import get_password_hash
from app.config import settings


def create_user(email: str, password: str, full_name: str):
    """Create a new user in the database."""
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"❌ User with email '{email}' already exists!")
            return False

        # Create new user
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print("✅ User created successfully!"        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.full_name}")
        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating user: {e}")
        return False
    finally:
        db.close()


def update_user_name(email: str, new_name: str):
    """Update an existing user's full name."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User with email '{email}' not found!")
            return False

        old_name = user.full_name
        user.full_name = new_name
        db.commit()
        db.refresh(user)

        print("✅ User name updated successfully!"        print(f"   Email: {user.email}")
        print(f"   Old Name: {old_name}")
        print(f"   New Name: {user.full_name}")
        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error updating user: {e}")
        return False
    finally:
        db.close()


def list_users():
    """List all users in the database."""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            print("📝 No users found in database.")
            return

        print("👥 Current Users:")
        print("-" * 60)
        for user in users:
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Name: {user.full_name}")
            print(f"Active: {user.is_active}")
            print(f"Created: {user.created_at}")
            print("-" * 60)

    except Exception as e:
        print(f"❌ Error listing users: {e}")
    finally:
        db.close()


def main():
    """Main CLI interface."""
    if len(sys.argv) < 2:
        print("Usage: python manage_users.py <command> [args...]")
        print("\nCommands:")
        print("  create <email> <password> <full_name>  - Create new user")
        print("  update <email> <new_name>             - Update user name")
        print("  list                                   - List all users")
        print("\nExamples:")
        print("  python manage_users.py create user@example.com mypassword123 'John Doe'")
        print("  python manage_users.py update user@example.com 'Jane Smith'")
        print("  python manage_users.py list")
        return

    command = sys.argv[1].lower()

    if command == "create":
        if len(sys.argv) != 5:
            print("❌ Usage: python manage_users.py create <email> <password> <full_name>")
            return
        email, password, full_name = sys.argv[2], sys.argv[3], sys.argv[4]
        create_user(email, password, full_name)

    elif command == "update":
        if len(sys.argv) != 4:
            print("❌ Usage: python manage_users.py update <email> <new_name>")
            return
        email, new_name = sys.argv[2], sys.argv[3]
        update_user_name(email, new_name)

    elif command == "list":
        list_users()

    else:
        print(f"❌ Unknown command: {command}")
        print("Use 'python manage_users.py' for help.")


if __name__ == "__main__":
    main()</content>
<parameter name="filePath">c:\Users\RONAK\OneDrive\Documents\SEM V\project\backend\manage_users.py