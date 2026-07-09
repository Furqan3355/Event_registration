const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3009; // Use unique port for testing
const BASE_URL = `http://localhost:${PORT}`;
const DB_PATH = path.join(__dirname, '../data/db.json');
const BACKUP_PATH = path.join(__dirname, '../data/db.backup.json');

// Helper to wait
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Setup clean DB
function setupTestDb() {
    if (fs.existsSync(DB_PATH)) {
        fs.renameSync(DB_PATH, BACKUP_PATH);
    } else {
        // Ensure parent dir exists
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    fs.writeFileSync(DB_PATH, JSON.stringify({ events: [], registrations: [] }, null, 2), 'utf-8');
}

// Restore DB
function restoreDb() {
    if (fs.existsSync(BACKUP_PATH)) {
        if (fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
        }
        fs.renameSync(BACKUP_PATH, DB_PATH);
    }
}

// Assert helper
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`  ✅ Passed: ${message}`);
}

async function runTests() {
    console.log('🤖 Starting Integration Tests...');
    setupTestDb();

    // Start the server
    console.log(`Starting server on port ${PORT}...`);
    const server = spawn('node', [path.join(__dirname, 'server.js')], {
        env: { ...process.env, PORT },
    });

    server.stdout.on('data', (data) => {
        // console.log(`[Server]: ${data}`);
    });

    server.stderr.on('data', (data) => {
        console.error(`[Server Error]: ${data}`);
    });

    // Wait for server to boot up
    await sleep(1500);

    try {
        // 1. Test Health endpoint
        console.log('\n--- 1. Testing Health Endpoint ---');
        const healthRes = await fetch(`${BASE_URL}/health`);
        assert(healthRes.status === 200, 'Health endpoint status is 200');
        const healthJson = await healthRes.json();
        assert(healthJson.status === 'ok', 'Health status is ok');

        // 2. Test Event Creation
        console.log('\n--- 2. Testing Event Creation ---');
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year in future
        const eventDateStr = futureDate.toISOString();

        const createRes = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: '  Tech Summit 2026  ', // test trimming check
                totalSeats: 3,
                eventDate: eventDateStr,
            }),
        });
        assert(createRes.status === 201, 'Create event returns 201');
        const createJson = await createRes.json();
        assert(createJson.success === true, 'Response indicates success');
        assert(createJson.data.name === 'Tech Summit 2026', 'Event name is trimmed in stored data');
        assert(createJson.data.totalSeats === 3, 'Total seats matches');
        assert(createJson.data.id !== undefined, 'Event ID generated');
        const eventId = createJson.data.id;

        // 3. Test Duplicate Event Name rejection
        console.log('\n--- 3. Testing Duplicate Event Rejection ---');
        const dupRes = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Tech Summit 2026', // exact duplicate
                totalSeats: 5,
                eventDate: eventDateStr,
            }),
        });
        assert(dupRes.status === 400, 'Duplicate exact name event returns 400');
        const dupJson = await dupRes.json();
        assert(dupJson.success === false, 'Duplicate is blocked');
        assert(dupJson.error === 'Validation failed', 'Error title matches');
        assert(dupJson.details.includes('Event name must be unique'), 'Error details include uniqueness message');

        // Test duplicate with spaces and different casing
        const dupSpaceRes = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: '  tech summit 2026  ', // with whitespace and lowercase
                totalSeats: 5,
                eventDate: eventDateStr,
            }),
        });
        assert(dupSpaceRes.status === 400, 'Duplicate event with case/space variations returns 400');

        // 4. Test Event Creation Validations (invalid seats / past date)
        console.log('\n--- 4. Testing Event Creation Validations ---');
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1); // 1 year in past

        const valRes = await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Past Event',
                totalSeats: -1,
                eventDate: pastDate.toISOString(),
            }),
        });
        assert(valRes.status === 400, 'Invalid fields return 400');
        const valJson = await valRes.json();
        assert(valJson.success === false, 'Validation failed indicator');
        assert(valJson.details.length >= 2, 'At least 2 error details returned');

        // 5. Test Register User
        console.log('\n--- 5. Testing User Registration ---');
        const reg1Res = await fetch(`${BASE_URL}/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: eventId,
                userName: '  Ali Khan  ', // contains whitespace to test trimming/duplication check
            }),
        });
        assert(reg1Res.status === 201, 'First registration returns 201');
        const reg1Json = await reg1Res.json();
        assert(reg1Json.success === true, 'Registration reports success');
        assert(reg1Json.data.userName === 'Ali Khan', 'User name is trimmed');
        assert(reg1Json.data.status === 'active', 'Registration status is active');
        const regId1 = reg1Json.data.id;

        // 6. Test Duplicate Registration Prevention
        console.log('\n--- 6. Testing Duplicate Registration Prevention ---');
        // Try registering with spaces and same casing
        const regDupRes = await fetch(`${BASE_URL}/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: eventId,
                userName: 'Ali Khan',
            }),
        });
        assert(regDupRes.status === 409, 'Duplicate user registration returns 409 Conflict');
        const regDupJson = await regDupRes.json();
        assert(regDupJson.success === false, 'Blocked duplicate registration success is false');
        assert(regDupJson.error === 'User is already registered for this event', 'Expected error message');

        // Try registering with whitespace padding
        const regDupRes2 = await fetch(`${BASE_URL}/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId: eventId,
                userName: '  Ali Khan  ',
            }),
        });
        assert(regDupRes2.status === 409, 'Duplicate user registration with whitespace padding returns 409 Conflict');

        // 7. Test Overbooking/Seat capacity exhaustion
        console.log('\n--- 7. Testing Overbooking ---');
        // Register remaining 2 users (total seats = 3)
        const reg2Res = await fetch(`${BASE_URL}/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, userName: 'John Doe' }),
        });
        assert(reg2Res.status === 201, 'Second registration succeeds (201)');

        const reg3Res = await fetch(`${BASE_URL}/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, userName: 'Jane Smith' }),
        });
        assert(reg3Res.status === 201, 'Third registration succeeds (201)');

        // View event details - should have 0 available seats
        const eventRes = await fetch(`${BASE_URL}/events/${eventId}`);
        const eventJson = await eventRes.json();
        assert(eventJson.data.availableSeats === 0, 'Available seats is 0');
        assert(eventJson.data.activeRegistrations === 3, 'Active registrations count is 3');

        // Register 4th user (should fail)
        const reg4Res = await fetch(`${BASE_URL}/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, userName: 'Sarah Jenkins' }),
        });
        assert(reg4Res.status === 409, '4th registration fails with 409 because event is full');
        const reg4Json = await reg4Res.json();
        assert(reg4Json.error.toLowerCase().includes('full') || reg4Json.error.toLowerCase().includes('no seats'), 'Error mentions full event');

        // 8. Test Cancellation and Seat Release
        console.log('\n--- 8. Testing Cancellation ---');
        const cancelRes = await fetch(`${BASE_URL}/registrations/${regId1}/cancel`, {
            method: 'PATCH',
        });
        assert(cancelRes.status === 200, 'Cancellation returns 200');
        const cancelJson = await cancelRes.json();
        assert(cancelJson.success === true, 'Cancellation success is true');
        assert(cancelJson.data.status === 'cancelled', 'Status is cancelled');
        assert(cancelJson.data.cancelledAt !== null, 'cancelledAt timestamp is populated');

        // Check seat availability again - should have 1 available seat now
        const eventResAfterCancel = await fetch(`${BASE_URL}/events/${eventId}`);
        const eventJsonAfterCancel = await eventResAfterCancel.json();
        assert(eventJsonAfterCancel.data.availableSeats === 1, 'Available seats incremented to 1 after cancellation');
        assert(eventJsonAfterCancel.data.activeRegistrations === 2, 'Active registrations decremented to 2');

        // Try cancelling the same registration again (should fail)
        const cancelDupRes = await fetch(`${BASE_URL}/registrations/${regId1}/cancel`, {
            method: 'PATCH',
        });
        assert(cancelDupRes.status === 409, 'Cancelling already cancelled registration returns 409');
        const cancelDupJson = await cancelDupRes.json();
        assert(cancelDupJson.error === 'Registration is already cancelled', 'Expected error message');

        // 9. Test Query Parameters & Sorting
        console.log('\n--- 9. Testing Query Filtering and Sorting ---');
        // Create an event in the further future
        const furtherFutureDate = new Date();
        furtherFutureDate.setFullYear(furtherFutureDate.getFullYear() + 2);
        await fetch(`${BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Future Expo 2028',
                totalSeats: 10,
                eventDate: furtherFutureDate.toISOString(),
            }),
        });

        // Get all events with sort=date&upcoming=true
        const queryRes = await fetch(`${BASE_URL}/events?sort=date&upcoming=true`);
        assert(queryRes.status === 200, 'Query events endpoint status is 200');
        const queryJson = await queryRes.json();
        assert(queryJson.data.length >= 2, 'Returned multiple events');

        // Validate order (ascending)
        const date1 = new Date(queryJson.data[0].eventDate);
        const date2 = new Date(queryJson.data[1].eventDate);
        assert(date1 < date2, 'Events are correctly sorted in ascending order of date');

        console.log('\n🌟 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟');
    } catch (err) {
        console.error('\n❌ Test execution failed!');
        console.error(err);
        process.exitCode = 1;
    } finally {
        console.log('Shutting down server...');
        server.kill();
        restoreDb();
        console.log('Test DB restored to backup state. Done.');
    }
}

runTests();
