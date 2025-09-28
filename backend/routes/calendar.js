const express = require('express');
const { query, validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
const Plant = require('../models/Plant');
const { requireAuth } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// @route   GET /api/calendar/events
// @desc    Get calendar events for a specific month
// @access  Private
router.get('/events', requireAuth, [
  query('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Valid year is required'),
  query('month')
    .isInt({ min: 0, max: 11 })
    .withMessage('Valid month is required (0-11)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { year, month } = req.query;
    const startDate = moment([year, month]).startOf('month').toDate();
    const endDate = moment([year, month]).endOf('month').toDate();

    // Get all reminders for the month
    const reminders = await Reminder.find({
      user: req.session.userId,
      scheduledDate: { $gte: startDate, $lte: endDate },
      isActive: true
    }).populate('plant', 'name species image.url');

    // Format events for calendar
    const events = reminders.map(reminder => ({
      id: reminder._id,
      title: reminder.title,
      description: reminder.description,
      date: reminder.scheduledDate,
      type: reminder.type,
      priority: reminder.priority,
      isCompleted: reminder.isCompleted,
      isOverdue: reminder.isOverdue,
      plant: reminder.plant,
      category: getEventCategory(reminder.type),
      color: getEventColor(reminder.type, reminder.priority, reminder.isOverdue)
    }));

    // Group events by date
    const eventsByDate = {};
    events.forEach(event => {
      const dateKey = moment(event.date).format('YYYY-MM-DD');
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    res.json({
      events,
      eventsByDate,
      month: parseInt(month),
      year: parseInt(year),
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/calendar/week/:weekStart
// @desc    Get calendar events for a specific week
// @access  Private
router.get('/week/:weekStart', requireAuth, async (req, res) => {
  try {
    const weekStart = moment(req.params.weekStart).startOf('week');
    const weekEnd = moment(weekStart).endOf('week');

    const reminders = await Reminder.find({
      user: req.session.userId,
      scheduledDate: { $gte: weekStart.toDate(), $lte: weekEnd.toDate() },
      isActive: true
    }).populate('plant', 'name species image.url');

    const events = reminders.map(reminder => ({
      id: reminder._id,
      title: reminder.title,
      description: reminder.description,
      date: reminder.scheduledDate,
      type: reminder.type,
      priority: reminder.priority,
      isCompleted: reminder.isCompleted,
      isOverdue: reminder.isOverdue,
      plant: reminder.plant,
      category: getEventCategory(reminder.type),
      color: getEventColor(reminder.type, reminder.priority, reminder.isOverdue)
    }));

    res.json({
      events,
      weekStart: weekStart.format('YYYY-MM-DD'),
      weekEnd: weekEnd.format('YYYY-MM-DD'),
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Get week events error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/calendar/today
// @desc    Get today's plant care tasks
// @access  Private
router.get('/today', requireAuth, async (req, res) => {
  try {
    const today = moment().startOf('day');
    const tomorrow = moment(today).add(1, 'day');

    const reminders = await Reminder.find({
      user: req.session.userId,
      scheduledDate: { $gte: today.toDate(), $lt: tomorrow.toDate() },
      isActive: true
    }).populate('plant', 'name species image.url');

    const events = reminders.map(reminder => ({
      id: reminder._id,
      title: reminder.title,
      description: reminder.description,
      date: reminder.scheduledDate,
      type: reminder.type,
      priority: reminder.priority,
      isCompleted: reminder.isCompleted,
      isOverdue: reminder.isOverdue,
      plant: reminder.plant,
      category: getEventCategory(reminder.type),
      color: getEventColor(reminder.type, reminder.priority, reminder.isOverdue)
    }));

    res.json({
      events,
      date: today.format('YYYY-MM-DD'),
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Get today events error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/calendar/upcoming
// @desc    Get upcoming plant care tasks
// @access  Private
router.get('/upcoming', requireAuth, [
  query('days')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Days must be between 1 and 30')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const days = parseInt(req.query.days) || 7;
    const startDate = moment().startOf('day');
    const endDate = moment(startDate).add(days, 'days');

    const reminders = await Reminder.find({
      user: req.session.userId,
      scheduledDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      isActive: true
    }).populate('plant', 'name species image.url').sort({ scheduledDate: 1 });

    const events = reminders.map(reminder => ({
      id: reminder._id,
      title: reminder.title,
      description: reminder.description,
      date: reminder.scheduledDate,
      type: reminder.type,
      priority: reminder.priority,
      isCompleted: reminder.isCompleted,
      isOverdue: reminder.isOverdue,
      plant: reminder.plant,
      category: getEventCategory(reminder.type),
      color: getEventColor(reminder.type, reminder.priority, reminder.isOverdue),
      daysUntil: moment(reminder.scheduledDate).diff(moment(), 'days')
    }));

    // Group by date
    const eventsByDate = {};
    events.forEach(event => {
      const dateKey = moment(event.date).format('YYYY-MM-DD');
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    res.json({
      events,
      eventsByDate,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/calendar/statistics
// @desc    Get calendar statistics
// @access  Private
router.get('/statistics', requireAuth, [
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('Period must be week, month, quarter, or year')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const period = req.query.period || 'month';
    let startDate, endDate;

    switch (period) {
      case 'week':
        startDate = moment().startOf('week');
        endDate = moment().endOf('week');
        break;
      case 'quarter':
        startDate = moment().startOf('quarter');
        endDate = moment().endOf('quarter');
        break;
      case 'year':
        startDate = moment().startOf('year');
        endDate = moment().endOf('year');
        break;
      default: // month
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
    }

    // Get statistics
    const totalReminders = await Reminder.countDocuments({
      user: req.session.userId,
      scheduledDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      isActive: true
    });

    const completedReminders = await Reminder.countDocuments({
      user: req.session.userId,
      scheduledDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      isActive: true,
      isCompleted: true
    });

    const overdueReminders = await Reminder.countDocuments({
      user: req.session.userId,
      scheduledDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      isActive: true,
      isCompleted: false,
      scheduledDate: { $lt: new Date() }
    });

    // Get reminders by type
    const remindersByType = await Reminder.aggregate([
      {
        $match: {
          user: req.session.userId,
          scheduledDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          }
        }
      }
    ]);

    const completionRate = totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0;

    res.json({
      statistics: {
        period,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        totalReminders,
        completedReminders,
        overdueReminders,
        completionRate: Math.round(completionRate * 100) / 100,
        remindersByType
      }
    });
  } catch (error) {
    console.error('Get calendar statistics error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions
function getEventCategory(type) {
  const categories = {
    'watering': 'care',
    'fertilizing': 'care',
    'repotting': 'maintenance',
    'pruning': 'maintenance',
    'checkup': 'inspection',
    'custom': 'custom'
  };
  return categories[type] || 'custom';
}

function getEventColor(type, priority, isOverdue) {
  if (isOverdue) return '#ef4444'; // red
  
  const colors = {
    'watering': '#3b82f6', // blue
    'fertilizing': '#10b981', // emerald
    'repotting': '#f59e0b', // amber
    'pruning': '#8b5cf6', // violet
    'checkup': '#06b6d4', // cyan
    'custom': '#6b7280' // gray
  };
  
  const baseColor = colors[type] || '#6b7280';
  
  // Adjust intensity based on priority
  const priorityMultipliers = {
    'low': 0.7,
    'medium': 1,
    'high': 1.2,
    'urgent': 1.4
  };
  
  return baseColor; // Simplified for now
}

module.exports = router;
