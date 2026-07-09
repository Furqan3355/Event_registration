const express = require('express');
const { v4: uuidv4 } = require('uuid');
const storage = require('../utils/fileStorage');
const validators = require('../utils/validators');
const seatCalculator = require('../utils/seatCalculator');

const router = express.Router();

/**
 * POST /events
 * Create a new event
 */
router.post('/', (req, res) => {
  try {
    const { name, totalSeats, eventDate } = req.body;
    const trimmedName = typeof name === 'string' ? name.trim() : name;

    // Validate input
    const validation = validators.validateEventInput({
      name: trimmedName,
      totalSeats,
      eventDate,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Create event
    const newEvent = {
      id: uuidv4(),
      name: trimmedName,
      totalSeats,
      eventDate,
      createdAt: new Date().toISOString(),
    };

    const event = storage.addEvent(newEvent);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create event',
      message: error.message,
    });
  }
});

/**
 * GET /events
 * Get all events with optional sorting and filtering
 * Query params:
 * - sort=date (sort by event date)
 * - upcoming=true (filter only upcoming events)
 */
router.get('/', (req, res) => {
  try {
    const { sort, upcoming } = req.query;
    let events = seatCalculator.getAllEventsWithSeatInfo();

    // Filter upcoming events if requested
    if (upcoming === 'true') {
      const now = new Date();
      events = events.filter(event => new Date(event.eventDate) > now);
    }

    // Sort by date if requested
    if (sort === 'date') {
      events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    }

    res.status(200).json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error.message,
    });
  }
});

/**
 * GET /events/:eventId
 * Get a specific event by ID
 */
router.get('/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    const event = storage.getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    const eventWithSeatInfo = seatCalculator.getEventWithSeatInfo(event);

    res.status(200).json({
      success: true,
      data: eventWithSeatInfo,
    });
  } catch (error) {
    console.error('Error fetching event:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
      message: error.message,
    });
  }
});

module.exports = router;
