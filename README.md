# Fleet Management System

A full-stack fleet management application for managing trips, orders, and logistics operations.

## Project Structure

```
├── backend/          # FastAPI backend with SQLite/PostgreSQL
├── frontend/         # Next.js 14 frontend with TypeScript
└── README.md         # This file
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
python init_db.py        # Initialize database with sample data
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## Features

- **Trip Management**: Create, view, edit, and delete trips
- **Multi-Stop Routes**: Support for pickup → stops → destination
- **Cost Calculator**: Base cost, accessories, margin calculation
- **Lane History**: View historical data for similar routes
- **Export Data**: Download trips as CSV by month/year
- **Advanced Filters**: Filter by date, city, equipment, cargo type
- **Responsive UI**: Clean, modern interface with Tailwind CSS

## Tech Stack

| Layer    | Technology                                |
|----------|-------------------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS      |
| Backend  | FastAPI, SQLAlchemy 2.0, Pydantic         |
| Database | SQLite (dev) / PostgreSQL (production)    |
| API      | REST API with automatic OpenAPI docs      |

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

MIT