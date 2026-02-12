from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL - Use PostgreSQL or fallback to SQLite for development
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./fleet_management.db"
)

# Determine if using PostgreSQL
IS_POSTGRES = DATABASE_URL.startswith("postgresql")

# Create engine with appropriate settings
if IS_POSTGRES:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True
    )
else:
    # SQLite
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
