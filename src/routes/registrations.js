const express = require('express');
const { v4: uuidv4 } = require('uuid');
const storage = require('../utils/fileStorage');
const validators = require('../utils/validators');
const seatCalculator = require('../utils/seatCalculator');

const router = express.Router();

/**
 * POST /registrations
 * Register a user for an event
 * Handles race condition prevention through sequential check-then-register
 */
router.post('/', (req, res) => {
  try {
    const { eventId, userName } = req.body;
    const trimmedEventId = typeof eventId === 'string' ? eventId.trim() : eventId;
    const trimmedUserName = typeof userName === 'string' ? userName.trim() : userName;

    // Validate input
    const validation = validators.validateRegistrationInput({
      eventId: trimmedEventId,
      userName: trimmedUserName,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Check if seats are available
    const seatCheck = validators.validateSeatAvailability(trimmedEventId);
    if (!seatCheck.available) {
      return res.status(409).json({
        success: false,
        error: seatCheck.error,
      });
    }

    // Check if user is already registered (prevent duplicate registrations)
    const duplicateCheck = validators.validateNotAlreadyRegistered(trimmedEventId, trimmedUserName);
    if (!duplicateCheck.valid) {
      return res.status(409).json({
        success: false,
        error: duplicateCheck.error,
      });
    }

    // Final seat check before registration (prevent race condition edge case)
    // This double-check ensures no overbooking even with concurrent requests
    const event = storage.getEventById(trimmedEventId);
    const activeRegistrations = storage.getActiveRegistrationsForEvent(trimmedEventId);

    if (activeRegistrations.length >= event.totalSeats) {
      return res.status(409).json({
        success: false,
        error: 'Event is full - no seats available',
      });
    }

    // Create registration
    const newRegistration = {
      id: uuidv4(),
      eventId: trimmedEventId,
      userName: trimmedUserName,
      status: 'active',
      registeredAt: new Date().toISOString(),
      cancelledAt: null,
    };

    const registration = storage.addRegistration(newRegistration);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: registration,
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
      message: error.message,
    });
  }
});

/**
 * GET /registrations
 * Get all registrations (optionally filtered by eventId or userName)
 * Query params:
 * - eventId (filter by event ID)
 * - userName (filter by user name)
 * - status=active (filter by status)
 */
router.get('/', (req, res) => {
  try {
    const { eventId, userName, status } = req.query;
    let registrations = storage.getRegistrations();

    // Filter by eventId if provided
    if (eventId) {
      registrations = registrations.filter(reg => reg.eventId === eventId);
    }

    // Filter by userName if provided
    if (userName) {
      registrations = registrations.filter(
        reg => reg.userName.toLowerCase() === userName.toLowerCase()
      );
    }

    // Filter by status if provided
    if (status) {
      registrations = registrations.filter(reg => reg.status === status);
    }

    res.status(200).json({
      success: true,
      data: registrations,
      count: registrations.length,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registrations',
      message: error.message,
    });
  }
});

/**
 * GET /registrations/:registrationId
 * Get a specific registration by ID
 */
router.get('/:registrationId', (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = storage.getRegistrationById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found',
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error('Error fetching registration:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registration',
      message: error.message,
    });
  }
});

/**
 * PATCH /registrations/:registrationId/cancel
 * Cancel a user registration
 */
router.patch('/:registrationId/cancel', (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = storage.getRegistrationById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found',
      });
    }

    // Check if already cancelled
    if (registration.status === 'cancelled') {
      return res.status(409).json({
        success: false,
        error: 'Registration is already cancelled',
      });
    }

    // Update registration status to cancelled
    const updatedRegistration = storage.updateRegistration(registrationId, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: updatedRegistration,
    });
  } catch (error) {
    console.error('Error cancelling registration:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel registration',
      message: error.message,
    });
  }
});

module.exports = router;
