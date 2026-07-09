# 🚀 START HERE - Event Registration System API

Welcome! This is a complete, production-ready Event Registration System API built with Node.js and Express.js.

## ⚡ Quick Start (2 Minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Start the server
pnpm start

# 3. Test it (in another terminal)
curl http://localhost:3000/health
```

**That's it!** Your API is now running on `http://localhost:3000`

---

## 📚 Documentation Guide

Choose your learning style:

### 🏃 In a Hurry? (5 minutes)
→ Read **[QUICKSTART.md](QUICKSTART.md)**
- Minimal commands to get started
- Basic API usage examples
- Troubleshooting tips

### 🚦 Getting Started? (15 minutes)
→ Read **[README.md](README.md)**
- Full setup instructions
- Feature overview
- API endpoint reference
- Common workflows

### 🧪 Want to Test? (30 minutes)
→ Read **[API-EXAMPLES.md](API-EXAMPLES.md)**
- Complete curl examples for every endpoint
- Success and error response examples
- Real-world test scenarios
- Complete workflow scripts

### 🔍 Deep Dive? (1 hour)
→ Read **[overview.md](overview.md)**
- Complete technical documentation
- Database schema details
- Validation rules explained
- Race condition handling strategy
- Seat counting logic
- Future improvement ideas

### 📋 Project Summary
→ Read **[PROJECT_SUMMARY.txt](PROJECT_SUMMARY.txt)**
- Project checklist
- File descriptions
- Feature overview
- Getting started instructions

---

## 🎯 What You Can Do

### Create Events
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Awesome Event",
    "totalSeats": 50,
    "eventDate": "2026-12-31T18:00:00Z"
  }'
```

### Register Users
```bash
curl -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "<event-id-from-above>",
    "userName": "John Doe"
  }'
```

### View Events with Seat Info
```bash
curl http://localhost:3000/events
```

### Cancel Registrations
```bash
curl -X PATCH http://localhost:3000/registrations/<registration-id>/cancel
```

---

## 📁 Project Structure

```
event-registration-system/
├── src/                          # Application code
│   ├── server.js                # Express server entry point
│   ├── routes/                  # API endpoints
│   │   ├── events.js            # Event endpoints (POST, GET)
│   │   └── registrations.js     # Registration endpoints (POST, GET, PATCH)
│   ├── utils/                   # Helper functions
│   │   ├── fileStorage.js       # Database access layer
│   │   ├── validators.js        # Input validation
│   │   └── seatCalculator.js    # Seat availability calculations
│   └── middleware/              # Express middleware
│       └── errorHandler.js      # Global error handling
├── data/
│   └── db.json                  # JSON database (auto-created)
├── package.json                 # Dependencies
├── START_HERE.md               # This file
├── QUICKSTART.md               # Quick start guide
├── README.md                   # Setup & usage guide
├── API-EXAMPLES.md            # Complete API examples
├── overview.md                # Detailed documentation
└── PROJECT_SUMMARY.txt        # Project completion summary
```

---

## ✨ Key Features

✅ **Event Management**
- Create events with seats and dates
- List events with filtering and sorting
- Real-time seat availability tracking

✅ **User Registration**
- Register users for events
- Prevent duplicate registrations
- Prevent overbooking automatically
- Cancel registrations (seats freed immediately)

✅ **Data Integrity**
- Input validation for all fields
- Race condition prevention
- Duplicate request handling
- Clear error messages

✅ **Persistence**
- JSON file-based database
- Data survives server restarts
- No external database needed

---

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Start production server
pnpm start

# Start with auto-reload (for development)
pnpm dev

# Check syntax errors
node -c src/server.js

# View database
cat data/db.json | jq .
```

---

## 🧪 Testing

### Quick Test
```bash
# In terminal 1: Start server
pnpm start

# In terminal 2: Run tests
source <(cat <<'EOF'
EVENT_ID=$(curl -s -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Event","totalSeats":2,"eventDate":"2026-12-31T00:00:00Z"}' | jq -r '.data.id')

echo "Created event: $EVENT_ID"

curl -s -X POST http://localhost:3000/registrations \
  -H "Content-Type: application/json" \
  -d "{\"eventId\":\"$EVENT_ID\",\"userName\":\"User1\"}"

echo ""

curl -s "http://localhost:3000/events/$EVENT_ID" | jq '.data | {totalSeats, availableSeats, activeRegistrations}'
EOF
)
```

### Full Testing
See **[API-EXAMPLES.md](API-EXAMPLES.md)** for 50+ test examples

---

## 🚫 Common Issues

**Port 3000 already in use?**
```bash
PORT=3001 pnpm start
```

**Dependencies not installing?**
```bash
pnpm install --force
```

**Database file corrupted?**
```bash
rm data/db.json
# Restart server - new file auto-created
```

**Invalid date error?**
- Use ISO 8601 format: `2026-12-31T18:00:00Z`
- Date must be in the future

---

## 📖 API Endpoints Reference

### Events
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/events` | Create event |
| GET | `/events` | List events |
| GET | `/events?sort=date` | Sort by date |
| GET | `/events?upcoming=true` | Upcoming only |
| GET | `/events/:id` | Get event details |

### Registrations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/registrations` | Register user |
| GET | `/registrations` | List registrations |
| GET | `/registrations?eventId=...` | Filter by event |
| GET | `/registrations/:id` | Get registration |
| PATCH | `/registrations/:id/cancel` | Cancel registration |

### Utility
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Server health check |

---

## 🎓 Learning Path

1. **Start**: Run `pnpm install && pnpm start`
2. **Quick Test**: Try health endpoint: `curl http://localhost:3000/health`
3. **Create Event**: Use examples from **QUICKSTART.md**
4. **Register User**: Use examples from **QUICKSTART.md**
5. **Explore**: Try other endpoints from **API-EXAMPLES.md**
6. **Understand**: Read code in `src/` folder
7. **Customize**: Modify for your needs
8. **Deploy**: Follow deployment guide (future enhancement)

---

## 🔒 Validation Rules

### Event Creation
- ✅ Unique event name
- ✅ Seats > 0
- ✅ Date in future

### User Registration
- ✅ Event exists
- ✅ Event has available seats
- ✅ User not already registered
- ✅ No duplicate registrations

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 14+ |
| Framework | Express.js 4.18+ |
| Database | JSON file |
| Language | JavaScript (CommonJS) |
| Package Manager | pnpm (npm, yarn compatible) |

---

## 📞 Support

### Have Questions?
1. Check **QUICKSTART.md** for common issues
2. Review **API-EXAMPLES.md** for usage examples
3. Read **overview.md** for detailed documentation
4. Check code comments in `src/` folder

### Found a Bug?
- Check error message in response
- Review validation rules
- Check **API-EXAMPLES.md** for error scenarios

---

## 🎯 Next Steps

### To Start Now
```bash
pnpm install && pnpm start
```

### To Learn API
Read **[API-EXAMPLES.md](API-EXAMPLES.md)** with curl examples

### To Explore Code
Start with `src/server.js` and follow the routes

### To Customize
Edit files in `src/routes/` and `src/utils/`

### To Deploy
See "Deployment" section in **overview.md**

---

## 📝 Project Status

✅ **COMPLETE & PRODUCTION-READY**

- All core features implemented
- Full validation and error handling
- Race condition prevention
- Comprehensive documentation
- Ready to use immediately

---

## 🎉 You're All Set!

Your Event Registration System API is ready to go!

### 3-Step Quick Start
1. `pnpm install`
2. `pnpm start`
3. Start making API requests!

### Documentation Map
- **5 min**: [QUICKSTART.md](QUICKSTART.md)
- **15 min**: [README.md](README.md)
- **30 min**: [API-EXAMPLES.md](API-EXAMPLES.md)
- **1 hour**: [overview.md](overview.md)

---

**Happy coding! 🚀**

For more help, check the documentation files above or examine the code in the `src/` folder.
