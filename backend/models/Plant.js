const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plant name is required'],
    trim: true,
    maxlength: [100, 'Plant name cannot exceed 100 characters']
  },
  species: {
    type: String,
    required: [true, 'Plant species is required'],
    trim: true,
    maxlength: [100, 'Species cannot exceed 100 characters']
  },
  scientificName: {
    type: String,
    trim: true,
    maxlength: [150, 'Scientific name cannot exceed 150 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    }
  },
  careInstructions: {
    wateringFrequency: {
      type: Number,
      required: [true, 'Watering frequency is required'],
      min: [1, 'Watering frequency must be at least 1 day'],
      max: [365, 'Watering frequency cannot exceed 365 days']
    },
    sunlightNeeds: {
      type: String,
      required: [true, 'Sunlight needs are required'],
      enum: ['low', 'medium', 'high', 'full-sun', 'partial-shade', 'full-shade'],
      default: 'medium'
    },
    soilType: {
      type: String,
      enum: ['clay', 'loamy', 'sandy', 'silt', 'peaty', 'chalky'],
      default: 'loamy'
    },
    fertilizerFrequency: {
      type: Number,
      default: 30,
      min: [1, 'Fertilizer frequency must be at least 1 day'],
      max: [365, 'Fertilizer frequency cannot exceed 365 days']
    },
    repottingFrequency: {
      type: Number,
      default: 365,
      min: [30, 'Repotting frequency must be at least 30 days'],
      max: [1825, 'Repotting frequency cannot exceed 5 years']
    },
    temperature: {
      min: Number,
      max: Number
    },
    humidity: {
      min: Number,
      max: Number
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  purchaseDate: {
    type: Date
  },
  lastWatered: {
    type: Date,
    default: Date.now
  },
  lastFertilized: {
    type: Date
  },
  lastRepotted: {
    type: Date
  },
  status: {
    type: String,
    enum: ['healthy', 'needs-attention', 'sick', 'dormant'],
    default: 'healthy'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
plantSchema.index({ owner: 1 });
plantSchema.index({ name: 1, owner: 1 });
plantSchema.index({ species: 1 });
plantSchema.index({ status: 1 });
plantSchema.index({ tags: 1 });

// Virtual for next watering date
plantSchema.virtual('nextWatering').get(function() {
  if (!this.lastWatered) return new Date();
  const nextDate = new Date(this.lastWatered);
  nextDate.setDate(nextDate.getDate() + this.careInstructions.wateringFrequency);
  return nextDate;
});

// Virtual for next fertilizing date
plantSchema.virtual('nextFertilizing').get(function() {
  if (!this.lastFertilized) return new Date(Date.now() + this.careInstructions.fertilizerFrequency * 24 * 60 * 60 * 1000);
  const nextDate = new Date(this.lastFertilized);
  nextDate.setDate(nextDate.getDate() + this.careInstructions.fertilizerFrequency);
  return nextDate;
});

// Method to check if plant needs watering
plantSchema.methods.needsWatering = function() {
  if (!this.lastWatered) return true;
  const daysSinceWatered = Math.floor((Date.now() - this.lastWatered.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceWatered >= this.careInstructions.wateringFrequency;
};

// Method to check if plant needs fertilizing
plantSchema.methods.needsFertilizing = function() {
  if (!this.lastFertilized) return true;
  const daysSinceFertilized = Math.floor((Date.now() - this.lastFertilized.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceFertilized >= this.careInstructions.fertilizerFrequency;
};

module.exports = mongoose.model('Plant', plantSchema);
