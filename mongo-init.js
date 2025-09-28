// MongoDB initialization script
db = db.getSiblingDB('plant-care');

// Create collections
db.createCollection('users');
db.createCollection('plants');
db.createCollection('reminders');
db.createCollection('sessions');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.plants.createIndex({ owner: 1 });
db.plants.createIndex({ name: 1, owner: 1 });
db.plants.createIndex({ species: 1 });
db.plants.createIndex({ status: 1 });

db.reminders.createIndex({ user: 1, scheduledDate: 1 });
db.reminders.createIndex({ plant: 1 });
db.reminders.createIndex({ type: 1 });
db.reminders.createIndex({ isActive: 1, isCompleted: 1 });

// Create sample users for testing
db.users.insertOne({
  username: 'demo',
  email: 'demo@example.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4p/8QJXcL6', // password: demo123
  firstName: 'Demo',
  lastName: 'User',
  preferences: {
    theme: 'system',
    notifications: {
      email: true,
      push: true
    },
    timezone: 'UTC'
  },
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

db.users.insertOne({
  username: 'testuser',
  email: 'test@example.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4p/8QJXcL6', // password: demo123
  firstName: 'Test',
  lastName: 'User',
  preferences: {
    theme: 'system',
    notifications: {
      email: true,
      push: true
    },
    timezone: 'UTC'
  },
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully with demo users!');
