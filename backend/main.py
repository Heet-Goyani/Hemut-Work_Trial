from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from contextlib import asynccontextmanager
import math

from database import engine, Base, get_db
from models import Customer, Order, Stop
from schemas import (
    CustomerCreate, CustomerResponse,
    OrderCreate, OrderUpdate, OrderResponse, OrderListResponse
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(title="Fleet Management API", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============= Customer Endpoints =============

@app.post("/api/customers", response_model=CustomerResponse)
async def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer"""
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


@app.get("/api/customers", response_model=list[CustomerResponse])
async def get_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all customers"""
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return customers


@app.get("/api/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a specific customer"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


# ============= Order Endpoints =============

@app.post("/api/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order with stops using transaction"""
    try:
        # Start transaction (automatic with SQLAlchemy session)
        
        # Verify customer exists
        customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Create order
        order_dict = order_data.dict(exclude={'stops'})
        db_order = Order(**order_dict)
        db.add(db_order)
        db.flush()  # Get order ID without committing
        
        # Create stops
        for stop_data in order_data.stops:
            stop_dict = stop_data.dict()
            db_stop = Stop(**stop_dict, order_id=db_order.id)
            db.add(db_stop)
        
        # Commit transaction
        db.commit()
        db.refresh(db_order)
        
        # Return with relationships loaded
        return db.query(Order).options(
            joinedload(Order.customer),
            joinedload(Order.stops)
        ).filter(Order.id == db_order.id).first()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/orders", response_model=OrderListResponse)
async def get_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|updated_at|status|id)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get all orders with pagination, search, and filters"""
    
    # Base query with joins
    query = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.stops)
    )
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Order.pickup_location.ilike(search_term)) |
            (Order.delivery_location.ilike(search_term)) |
            (Order.cargo_type.ilike(search_term)) |
            (Order.reference_number.ilike(search_term))
        )
    
    if status:
        query = query.filter(Order.status == status)
    
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    
    # Count total
    total = query.count()
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(getattr(Order, sort_by).desc())
    else:
        query = query.order_by(getattr(Order, sort_by).asc())
    
    # Apply pagination
    offset = (page - 1) * limit
    orders = query.offset(offset).limit(limit).all()
    
    total_pages = math.ceil(total / limit)
    
    return {
        "orders": orders,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


@app.get("/api/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order"""
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.stops)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.put("/api/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db)
):
    """Update an order with transaction"""
    try:
        # Get existing order
        db_order = db.query(Order).filter(Order.id == order_id).first()
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Update order fields
        update_data = order_update.dict(exclude_unset=True, exclude={'stops'})
        for field, value in update_data.items():
            setattr(db_order, field, value)
        
        # Update stops if provided
        if order_update.stops is not None:
            # Delete existing stops
            db.query(Stop).filter(Stop.order_id == order_id).delete()
            
            # Create new stops
            for stop_data in order_update.stops:
                stop_dict = stop_data.dict()
                db_stop = Stop(**stop_dict, order_id=order_id)
                db.add(db_stop)
        
        db.commit()
        db.refresh(db_order)
        
        return db.query(Order).options(
            joinedload(Order.customer),
            joinedload(Order.stops)
        ).filter(Order.id == order_id).first()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/orders/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order (and its stops via cascade)"""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted successfully"}


# ============= Stop Endpoints =============

@app.patch("/api/stops/{stop_id}/status")
async def update_stop_status(
    stop_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update stop status (for tracking)"""
    db_stop = db.query(Stop).filter(Stop.id == stop_id).first()
    if not db_stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    
    db_stop.status = status
    db.commit()
    return {"message": "Stop status updated"}


@app.get("/")
async def root():
    return {
        "message": "Fleet Management API",
        "database": "PostgreSQL with proper schema",
        "features": [
            "Customers table",
            "Orders table", 
            "Stops table with order→stops relation",
            "Route geometry (GeoJSON)",
            "Transactions for multi-table writes"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
