from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(50))
    address = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    orders = relationship("Order", back_populates="customer")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    # Order details
    pickup_location = Column(String(255), nullable=False)
    delivery_location = Column(String(255), nullable=False)
    pickup_date = Column(DateTime, nullable=False)
    delivery_date = Column(DateTime, nullable=False)
    cargo_type = Column(String(100), nullable=False)
    weight = Column(Float, nullable=False)
    dimensions = Column(String(100))
    vehicle_type = Column(String(100))
    
    # Contact information
    contact_person = Column(String(255))
    contact_phone = Column(String(50))
    contact_email = Column(String(255))
    
    # Route geometry - GeoJSON LineString
    route_geometry = Column(JSON)  # Store as GeoJSON: {"type": "LineString", "coordinates": [[lng, lat], ...]}
    
    # Shipment information
    bill_of_lading = Column(String(100))
    container_number = Column(String(100))
    seal_number = Column(String(100))
    carrier = Column(String(100))
    
    # Reference information
    reference_number = Column(String(100))
    po_number = Column(String(100))
    customer_reference = Column(String(100))
    
    # Notes
    special_instructions = Column(Text)
    internal_notes = Column(Text)
    
    # Quote/Cost
    quote_amount = Column(Float, default=0.0)
    
    # Status
    status = Column(String(50), nullable=False, default="pending")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    stops = relationship("Stop", back_populates="order", cascade="all, delete-orphan")


class Stop(Base):
    __tablename__ = "stops"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    # Stop details
    sequence = Column(Integer, nullable=False)  # Order of stops in the route
    location = Column(String(255), nullable=False)
    stop_type = Column(String(50), nullable=False)  # 'pickup' or 'delivery'
    scheduled_time = Column(DateTime, nullable=False)
    
    # Contact information
    contact_person = Column(String(100))
    contact_phone = Column(String(50))
    
    # Location coordinates
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Status and timestamps
    status = Column(String(50), default="pending")  # pending, completed, failed
    actual_arrival_time = Column(DateTime)
    actual_departure_time = Column(DateTime)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="stops")
