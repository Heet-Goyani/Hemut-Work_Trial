'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, User, History, Calculator, Plus, Trash2 } from 'lucide-react';
import { Trip } from '@/types/trip';
import { tripService } from '@/lib/api';

interface TripDetailPanelProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

type DetailTab = 'load_details' | 'customer_details' | 'lane_history' | 'calculator';

interface Accessory {
  id: number;
  category: string;
  cost: number;
}

export default function TripDetailPanel({ trip, isOpen, onClose, onUpdate }: TripDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('load_details');
  
  // Calculator states
  const [baseRatePerMile, setBaseRatePerMile] = useState<number>(0);
  const [miles, setMiles] = useState<number>(0);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [marginType, setMarginType] = useState<'percentage' | 'flat'>('percentage');
  const [marginPercentage, setMarginPercentage] = useState<number>(0);
  const [marginFlatAmount, setMarginFlatAmount] = useState<number>(0);
  const [nextAccessoryId, setNextAccessoryId] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Lane history states
  const [laneHistoryTrips, setLaneHistoryTrips] = useState<Trip[]>([]);
  const [loadingLaneHistory, setLoadingLaneHistory] = useState(false);

  // Reset calculator when trip changes
  useEffect(() => {
    setBaseRatePerMile(0);
    setMiles(0);
    setAccessories([]);
    setMarginType('percentage');
    setMarginPercentage(0);
    setMarginFlatAmount(0);
    setNextAccessoryId(1);
    setActiveTab('load_details');
  }, [trip?.id]);

  // Fetch lane history when trip changes
  useEffect(() => {
    const fetchLaneHistory = async () => {
      if (!trip) return;
      
      setLoadingLaneHistory(true);
      try {
        const response = await tripService.getTrips({
          limit: 100, // Get more trips to find matches
        });
        
        // Filter trips with same pickup and delivery locations (excluding current trip)
        const matchingTrips = response.trips.filter(t => 
          t.id !== trip.id &&
          t.pickup_location === trip.pickup_location &&
          t.delivery_location === trip.delivery_location
        );
        
        setLaneHistoryTrips(matchingTrips);
      } catch (error) {
        console.error('Failed to fetch lane history:', error);
        setLaneHistoryTrips([]);
      } finally {
        setLoadingLaneHistory(false);
      }
    };

    if (trip) {
      fetchLaneHistory();
    }
  }, [trip?.id]);

  const accessoryCategories = [
    'Fuel Surcharge',
    'Tolls',
    'Loading/Unloading Fee',
    'Detention Time',
    'Hazmat Fee',
    'Refrigeration',
    'Insurance',
    'Other'
  ];

  // Calculations
  const baseCost = baseRatePerMile * miles;
  const accessoriesCost = accessories.reduce((sum, acc) => sum + acc.cost, 0);
  const subtotal = baseCost + accessoriesCost;
  const marginAmount = marginType === 'percentage' 
    ? (subtotal * marginPercentage) / 100 
    : marginFlatAmount;
  const totalCost = subtotal + marginAmount;

  const addAccessory = () => {
    setAccessories([...accessories, { id: nextAccessoryId, category: '', cost: 0 }]);
    setNextAccessoryId(nextAccessoryId + 1);
  };

  const updateAccessory = (id: number, field: 'category' | 'cost', value: string | number) => {
    setAccessories(accessories.map(acc => 
      acc.id === id ? { ...acc, [field]: value } : acc
    ));
  };

  const deleteAccessory = (id: number) => {
    setAccessories(accessories.filter(acc => acc.id !== id));
  };

  const handleSaveQuote = async () => {
    if (!trip) return;
    
    setIsSaving(true);
    try {
      await tripService.updateTrip(trip.id, {
        quote_amount: totalCost,
      });
      alert(`Quote of $${totalCost.toFixed(2)} saved successfully!`);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to save quote:', error);
      alert('Failed to save quote. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !trip) return null;

  const tabs = [
    { id: 'load_details', label: 'Load Details', icon: Package },
    { id: 'customer_details', label: 'Customer Details', icon: User },
    { id: 'lane_history', label: 'Lane History', icon: History },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-40 transform transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">{trip.customer?.name || 'Trip #' + trip.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-200 rounded"
          >
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {trip.pickup_location.split(',')[0]} → {trip.delivery_location.split(',')[0]}
        </p>
      </div>

      {/* Status Badge */}
      <div className="px-4 py-3 bg-gray-50 border-b">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          trip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          trip.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          trip.status === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DetailTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-yellow-400 text-yellow-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto h-[calc(100vh-180px)]">
        {/* Load Details Tab */}
        {activeTab === 'load_details' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Details</h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Pickup Location</p>
                    <p className="text-sm font-medium">{trip.pickup_location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Delivery Location</p>
                    <p className="text-sm font-medium">{trip.delivery_location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Pickup Date</p>
                    <p className="text-sm font-medium">
                      {new Date(trip.pickup_date).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
                    <p className="text-sm font-medium">
                      {new Date(trip.delivery_date).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cargo Type</p>
                    <p className="text-sm font-medium">{trip.cargo_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Weight</p>
                    <p className="text-sm font-medium">{trip.weight} kg</p>
                  </div>
                  {trip.dimensions && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Dimensions</p>
                      <p className="text-sm font-medium">{trip.dimensions}</p>
                    </div>
                  )}
                  {trip.vehicle_type && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Vehicle Type</p>
                      <p className="text-sm font-medium">{trip.vehicle_type}</p>
                    </div>
                  )}
                  {trip.quote_amount && trip.quote_amount > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quote Amount</p>
                      <p className="text-lg font-bold text-green-600">${trip.quote_amount.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Route Itinerary</h3>
              <div className="space-y-2">
                {/* Source - Pickup Location */}
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm text-green-900">Source</h4>
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
                      PICKUP
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">{trip.pickup_location}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(trip.pickup_date).toLocaleString()}
                  </p>
                  {trip.contact_person && (
                    <p className="text-xs text-gray-600 mt-2">
                      Contact: {trip.contact_person}
                      {trip.contact_phone && ` - ${trip.contact_phone}`}
                    </p>
                  )}
                </div>

                {/* Arrow Connector */}
                {trip.stops.length > 2 && (
                  <div className="flex justify-center">
                    <div className="text-gray-400">↓</div>
                  </div>
                )}

                {/* Intermediate Stops (exclude first pickup and last delivery) */}
                {trip.stops
                  .filter((_, index) => index > 0 && index < trip.stops.length - 1)
                  .map((stop, index) => (
                  <React.Fragment key={index}>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm text-blue-900">Stop {index + 1}</h4>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          stop.stop_type === 'pickup' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {stop.stop_type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{stop.location}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(stop.scheduled_time).toLocaleString()}
                      </p>
                      {stop.contact_person && (
                        <p className="text-xs text-gray-600 mt-2">
                          Contact: {stop.contact_person}
                          {stop.contact_phone && ` - ${stop.contact_phone}`}
                        </p>
                      )}
                    </div>
                    {/* Arrow after each stop */}
                    <div className="flex justify-center">
                      <div className="text-gray-400">↓</div>
                    </div>
                  </React.Fragment>
                ))}

                {/* Arrow before Destination if no intermediate stops */}
                {trip.stops.length <= 2 && (
                  <div className="flex justify-center">
                    <div className="text-gray-400">↓</div>
                  </div>
                )}

                {/* Destination - Delivery Location */}
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm text-purple-900">Destination</h4>
                    <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800 font-medium">
                      DELIVERY
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">{trip.delivery_location}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(trip.delivery_date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Shipment Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {trip.bill_of_lading && (
                  <div>
                    <p className="text-xs text-gray-500">Bill of Lading</p>
                    <p className="text-sm font-medium">{trip.bill_of_lading}</p>
                  </div>
                )}
                {trip.container_number && (
                  <div>
                    <p className="text-xs text-gray-500">Container Number</p>
                    <p className="text-sm font-medium">{trip.container_number}</p>
                  </div>
                )}
                {trip.seal_number && (
                  <div>
                    <p className="text-xs text-gray-500">Seal Number</p>
                    <p className="text-sm font-medium">{trip.seal_number}</p>
                  </div>
                )}
                {trip.carrier && (
                  <div>
                    <p className="text-xs text-gray-500">Carrier</p>
                    <p className="text-sm font-medium">{trip.carrier}</p>
                  </div>
                )}
              </div>
            </div>

            {(trip.special_instructions || trip.internal_notes) && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  {trip.special_instructions && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Special Instructions</p>
                      <p className="text-sm">{trip.special_instructions}</p>
                    </div>
                  )}
                  {trip.internal_notes && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Internal Notes</p>
                      <p className="text-sm">{trip.internal_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Details Tab */}
        {activeTab === 'customer_details' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            {trip.customer && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Customer Name</p>
                  <p className="text-sm font-medium">{trip.customer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{trip.customer.email}</p>
                </div>
                {trip.customer.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{trip.customer.phone}</p>
                  </div>
                )}
                {trip.customer.address && (
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium">{trip.customer.address}</p>
                  </div>
                )}
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {trip.reference_number && (
                <div>
                  <p className="text-xs text-gray-500">Reference Number</p>
                  <p className="text-sm font-medium">{trip.reference_number}</p>
                </div>
              )}
              {trip.po_number && (
                <div>
                  <p className="text-xs text-gray-500">PO Number</p>
                  <p className="text-sm font-medium">{trip.po_number}</p>
                </div>
              )}
              {trip.customer_reference && (
                <div>
                  <p className="text-xs text-gray-500">Customer Reference</p>
                  <p className="text-sm font-medium">{trip.customer_reference}</p>
                </div>
              )}
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500">Primary Contact</p>
                <p className="text-sm font-medium">
                  {trip.stops[0]?.contact_person || 'N/A'}
                </p>
                {trip.stops[0]?.contact_phone && (
                  <p className="text-sm text-gray-600">{trip.stops[0].contact_phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lane History Tab */}
        {activeTab === 'lane_history' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-6">Lane History</h3>
            
            {loadingLaneHistory ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading lane history...</p>
              </div>
            ) : laneHistoryTrips.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-lg mb-2">No history available</p>
                <p className="text-gray-500 text-sm">
                  No previous trips found from <span className="font-medium">{trip.pickup_location}</span> to <span className="font-medium">{trip.delivery_location}</span>
                </p>
              </div>
            ) : (
              <>
                {/* Historical Lane Trips */}
                <div className="space-y-4">
                  {laneHistoryTrips.slice(0, 10).map((historyTrip, index) => (
                    <div key={historyTrip.id} className="relative">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                          {index < Math.min(laneHistoryTrips.length, 10) - 1 && (
                            <div className="w-0.5 h-16 border-l-2 border-dotted border-gray-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <h4 className="font-semibold text-base mb-1">
                            {historyTrip.customer?.name || `Trip #${historyTrip.id}`}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">{historyTrip.pickup_location}</p>
                          <p className="text-xs text-gray-500">
                            DATE: {new Date(historyTrip.pickup_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          {historyTrip.quote_amount && historyTrip.quote_amount > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              Quote: ${historyTrip.quote_amount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lane Statistics */}
                <div className="bg-gray-50 rounded-lg p-5 mt-6">
                  <h3 className="text-xl font-bold mb-6">Lane Statistics</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Avg Rate</p>
                      <p className="text-2xl font-bold">
                        ${(() => {
                          const tripsWithQuotes = laneHistoryTrips.filter(t => t.quote_amount && t.quote_amount > 0);
                          if (tripsWithQuotes.length === 0) return '0.00';
                          const avgQuote = tripsWithQuotes.reduce((sum, t) => sum + (t.quote_amount || 0), 0) / tripsWithQuotes.length;
                          // Assume average distance (or you can calculate from actual data if available)
                          const estimatedMiles = 500; // Default estimate
                          return (avgQuote / estimatedMiles).toFixed(2);
                        })()}/mi
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Total Loads</p>
                      <p className="text-2xl font-bold">{laneHistoryTrips.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Last Load</p>
                      <p className="text-xl font-semibold">
                        {(() => {
                          if (laneHistoryTrips.length === 0) return 'N/A';
                          const latestTrip = laneHistoryTrips.reduce((latest, current) => 
                            new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
                          );
                          const daysAgo = Math.floor((new Date().getTime() - new Date(latestTrip.updated_at).getTime()) / (1000 * 60 * 60 * 24));
                          return daysAgo === 0 ? 'Today' : `${daysAgo} days ago`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Frequency</p>
                      <p className="text-xl font-semibold">
                        {(() => {
                          if (laneHistoryTrips.length < 2) return 'N/A';
                          // Calculate average days between trips
                          const sortedTrips = [...laneHistoryTrips].sort((a, b) => 
                            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                          );
                          let totalDays = 0;
                          for (let i = 1; i < sortedTrips.length; i++) {
                            const days = (new Date(sortedTrips[i].created_at).getTime() - new Date(sortedTrips[i-1].created_at).getTime()) / (1000 * 60 * 60 * 24);
                            totalDays += days;
                          }
                          const avgDays = totalDays / (sortedTrips.length - 1);
                          if (avgDays < 2) return 'Daily';
                          if (avgDays < 8) return 'Weekly';
                          if (avgDays < 20) return 'Bi-weekly';
                          if (avgDays < 35) return 'Monthly';
                          return 'Occasional';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Find Best Driver Button */}
                <button className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-lg rounded-lg transition-colors mt-6">
                  Find Best Driver
                </button>
              </>
            )}
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-5">
            {/* Base Cost Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-5 text-xl">Base Cost</h4>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Rate (per mile)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={baseRatePerMile || ''}
                    onChange={(e) => setBaseRatePerMile(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Miles
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={miles || ''}
                    onChange={(e) => setMiles(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Base Cost</span>
                <span className="text-2xl font-bold text-gray-900">${baseCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Accessories Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-5 text-xl">Accessories</h4>
              
              {accessories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No accessories added</p>
                  <button
                    onClick={addAccessory}
                    className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                  >
                    + Add Accessory
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {accessories.map((accessory) => (
                      <div key={accessory.id} className="flex items-center gap-3">
                        <select
                          value={accessory.category}
                          onChange={(e) => updateAccessory(accessory.id, 'category', e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                          <option value="">Select accessory</option>
                          {accessoryCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={accessory.cost || ''}
                          onChange={(e) => updateAccessory(accessory.id, 'cost', parseFloat(e.target.value) || 0)}
                          className="w-28 px-4 py-3 bg-gray-50 border-0 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                        <button
                          onClick={() => deleteAccessory(accessory.id)}
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addAccessory}
                    className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                  >
                    + Add Another
                  </button>
                </>
              )}
            </div>

            {/* Margin Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h4 className="font-semibold text-gray-800 mb-4 text-base">Profit Margin</h4>
              
              {/* Margin Type Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setMarginType('percentage')}
                  className={`pb-2 px-4 text-sm font-medium transition-colors ${
                    marginType === 'percentage'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Percentage
                </button>
                <button
                  onClick={() => setMarginType('flat')}
                  className={`pb-2 px-4 text-sm font-medium transition-colors ${
                    marginType === 'flat'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Flat Amount
                </button>
              </div>

              {/* Percentage Margin Tab Content */}
              {marginType === 'percentage' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margin Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={marginPercentage || ''}
                    onChange={(e) => setMarginPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {marginPercentage}% of ${subtotal.toFixed(2)} = ${marginAmount.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Flat Amount Margin Tab Content */}
              {marginType === 'flat' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flat Margin Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={marginFlatAmount || ''}
                    onChange={(e) => setMarginFlatAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Fixed margin amount added to subtotal
                  </p>
                </div>
              )}
              
              <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                <p className="text-sm text-gray-600 mb-1">
                  {marginType === 'percentage' ? 'Calculated' : 'Flat'} Margin Amount
                </p>
                <p className="text-2xl font-bold text-purple-600">${marginAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Quote Summary Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Quote Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-700">Base Cost</span>
                  <span className="font-semibold text-gray-900">${baseCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-700">Accessories Cost</span>
                  <span className="font-semibold text-gray-900">${accessoriesCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                  <span className="text-gray-700">
                    Profit Margin {marginType === 'percentage' ? `(${marginPercentage}%)` : '(Flat)'}
                  </span>
                  <span className="font-semibold text-gray-900">${marginAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-gray-900">Total Quote</span>
                  <span className="text-3xl font-bold text-yellow-500">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button className="py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-base rounded-lg hover:bg-gray-50 transition-colors">
                Find Best Driver
              </button>
              <button
                onClick={handleSaveQuote}
                disabled={isSaving || totalCost === 0}
                className={`py-4 font-semibold text-base rounded-lg transition-all ${
                  isSaving || totalCost === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                }`}
              >
                {isSaving ? 'Saving...' : 'Get Quote'}
              </button>
            </div>

            {trip?.quote_amount && trip.quote_amount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Current Saved Quote: <span className="text-xl font-bold">${trip.quote_amount.toFixed(2)}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
