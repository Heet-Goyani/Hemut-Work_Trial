# Fleet Management Frontend

A modern, responsive fleet management interface built with Next.js 14 and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Features

### Main Navigation Tabs
- **Inbound Loads** - View incoming shipments with total count badge
- **Outbound Loads** - View outgoing shipments
- **My Bids** - View your bid history

### Trip List
- Card-based layout showing city names (e.g., "Los Angeles → New York")
- Full pickup/delivery addresses displayed below city names
- Search across all trip fields
- Sort by created date, updated date, or status
- Delete trips with confirmation dialog

### Create Trip Form (5 Tabs)
1. **Order Details**
   - Customer selection
   - Equipment type
   - Contact person, phone, email

2. **Stops**
   - Pickup location with date selector
   - Add multiple intermediate stops
   - Destination with date selector

3. **Shipment**
   - Weight (LBS)
   - Miles
   - Rate
   - Commodity

4. **Reference**
   - Order ID
   - BOL Number
   - Shipment ID

5. **Notes**
   - Special instructions textarea

### Trip Detail Panel (4 Tabs)
1. **Load Details**
   - Route itinerary with visual flow (Source → Stops → Destination)
   - Status, equipment type, weight, rate, commodity
   - Reference numbers

2. **Customer**
   - Company information
   - Contact details

3. **Lane History**
   - Historical data for similar routes
   - Statistics: Average Rate, Total Loads, Last Load, Frequency

4. **Calculator**
   - Base cost input
   - Accessories list (add/remove items)
   - Margin calculation (Percentage or Flat amount tabs)
   - Quote summary with save functionality
   - Auto-reset when switching trips

### Advanced Filter Panel
- Date range filter
- Time window (pickup/delivery times)
- Pickup city filter
- Delivery city filter
- Equipment type filter
- Shipper filter
- Cargo type filter
- Weight range filter

### Export Feature
- Download trips as CSV
- Filter by month and year
- Modal selector for date selection
- Batch fetching for large datasets

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx           # Main page with trip list
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── CreateTripForm.tsx # Multi-tab create form
│   ├── TripDetailPanel.tsx# Detail panel with calculator
│   └── FilterPanel.tsx    # Advanced filter panel
├── lib/
│   └── api.ts             # API service layer
├── types/
│   └── trip.ts            # TypeScript interfaces
└── public/                # Static assets
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Color Theme**: Yellow accent (bg-yellow-400, text-yellow-600)

## API Integration

All API calls are made through the `lib/api.ts` service layer:

```typescript
import { api } from '@/lib/api';

// Get trips with pagination
const trips = await api.getTrips(skip, limit, search, status);

// Create new trip
const trip = await api.createTrip(tripData);

// Delete trip
await api.deleteTrip(tripId);
```

## Build for Production

```bash
npm run build
npm start
```
