'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { TripCreate, Customer } from '@/types/trip';
import { customerService } from '@/lib/api';

interface CreateTripFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trip: TripCreate) => void;
}

type TabType = 'order_details' | 'stops' | 'shipment' | 'reference' | 'notes';

interface StopData {
  locationName: string;
  locationId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  arrivalEarly: string;
  arrivalLate: string;
  driverLoad: string;
  contactName: string;
  contactNumber: string;
  email: string;
  stopType: 'pickup' | 'delivery' | 'stop';
}

const emptyStop = (type: 'pickup' | 'delivery' | 'stop'): StopData => ({
  locationName: '',
  locationId: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  arrivalEarly: '',
  arrivalLate: '',
  driverLoad: '',
  contactName: '',
  contactNumber: '',
  email: '',
  stopType: type,
});

export default function CreateTripForm({ isOpen, onClose, onSubmit }: CreateTripFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('order_details');
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Order Details
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  const [equipmentType, setEquipmentType] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Stops
  const [pickup, setPickup] = useState<StopData>(emptyStop('pickup'));
  const [intermediateStops, setIntermediateStops] = useState<StopData[]>([]);
  const [destination, setDestination] = useState<StopData>(emptyStop('delivery'));

  // Shipment
  const [weightLbs, setWeightLbs] = useState<number>(0);
  const [miles, setMiles] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [commodity, setCommodity] = useState('');

  // Reference
  const [orderId, setOrderId] = useState('');
  const [billOfLading, setBillOfLading] = useState('');
  const [shipmentId, setShipmentId] = useState('');

  // Notes
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
      if (data.length > 0) {
        setSelectedCustomerId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const tabs = [
    { id: 'order_details', label: 'Order Details' },
    { id: 'stops', label: 'Stops' },
    { id: 'shipment', label: 'Shipment' },
    { id: 'reference', label: 'Reference' },
    { id: 'notes', label: 'Notes' },
  ];

  const addIntermediateStop = () => {
    setIntermediateStops([...intermediateStops, emptyStop('stop')]);
  };

  const removeIntermediateStop = (index: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    // Build location strings
    const pickupLocation = `${pickup.address}, ${pickup.city}, ${pickup.state} ${pickup.zipCode}`;
    const deliveryLocation = `${destination.address}, ${destination.city}, ${destination.state} ${destination.zipCode}`;

    // Build stops array
    const allStops = [
      {
        location: pickupLocation,
        stop_type: 'pickup',
        scheduled_time: pickup.arrivalEarly || new Date().toISOString(),
        contact_person: pickup.contactName,
        contact_phone: pickup.contactNumber,
        sequence: 1,
      },
      ...intermediateStops.map((stop, index) => ({
        location: `${stop.address}, ${stop.city}, ${stop.state} ${stop.zipCode}`,
        stop_type: stop.stopType === 'pickup' ? 'pickup' : 'delivery',
        scheduled_time: stop.arrivalEarly || new Date().toISOString(),
        contact_person: stop.contactName,
        contact_phone: stop.contactNumber,
        sequence: index + 2,
      })),
      {
        location: deliveryLocation,
        stop_type: 'delivery',
        scheduled_time: destination.arrivalEarly || new Date().toISOString(),
        contact_person: destination.contactName,
        contact_phone: destination.contactNumber,
        sequence: intermediateStops.length + 2,
      },
    ];

    const tripData: TripCreate = {
      customer_id: selectedCustomerId,
      pickup_location: pickupLocation,
      delivery_location: deliveryLocation,
      pickup_date: pickup.arrivalEarly || new Date().toISOString(),
      delivery_date: destination.arrivalEarly || new Date().toISOString(),
      cargo_type: commodity || 'General',
      weight: weightLbs || 1000,
      vehicle_type: equipmentType || undefined,
      contact_person: contactPerson || undefined,
      contact_phone: contactPhone || undefined,
      contact_email: contactEmail || undefined,
      bill_of_lading: billOfLading || undefined,
      reference_number: orderId || undefined,
      internal_notes: notes || undefined,
      status: 'pending',
      stops: allStops,
    };
    
    onSubmit(tripData);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCustomerId(0);
    setEquipmentType('');
    setContactPerson('');
    setContactPhone('');
    setContactEmail('');
    setPickup(emptyStop('pickup'));
    setIntermediateStops([]);
    setDestination(emptyStop('delivery'));
    setWeightLbs(0);
    setMiles(0);
    setRate(0);
    setCommodity('');
    setOrderId('');
    setBillOfLading('');
    setShipmentId('');
    setNotes('');
    setActiveTab('order_details');
  };

  const renderStopForm = (
    stop: StopData,
    setStop: (stop: StopData) => void,
    title: string,
    showRemove?: boolean,
    onRemove?: () => void
  ) => (
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        {showRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
          <input
            type="text"
            value={stop.locationName}
            onChange={(e) => setStop({ ...stop, locationName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., ABC Warehouse"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location ID</label>
          <input
            type="text"
            value={stop.locationId}
            onChange={(e) => setStop({ ...stop, locationId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., LOC-001"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <input
            type="text"
            required
            value={stop.address}
            onChange={(e) => setStop({ ...stop, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Street address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            required
            value={stop.city}
            onChange={(e) => setStop({ ...stop, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="City"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input
              type="text"
              required
              value={stop.state}
              onChange={(e) => setStop({ ...stop, state: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="State"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
            <input
              type="text"
              required
              value={stop.zipCode}
              onChange={(e) => setStop({ ...stop, zipCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Zip"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Arrival (Early) *</label>
          <input
            type="datetime-local"
            required
            value={stop.arrivalEarly}
            onChange={(e) => setStop({ ...stop, arrivalEarly: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Arrival (Late)</label>
          <input
            type="datetime-local"
            value={stop.arrivalLate}
            onChange={(e) => setStop({ ...stop, arrivalLate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Driver Load</label>
          <input
            type="text"
            value={stop.driverLoad}
            onChange={(e) => setStop({ ...stop, driverLoad: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Full Truckload, Partial"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
          <input
            type="text"
            value={stop.contactName}
            onChange={(e) => setStop({ ...stop, contactName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contact person"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input
            type="tel"
            value={stop.contactNumber}
            onChange={(e) => setStop({ ...stop, contactNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1-555-0123"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={stop.email}
            onChange={(e) => setStop({ ...stop, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="contact@example.com"
          />
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Create New Trip</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-gray-50 border-r p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full text-left px-4 py-3 rounded-md mb-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-yellow-400 text-gray-900'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Order Details Tab */}
              {activeTab === 'order_details' && (
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold mb-4">Order Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <select
                      required
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Type *</label>
                    <select
                      required
                      value={equipmentType}
                      onChange={(e) => setEquipmentType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select equipment type</option>
                      <option value="Dry Van">Dry Van</option>
                      <option value="Flatbed">Flatbed</option>
                      <option value="Refrigerated">Refrigerated (Reefer)</option>
                      <option value="Step Deck">Step Deck</option>
                      <option value="Box Truck">Box Truck</option>
                      <option value="Tanker">Tanker</option>
                      <option value="Lowboy">Lowboy</option>
                      <option value="Conestoga">Conestoga</option>
                      <option value="Power Only">Power Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1-555-0123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
              )}

              {/* Stops Tab */}
              {activeTab === 'stops' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Stops</h3>
                  
                  {/* Stop 1 - Pickup (Always First) */}
                  {renderStopForm(
                    pickup,
                    setPickup,
                    'Stop 1 (Pickup)'
                  )}

                  {/* Intermediate Stops */}
                  {intermediateStops.map((stop, index) => (
                    <div key={index}>
                      {renderStopForm(
                        stop,
                        (updatedStop) => {
                          const newStops = [...intermediateStops];
                          newStops[index] = updatedStop;
                          setIntermediateStops(newStops);
                        },
                        `Stop ${index + 2}`,
                        true,
                        () => removeIntermediateStop(index)
                      )}
                    </div>
                  ))}

                  {/* Add Stop Button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={addIntermediateStop}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-yellow-400 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
                    >
                      <Plus size={18} />
                      Add Stop
                    </button>
                  </div>

                  {/* Destination (Always Last) */}
                  {renderStopForm(
                    destination,
                    setDestination,
                    `Destination (Stop ${intermediateStops.length + 2})`
                  )}
                </div>
              )}

              {/* Shipment Tab */}
              {activeTab === 'shipment' && (
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold mb-4">Shipment Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (LBS) *</label>
                    <input
                      type="number"
                      required
                      value={weightLbs}
                      onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter weight in pounds"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Miles</label>
                    <input
                      type="number"
                      value={miles}
                      onChange={(e) => setMiles(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter distance in miles"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter rate in dollars"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commodity *</label>
                    <select
                      required
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select commodity type</option>
                      <option value="General Freight">General Freight</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Pharmaceuticals">Pharmaceuticals</option>
                      <option value="Automotive Parts">Automotive Parts</option>
                      <option value="Chemicals">Chemicals</option>
                      <option value="Building Materials">Building Materials</option>
                      <option value="Machinery">Machinery</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Paper Products">Paper Products</option>
                      <option value="Hazardous Materials">Hazardous Materials</option>
                      <option value="Refrigerated Goods">Refrigerated Goods</option>
                      <option value="Dry Goods">Dry Goods</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Reference Tab */}
              {activeTab === 'reference' && (
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold mb-4">Reference Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter order ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bill of Lading</label>
                    <input
                      type="text"
                      value={billOfLading}
                      onChange={(e) => setBillOfLading(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter bill of lading number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipment ID</label>
                    <input
                      type="text"
                      value={shipmentId}
                      onChange={(e) => setShipmentId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter shipment ID"
                    />
                  </div>
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold mb-4">Notes</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={6}
                      placeholder="Enter any additional notes or special instructions..."
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t">
          <button
            type="button"
            onClick={() => {
              const currentIndex = tabs.findIndex(t => t.id === activeTab);
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1].id as TabType);
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            {activeTab === 'order_details' ? 'Cancel' : 'Previous'}
          </button>
          <div className="flex gap-2">
            {activeTab !== 'notes' ? (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id as TabType);
                  }
                }}
                className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500 font-semibold"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit Trip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
