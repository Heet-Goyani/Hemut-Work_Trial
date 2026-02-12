'use client';

import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterValues) => void;
}

export interface FilterValues {
  availableDate?: string;
  timeWindow?: string;
  pickupCity?: string;
  deliveryCity?: string;
  equipment?: string;
  shipper?: string;
  // Advanced filters
  cargoType?: string;
  weightMin?: number;
  weightMax?: number;
}

export default function FilterPanel({ isOpen, onClose, onApplyFilters }: FilterPanelProps) {
  const [availableDate, setAvailableDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [equipment, setEquipment] = useState('');
  const [shipper, setShipper] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced filters
  const [cargoType, setCargoType] = useState('');
  const [weightMin, setWeightMin] = useState('');
  const [weightMax, setWeightMax] = useState('');

  const timeWindows = [
    'Morning (6 AM - 12 PM)',
    'Afternoon (12 PM - 6 PM)',
    'Evening (6 PM - 12 AM)',
    'Night (12 AM - 6 AM)',
    'Anytime'
  ];

  const equipmentTypes = [
    'All types',
    'Dry Van',
    'Flatbed',
    'Refrigerated',
    'Step Deck',
    'Lowboy',
    'Tanker',
    'Box Truck',
    'Conestoga',
    'Power Only'
  ];

  const usCities = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA',
    'Austin, TX',
    'Jacksonville, FL',
    'Fort Worth, TX',
    'Columbus, OH',
    'Charlotte, NC',
    'San Francisco, CA',
    'Indianapolis, IN',
    'Seattle, WA',
    'Denver, CO',
    'Boston, MA',
    'Atlanta, GA',
    'Miami, FL',
    'Detroit, MI',
    'Portland, OR',
    'Las Vegas, NV'
  ];

  const cargoTypes = [
    'General Freight',
    'Electronics',
    'Furniture',
    'Perishables',
    'Machinery',
    'Automobiles',
    'Chemicals',
    'Building Materials',
    'Consumer Goods',
    'Other'
  ];

  const handleClearAll = () => {
    setAvailableDate('');
    setTimeWindow('');
    setPickupCity('');
    setDeliveryCity('');
    setEquipment('');
    setShipper('');
    setCargoType('');
    setWeightMin('');
    setWeightMax('');
  };

  const handleApply = () => {
    const filters: FilterValues = {};
    
    if (availableDate) filters.availableDate = availableDate;
    if (timeWindow) filters.timeWindow = timeWindow;
    if (pickupCity) filters.pickupCity = pickupCity;
    if (deliveryCity) filters.deliveryCity = deliveryCity;
    if (equipment && equipment !== 'All types') filters.equipment = equipment;
    if (shipper && shipper !== 'All shippers') filters.shipper = shipper;
    if (cargoType) filters.cargoType = cargoType;
    if (weightMin) filters.weightMin = parseFloat(weightMin);
    if (weightMax) filters.weightMax = parseFloat(weightMax);

    onApplyFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="text-xl">☰</div>
            <h2 className="text-xl font-bold">Filter</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm text-gray-500">Filter loads based on filter</p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-200px)] px-4">
          {/* WHEN Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">WHEN</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Date
                </label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Window
                </label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Select time</option>
                  {timeWindows.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* WHERE Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">WHERE</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup City/State
                </label>
                <select
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Select City</option>
                  {usCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery City/State
                </label>
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Select City</option>
                  {usCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* REFINE RESULTS Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">REFINE RESULTS</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  {equipmentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipper
                </label>
                <select
                  value={shipper}
                  onChange={(e) => setShipper(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">All shippers</option>
                  <option value="Acme Corporation">Acme Corporation</option>
                  <option value="TechStart Inc">TechStart Inc</option>
                  <option value="BuildRight LLC">BuildRight LLC</option>
                  <option value="FreshFoods Co">FreshFoods Co</option>
                  <option value="AutoParts Direct">AutoParts Direct</option>
                </select>
              </div>
            </div>
          </div>

          {/* Show Advanced Filters */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
            >
              <ChevronDown 
                size={16} 
                className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
              Show Advanced Filters
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo Type
                  </label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="">All cargo types</option>
                    {cargoTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight Range (kg)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={weightMin}
                      onChange={(e) => setWeightMin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={weightMax}
                      onChange={(e) => setWeightMax(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Apply Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            onClick={handleApply}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
