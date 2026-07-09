# Event Registration System API

A beginner-friendly **Event Registration System API** built with **Node.js and Express.js**. Create events, register users, manage seats, and handle cancellations with a simple JSON-based backend.

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Start the server
pnpm start

# Or use development mode with auto-reload
pnpm dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/events` | Create a new event |
| `GET` | `/events` | Get all events (with optional filtering/sorting) |
| `GET` | `/events/:eventId` | Get a specific event |

### Registrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/registrations` | Register a user for an event |
| `GET` | `/registrations` | Get all registrations (with optional filtering) |
| `GET` | `/registrations/:registrationId` | Get a specific registration |
| `PATCH` | `/registrations/:registrationId/cancel` | Cancel a registration |

## Example Usage

### Create an Event

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2026",
    "totalSeats": 100,
    "eventDate": "2026-12-20T10:00:00Z"
  }'
```

Response:
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

### Get All Events (Sorted by Date, Upcoming Only)

```bash
curl "http://localhost:3000/events?sort=date&upcoming=true"
```

### Register a User

```bash
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Ali Khan"
  }'
```

### Cancel a Registration

```bash
curl -X PATCH http://localhost:3000/registrations/660e8400-e29b-41d4-a716-446655440001/cancel
```

## Features

✅ **Event Management** - Create and list events  
✅ **User Registration** - Register users for events  
✅ **Seat Management** - Automatic seat counting and availability tracking  
✅ **Overbooking Prevention** - Race condition handling with double-check validation  
✅ **Duplicate Prevention** - Prevents same user registering twice  
✅ **Input Validation** - Comprehensive validation for all inputs  
✅ **Error Handling** - Clear, consistent error responses  
✅ **Data Persistence** - JSON file-based storage  
✅ **Filtering & Sorting** - Filter upcoming events, sort by date  
✅ **Cancellation Support** - Users can cancel with immediate seat release  

## Project Structure

```
event-registration-system/
├── data/
│   └── db.json                    # JSON database file
├── src/
│   ├── server.js                  # Express server setup
│   ├── routes/
│   │   ├── events.js              # Event endpoints
│   │   └── registrations.js       # Registration endpoints
│   ├── utils/
│   │   ├── fileStorage.js         # Database access layer
│   │   ├── validators.js          # Input validation
│   │   └── seatCalculator.js      # Seat calculations
│   └── middleware/
│       └── errorHandler.js        # Error handling
├── package.json
├── README.md                       # This file
└── overview.md                     # Detailed documentation
```

## Validation Rules

### Event Creation
- Event name must be unique and non-empty
- Total seats must be greater than 0
- Event date must be in the future

### User Registration
- User name must be non-empty
- Event must exist and have available seats
- Same user cannot register twice for the same event

## Key Implementation Details

### Race Condition Prevention
The registration endpoint implements a **triple-check validation**:
1. Check if seats are available
2. Check if user is already registered
3. Final verification before registration (prevents overbooking with concurrent requests)

### Seat Counting
- Only active registrations are counted
- Cancelled registrations immediately free up seats
- Available seats = Total seats - Active registrations

### Data Storage
- JSON file stored at `data/db.json`
- Two collections: `events` and `registrations`
- Persists between server restarts

## HTTP Status Codes

- `201 Created` - Resource successfully created
- `200 OK` - Successful request
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `409 Conflict` - Business logic conflict (full event, duplicate registration)
- `500 Internal Server Error` - Server error

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
```bash
PORT=3001 pnpm start
```

### Database File Issues

If `data/db.json` becomes corrupted, delete it. A new one will be created on the first write.

### Invalid Event Date

Event dates must be in ISO 8601 format and be in the future:
- ✅ Correct: `"2026-12-20T10:00:00Z"`
- ❌ Wrong: `"12/20/2026"` or `"2020-01-01T00:00:00Z"` (past date)

## Technology Stack

- **Runtime**: Node.js 14+
- **Framework**: Express.js 4.18+
- **Storage**: JSON file
- **ID Generation**: UUID v4

## Development Scripts

```bash
# Start production server
pnpm start

# Start with auto-reload on file changes
pnpm dev

# Check for syntax errors
node -c src/server.js
```

## For More Information

See `overview.md` for:
- Complete API documentation with examples
- Database structure details
- Race condition handling strategies
- Seat counting calculations
- Future improvement ideas
- Deployment considerations

## License

ISC

---

**Built for beginners learning backend API development with Node.js and Express.js**
