const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Plant = require('../models/Plant');
const Reminder = require('../models/Reminder');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/plant-care');
    console.log('Connected to MongoDB for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Comprehensive plant data with realistic examples
const plantData = [
  {
    name: "Monstera Deliciosa",
    species: "Monstera deliciosa",
    scientificName: "Monstera deliciosa",
    description: "A popular houseplant known for its large, split leaves. Native to tropical forests, it's easy to care for and grows quickly.",
    careInstructions: {
      wateringFrequency: 7,
      sunlightNeeds: "medium",
      soilType: "loamy",
      fertilizerFrequency: 30,
      repottingFrequency: 365,
      temperature: { min: 18, max: 27 },
      humidity: { min: 60, max: 80 }
    },
    tags: ["indoor", "tropical", "low-maintenance", "fast-growing"],
    location: "Living room corner",
    status: "healthy"
  },
  {
    name: "Fiddle Leaf Fig",
    species: "Ficus lyrata",
    scientificName: "Ficus lyrata",
    description: "A stunning plant with large, violin-shaped leaves. Requires bright, indirect light and consistent watering.",
    careInstructions: {
      wateringFrequency: 10,
      sunlightNeeds: "high",
      soilType: "loamy",
      fertilizerFrequency: 60,
      repottingFrequency: 730,
      temperature: { min: 16, max: 24 },
      humidity: { min: 40, max: 60 }
    },
    tags: ["indoor", "statement-plant", "bright-light", "popular"],
    location: "Near south-facing window",
    status: "healthy"
  },
  {
    name: "Snake Plant",
    species: "Sansevieria trifasciata",
    scientificName: "Dracaena trifasciata",
    description: "An extremely hardy plant perfect for beginners. Tolerates low light and infrequent watering.",
    careInstructions: {
      wateringFrequency: 21,
      sunlightNeeds: "low",
      soilType: "sandy",
      fertilizerFrequency: 90,
      repottingFrequency: 1095,
      temperature: { min: 10, max: 30 },
      humidity: { min: 30, max: 70 }
    },
    tags: ["indoor", "beginner-friendly", "low-light", "air-purifying"],
    location: "Bedroom nightstand",
    status: "healthy"
  },
  {
    name: "Pothos Golden",
    species: "Epipremnum aureum",
    scientificName: "Epipremnum aureum",
    description: "A trailing vine with heart-shaped leaves. Very forgiving and can grow in various light conditions.",
    careInstructions: {
      wateringFrequency: 7,
      sunlightNeeds: "medium",
      soilType: "loamy",
      fertilizerFrequency: 30,
      repottingFrequency: 365,
      temperature: { min: 15, max: 26 },
      humidity: { min: 40, max: 70 }
    },
    tags: ["indoor", "trailing", "easy-care", "variegated"],
    location: "Hanging in kitchen",
    status: "healthy"
  },
  {
    name: "Rubber Plant",
    species: "Ficus elastica",
    scientificName: "Ficus elastica",
    description: "A glossy-leaved plant that can grow quite large. Prefers bright, indirect light and consistent moisture.",
    careInstructions: {
      wateringFrequency: 7,
      sunlightNeeds: "medium",
      soilType: "loamy",
      fertilizerFrequency: 30,
      repottingFrequency: 365,
      temperature: { min: 15, max: 24 },
      humidity: { min: 40, max: 60 }
    },
    tags: ["indoor", "glossy-leaves", "tree-like", "low-maintenance"],
    location: "Office corner",
    status: "healthy"
  },
  {
    name: "ZZ Plant",
    species: "Zamioculcas zamiifolia",
    scientificName: "Zamioculcas zamiifolia",
    description: "An extremely drought-tolerant plant with waxy, dark green leaves. Perfect for busy plant parents.",
    careInstructions: {
      wateringFrequency: 21,
      sunlightNeeds: "low",
      soilType: "sandy",
      fertilizerFrequency: 90,
      repottingFrequency: 1095,
      temperature: { min: 15, max: 26 },
      humidity: { min: 30, max: 60 }
    },
    tags: ["indoor", "drought-tolerant", "low-light", "waxy-leaves"],
    location: "Dining room",
    status: "healthy"
  },
  {
    name: "Peace Lily",
    species: "Spathiphyllum wallisii",
    scientificName: "Spathiphyllum wallisii",
    description: "Known for its white flowers and air-purifying qualities. Prefers consistently moist soil.",
    careInstructions: {
      wateringFrequency: 5,
      sunlightNeeds: "low",
      soilType: "loamy",
      fertilizerFrequency: 45,
      repottingFrequency: 365,
      temperature: { min: 18, max: 24 },
      humidity: { min: 50, max: 80 }
    },
    tags: ["indoor", "flowering", "air-purifying", "moist-soil"],
    location: "Bathroom",
    status: "healthy"
  },
  {
    name: "Aloe Vera",
    species: "Aloe barbadensis",
    scientificName: "Aloe vera",
    description: "A succulent with medicinal properties. Requires minimal water and bright light.",
    careInstructions: {
      wateringFrequency: 14,
      sunlightNeeds: "high",
      soilType: "sandy",
      fertilizerFrequency: 60,
      repottingFrequency: 365,
      temperature: { min: 10, max: 26 },
      humidity: { min: 30, max: 50 }
    },
    tags: ["succulent", "medicinal", "bright-light", "drought-tolerant"],
    location: "Kitchen windowsill",
    status: "healthy"
  },
  {
    name: "Spider Plant",
    species: "Chlorophytum comosum",
    scientificName: "Chlorophytum comosum",
    description: "Produces baby plants (spiderettes) and is excellent for beginners. Very adaptable to different conditions.",
    careInstructions: {
      wateringFrequency: 7,
      sunlightNeeds: "medium",
      soilType: "loamy",
      fertilizerFrequency: 30,
      repottingFrequency: 365,
      temperature: { min: 13, max: 24 },
      humidity: { min: 40, max: 70 }
    },
    tags: ["indoor", "beginner-friendly", "spiderettes", "adaptable"],
    location: "Living room shelf",
    status: "healthy"
  },
  {
    name: "Chinese Money Plant",
    species: "Pilea peperomioides",
    scientificName: "Pilea peperomioides",
    description: "A trendy plant with round, coin-shaped leaves. Prefers bright, indirect light and well-draining soil.",
    careInstructions: {
      wateringFrequency: 7,
      sunlightNeeds: "medium",
      soilType: "loamy",
      fertilizerFrequency: 30,
      repottingFrequency: 365,
      temperature: { min: 15, max: 24 },
      humidity: { min: 40, max: 60 }
    },
    tags: ["indoor", "trendy", "round-leaves", "bright-light"],
    location: "Office desk",
    status: "healthy"
  },
  {
    name: "Philodendron Heartleaf",
    species: "Philodendron hederaceum",
    scientificName: "Philodendron hederaceum",
    description: "A classic trailing plant with heart-shaped leaves. Very easy to care for and propagate.",
    careInstructions: {
      wateringFrequency: 7,
      sunlightNeeds: "medium",
      soilType: "loamy",
      fertilizerFrequency: 30,
      repottingFrequency: 365,
      temperature: { min: 15, max: 26 },
      humidity: { min: 40, max: 70 }
    },
    tags: ["indoor", "trailing", "heart-shaped", "easy-propagation"],
    location: "Bookshelf",
    status: "healthy"
  },
  {
    name: "Bird of Paradise",
    species: "Strelitzia reginae",
    scientificName: "Strelitzia reginae",
    description: "A dramatic plant with large, paddle-shaped leaves. Can grow quite tall and prefers bright light.",
    careInstructions: {
      wateringFrequency: 10,
      sunlightNeeds: "high",
      soilType: "loamy",
      fertilizerFrequency: 30,
      repottingFrequency: 365,
      temperature: { min: 18, max: 26 },
      humidity: { min: 50, max: 70 }
    },
    tags: ["indoor", "dramatic", "large-leaves", "bright-light"],
    location: "Living room corner",
    status: "healthy"
  },
  {
    name: "Swiss Cheese Plant",
    species: "Monstera adansonii",
    scientificName: "Monstera adansonii",
    description: "Similar to Monstera deliciosa but with smaller, more perforated leaves. Great for hanging baskets.",
    careInstructions: {
      wateringFrequency: 7,
      sunlightNeeds: "medium",
      soilType: "loamy",
      fertilizerFrequency: 30,
      repottingFrequency: 365,
      temperature: { min: 18, max: 27 },
      humidity: { min: 60, max: 80 }
    },
    tags: ["indoor", "hanging", "perforated-leaves", "tropical"],
    location: "Hanging in living room",
    status: "healthy"
  },
  {
    name: "String of Pearls",
    species: "Senecio rowleyanus",
    scientificName: "Curio rowleyanus",
    description: "A unique succulent with bead-like leaves. Requires bright light and minimal water.",
    careInstructions: {
      wateringFrequency: 14,
      sunlightNeeds: "high",
      soilType: "sandy",
      fertilizerFrequency: 60,
      repottingFrequency: 365,
      temperature: { min: 15, max: 24 },
      humidity: { min: 30, max: 50 }
    },
    tags: ["succulent", "trailing", "unique", "bright-light"],
    location: "Hanging in bedroom",
    status: "healthy"
  },
  {
    name: "Jade Plant",
    species: "Crassula ovata",
    scientificName: "Crassula ovata",
    description: "A popular succulent with thick, fleshy leaves. Symbolizes good luck and prosperity.",
    careInstructions: {
      wateringFrequency: 14,
      sunlightNeeds: "high",
      soilType: "sandy",
      fertilizerFrequency: 60,
      repottingFrequency: 365,
      temperature: { min: 10, max: 24 },
      humidity: { min: 30, max: 50 }
    },
    tags: ["succulent", "good-luck", "thick-leaves", "bright-light"],
    location: "Kitchen counter",
    status: "healthy"
  }
];

// Create demo users and assign plants
const createDemoUsersAndPlants = async () => {
  try {
    console.log('Creating demo users and plants...');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 12);
    const demoUser = new User({
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User'
    });

    await demoUser.save();
    console.log('Demo user created successfully');

    // Create test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User'
    });

    await testUser.save();
    console.log('Test user created successfully');

    // Create plants for demo user (first 8 plants)
    for (let i = 0; i < 8; i++) {
      const plantInfo = plantData[i];
      const plant = new Plant({
        ...plantInfo,
        owner: demoUser._id,
        lastWatered: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
        purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random within last year
      });

      await plant.save();

      // Create watering reminder for each plant
      const nextWateringDate = new Date(Date.now() + plantInfo.careInstructions.wateringFrequency * 24 * 60 * 60 * 1000);
      const wateringReminder = new Reminder({
        plant: plant._id,
        user: demoUser._id,
        type: 'watering',
        title: `Water ${plantInfo.name}`,
        description: `Time to water your ${plantInfo.species}`,
        scheduledDate: nextWateringDate,
        frequency: 'once',
        priority: 'medium',
        isActive: true
      });

      await wateringReminder.save();

      console.log(`Created plant: ${plantInfo.name}`);
    }

    // Create plants for test user (remaining plants)
    for (let i = 8; i < plantData.length; i++) {
      const plantInfo = plantData[i];
      const plant = new Plant({
        ...plantInfo,
        owner: testUser._id,
        lastWatered: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      });

      await plant.save();

      // Create watering reminder for each plant
      const nextWateringDate = new Date(Date.now() + plantInfo.careInstructions.wateringFrequency * 24 * 60 * 60 * 1000);
      const wateringReminder = new Reminder({
        plant: plant._id,
        user: testUser._id,
        type: 'watering',
        title: `Water ${plantInfo.name}`,
        description: `Time to water your ${plantInfo.species}`,
        scheduledDate: nextWateringDate,
        frequency: 'once',
        priority: 'medium',
        isActive: true
      });

      await wateringReminder.save();

      console.log(`Created plant: ${plantInfo.name}`);
    }

    console.log(`Successfully created ${plantData.length} plants with reminders`);
    
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping seed...');
      return;
    }

    // Create demo users and plants
    await createDemoUsersAndPlants();

    console.log('Database seeded successfully!');
    console.log('\nDemo Accounts Created:');
    console.log('Email: demo@example.com, Password: demo123');
    console.log('Email: test@example.com, Password: demo123');
    console.log('\nTotal plants created:', plantData.length);
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, plantData };
