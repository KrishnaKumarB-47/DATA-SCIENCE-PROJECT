const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const Plant = require('../models/Plant');
const Reminder = require('../models/Reminder');
const { requireAuth, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation rules
const plantValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Plant name is required and cannot exceed 100 characters')
    .trim(),
  body('species')
    .isLength({ min: 1, max: 100 })
    .withMessage('Species is required and cannot exceed 100 characters')
    .trim(),
  body('careInstructions.wateringFrequency')
    .isInt({ min: 1, max: 365 })
    .withMessage('Watering frequency must be between 1 and 365 days'),
  body('careInstructions.sunlightNeeds')
    .isIn(['low', 'medium', 'high', 'full-sun', 'partial-shade', 'full-shade'])
    .withMessage('Invalid sunlight needs value'),
  body('careInstructions.soilType')
    .optional()
    .isIn(['clay', 'loamy', 'sandy', 'silt', 'peaty', 'chalky'])
    .withMessage('Invalid soil type'),
  body('careInstructions.fertilizerFrequency')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Fertilizer frequency must be between 1 and 365 days'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
];

// @route   GET /api/plants
// @desc    Get all plants for authenticated user
// @access  Private
router.get('/', requireAuth, [
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  query('status')
    .optional()
    .isIn(['healthy', 'needs-attention', 'sick', 'dormant'])
    .withMessage('Invalid status filter'),
  query('sunlightNeeds')
    .optional()
    .isIn(['low', 'medium', 'high', 'full-sun', 'partial-shade', 'full-shade'])
    .withMessage('Invalid sunlight needs filter'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      search,
      status,
      sunlightNeeds,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = { owner: req.session.userId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { species: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (sunlightNeeds) {
      filter['careInstructions.sunlightNeeds'] = sunlightNeeds;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const plants = await Plant.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Plant.countDocuments(filter);

    // Add virtual fields
    const plantsWithVirtuals = plants.map(plant => ({
      ...plant,
      nextWatering: plant.lastWatered 
        ? new Date(plant.lastWatered.getTime() + plant.careInstructions.wateringFrequency * 24 * 60 * 60 * 1000)
        : new Date(),
      needsWatering: plant.lastWatered 
        ? Math.floor((Date.now() - plant.lastWatered.getTime()) / (1000 * 60 * 60 * 24)) >= plant.careInstructions.wateringFrequency
        : true
    }));

    res.json({
      plants: plantsWithVirtuals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPlants: total,
        hasNextPage: skip + plants.length < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/plants/:id
// @desc    Get single plant by ID
// @access  Private
router.get('/:id', requireAuth, requireOwnership(Plant), async (req, res) => {
  try {
    const plant = req.resource;
    
    // Add virtual fields
    const plantWithVirtuals = {
      ...plant.toObject(),
      nextWatering: plant.nextWatering,
      nextFertilizing: plant.nextFertilizing,
      needsWatering: plant.needsWatering(),
      needsFertilizing: plant.needsFertilizing()
    };

    res.json({ plant: plantWithVirtuals });
  } catch (error) {
    console.error('Get plant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/plants
// @desc    Create a new plant
// @access  Private
router.post('/', requireAuth, upload.single('image'), plantValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Parse JSON fields from FormData
    const plantData = {
      ...req.body,
      owner: req.session.userId
    };

    // Parse JSON strings back to objects
    if (req.body.careInstructions) {
      try {
        plantData.careInstructions = JSON.parse(req.body.careInstructions);
      } catch (error) {
        console.error('Error parsing careInstructions:', error);
      }
    }

    if (req.body.tags) {
      try {
        plantData.tags = JSON.parse(req.body.tags);
      } catch (error) {
        console.error('Error parsing tags:', error);
        plantData.tags = [];
      }
    }

    // Handle image upload (placeholder - in production, upload to cloud storage)
    if (req.file) {
      plantData.image = {
        url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        publicId: null
      };
    }

    const plant = new Plant(plantData);
    await plant.save();

    // Create initial watering reminder
    const wateringReminder = new Reminder({
      plant: plant._id,
      user: req.session.userId,
      type: 'watering',
      title: `Water ${plant.name}`,
      description: `Time to water your ${plant.species}`,
      scheduledDate: new Date(Date.now() + plant.careInstructions.wateringFrequency * 24 * 60 * 60 * 1000),
      frequency: 'once',
      priority: 'medium'
    });
    await wateringReminder.save();

    res.status(201).json({
      message: 'Plant created successfully',
      plant: {
        ...plant.toObject(),
        nextWatering: plant.nextWatering,
        needsWatering: plant.needsWatering()
      }
    });
  } catch (error) {
    console.error('Create plant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/plants/:id
// @desc    Update a plant
// @access  Private
router.put('/:id', requireAuth, requireOwnership(Plant), upload.single('image'), plantValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const plant = req.resource;
    const updateData = { ...req.body };

    // Handle image update
    if (req.file) {
      updateData.image = {
        url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        publicId: null
      };
    }

    // Update plant
    Object.assign(plant, updateData);
    await plant.save();

    res.json({
      message: 'Plant updated successfully',
      plant: {
        ...plant.toObject(),
        nextWatering: plant.nextWatering,
        needsWatering: plant.needsWatering()
      }
    });
  } catch (error) {
    console.error('Update plant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/plants/:id
// @desc    Delete a plant
// @access  Private
router.delete('/:id', requireAuth, requireOwnership(Plant), async (req, res) => {
  try {
    const plant = req.resource;

    // Delete associated reminders
    await Reminder.deleteMany({ plant: plant._id });

    // Delete plant
    await Plant.findByIdAndDelete(plant._id);

    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    console.error('Delete plant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/plants/:id/water
// @desc    Mark plant as watered
// @access  Private
router.post('/:id/water', requireAuth, requireOwnership(Plant), async (req, res) => {
  try {
    const plant = req.resource;
    
    plant.lastWatered = new Date();
    await plant.save();

    // Update or create next watering reminder
    const nextWateringDate = new Date(Date.now() + plant.careInstructions.wateringFrequency * 24 * 60 * 60 * 1000);
    
    await Reminder.findOneAndUpdate(
      { plant: plant._id, type: 'watering', isActive: true },
      { scheduledDate: nextWateringDate, isCompleted: false },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Plant marked as watered',
      plant: {
        ...plant.toObject(),
        nextWatering: plant.nextWatering,
        needsWatering: plant.needsWatering()
      }
    });
  } catch (error) {
    console.error('Water plant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/plants/:id/fertilize
// @desc    Mark plant as fertilized
// @access  Private
router.post('/:id/fertilize', requireAuth, requireOwnership(Plant), async (req, res) => {
  try {
    const plant = req.resource;
    
    plant.lastFertilized = new Date();
    await plant.save();

    // Update or create next fertilizing reminder
    const nextFertilizingDate = new Date(Date.now() + plant.careInstructions.fertilizerFrequency * 24 * 60 * 60 * 1000);
    
    await Reminder.findOneAndUpdate(
      { plant: plant._id, type: 'fertilizing', isActive: true },
      { scheduledDate: nextFertilizingDate, isCompleted: false },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Plant marked as fertilized',
      plant: {
        ...plant.toObject(),
        nextFertilizing: plant.nextFertilizing,
        needsFertilizing: plant.needsFertilizing()
      }
    });
  } catch (error) {
    console.error('Fertilize plant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
