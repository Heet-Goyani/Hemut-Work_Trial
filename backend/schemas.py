from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Stop Schemas
class StopBase(BaseModel):
    location: str
    stop_type: str  # 'pickup' or 'delivery'
    scheduled_time: datetime
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class StopCreate(StopBase):
    sequence: int

class StopResponse(StopBase):
    id: int
    order_id: int
    sequence: int
    status: str
    actual_arrival_time: Optional[datetime] = None
    actual_departure_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Order Schemas
class OrderBase(BaseModel):
    pickup_location: str
    delivery_location: str
    pickup_date: datetime
    delivery_date: datetime
    cargo_type: str
    weight: float
    dimensions: Optional[str] = None
    vehicle_type: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    route_geometry: Optional[dict] = None  # GeoJSON LineString
    bill_of_lading: Optional[str] = None
    container_number: Optional[str] = None
    seal_number: Optional[str] = None
    carrier: Optional[str] = None
    reference_number: Optional[str] = None
    po_number: Optional[str] = None
    customer_reference: Optional[str] = None
    special_instructions: Optional[str] = None
    internal_notes: Optional[str] = None
    quote_amount: Optional[float] = 0.0
    status: str = "pending"

class OrderCreate(OrderBase):
    customer_id: int
    stops: List[StopCreate]

class OrderUpdate(BaseModel):
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None
    pickup_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None
    cargo_type: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    vehicle_type: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    route_geometry: Optional[dict] = None
    bill_of_lading: Optional[str] = None
    container_number: Optional[str] = None
    seal_number: Optional[str] = None
    carrier: Optional[str] = None
    reference_number: Optional[str] = None
    po_number: Optional[str] = None
    customer_reference: Optional[str] = None
    special_instructions: Optional[str] = None
    internal_notes: Optional[str] = None
    quote_amount: Optional[float] = None
    status: Optional[str] = None
    stops: Optional[List[StopCreate]] = None

class OrderResponse(OrderBase):
    id: int
    customer_id: int
    customer: CustomerResponse
    stops: List[StopResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Pagination Response
class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    limit: int
    total_pages: int
