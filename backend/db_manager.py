"""
Complete Database Manager for AI-QUITY
Manage users, portfolios, and holdings via command line.
"""

import sys
from app.database import SessionLocal, User, Portfolio, PortfolioHolding
from app.utils.security import get_password_hash
from app.config import settings


def create_user(email: str, password: str, full_name: str):
    """Create a new user."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"❌ User with email '{email}' already exists!")
            return False

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


def update_user(email: str, field: str, value: str):
    """Update a specific field of a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User with email '{email}' not found!")
            return False

        if field == "email":
            # Check if new email is taken
            existing = db.query(User).filter(User.email == value, User.id != user.id).first()
            if existing:
                print(f"❌ Email '{value}' is already in use!")
                return False
            user.email = value
        elif field == "full_name":
            user.full_name = value
        elif field == "password":
            user.hashed_password = get_password_hash(value)
        else:
            print(f"❌ Invalid field: {field}. Use: email, full_name, password")
            return False

        db.commit()
        db.refresh(user)
        print(f"✅ Updated user {email}: {field} = {value}")
        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error updating user: {e}")
        return False
    finally:
        db.close()


def create_portfolio(user_email: str, portfolio_name: str):
    """Create a portfolio for a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            print(f"❌ User with email '{user_email}' not found!")
            return False

        portfolio = Portfolio(
            user_id=user.id,
            name=portfolio_name,
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

        print("✅ Portfolio created successfully!"        print(f"   Portfolio ID: {portfolio.id}")
        print(f"   Name: {portfolio.name}")
        print(f"   User: {user.email}")
        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating portfolio: {e}")
        return False
    finally:
        db.close()


def add_holding(user_email: str, portfolio_name: str, ticker: str, shares: float, avg_cost: float):
    """Add a holding to a portfolio."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            print(f"❌ User with email '{user_email}' not found!")
            return False

        portfolio = db.query(Portfolio).filter(
            Portfolio.user_id == user.id,
            Portfolio.name == portfolio_name
        ).first()
        if not portfolio:
            print(f"❌ Portfolio '{portfolio_name}' not found for user {user_email}!")
            return False

        holding = PortfolioHolding(
            portfolio_id=portfolio.id,
            ticker=ticker.upper(),
            shares=shares,
            avg_cost=avg_cost,
        )
        db.add(holding)
        db.commit()
        db.refresh(holding)

        print("✅ Holding added successfully!"        print(f"   Ticker: {holding.ticker}")
        print(f"   Shares: {holding.shares}")
        print(f"   Avg Cost: ${holding.avg_cost}")
        print(f"   Portfolio: {portfolio.name}")
        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error adding holding: {e}")
        return False
    finally:
        db.close()


def list_all_data():
    """List all users, portfolios, and holdings."""
    db = SessionLocal()
    try:
        print("👥 USERS:")
        print("-" * 60)
        users = db.query(User).all()
        for user in users:
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Name: {user.full_name}")
            print(f"Active: {user.is_active}")
            print(f"Created: {user.created_at}")
            print()

        print("📁 PORTFOLIOS:")
        print("-" * 60)
        portfolios = db.query(Portfolio).all()
        for portfolio in portfolios:
            user = db.query(User).filter(User.id == portfolio.user_id).first()
            print(f"ID: {portfolio.id}")
            print(f"Name: {portfolio.name}")
            print(f"User: {user.email if user else 'Unknown'}")
            print(f"Created: {portfolio.created_at}")
            print()

        print("📈 HOLDINGS:")
        print("-" * 60)
        holdings = db.query(PortfolioHolding).all()
        for holding in holdings:
            portfolio = db.query(Portfolio).filter(Portfolio.id == holding.portfolio_id).first()
            print(f"Ticker: {holding.ticker}")
            print(f"Shares: {holding.shares}")
            print(f"Avg Cost: ${holding.avg_cost}")
            print(f"Added: {holding.added_at}")
            print(f"Portfolio: {portfolio.name if portfolio else 'Unknown'}")
            print()

    except Exception as e:
        print(f"❌ Error listing data: {e}")
    finally:
        db.close()


def main():
    """Main CLI interface."""
    if len(sys.argv) < 2:
        print("Usage: python db_manager.py <command> [args...]")
        print("\nCommands:")
        print("  create-user <email> <password> <full_name>     - Create new user")
        print("  update-user <email> <field> <value>            - Update user field")
        print("  create-portfolio <user_email> <portfolio_name> - Create portfolio")
        print("  add-holding <user_email> <portfolio_name> <ticker> <shares> <avg_cost>")
        print("  list                                           - List all data")
        print("\nExamples:")
        print("  python db_manager.py create-user user@example.com pass123 'John Doe'")
        print("  python db_manager.py update-user user@example.com full_name 'Jane Doe'")
        print("  python db_manager.py create-portfolio user@example.com 'My Portfolio'")
        print("  python db_manager.py add-holding user@example.com 'My Portfolio' AAPL 100 150.50")
        print("  python db_manager.py list")
        return

    command = sys.argv[1].lower()

    if command == "create-user":
        if len(sys.argv) != 5:
            print("❌ Usage: python db_manager.py create-user <email> <password> <full_name>")
            return
        email, password, full_name = sys.argv[2], sys.argv[3], sys.argv[4]
        create_user(email, password, full_name)

    elif command == "update-user":
        if len(sys.argv) != 5:
            print("❌ Usage: python db_manager.py update-user <email> <field> <value>")
            return
        email, field, value = sys.argv[2], sys.argv[3], sys.argv[4]
        update_user(email, field, value)

    elif command == "create-portfolio":
        if len(sys.argv) != 4:
            print("❌ Usage: python db_manager.py create-portfolio <user_email> <portfolio_name>")
            return
        user_email, portfolio_name = sys.argv[2], sys.argv[3]
        create_portfolio(user_email, portfolio_name)

    elif command == "add-holding":
        if len(sys.argv) != 7:
            print("❌ Usage: python db_manager.py add-holding <user_email> <portfolio_name> <ticker> <shares> <avg_cost>")
            return
        user_email, portfolio_name, ticker, shares, avg_cost = sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5]), float(sys.argv[6])
        add_holding(user_email, portfolio_name, ticker, shares, avg_cost)

    elif command == "list":
        list_all_data()

    else:
        print(f"❌ Unknown command: {command}")
        print("Use 'python db_manager.py' for help.")


if __name__ == "__main__":
    main()</content>
<parameter name="filePath">c:\Users\RONAK\OneDrive\Documents\SEM V\project\backend\db_manager.py