const storage = require('./fileStorage');

/**
 * Calculate the number of available seats for an event
 */
function getAvailableSeats(eventId) {
  const event = storage.getEventById(eventId);
  if (!event) {
    return null;
  }

  const activeRegistrations = storage.getActiveRegistrationsForEvent(eventId);
  const availableSeats = event.totalSeats - activeRegistrations.length;

  return Math.max(0, availableSeats);
}

/**
 * Calculate the number of active registrations for an event
 */
function getActiveRegistrationCount(eventId) {
  const activeRegistrations = storage.getActiveRegistrationsForEvent(eventId);
  return activeRegistrations.length;
}

/**
 * Get event with calculated seat information
 */
function getEventWithSeatInfo(event) {
  const activeCount = getActiveRegistrationCount(event.id);
  const availableSeats = getAvailableSeats(event.id);

  return {
    ...event,
    availableSeats,
    activeRegistrations: activeCount,
  };
}

/**
 * Get all events with calculated seat information
 */
function getAllEventsWithSeatInfo() {
  const events = storage.getEvents();
  return events.map(event => getEventWithSeatInfo(event));
}

module.exports = {
  getAvailableSeats,
  getActiveRegistrationCount,
  getEventWithSeatInfo,
  getAllEventsWithSeatInfo,
};
