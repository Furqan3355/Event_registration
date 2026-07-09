const storage = require('./fileStorage');

/**
 * Validate event creation input
 */
function validateEventInput(data) {
  const errors = [];

  // Check if name is provided
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Event name is required and must be a non-empty string');
  }

  // Check if name already exists
  if (data.name && typeof data.name === 'string') {
    const existingEvent = storage.getEvents().find(
      event => event.name.toLowerCase() === data.name.toLowerCase()
    );
    if (existingEvent) {
      errors.push('Event name must be unique');
    }
  }

  // Check if totalSeats is valid
  if (!data.totalSeats || typeof data.totalSeats !== 'number' || data.totalSeats <= 0) {
    errors.push('Total seats must be a number greater than 0');
  }

  // Check if eventDate is valid
  if (!data.eventDate || typeof data.eventDate !== 'string') {
    errors.push('Event date is required and must be a string');
  } else {
    const eventDate = new Date(data.eventDate);
    if (isNaN(eventDate.getTime())) {
      errors.push('Event date must be a valid date string');
    } else if (eventDate <= new Date()) {
      errors.push('Event date must be in the future');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate registration input
 */
function validateRegistrationInput(data) {
  const errors = [];

  // Check if userName is provided
  if (!data.userName || typeof data.userName !== 'string' || data.userName.trim() === '') {
    errors.push('User name is required and must be a non-empty string');
  }

  // Check if eventId is provided
  if (!data.eventId || typeof data.eventId !== 'string' || data.eventId.trim() === '') {
    errors.push('Event ID is required and must be a non-empty string');
  }

  // Check if event exists
  if (data.eventId) {
    const event = storage.getEventById(data.eventId);
    if (!event) {
      errors.push('Event not found');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate that available seats are available
 */
function validateSeatAvailability(eventId) {
  const event = storage.getEventById(eventId);
  if (!event) {
    return { available: false, error: 'Event not found' };
  }

  const activeRegistrations = storage.getActiveRegistrationsForEvent(eventId);
  const availableSeats = event.totalSeats - activeRegistrations.length;

  if (availableSeats <= 0) {
    return { available: false, error: 'Event is full' };
  }

  return { available: true };
}

/**
 * Validate user is not already registered
 */
function validateNotAlreadyRegistered(eventId, userName) {
  const existingRegistration = storage.getUserEventRegistration(eventId, userName);
  if (existingRegistration) {
    return { valid: false, error: 'User is already registered for this event' };
  }
  return { valid: true };
}

module.exports = {
  validateEventInput,
  validateRegistrationInput,
  validateSeatAvailability,
  validateNotAlreadyRegistered,
};
