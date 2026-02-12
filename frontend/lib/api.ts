import axios from 'axios';
import { Trip, TripCreate, TripsResponse, Customer, Order, OrderCreate, OrdersResponse } from '@/types/trip';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customer Service
export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const response = await api.get<Customer[]>('/api/customers');
    return response.data;
  },

  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const response = await api.post<Customer>('/api/customers', customer);
    return response.data;
  },
};

// Trip/Order Service (unified)
export const tripService = {
  async getTrips(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customer_id?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<TripsResponse> {
    const response = await api.get<OrdersResponse>('/api/orders', { params });
    return {
      trips: response.data.orders,
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      total_pages: response.data.total_pages,
    };
  },

  async getTrip(id: number): Promise<Trip> {
    const response = await api.get<Order>(`/api/orders/${id}`);
    return response.data;
  },

  async createTrip(trip: TripCreate): Promise<Trip> {
    const response = await api.post<Order>('/api/orders', trip);
    return response.data;
  },

  async updateTrip(id: number, trip: Partial<TripCreate>): Promise<Trip> {
    const response = await api.put<Order>(`/api/orders/${id}`, trip);
    return response.data;
  },

  async deleteTrip(id: number): Promise<void> {
    await api.delete(`/api/orders/${id}`);
  },
};

// Alias for order service
export const orderService = tripService;
