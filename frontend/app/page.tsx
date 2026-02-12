'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { tripService } from '@/lib/api';
import { Trip, TripCreate } from '@/types/trip';
import CreateTripForm from '@/components/CreateTripForm';
import TripDetailPanel from '@/components/TripDetailPanel';
import FilterPanel, { FilterValues } from '@/components/FilterPanel';

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});

  useEffect(() => {
    fetchTrips();
  }, [page, search, statusFilter, sortBy, sortOrder, advancedFilters]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTrips({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setTrips(response.trips);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      alert('Failed to load trips. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (tripData: TripCreate) => {
    try {
      await tripService.createTrip(tripData);
      setIsCreateFormOpen(false);
      fetchTrips();
      alert('Trip created successfully!');
    } catch (error) {
      console.error('Failed to create trip:', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsDetailPanelOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
    setPage(1);
  };

  // Apply advanced filters on frontend
  const getFilteredTrips = () => {
    let filtered = [...trips];

    // Filter by available date (pickup date)
    if (advancedFilters.availableDate) {
      const filterDate = new Date(advancedFilters.availableDate).toDateString();
      filtered = filtered.filter(trip => 
        new Date(trip.pickup_date).toDateString() === filterDate
      );
    }

    // Filter by pickup city
    if (advancedFilters.pickupCity) {
      filtered = filtered.filter(trip => 
        trip.pickup_location.includes(advancedFilters.pickupCity!)
      );
    }

    // Filter by delivery city
    if (advancedFilters.deliveryCity) {
      filtered = filtered.filter(trip => 
        trip.delivery_location.includes(advancedFilters.deliveryCity!)
      );
    }

    // Filter by equipment (vehicle type)
    if (advancedFilters.equipment) {
      filtered = filtered.filter(trip => 
        trip.vehicle_type === advancedFilters.equipment
      );
    }

    // Filter by cargo type
    if (advancedFilters.cargoType) {
      filtered = filtered.filter(trip => 
        trip.cargo_type === advancedFilters.cargoType
      );
    }

    // Filter by weight range
    if (advancedFilters.weightMin) {
      filtered = filtered.filter(trip => 
        trip.weight >= advancedFilters.weightMin!
      );
    }
    if (advancedFilters.weightMax) {
      filtered = filtered.filter(trip => 
        trip.weight <= advancedFilters.weightMax!
      );
    }

    return filtered;
  };

  const displayTrips = getFilteredTrips();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
            <button
              onClick={() => setIsCreateFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create Trip
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Created Date</option>
                <option value="updated_at">Updated Date</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Advanced Filter Button */}
            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>
        </div>

        {/* Trip List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">No trips found</p>
            <button
              onClick={() => setIsCreateFormOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first trip
            </button>
          </div>
        ) : displayTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">No trips match your filters</p>
            <button
              onClick={() => setAdvancedFilters({})}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between p-4">
                    {/* Left Section - Trip ID and Status */}
                    <div 
                      className="flex items-center gap-4 cursor-pointer flex-shrink-0"
                      onClick={() => handleTripClick(trip)}
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          Trip #{trip.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          #{trip.id.toString().padStart(6, '0')}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded ${
                        trip.status === 'pending' ? 'bg-green-100 text-green-700' :
                        trip.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        trip.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {trip.status === 'pending' ? 'ETA Order' : trip.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Middle Section - Route and Details */}
                    <div 
                      className="flex items-center gap-6 flex-1 mx-6 cursor-pointer"
                      onClick={() => handleTripClick(trip)}
                    >
                      {/* Locations */}
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {trip.pickup_location}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(trip.pickup_date).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                            <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {trip.delivery_location}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(trip.delivery_date).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-8 w-px bg-gray-200"></div>

                      {/* Trip Details */}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">
                            {trip.weight} kg
                          </span>
                        </div>
                        <div>
                          <span>
                            {trip.cargo_type}
                          </span>
                        </div>
                        {trip.dimensions && (
                          <div>
                            <span className="text-gray-500">
                              {trip.dimensions}
                            </span>
                          </div>
                        )}
                        {trip.quote_amount && trip.quote_amount > 0 && (
                          <>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div>
                              <span className="text-green-600 font-semibold text-sm">
                                Quote: ${trip.quote_amount.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Deploy Agent for Trip #${trip.id}`);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-500">
                          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Deploy Agent
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Bid on Trip #${trip.id}`);
                        }}
                        className="px-5 py-2 bg-yellow-400 text-gray-900 text-sm font-semibold rounded hover:bg-yellow-500 transition-colors"
                      >
                        Bid
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-lg shadow-sm mt-4 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Create Trip Form Modal */}
      <CreateTripForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateTrip}
      />

      {/* Trip Detail Side Panel */}
      <TripDetailPanel
        trip={selectedTrip}
        isOpen={isDetailPanelOpen}
        onClose={() => {
          setIsDetailPanelOpen(false);
          setSelectedTrip(null);
        }}
        onUpdate={() => {
          fetchTrips();
          // Refresh the selected trip data
          if (selectedTrip) {
            tripService.getTrip(selectedTrip.id).then(updatedTrip => {
              setSelectedTrip(updatedTrip);
            });
          }
        }}
      />

      {/* Overlay for side panel */}
      {isDetailPanelOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => {
            setIsDetailPanelOpen(false);
            setSelectedTrip(null);
          }}
        />
      )}

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
