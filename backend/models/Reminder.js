const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['watering', 'fertilizing', 'repotting', 'pruning', 'checkup', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'bi-weekly', 'monthly', 'custom'],
    default: 'once'
  },
  customFrequency: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months']
    }
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    }
  },
  metadata: {
    originalScheduleDate: Date,
    rescheduledCount: {
      type: Number,
      default: 0
    },
    lastRescheduledAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reminderSchema.index({ user: 1, scheduledDate: 1 });
reminderSchema.index({ plant: 1 });
reminderSchema.index({ type: 1 });
reminderSchema.index({ isActive: 1, isCompleted: 1 });
reminderSchema.index({ scheduledDate: 1, isActive: 1 });

// Virtual for days until reminder
reminderSchema.virtual('daysUntil').get(function() {
  const now = new Date();
  const scheduled = new Date(this.scheduledDate);
  const diffTime = scheduled.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
reminderSchema.virtual('isOverdue').get(function() {
  if (this.isCompleted) return false;
  return new Date(this.scheduledDate) < new Date();
});

// Method to mark as completed
reminderSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to reschedule reminder
reminderSchema.methods.reschedule = function(newDate) {
  if (!this.metadata.originalScheduleDate) {
    this.metadata.originalScheduleDate = this.scheduledDate;
  }
  this.metadata.rescheduledCount += 1;
  this.metadata.lastRescheduledAt = new Date();
  this.scheduledDate = newDate;
  this.notifications.email.sent = false;
  this.notifications.push.sent = false;
  return this.save();
};

// Static method to get upcoming reminders
reminderSchema.statics.getUpcoming = function(userId, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    user: userId,
    scheduledDate: {
      $gte: startDate,
      $lte: endDate
    },
    isActive: true,
    isCompleted: false
  }).populate('plant', 'name species image.url').sort({ scheduledDate: 1 });
};

// Static method to get overdue reminders
reminderSchema.statics.getOverdue = function(userId) {
  return this.find({
    user: userId,
    scheduledDate: { $lt: new Date() },
    isActive: true,
    isCompleted: false
  }).populate('plant', 'name species image.url').sort({ scheduledDate: 1 });
};

module.exports = mongoose.model('Reminder', reminderSchema);
