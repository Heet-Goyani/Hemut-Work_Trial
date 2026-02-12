"""
Rebuild database schema from scratch
"""
import os
import sys

# Remove the database file if it exists
db_path = "fleet_management.db"
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"✅ Deleted {db_path}")

# Now import and rebuild
from database import engine, Base
from models import Customer, Order, Stop

# Create all tables
Base.metadata.create_all(bind=engine)
print("✅ Created all tables with new schema")
print("✅ Database ready for initialization")
