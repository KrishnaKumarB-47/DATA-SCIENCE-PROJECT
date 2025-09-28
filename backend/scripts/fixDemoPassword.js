const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/plant-care');
    console.log('Connected to MongoDB for password fix');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fix demo user password
const fixDemoPassword = async () => {
  try {
    await connectDB();
    
    console.log('Fixing demo user password...');
    
    // Hash the demo password
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    // Update the demo user password
    const result = await User.updateOne(
      { email: 'demo@example.com' },
      { password: hashedPassword }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Demo user password updated successfully!');
      console.log('Email: demo@example.com');
      console.log('Password: demo123');
    } else {
      console.log('❌ Demo user not found or password not updated');
    }
    
    // Also fix testuser password
    const testResult = await User.updateOne(
      { email: 'test@example.com' },
      { password: hashedPassword }
    );
    
    if (testResult.modifiedCount > 0) {
      console.log('✅ Test user password updated successfully!');
      console.log('Email: test@example.com');
      console.log('Password: demo123');
    }
    
  } catch (error) {
    console.error('Error fixing demo password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  fixDemoPassword();
}

module.exports = { fixDemoPassword };
