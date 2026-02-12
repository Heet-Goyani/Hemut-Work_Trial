"""
Add new columns to existing database
"""
import sqlite3

# Connect to database
conn = sqlite3.connect('fleet_management.db')
cursor = conn.cursor()

# Add new columns to orders table
try:
    cursor.execute("ALTER TABLE orders ADD COLUMN vehicle_type VARCHAR(100)")
    print("✅ Added vehicle_type column")
except sqlite3.OperationalError as e:
    print(f"⚠️  vehicle_type column may already exist: {e}")

try:
    cursor.execute("ALTER TABLE orders ADD COLUMN contact_person VARCHAR(255)")
    print("✅ Added contact_person column")
except sqlite3.OperationalError as e:
    print(f"⚠️  contact_person column may already exist: {e}")

try:
    cursor.execute("ALTER TABLE orders ADD COLUMN contact_phone VARCHAR(50)")
    print("✅ Added contact_phone column")
except sqlite3.OperationalError as e:
    print(f"⚠️  contact_phone column may already exist: {e}")

try:
    cursor.execute("ALTER TABLE orders ADD COLUMN contact_email VARCHAR(255)")
    print("✅ Added contact_email column")
except sqlite3.OperationalError as e:
    print(f"⚠️  contact_email column may already exist: {e}")

conn.commit()
conn.close()
print("✅ Database migration complete!")
