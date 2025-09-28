const mongoose = require('mongoose');
const User = require('../models/User');
const Plant = require('../models/Plant');
const Reminder = require('../models/Reminder');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/plant-care');
    console.log('Connected to MongoDB for data check');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check seeded data
const checkSeededData = async () => {
  try {
    await connectDB();
    
    console.log('\n=== SEEDED DATA CHECK ===\n');
    
    // Check users
    const users = await User.find({}).select('username email firstName lastName');
    console.log(`📊 Users found: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - ${user.firstName} ${user.lastName}`);
    });
    
    // Check plants
    const plants = await Plant.find({}).populate('owner', 'username email');
    console.log(`\n🌱 Plants found: ${plants.length}`);
    
    // Group plants by user
    const plantsByUser = {};
    plants.forEach(plant => {
      const ownerUsername = plant.owner ? plant.owner.username : 'Unknown';
      if (!plantsByUser[ownerUsername]) {
        plantsByUser[ownerUsername] = [];
      }
      plantsByUser[ownerUsername].push(plant);
    });
    
    Object.keys(plantsByUser).forEach(username => {
      console.log(`\n  👤 ${username} (${plantsByUser[username].length} plants):`);
      plantsByUser[username].forEach(plant => {
        console.log(`    - ${plant.name} (${plant.species}) - ${plant.status}`);
      });
    });
    
    // Check reminders
    const reminders = await Reminder.find({}).populate('user', 'username').populate('plant', 'name');
    console.log(`\n🔔 Reminders found: ${reminders.length}`);
    
    // Group reminders by user
    const remindersByUser = {};
    reminders.forEach(reminder => {
      const userUsername = reminder.user ? reminder.user.username : 'Unknown';
      if (!remindersByUser[userUsername]) {
        remindersByUser[userUsername] = [];
      }
      remindersByUser[userUsername].push(reminder);
    });
    
    Object.keys(remindersByUser).forEach(username => {
      console.log(`\n  👤 ${username} (${remindersByUser[username].length} reminders):`);
      remindersByUser[username].forEach(reminder => {
        const plantName = reminder.plant ? reminder.plant.name : 'Unknown Plant';
        console.log(`    - ${reminder.type}: ${reminder.title} (${plantName})`);
      });
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`✅ Users: ${users.length}`);
    console.log(`✅ Plants: ${plants.length}`);
    console.log(`✅ Reminders: ${reminders.length}`);
    console.log('\n🎉 Seeded data check completed successfully!');
    
  } catch (error) {
    console.error('Error checking seeded data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run check if this file is executed directly
if (require.main === module) {
  checkSeededData();
}

module.exports = { checkSeededData };
