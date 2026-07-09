# API Examples & Test Cases

Complete examples for testing the Event Registration System API.

## Prerequisites

- Server running on `http://localhost:3000`
- `curl` installed (or use Postman/Insomnia)
- `jq` for pretty JSON output (optional)

---

## 1. Health Check

Verify the server is running:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-07-08T12:00:00.000Z"
}
```

---

## 2. Events API

### 2.1 Create Event

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript Workshop",
    "totalSeats": 20,
    "eventDate": "2026-09-15T09:00:00Z"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "JavaScript Workshop",
    "totalSeats": 20,
    "eventDate": "2026-09-15T09:00:00Z",
    "createdAt": "2026-07-08T12:00:00.000Z"
  }
}
```

### 2.2 Create Event - Validation Errors

**Missing name:**
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "totalSeats": 20,
    "eventDate": "2026-09-15T09:00:00Z"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Event name is required and must be a non-empty string"]
}
```

**Invalid seats (zero):**
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Event Name",
    "totalSeats": 0,
    "eventDate": "2026-09-15T09:00:00Z"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Total seats must be a number greater than 0"]
}
```

**Event date in past:**
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Past Event",
    "totalSeats": 20,
    "eventDate": "2020-01-01T09:00:00Z"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Event date must be in the future"]
}
```

**Duplicate event name:**
```bash
# First create an event
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NodeJS Bootcamp",
    "totalSeats": 30,
    "eventDate": "2026-10-01T10:00:00Z"
  }'

# Try creating with same name
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NodeJS Bootcamp",
    "totalSeats": 50,
    "eventDate": "2026-10-15T10:00:00Z"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Event name must be unique"]
}
```

### 2.3 Get All Events

Basic query:
```bash
curl http://localhost:3000/events
```

Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "JavaScript Workshop",
      "totalSeats": 20,
      "eventDate": "2026-09-15T09:00:00Z",
      "createdAt": "2026-07-08T12:00:00.000Z",
      "availableSeats": 18,
      "activeRegistrations": 2
    }
  ],
  "count": 1
}
```

### 2.4 Get Events - With Sorting

Sort by date (ascending):
```bash
curl "http://localhost:3000/events?sort=date"
```

### 2.5 Get Events - Upcoming Only

Filter upcoming events:
```bash
curl "http://localhost:3000/events?upcoming=true"
```

### 2.6 Get Events - Combined Filters

Upcoming events sorted by date:
```bash
curl "http://localhost:3000/events?sort=date&upcoming=true"
```

### 2.7 Get Single Event

```bash
curl http://localhost:3000/events/550e8400-e29b-41d4-a716-446655440000
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "JavaScript Workshop",
    "totalSeats": 20,
    "eventDate": "2026-09-15T09:00:00Z",
    "createdAt": "2026-07-08T12:00:00.000Z",
    "availableSeats": 18,
    "activeRegistrations": 2
  }
}
```

### 2.8 Get Non-existent Event

```bash
curl http://localhost:3000/events/invalid-id-12345
```

Response (404):
```json
{
  "success": false,
  "error": "Event not found"
}
```

---

## 3. Registrations API

### 3.1 Register User for Event

First, note the event ID from creating an event above.

```bash
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Alice Johnson"
  }'
```

Response (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Alice Johnson",
    "status": "active",
    "registeredAt": "2026-07-08T12:05:00.000Z",
    "cancelledAt": null
  }
}
```

### 3.2 Register User - Validation Errors

**Missing event ID:**
```bash
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Bob Smith"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Event ID is required and must be a non-empty string"]
}
```

**Non-existent event:**
```bash
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "invalid-event-id",
    "userName": "Charlie Brown"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Event not found"]
}
```

### 3.3 Duplicate Registration

Register the same user twice for the same event:

```bash
# First registration (succeeds)
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Diana Prince"
  }'

# Second registration - same user and event (fails)
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Diana Prince"
  }'
```

Response (409):
```json
{
  "success": false,
  "error": "User is already registered for this event"
}
```

### 3.4 Event Full (No Seats Available)

Event with 2 seats, registering 3 users:

```bash
# Create event with 2 seats
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Limited Workshop",
    "totalSeats": 2,
    "eventDate": "2026-08-20T14:00:00Z"
  }' | jq -r '.data.id' > /tmp/event_id.txt

EVENT_ID=$(cat /tmp/event_id.txt)

# Register first user (succeeds)
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d "{\"eventId\": \"$EVENT_ID\", \"userName\": \"User One\"}"

# Register second user (succeeds)
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d "{\"eventId\": \"$EVENT_ID\", \"userName\": \"User Two\"}"

# Register third user (fails - event full)
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d "{\"eventId\": \"$EVENT_ID\", \"userName\": \"User Three\"}"
```

Response (409):
```json
{
  "success": false,
  "error": "Event is full"
}
```

### 3.5 Get All Registrations

```bash
curl http://localhost:3000/registrations
```

Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "eventId": "550e8400-e29b-41d4-a716-446655440000",
      "userName": "Alice Johnson",
      "status": "active",
      "registeredAt": "2026-07-08T12:05:00.000Z",
      "cancelledAt": null
    }
  ],
  "count": 1
}
```

### 3.6 Filter Registrations by Event ID

```bash
curl "http://localhost:3000/registrations?eventId=550e8400-e29b-41d4-a716-446655440000"
```

### 3.7 Filter Registrations by User Name

```bash
curl "http://localhost:3000/registrations?userName=Alice%20Johnson"
```

### 3.8 Filter by Status

Get only active registrations:
```bash
curl "http://localhost:3000/registrations?status=active"
```

Get only cancelled registrations:
```bash
curl "http://localhost:3000/registrations?status=cancelled"
```

### 3.9 Get Single Registration

```bash
curl http://localhost:3000/registrations/660e8400-e29b-41d4-a716-446655440001
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Alice Johnson",
    "status": "active",
    "registeredAt": "2026-07-08T12:05:00.000Z",
    "cancelledAt": null
  }
}
```

### 3.10 Cancel Registration

```bash
curl -X PATCH http://localhost:3000/registrations/660e8400-e29b-41d4-a716-446655440001/cancel
```

Response (200):
```json
{
  "success": true,
  "message": "Registration cancelled successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Alice Johnson",
    "status": "cancelled",
    "registeredAt": "2026-07-08T12:05:00.000Z",
    "cancelledAt": "2026-07-08T12:10:00.000Z"
  }
}
```

### 3.11 Cancel Already-Cancelled Registration

```bash
# Try cancelling the same registration again
curl -X PATCH http://localhost:3000/registrations/660e8400-e29b-41d4-a716-446655440001/cancel
```

Response (409):
```json
{
  "success": false,
  "error": "Registration is already cancelled"
}
```

### 3.12 Seat Count After Cancellation

After cancelling a registration, seats should be available again:

```bash
# View the event - availableSeats should have increased
curl http://localhost:3000/events/550e8400-e29b-41d4-a716-446655440000
```

---

## 4. Complete Workflow Example

Comprehensive workflow demonstrating all features:

```bash
#!/bin/bash

# Set base URL
BASE_URL="http://localhost:3000"

echo "=== Creating Events ==="

# Create Event 1
EVENT_1=$(curl -s -X POST $BASE_URL/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "React Masterclass",
    "totalSeats": 5,
    "eventDate": "2026-12-10T10:00:00Z"
  }' | jq -r '.data.id')
echo "Event 1 created: $EVENT_1"

# Create Event 2
EVENT_2=$(curl -s -X POST $BASE_URL/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node.js Advanced",
    "totalSeats": 3,
    "eventDate": "2026-11-25T14:00:00Z"
  }' | jq -r '.data.id')
echo "Event 2 created: $EVENT_2"

echo -e "\n=== Registering Users ==="

# Register users for Event 1
for name in "Alice" "Bob" "Charlie"; do
  REG_ID=$(curl -s -X POST $BASE_URL/registrations \
    -H "Content-Type: application/json" \
    -d "{\"eventId\": \"$EVENT_1\", \"userName\": \"$name\"}" | jq -r '.data.id')
  echo "$name registered for Event 1: $REG_ID"
done

# Register users for Event 2
for name in "Diana" "Eve"; do
  REG_ID=$(curl -s -X POST $BASE_URL/registrations \
    -H "Content-Type: application/json" \
    -d "{\"eventId\": \"$EVENT_2\", \"userName\": \"$name\"}" | jq -r '.data.id')
  echo "$name registered for Event 2: $REG_ID"
done

echo -e "\n=== Viewing Events with Seat Info ==="

curl -s "$BASE_URL/events" | jq '.data[] | {name, totalSeats, availableSeats, activeRegistrations}'

echo -e "\n=== Viewing Registrations by Event ==="

curl -s "$BASE_URL/registrations?eventId=$EVENT_1" | jq ".data | length" | xargs echo "Event 1 registrations:"
curl -s "$BASE_URL/registrations?eventId=$EVENT_2" | jq ".data | length" | xargs echo "Event 2 registrations:"

echo -e "\n=== Done ==="
```

---

## 5. Error Scenarios

### 5.1 Invalid JSON

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

### 5.2 Endpoint Not Found

```bash
curl http://localhost:3000/invalid-endpoint
```

Response (404):
```json
{
  "success": false,
  "error": "Endpoint not found",
  "path": "/invalid-endpoint"
}
```

### 5.3 Malformed Date Format

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Event",
    "totalSeats": 10,
    "eventDate": "12/31/2026"
  }'
```

Response (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Event date must be a valid date string"]
}
```

---

## 6. Performance Testing

Test concurrent registrations with race condition prevention:

```bash
# Shell script for concurrent requests
EVENT_ID="550e8400-e29b-41d4-a716-446655440000"

for i in {1..5}; do
  curl -X POST http://localhost:3000/registrations \
    -H "Content-Type: application/json" \
    -d "{\"eventId\": \"$EVENT_ID\", \"userName\": \"User $i\"}" &
done

wait
```

---

## 7. Useful curl Flags

```bash
# Pretty print JSON
curl ... | jq .

# Save to variable
RESULT=$(curl -s ... | jq -r '.data.id')

# Show headers
curl -i http://localhost:3000/events

# Include request headers
curl -v http://localhost:3000/events

# Custom port
curl http://localhost:3001/events

# Timeout (5 seconds)
curl --max-time 5 http://localhost:3000/events
```

---

## Quick Reference

| Scenario | Endpoint | Method | Status |
|----------|----------|--------|--------|
| Create event | `/events` | POST | 201 |
| List events | `/events` | GET | 200 |
| Get event | `/events/:id` | GET | 200 |
| Register user | `/registrations` | POST | 201 |
| List registrations | `/registrations` | GET | 200 |
| Get registration | `/registrations/:id` | GET | 200 |
| Cancel registration | `/registrations/:id/cancel` | PATCH | 200 |
| Event not found | `/events/:id` | GET | 404 |
| Invalid input | `/events` | POST | 400 |
| Event full | `/registrations` | POST | 409 |
| Duplicate registration | `/registrations` | POST | 409 |

---

Happy testing! 🧪
