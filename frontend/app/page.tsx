'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Trash2, Download } from 'lucide-react';
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
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadMonth, setDownloadMonth] = useState(new Date().getMonth() + 1);
  const [downloadYear, setDownloadYear] = useState(new Date().getFullYear());

  // Helper function to extract city from address
  const extractCity = (address: string): string => {
    // Address format could be: "street, city, state zip" or just "city, state"
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      // Return the second part (city) if format is "street, city, state zip"
      // or first part if format is "city, state"
      return parts.length >= 3 ? parts[1] : parts[0];
    }
    // Return first word or the whole string if no comma
    return address.split(' ')[0] || address;
  };
  
  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});

  useEffect(() => {
    fetchTrips();
  }, [page, search, sortBy, sortOrder, advancedFilters]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTrips({
        page,
        limit,
        search: search || undefined,
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

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm(`Are you sure you want to delete Trip #${tripId}? This action cannot be undone.`)) {
      return;
    }
    try {
      await tripService.deleteTrip(tripId);
      fetchTrips();
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
        setIsDetailPanelOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
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

  // Download trips as CSV
  const handleDownloadTrips = async () => {
    try {
      // Fetch trips in batches (backend max limit is 100)
      let allTrips: Trip[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await tripService.getTrips({
          page: currentPage,
          limit: 100,
        });
        allTrips = [...allTrips, ...response.trips];
        hasMore = currentPage < response.total_pages;
        currentPage++;
      }
      
      // Filter by selected month and year
      const filteredTrips = allTrips.filter((trip: Trip) => {
        const tripDate = new Date(trip.pickup_date);
        return tripDate.getMonth() + 1 === downloadMonth && 
               tripDate.getFullYear() === downloadYear;
      });

      if (filteredTrips.length === 0) {
        alert(`No trips found for ${downloadMonth}/${downloadYear}`);
        return;
      }

      // Generate CSV
      const headers = [
        'Trip ID',
        'Customer',
        'Pickup Location',
        'Delivery Location',
        'Pickup Date',
        'Delivery Date',
        'Status',
        'Cargo Type',
        'Weight (kg)',
        'Vehicle Type',
        'Quote Amount',
        'Contact Person',
        'Contact Phone',
        'Contact Email'
      ];

      const csvRows = [
        headers.join(','),
        ...filteredTrips.map((trip: Trip) => [
          trip.id,
          `"${trip.customer?.name || 'N/A'}"`,
          `"${trip.pickup_location}"`,
          `"${trip.delivery_location}"`,
          `"${new Date(trip.pickup_date).toLocaleString()}"`,
          `"${new Date(trip.delivery_date).toLocaleString()}"`,
          trip.status,
          `"${trip.cargo_type}"`,
          trip.weight,
          trip.vehicle_type || 'N/A',
          trip.quote_amount || 0,
          `"${trip.contact_person || 'N/A'}"`,
          `"${trip.contact_phone || 'N/A'}"`,
          `"${trip.contact_email || 'N/A'}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trips_${downloadMonth}_${downloadYear}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsDownloadModalOpen(false);
      alert(`Downloaded ${filteredTrips.length} trips for ${downloadMonth}/${downloadYear}`);
    } catch (error) {
      console.error('Failed to download trips:', error);
      alert('Failed to download trips. Please try again.');
    }
  };

  // Tab state
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound' | 'mybids'>('inbound');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Download size={20} />
                Export
              </button>
              <button
                onClick={() => setIsCreateFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
              >
                <Plus size={20} />
                Create Trip
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('inbound')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'inbound'
                  ? 'border-yellow-400 text-yellow-600 bg-yellow-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inbound Loads
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                {total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('outbound')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'outbound'
                  ? 'border-yellow-400 text-yellow-600 bg-yellow-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Outbound Loads
            </button>
            <button
              onClick={() => setActiveTab('mybids')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'mybids'
                  ? 'border-yellow-400 text-yellow-600 bg-yellow-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Bids
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show content based on active tab */}
        {activeTab === 'inbound' ? (
          <>
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
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
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
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Create your first trip
            </button>
          </div>
        ) : displayTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">No trips match your filters</p>
            <button
              onClick={() => setAdvancedFilters({})}
              className="text-yellow-600 hover:text-yellow-700 font-medium"
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
                        <div className="max-w-[200px]">
                          <div className="text-sm font-semibold text-gray-900">
                            {extractCity(trip.pickup_location)}
                          </div>
                          <div className="text-xs text-gray-400 truncate" title={trip.pickup_location}>
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
                        <div className="max-w-[200px]">
                          <div className="text-sm font-semibold text-gray-900">
                            {extractCity(trip.delivery_location)}
                          </div>
                          <div className="text-xs text-gray-400 truncate" title={trip.delivery_location}>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Trip"
                      >
                        <Trash2 size={18} />
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
                              ? 'bg-yellow-400 text-gray-900 font-semibold'
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
          </>
        ) : activeTab === 'outbound' ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Outbound Loads</h3>
            <p className="text-gray-500">Outbound loads management coming soon</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">My Bids</h3>
            <p className="text-gray-500">Your bid history and active bids coming soon</p>
          </div>
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

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Export Trips</h2>
            <p className="text-gray-600 mb-6">Select the month and year to export trip data as CSV.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={downloadMonth}
                  onChange={(e) => setDownloadMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={downloadYear}
                  onChange={(e) => setDownloadYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>{year}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadTrips}
                className="px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-md hover:bg-yellow-500 flex items-center gap-2"
              >
                <Download size={18} />
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
