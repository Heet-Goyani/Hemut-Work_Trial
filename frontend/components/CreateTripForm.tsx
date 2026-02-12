'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TripCreate, Stop, Customer } from '@/types/trip';
import { customerService } from '@/lib/api';

interface CreateTripFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trip: TripCreate) => void;
}

type TabType = 'order_details' | 'stops' | 'shipment' | 'reference' | 'notes';

export default function CreateTripForm({ isOpen, onClose, onSubmit }: CreateTripFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('order_details');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
  
  // Form state - flattened
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [weight, setWeight] = useState(0);
  const [dimensions, setDimensions] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  const [stops, setStops] = useState<Stop[]>([{
    location: '',
    stop_type: 'pickup',
    scheduled_time: '',
    contact_person: '',
    contact_phone: '',
    sequence: 1,
  }]);

  const [billOfLading, setBillOfLading] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const [referenceNumber, setReferenceNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [customerReference, setCustomerReference] = useState('');

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Load customers on mount
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

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id as TabType);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id as TabType);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }
    
    const tripData: TripCreate = {
      customer_id: selectedCustomerId,
      pickup_location: pickupLocation,
      delivery_location: deliveryLocation,
      pickup_date: pickupDate,
      delivery_date: deliveryDate,
      cargo_type: cargoType,
      weight: weight,
      dimensions: dimensions || undefined,
      vehicle_type: vehicleType || undefined,
      contact_person: contactPerson || undefined,
      contact_phone: contactPhone || undefined,
      contact_email: contactEmail || undefined,
      bill_of_lading: billOfLading || undefined,
      container_number: containerNumber || undefined,
      seal_number: sealNumber || undefined,
      carrier: carrier || undefined,
      reference_number: referenceNumber || undefined,
      po_number: poNumber || undefined,
      customer_reference: customerReference || undefined,
      special_instructions: specialInstructions || undefined,
      internal_notes: internalNotes || undefined,
      status: 'pending',
      stops: stops.map((stop, index) => ({
        ...stop,
        sequence: index + 1,
      })),
    };
    onSubmit(tripData);
    resetForm();
  };

  const resetForm = () => {
    setPickupLocation('');
    setDeliveryLocation('');
    setPickupDate('');
    setDeliveryDate('');
    setCargoType('');
    setWeight(0);
    setDimensions('');
    setVehicleType('');
    setContactPerson('');
    setContactPhone('');
    setContactEmail('');
    setStops([{
      location: '',
      stop_type: 'pickup',
      scheduled_time: '',
      contact_person: '',
      contact_phone: '',
      sequence: 1,
    }]);
    setBillOfLading('');
    setContainerNumber('');
    setSealNumber('');
    setCarrier('');
    setReferenceNumber('');
    setPoNumber('');
    setCustomerReference('');
    setSpecialInstructions('');
    setInternalNotes('');
    setActiveTab('order_details');
  };

  const addStop = () => {
    setStops([...stops, {
      location: '',
      stop_type: 'delivery',
      scheduled_time: '',
      contact_person: '',
      contact_phone: '',
      sequence: stops.length + 1,
    }]);
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

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
                    ? 'bg-blue-600 text-white'
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
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Order Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Customer *</label>
                      <select
                        required
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value={0}>Select a customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} ({customer.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pickup Location *</label>
                      <input
                        type="text"
                        required
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Enter pickup location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Delivery Location *</label>
                      <input
                        type="text"
                        required
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Enter delivery location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pickup Date *</label>
                      <input
                        type="datetime-local"
                        required
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Delivery Date *</label>
                      <input
                        type="datetime-local"
                        required
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cargo Type *</label>
                      <input
                        type="text"
                        required
                        value={cargoType}
                        onChange={(e) => setCargoType(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., Electronics, Food"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Weight (kg) *</label>
                      <input
                        type="number"
                        required
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Dimensions (LxWxH)</label>
                      <input
                        type="text"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 100x50x30 cm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Select vehicle type</option>
                        <option value="Dry Van">Dry Van</option>
                        <option value="Flatbed">Flatbed</option>
                        <option value="Refrigerated">Refrigerated (Reefer)</option>
                        <option value="Step Deck">Step Deck</option>
                        <option value="Box Truck">Box Truck</option>
                        <option value="Tanker">Tanker</option>
                        <option value="Lowboy">Lowboy</option>
                        <option value="Conestoga">Conestoga</option>
                        <option value="Auto Carrier">Auto Carrier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="+1-555-0123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stops Tab */}
              {activeTab === 'stops' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Stops</h3>
                    <button
                      type="button"
                      onClick={addStop}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Stop
                    </button>
                  </div>
                  {stops.map((stop, index) => (
                    <div key={index} className="border p-4 rounded-md relative">
                      {stops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                        >
                          <X size={20} />
                        </button>
                      )}
                      <h4 className="font-medium mb-3">Stop {index + 1}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Location *</label>
                          <input
                            type="text"
                            required
                            value={stop.location}
                            onChange={(e) => {
                              const newStops = [...stops];
                              newStops[index].location = e.target.value;
                              setStops(newStops);
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type *</label>
                          <select
                            required
                            value={stop.stop_type}
                            onChange={(e) => {
                              const newStops = [...stops];
                              newStops[index].stop_type = e.target.value;
                              setStops(newStops);
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="pickup">Pickup</option>
                            <option value="delivery">Delivery</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Scheduled Time *</label>
                          <input
                            type="datetime-local"
                            required
                            value={stop.scheduled_time}
                            onChange={(e) => {
                              const newStops = [...stops];
                              newStops[index].scheduled_time = e.target.value;
                              setStops(newStops);
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Contact Person</label>
                          <input
                            type="text"
                            value={stop.contact_person}
                            onChange={(e) => {
                              const newStops = [...stops];
                              newStops[index].contact_person = e.target.value;
                              setStops(newStops);
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Contact Phone</label>
                          <input
                            type="tel"
                            value={stop.contact_phone}
                            onChange={(e) => {
                              const newStops = [...stops];
                              newStops[index].contact_phone = e.target.value;
                              setStops(newStops);
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Shipment Tab */}
              {activeTab === 'shipment' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Shipment Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Bill of Lading</label>
                      <input
                        type="text"
                        value={billOfLading}
                        onChange={(e) => setBillOfLading(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Container Number</label>
                      <input
                        type="text"
                        value={containerNumber}
                        onChange={(e) => setContainerNumber(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Seal Number</label>
                      <input
                        type="text"
                        value={sealNumber}
                        onChange={(e) => setSealNumber(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Carrier</label>
                      <input
                        type="text"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reference Tab */}
              {activeTab === 'reference' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Reference Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Reference Number</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">PO Number</label>
                      <input
                        type="text"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Customer Reference</label>
                      <input
                        type="text"
                        value={customerReference}
                        onChange={(e) => setCustomerReference(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Notes</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Special Instructions</label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={4}
                      placeholder="Any special handling instructions..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Internal Notes</label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={4}
                      placeholder="Internal notes (not visible to customer)..."
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
            onClick={handlePrevious}
            disabled={activeTab === 'order_details'}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex gap-2">
            {activeTab !== 'notes' ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
