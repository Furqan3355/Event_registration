const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/db.json');

/**
 * Read the entire database from the JSON file
 */
function readDatabase() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error.message);
    return { events: [], registrations: [] };
  }
}

/**
 * Write the entire database to the JSON file
 */
function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error.message);
    return false;
  }
}

/**
 * Get all events
 */
function getEvents() {
  const db = readDatabase();
  return db.events || [];
}

/**
 * Get a specific event by ID
 */
function getEventById(eventId) {
  const db = readDatabase();
  return db.events.find(event => event.id === eventId);
}

/**
 * Add a new event
 */
function addEvent(event) {
  const db = readDatabase();
  if (!db.events) db.events = [];
  db.events.push(event);
  writeDatabase(db);
  return event;
}

/**
 * Get all registrations
 */
function getRegistrations() {
  const db = readDatabase();
  return db.registrations || [];
}

/**
 * Get a specific registration by ID
 */
function getRegistrationById(registrationId) {
  const db = readDatabase();
  return db.registrations.find(reg => reg.id === registrationId);
}

/**
 * Add a new registration
 */
function addRegistration(registration) {
  const db = readDatabase();
  if (!db.registrations) db.registrations = [];
  db.registrations.push(registration);
  writeDatabase(db);
  return registration;
}

/**
 * Update a registration
 */
function updateRegistration(registrationId, updates) {
  const db = readDatabase();
  const registration = db.registrations.find(reg => reg.id === registrationId);
  if (!registration) return null;
  
  const updatedRegistration = { ...registration, ...updates };
  db.registrations = db.registrations.map(reg =>
    reg.id === registrationId ? updatedRegistration : reg
  );
  writeDatabase(db);
  return updatedRegistration;
}

/**
 * Check if a user is already registered for an event
 */
function getUserEventRegistration(eventId, userName) {
  const db = readDatabase();
  return db.registrations.find(
    reg => reg.eventId === eventId && 
            reg.userName === userName && 
            reg.status === 'active'
  );
}

/**
 * Get active registrations for an event
 */
function getActiveRegistrationsForEvent(eventId) {
  const db = readDatabase();
  return db.registrations.filter(
    reg => reg.eventId === eventId && reg.status === 'active'
  );
}

module.exports = {
  readDatabase,
  writeDatabase,
  getEvents,
  getEventById,
  addEvent,
  getRegistrations,
  getRegistrationById,
  addRegistration,
  updateRegistration,
  getUserEventRegistration,
  getActiveRegistrationsForEvent,
};
