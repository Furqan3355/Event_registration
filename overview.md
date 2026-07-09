# Event Registration System API

## Project Overview

This is a **beginner-friendly Event Registration System API** built with **Node.js and Express.js**. The system allows users to create events, register for events, view events with available seat information, and cancel registrations.

### Purpose

The project demonstrates best practices for building a simple yet robust backend API with:
- JSON file-based data persistence
- Input validation and error handling
- Race condition prevention for concurrent requests
- Clean code organization with separation of concerns
- RESTful API design principles

## Features

### 1. Event Management
- **Create Events**: Users can create new events with a unique name, total seat capacity, and future event date
- **View Events**: Browse all events with available seat counts and active registration counts
- **Filter Upcoming Events**: Get only events scheduled for the future
- **Sort Events**: Sort events by date for better organization

### 2. User Registration
- **Register for Events**: Users can register for events they're interested in
- **Prevent Overbooking**: System ensures seat capacity is never exceeded
- **Prevent Duplicate Registrations**: Same user cannot register twice for the same event
- **Safe Cancellation**: Users can cancel registrations and free up seats

### 3. Robust Data Handling
- **Race Condition Prevention**: Double-check mechanism prevents concurrent request issues
- **Duplicate Request Safety**: Idempotent operations handle retries gracefully
- **Data Persistence**: All data is stored in a JSON file and persists between restarts
- **Accurate Seat Counting**: Available seats calculated only from active registrations

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Web Framework | Express.js 4.18+ |
| Data Storage | JSON file (persistent local storage) |
| ID Generation | UUID |
| Language | JavaScript (CommonJS) |

## Project Structure

```
event-registration-system/
├── data/
│   └── db.json                    # Persistent data storage (JSON database)
├── src/
│   ├── server.js                  # Express app setup and server initialization
│   ├── routes/
│   │   ├── events.js              # Event creation and retrieval endpoints
│   │   └── registrations.js       # Registration and cancellation endpoints
│   ├── utils/
│   │   ├── fileStorage.js         # File I/O and database access layer
│   │   ├── validators.js          # Input validation and business logic checks
│   │   └── seatCalculator.js      # Seat availability calculations
│   └── middleware/
│       └── errorHandler.js        # Global error handling middleware
├── package.json                   # Project dependencies and scripts
├── README.md                       # Setup and usage instructions
└── overview.md                     # This file
```

## Data Storage Approach

### JSON Database File
- Located at: `data/db.json`
- Format: Plain JSON with two root collections: `events` and `registrations`
- Persistence: Automatically written to disk after each write operation
- Initial State: Empty arrays for both events and registrations

### Database Structure

```json
{
  "events": [
    {
      "id": "unique-uuid",
      "name": "Event Name",
      "totalSeats": 100,
      "eventDate": "2026-12-20T10:00:00Z",
      "createdAt": "2026-07-08T12:00:00Z"
    }
  ],
  "registrations": [
    {
      "id": "unique-uuid",
      "eventId": "event-id-reference",
      "userName": "User Name",
      "status": "active",
      "registeredAt": "2026-07-08T12:15:00Z",
      "cancelledAt": null
    }
  ]
}
```

## API Endpoints

### Event Endpoints

#### `POST /events`
Create a new event

**Request Body:**
```json
{
  "name": "Tech Conference 2026",
  "totalSeats": 100,
  "eventDate": "2026-12-20T10:00:00Z"
}
```

**Successful Response (201 Created):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Conference 2026",
    "totalSeats": 100,
    "eventDate": "2026-12-20T10:00:00Z",
    "createdAt": "2026-07-08T12:00:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Event date must be in the future", "Total seats must be a number greater than 0"]
}
```

#### `GET /events`
Retrieve all events with optional sorting and filtering

**Query Parameters:**
- `sort=date` - Sort events by event date (ascending)
- `upcoming=true` - Show only upcoming events (future dates)

**Examples:**
- `GET /events` - Get all events
- `GET /events?sort=date` - Get all events sorted by date
- `GET /events?upcoming=true` - Get only upcoming events
- `GET /events?sort=date&upcoming=true` - Get upcoming events sorted by date

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Tech Conference 2026",
      "totalSeats": 100,
      "eventDate": "2026-12-20T10:00:00Z",
      "createdAt": "2026-07-08T12:00:00Z",
      "activeRegistrations": 45,
      "availableSeats": 55
    }
  ],
  "count": 1
}
```

#### `GET /events/:eventId`
Get a specific event by ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Conference 2026",
    "totalSeats": 100,
    "eventDate": "2026-12-20T10:00:00Z",
    "createdAt": "2026-07-08T12:00:00Z",
    "activeRegistrations": 45,
    "availableSeats": 55
  }
}
```

### Registration Endpoints

#### `POST /registrations`
Register a user for an event

**Request Body:**
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "userName": "Ali Khan"
}
```

**Successful Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Ali Khan",
    "status": "active",
    "registeredAt": "2026-07-08T12:15:00Z",
    "cancelledAt": null
  }
}
```

**Error - Event Full (409 Conflict):**
```json
{
  "success": false,
  "error": "Event is full"
}
```

**Error - Already Registered (409 Conflict):**
```json
{
  "success": false,
  "error": "User is already registered for this event"
}
```

#### `GET /registrations`
Retrieve all registrations with optional filtering

**Query Parameters:**
- `eventId=<id>` - Filter by event ID
- `userName=<name>` - Filter by user name
- `status=active` - Filter by status (active or cancelled)

**Examples:**
- `GET /registrations` - Get all registrations
- `GET /registrations?eventId=550e8400-e29b-41d4-a716-446655440000` - Get registrations for a specific event
- `GET /registrations?userName=Ali Khan` - Get registrations for a specific user
- `GET /registrations?status=active` - Get only active registrations

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "eventId": "550e8400-e29b-41d4-a716-446655440000",
      "userName": "Ali Khan",
      "status": "active",
      "registeredAt": "2026-07-08T12:15:00Z",
      "cancelledAt": null
    }
  ],
  "count": 1
}
```

#### `GET /registrations/:registrationId`
Get a specific registration by ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Ali Khan",
    "status": "active",
    "registeredAt": "2026-07-08T12:15:00Z",
    "cancelledAt": null
  }
}
```

#### `PATCH /registrations/:registrationId/cancel`
Cancel a user registration

**Successful Response (200 OK):**
```json
{
  "success": true,
  "message": "Registration cancelled successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Ali Khan",
    "status": "cancelled",
    "registeredAt": "2026-07-08T12:15:00Z",
    "cancelledAt": "2026-07-08T12:30:00Z"
  }
}
```

**Error - Already Cancelled (409 Conflict):**
```json
{
  "success": false,
  "error": "Registration is already cancelled"
}
```

## Validation Rules

### Event Creation Validation
- **Event Name**: Required, non-empty string, must be unique (case-insensitive)
- **Total Seats**: Required, must be a number greater than 0
- **Event Date**: Required, must be a valid ISO 8601 date string, must be in the future

### User Registration Validation
- **Event ID**: Required, non-empty string, event must exist
- **User Name**: Required, non-empty string
- **Seat Availability**: Event must have available seats
- **Duplicate Prevention**: Same user cannot be registered twice for the same event

## Error Handling Approach

### HTTP Status Codes
- **201 Created**: Successful resource creation (event, registration)
- **200 OK**: Successful retrieval or update
- **400 Bad Request**: Invalid input data or validation failure
- **404 Not Found**: Resource (event, registration) doesn't exist
- **409 Conflict**: Business logic conflict (event full, duplicate registration, already cancelled)
- **500 Internal Server Error**: Unexpected server error

### Error Response Format
All errors follow a consistent JSON structure:
```json
{
  "success": false,
  "error": "Error title",
  "details": ["Detailed error message 1", "Detailed error message 2"],
  "message": "Additional context (for some endpoints)"
}
```

### Common Error Messages
- **"Event is full"**: No seats available for the event
- **"User is already registered for this event"**: Duplicate registration attempt
- **"Registration is already cancelled"**: Attempting to cancel an already-cancelled registration
- **"Event not found"**: Referenced event ID doesn't exist
- **"Registration not found"**: Referenced registration ID doesn't exist
- **"Event date must be in the future"**: Attempting to create event with past or current date
- **"Event name must be unique"**: Event with same name already exists

## Race Condition and Duplicate Request Handling Strategy

### Race Condition Prevention

**Problem**: When multiple concurrent requests try to register for the same event, there's a risk of overbooking if the seat check and registration aren't atomic.

**Solution**: Double-check mechanism implemented in registration endpoint:
1. First validation checks available seats
2. Second validation checks duplicate registration
3. **Final verification** immediately before registration:
   - Re-query database for active registrations
   - Verify seat count hasn't changed since first check
   - Only register if seats still available

This triple-check pattern ensures that even with concurrent requests, the seat count never exceeds the event capacity.

### Duplicate Request Handling

**Problem**: If a client resends a registration request (network retry), it could create a duplicate registration.

**Solution**: The system validates that a user cannot register twice for the same event:
- Before registration, system checks if user already has active registration
- If duplicate attempt detected, returns `409 Conflict` error
- Client can safely retry without risk of duplicate entries

### JSON File Atomicity

**Limitation**: JSON file writes are not atomic by default, but because:
- Each request follows sequential operations (read → validate → write)
- Node.js is single-threaded for file I/O
- The time window for conflicts is minimal
- The double-check validation catches any edge cases

This approach is suitable for a small-scale beginner project. For production systems, a proper database with transaction support would be recommended.

## Seat Count Calculation

### How Available Seats Are Calculated

Available seats are calculated dynamically by:
1. Reading total seats from event record
2. Counting all active registrations for that event
3. Subtracting active registrations from total seats
4. Ensuring result never goes below 0

**Formula:**
```
availableSeats = max(0, event.totalSeats - activeRegistrationCount)
```

### Active Registrations

Only registrations with `status === "active"` are counted:
- New registrations start with `status: "active"`
- Cancelled registrations have `status: "cancelled"` and are excluded from seat counting
- This ensures cancelled users free up seats immediately

### Seat Information in Responses

Event responses include:
- `totalSeats`: Total capacity of the event
- `availableSeats`: Remaining seats available for registration
- `activeRegistrations`: Number of current active registrations

This allows clients to:
- Show progress bars (e.g., "45 of 100 seats filled")
- Determine if event is sold out (`availableSeats === 0`)
- Display real-time availability information

## How to Run the Project Locally

### Prerequisites
- Node.js 14+ installed
- npm or pnpm package manager

### Installation Steps

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start the Server**
   ```bash
   # Production mode
   pnpm start

   # Development mode with auto-restart on file changes
   pnpm dev
   ```

3. **Verify Server is Running**
   ```bash
   # Check health endpoint
   curl http://localhost:3000/health
   ```

### API Testing

You can test the API using curl, Postman, or any HTTP client:

**Create an Event:**
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2026",
    "totalSeats": 100,
    "eventDate": "2026-12-20T10:00:00Z"
  }'
```

**View All Events:**
```bash
curl http://localhost:3000/events
```

**Register a User:**
```bash
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "<event-id-from-above>",
    "userName": "Ali Khan"
  }'
```

## JSON Database Structure

### Events Collection

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Tech Conference 2026",
  "totalSeats": 100,
  "eventDate": "2026-12-20T10:00:00Z",
  "createdAt": "2026-07-08T12:00:00Z"
}
```

**Fields:**
- `id`: Unique event identifier (UUID v4)
- `name`: Event name (must be unique)
- `totalSeats`: Maximum number of participants
- `eventDate`: ISO 8601 formatted future date
- `createdAt`: ISO 8601 timestamp of creation

### Registrations Collection

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "userName": "Ali Khan",
  "status": "active",
  "registeredAt": "2026-07-08T12:15:00Z",
  "cancelledAt": null
}
```

**Fields:**
- `id`: Unique registration identifier (UUID v4)
- `eventId`: Reference to the event
- `userName`: Name of the registered user
- `status`: Either "active" or "cancelled"
- `registeredAt`: ISO 8601 timestamp of registration
- `cancelledAt`: ISO 8601 timestamp of cancellation (null if not cancelled)

## Project Structure Details

### src/server.js
- Express app initialization
- Middleware setup (JSON parsing, logging)
- Route mounting for events and registrations
- Health check endpoint
- Global error handling
- Server startup

### src/routes/events.js
- `POST /events` - Create new event
- `GET /events` - List all events with filtering and sorting
- `GET /events/:eventId` - Get specific event details

**Validation & Business Logic:**
- Event name uniqueness
- Future date validation
- Positive seat count validation

### src/routes/registrations.js
- `POST /registrations` - Register user for event
- `GET /registrations` - List registrations with filtering
- `GET /registrations/:registrationId` - Get specific registration
- `PATCH /registrations/:registrationId/cancel` - Cancel registration

**Validation & Business Logic:**
- Seat availability check
- Duplicate registration prevention
- Race condition prevention (double-check)
- Duplicate cancellation prevention

### src/utils/fileStorage.js
**Database Access Layer** - Provides consistent interface for data operations:
- `readDatabase()` - Read entire JSON file
- `writeDatabase()` - Write entire JSON file
- `getEvents()`, `getEventById()`, `addEvent()` - Event operations
- `getRegistrations()`, `getRegistrationById()`, `addRegistration()` - Registration operations
- `updateRegistration()` - Update registration fields
- `getUserEventRegistration()` - Find user's registration for event
- `getActiveRegistrationsForEvent()` - Get active registrations for event

### src/utils/validators.js
**Input Validation & Business Rules**:
- `validateEventInput()` - Validate event creation data
- `validateRegistrationInput()` - Validate registration data
- `validateSeatAvailability()` - Check if event has seats
- `validateNotAlreadyRegistered()` - Prevent duplicate registrations

### src/utils/seatCalculator.js
**Seat Availability Calculations**:
- `getAvailableSeats()` - Calculate remaining seats
- `getActiveRegistrationCount()` - Count active registrations
- `getEventWithSeatInfo()` - Enhance event with seat information
- `getAllEventsWithSeatInfo()` - Get all events with seat calculations

### src/middleware/errorHandler.js
- Global error handling middleware
- Consistent error response formatting
- Error logging

## Possible Future Improvements

### 1. **Database Upgrade**
   - Migrate to SQLite/PostgreSQL for better concurrency
   - Implement proper transactions for atomic operations
   - Add database indexes for faster queries

### 2. **Authentication & Authorization**
   - Add user accounts and authentication
   - Different roles: admin, event organizer, attendee
   - Admin dashboard for event management

### 3. **Advanced Features**
   - User profiles and registration history
   - Email notifications for registration confirmation
   - Waiting list when event is full
   - Event categories and search functionality
   - Ratings and reviews for events
   - QR code generation for check-in

### 4. **API Enhancements**
   - Pagination for large datasets
   - Advanced filtering (date range, event type)
   - Bulk operations (batch registrations, bulk cancellations)
   - Event statistics and analytics endpoints
   - Import/export functionality (CSV)

### 5. **Frontend Application**
   - Web UI for event discovery
   - User registration form
   - Dashboard showing user's registrations
   - Admin panel for event management

### 6. **Deployment & DevOps**
   - Docker containerization
   - CI/CD pipeline with GitHub Actions
   - Automated testing (unit tests, integration tests)
   - API documentation (Swagger/OpenAPI)
   - Monitoring and logging (Winston, Morgan)
   - Rate limiting and API security

### 7. **Performance Optimization**
   - Caching layer (Redis) for frequently accessed events
   - Database query optimization
   - API response compression
   - Connection pooling

### 8. **Data Improvements**
   - Add event descriptions, location, organizer info
   - Support for event categories and tags
   - User preferences and recommendations
   - Event capacity by tier (VIP, General, etc.)

### 9. **Testing**
   - Unit tests for utilities and validators
   - Integration tests for API endpoints
   - Load testing for concurrent registrations
   - Error scenario testing

### 10. **Documentation**
   - API documentation with Swagger/OpenAPI
   - Developer setup guide
   - Architecture decision records (ADRs)
   - Contribution guidelines

---

**Version**: 1.0.0  
**Last Updated**: July 8, 2026  
**Status**: Ready for use and enhancement
