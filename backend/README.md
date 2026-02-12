# Fleet Management Backend

A FastAPI backend for fleet management with SQLAlchemy ORM and SQLite/PostgreSQL support.

## Quick Start (SQLite - Development)

```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python init_db.py      # Creates SQLite database with sample data
uvicorn main:app --reload
```

Server runs at: http://localhost:8000
API Docs at: http://localhost:8000/docs

## Database Options

### SQLite (Default - Development)
No configuration needed. Database file created at `./fleet_management.db`

### PostgreSQL (Production)

**Option 1: Direct Install**
Download from https://www.postgresql.org/download/

**Option 2: Docker**
```bash
docker run --name fleet-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fleet_management \
  -p 5432:5432 -d postgres:15
```

Create `.env` file:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fleet_management
```

## Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  customers  │────<│   orders    │────<│    stops    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### customers
| Column     | Type      | Description           |
|------------|-----------|---------------------- |
| id         | Integer   | Primary key           |
| name       | String    | Company name          |
| email      | String    | Contact email         |
| phone      | String    | Contact phone         |
| address    | String    | Company address       |
| created_at | DateTime  | Record creation time  |
| updated_at | DateTime  | Last update time      |

### orders
| Column            | Type      | Description              |
|-------------------|-----------|--------------------------|
| id                | Integer   | Primary key              |
| customer_id       | Integer   | Foreign key to customers |
| pickup_location   | String    | Pickup address           |
| delivery_location | String    | Delivery address         |
| pickup_date       | DateTime  | Pickup date/time         |
| delivery_date     | DateTime  | Delivery date/time       |
| cargo_type        | String    | Type of cargo            |
| weight            | Float     | Weight in LBS            |
| vehicle_type      | String    | Equipment type           |
| contact_person    | String    | Shipper contact name     |
| contact_phone     | String    | Shipper phone            |
| contact_email     | String    | Shipper email            |
| rate              | Float     | Per-mile rate            |
| miles             | Float     | Total miles              |
| commodity         | String    | Commodity description    |
| order_ref_id      | String    | Order reference ID       |
| bol_number        | String    | Bill of Lading number    |
| shipment_id       | String    | Shipment ID              |
| quote_amount      | Float     | Calculated quote amount  |
| notes             | Text      | Special instructions     |
| status            | String    | Order status             |
| created_at        | DateTime  | Record creation time     |
| updated_at        | DateTime  | Last update time         |

### stops
| Column          | Type      | Description           |
|-----------------|-----------|---------------------- |
| id              | Integer   | Primary key           |
| order_id        | Integer   | Foreign key to orders |
| sequence        | Integer   | Stop order (1,2,3...) |
| location        | String    | Stop address          |
| stop_type       | String    | pickup/delivery/stop  |
| scheduled_time  | DateTime  | Scheduled arrival     |
| status          | String    | Stop status           |
| created_at      | DateTime  | Record creation time  |
| updated_at      | DateTime  | Last update time      |

## API Endpoints

### Customers

| Method | Endpoint             | Description          |
|--------|---------------------|----------------------|
| POST   | /api/customers      | Create customer      |
| GET    | /api/customers      | List all customers   |
| GET    | /api/customers/{id} | Get customer by ID   |

### Orders

| Method | Endpoint                 | Description                    |
|--------|-------------------------|--------------------------------|
| GET    | /api/orders             | List orders (paginated)        |
| POST   | /api/orders             | Create order with stops        |
| GET    | /api/orders/{id}        | Get order with stops           |
| PUT    | /api/orders/{id}        | Update order                   |
| DELETE | /api/orders/{id}        | Delete order (cascades stops)  |
| PATCH  | /api/orders/{id}/quote  | Update quote amount            |

### Query Parameters (GET /api/orders)

| Parameter | Type    | Default | Max  | Description            |
|-----------|---------|---------|------|------------------------|
| skip      | int     | 0       | -    | Pagination offset      |
| limit     | int     | 10      | 100  | Results per page       |
| search    | string  | null    | -    | Search all fields      |
| status    | string  | null    | -    | Filter by status       |
| sort_by   | string  | created | -    | Sort field             |
| sort_order| string  | desc    | -    | asc or desc            |

**Note:** Maximum limit is 100 per request. For larger exports, use pagination.

### Stops

| Method | Endpoint               | Description        |
|--------|------------------------|-------------------|
| PATCH  | /api/stops/{id}/status | Update stop status |

## Sample Data

The `init_db.py` script creates:
- 10 US-based customers (Amazon, FedEx, UPS, etc.)
- 15 sample orders with realistic routes
- Multiple stops per order

## Project Structure

```
backend/
├── main.py           # FastAPI app and routes
├── models.py         # SQLAlchemy ORM models
├── schemas.py        # Pydantic validation schemas
├── database.py       # Database connection
├── init_db.py        # Sample data initialization
├── requirements.txt  # Python dependencies
└── .env              # Environment variables
```

## Dependencies

```
fastapi>=0.104.0
uvicorn>=0.24.0
sqlalchemy>=2.0.0
pydantic>=2.0.0
python-dotenv>=1.0.0
psycopg2-binary>=2.9.9  # For PostgreSQL
```

## CORS Configuration

Backend allows CORS from:
- http://localhost:3000 (Next.js dev)
- http://localhost:3001

## Error Handling

- 404: Resource not found
- 422: Validation error (check request body)
- 500: Server error

## License

MIT
