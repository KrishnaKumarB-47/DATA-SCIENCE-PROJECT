const express = require('express');
const { body, validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
const Plant = require('../models/Plant');
const { requireAuth, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const reminderValidation = [
  body('plant')
    .isMongoId()
    .withMessage('Valid plant ID is required'),
  body('type')
    .isIn(['watering', 'fertilizing', 'repotting', 'pruning', 'checkup', 'custom'])
    .withMessage('Invalid reminder type'),
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and cannot exceed 100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('frequency')
    .optional()
    .isIn(['once', 'daily', 'weekly', 'bi-weekly', 'monthly', 'custom'])
    .withMessage('Invalid frequency'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
];

// @route   GET /api/reminders
// @desc    Get all reminders for authenticated user
// @access  Private
router.get('/', requireAuth, async (req, res) => {
  try {
    const { 
      type, 
      status = 'active', 
      upcoming = false, 
      overdue = false,
      days = 7 
    } = req.query;

    let filter = { user: req.session.userId };

    // Filter by type
    if (type) {
      filter.type = type;
    }

    // Filter by status
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'completed') {
      filter.isCompleted = true;
    } else if (status === 'all') {
      // No additional filter
    }

    // Filter by upcoming/overdue
    if (upcoming === 'true') {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(days));
      filter.scheduledDate = { $gte: new Date(), $lte: endDate };
      filter.isCompleted = false;
    }

    if (overdue === 'true') {
      filter.scheduledDate = { $lt: new Date() };
      filter.isCompleted = false;
    }

    const reminders = await Reminder.find(filter)
      .populate('plant', 'name species image.url')
      .sort({ scheduledDate: 1 });

    // Add virtual fields
    const remindersWithVirtuals = reminders.map(reminder => ({
      ...reminder.toObject(),
      daysUntil: reminder.daysUntil,
      isOverdue: reminder.isOverdue
    }));

    res.json({ reminders: remindersWithVirtuals });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/reminders/:id
// @desc    Get single reminder by ID
// @access  Private
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.session.userId
    }).populate('plant', 'name species image.url');

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({
      reminder: {
        ...reminder.toObject(),
        daysUntil: reminder.daysUntil,
        isOverdue: reminder.isOverdue
      }
    });
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/reminders
// @desc    Create a new reminder
// @access  Private
router.post('/', requireAuth, reminderValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { plant, ...reminderData } = req.body;

    // Verify plant ownership
    const plantExists = await Plant.findOne({
      _id: plant,
      owner: req.session.userId
    });

    if (!plantExists) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    const reminder = new Reminder({
      ...reminderData,
      plant,
      user: req.session.userId
    });

    await reminder.save();
    await reminder.populate('plant', 'name species image.url');

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder: {
        ...reminder.toObject(),
        daysUntil: reminder.daysUntil,
        isOverdue: reminder.isOverdue
      }
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/reminders/:id
// @desc    Update a reminder
// @access  Private
router.put('/:id', requireAuth, reminderValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.session.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // If plant is being changed, verify ownership
    if (req.body.plant && req.body.plant !== reminder.plant.toString()) {
      const plantExists = await Plant.findOne({
        _id: req.body.plant,
        owner: req.session.userId
      });

      if (!plantExists) {
        return res.status(404).json({ message: 'Plant not found' });
      }
    }

    Object.assign(reminder, req.body);
    await reminder.save();
    await reminder.populate('plant', 'name species image.url');

    res.json({
      message: 'Reminder updated successfully',
      reminder: {
        ...reminder.toObject(),
        daysUntil: reminder.daysUntil,
        isOverdue: reminder.isOverdue
      }
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder
// @access  Private
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.session.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/reminders/:id/complete
// @desc    Mark reminder as completed
// @access  Private
router.post('/:id/complete', requireAuth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.session.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    await reminder.markCompleted();
    await reminder.populate('plant', 'name species image.url');

    res.json({
      message: 'Reminder marked as completed',
      reminder: {
        ...reminder.toObject(),
        daysUntil: reminder.daysUntil,
        isOverdue: reminder.isOverdue
      }
    });
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/reminders/:id/reschedule
// @desc    Reschedule a reminder
// @access  Private
router.post('/:id/reschedule', requireAuth, [
  body('newDate')
    .isISO8601()
    .withMessage('Valid new date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.session.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    await reminder.reschedule(new Date(req.body.newDate));
    await reminder.populate('plant', 'name species image.url');

    res.json({
      message: 'Reminder rescheduled successfully',
      reminder: {
        ...reminder.toObject(),
        daysUntil: reminder.daysUntil,
        isOverdue: reminder.isOverdue
      }
    });
  } catch (error) {
    console.error('Reschedule reminder error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/reminders/dashboard/summary
// @desc    Get reminder summary for dashboard
// @access  Private
router.get('/dashboard/summary', requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get overdue reminders
    const overdue = await Reminder.countDocuments({
      user: req.session.userId,
      scheduledDate: { $lt: today },
      isActive: true,
      isCompleted: false
    });

    // Get today's reminders
    const todayReminders = await Reminder.countDocuments({
      user: req.session.userId,
      scheduledDate: { $gte: today, $lt: tomorrow },
      isActive: true,
      isCompleted: false
    });

    // Get this week's reminders
    const weekReminders = await Reminder.countDocuments({
      user: req.session.userId,
      scheduledDate: { $gte: today, $lt: weekFromNow },
      isActive: true,
      isCompleted: false
    });

    // Get recent completed reminders
    const recentCompleted = await Reminder.countDocuments({
      user: req.session.userId,
      isCompleted: true,
      completedAt: { $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      summary: {
        overdue,
        today: todayReminders,
        thisWeek: weekReminders,
        recentCompleted,
        totalActive: overdue + todayReminders + weekReminders
      }
    });
  } catch (error) {
    console.error('Get reminder summary error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
