# Quick Start Guide

Get the Event Registration System API running in 2 minutes.

## 1. Install & Start

```bash
pnpm install
pnpm start
```

Server starts on `http://localhost:3000`

## 2. Test It

### Create an Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Event",
    "totalSeats": 10,
    "eventDate": "2026-12-31T18:00:00Z"
  }'
```

Response: Save the `id` from the response (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### Register a User
```bash
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "John Doe"
  }'
```

### View Events
```bash
curl http://localhost:3000/events
```

### View Registrations
```bash
curl http://localhost:3000/registrations
```

## 3. Key API Features

| Feature | Endpoint | Method |
|---------|----------|--------|
| Create Event | `/events` | POST |
| List Events | `/events` | GET |
| Register User | `/registrations` | POST |
| View Registrations | `/registrations` | GET |
| Cancel Registration | `/registrations/:id/cancel` | PATCH |

## 4. Validation Rules

### Creating Events
- **Name**: Must be unique and non-empty
- **Seats**: Must be > 0
- **Date**: Must be in the future

### Registering Users
- **Name**: Required and non-empty
- **Event**: Must exist and have available seats
- **Duplicate**: Same user can't register twice

## 5. Response Format

### Success (201 Created)
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Error (400 Bad Request)
```json
{
  "success": false,
  "error": "Error title",
  "details": ["Details..."]
}
```

## 6. Common Status Codes

- `201` - Created successfully
- `200` - Success
- `400` - Validation error
- `404` - Not found
- `409` - Conflict (event full, duplicate registration)

## 7. Example Workflow

```bash
# 1. Create event
EVENT_ID=$(curl -s -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "React Workshop",
    "totalSeats": 50,
    "eventDate": "2026-10-15T09:00:00Z"
  }' | jq -r '.data.id')

echo "Event created: $EVENT_ID"

# 2. Register users
curl -s -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d "{\"eventId\": \"$EVENT_ID\", \"userName\": \"Alice\"}" | jq .

# 3. View event with seat info
curl -s "http://localhost:3000/events/$EVENT_ID" | jq '.data | {name, totalSeats, availableSeats, activeRegistrations}'

# 4. Get all registrations for event
curl -s "http://localhost:3000/registrations?eventId=$EVENT_ID" | jq '.data | length'
```

## 8. Troubleshooting

**Port 3000 already in use?**
```bash
PORT=3001 pnpm start
```

**Database file corrupted?**
```bash
rm data/db.json
# Restart server - new file will be created
```

**Invalid date error?**
- Use ISO 8601 format: `2026-12-31T18:00:00Z`
- Date must be in the future

## 9. Useful Commands

```bash
# Development mode with auto-reload
pnpm dev

# Check for errors
node -c src/server.js

# View database
cat data/db.json | jq .
```

## 10. Next Steps

1. Read `README.md` for more details
2. Check `overview.md` for complete API documentation
3. Explore the code in `src/` folder
4. Try advanced queries with filtering and sorting

---

Happy coding! 🚀
