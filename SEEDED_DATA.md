# 🌱 Plant Care App - Seeded Data Documentation

## Overview

The Plant Care App comes with comprehensive seeded data to demonstrate all features and provide realistic examples for development and testing.

## 📊 Seeded Data Summary

### Users
- **3 Users** with different plant collections
- **Demo Account**: `demo@example.com` / `demo123` (5 plants)
- **Test Account**: `test@example.com` / `demo123` (7 plants)  
- **New User**: `newuser@example.com` / `Newuser123` (0 plants - fresh start)

### Plants
- **12 Total Plants** across 2 accounts
- **15 Different Plant Species** available in seed data
- **Realistic Care Instructions** for each plant
- **Varied Locations** (living room, kitchen, bedroom, etc.)
- **Complete Plant Information** (scientific names, descriptions, tags)

### Reminders
- **12 Active Watering Reminders** (one per plant)
- **Automated Scheduling** based on plant watering frequency
- **Ready for Notification System**

## 🌿 Available Plant Species

The seed data includes these popular houseplants:

1. **Monstera Deliciosa** - Large split leaves, tropical
2. **Fiddle Leaf Fig** - Statement plant, bright light needed
3. **Snake Plant** - Beginner-friendly, low maintenance
4. **Pothos Golden** - Trailing vine, easy care
5. **Rubber Plant** - Glossy leaves, tree-like growth
6. **ZZ Plant** - Drought-tolerant, waxy leaves
7. **Peace Lily** - Flowering, air-purifying
8. **Aloe Vera** - Succulent, medicinal properties
9. **Spider Plant** - Produces baby plants, adaptable
10. **Chinese Money Plant** - Round leaves, trendy
11. **Philodendron Heartleaf** - Classic trailing plant
12. **Bird of Paradise** - Dramatic, large leaves
13. **Swiss Cheese Plant** - Perforated leaves, hanging
14. **String of Pearls** - Unique succulent, trailing
15. **Jade Plant** - Thick leaves, good luck symbol

## 🔧 Database Management Scripts

### Available Commands

```bash
# Seed the database with users and plants
npm run seed

# Seed only plants for existing users
npm run seed:plants

# Check current seeded data
npm run check:data
```

### Script Locations

- `backend/scripts/seedPlants.js` - Full seed script (users + plants)
- `backend/scripts/seedPlantsOnly.js` - Plants only for existing users
- `backend/scripts/checkSeededData.js` - Data verification script

## 🎯 Plant Data Structure

Each plant includes comprehensive information:

```javascript
{
  name: "Monstera Deliciosa",
  species: "Monstera deliciosa", 
  scientificName: "Monstera deliciosa",
  description: "A popular houseplant known for its large, split leaves...",
  careInstructions: {
    wateringFrequency: 7, // days
    sunlightNeeds: "medium",
    soilType: "loamy",
    fertilizerFrequency: 30, // days
    repottingFrequency: 365, // days
    temperature: { min: 18, max: 27 }, // Celsius
    humidity: { min: 60, max: 80 } // percentage
  },
  tags: ["indoor", "tropical", "low-maintenance"],
  location: "Living room corner",
  status: "healthy",
  lastWatered: "2024-01-15T10:30:00Z",
  purchaseDate: "2023-06-15T00:00:00Z"
}
```

## 🚀 Getting Started with Seeded Data

### 1. Login to Demo Account
```
Email: demo@example.com
Password: demo123
```

### 2. Explore the Plants
- View 5 different plant types
- See realistic care schedules
- Check watering reminders
- Browse plant details and care instructions

### 3. Test Features
- **Plant Management**: View, edit, add new plants
- **Reminders**: See upcoming watering schedules
- **Calendar**: Check plant care calendar
- **Search & Filter**: Find plants by name, species, or status

### 4. Create New Plants
- Use the comprehensive add plant form
- Upload plant photos
- Set custom care schedules
- Add tags and notes

## 📱 Frontend Integration

The seeded data works seamlessly with the React frontend:

- **Plants Page**: Shows all user's plants with rich cards
- **Plant Details**: Complete plant information display
- **Add Plant Form**: Comprehensive form with all fields
- **Search & Filter**: Real-time filtering by name/status
- **Empty State**: Welcoming message for new users

## 🔄 Data Refresh

To reset and reseed the data:

```bash
# From backend directory
docker-compose exec backend npm run seed:plants
```

This will:
- Clear existing plants and reminders
- Create new random plant assignments for each user
- Generate fresh watering schedules
- Maintain user accounts

## 🎨 Plant Categories & Tags

The seeded data includes these categories:

### Indoor Plants
- Monstera Deliciosa
- Fiddle Leaf Fig
- Snake Plant
- Pothos Golden
- Rubber Plant
- ZZ Plant
- Peace Lily
- Spider Plant
- Chinese Money Plant
- Philodendron Heartleaf
- Bird of Paradise
- Swiss Cheese Plant

### Succulents
- Aloe Vera
- String of Pearls
- Jade Plant

### Tags Used
- `indoor` - Houseplants
- `succulent` - Water-storing plants
- `tropical` - Warm climate plants
- `beginner-friendly` - Easy to care for
- `trailing` - Vining plants
- `bright-light` - Needs lots of sun
- `low-light` - Tolerates shade
- `air-purifying` - Cleans air
- `flowering` - Produces flowers
- `medicinal` - Has health benefits

## 🔍 API Testing

Test the seeded data with these endpoints:

```bash
# Login
POST /api/auth/login
{
  "email": "demo@example.com",
  "password": "demo123"
}

# Get plants
GET /api/plants

# Get specific plant
GET /api/plants/{plantId}

# Get reminders
GET /api/reminders
```

## 🎉 Benefits of Seeded Data

1. **Immediate Demo**: Show app functionality without setup
2. **Realistic Testing**: Test with real-world plant data
3. **Feature Validation**: Verify all features work with data
4. **User Experience**: Provide engaging content for new users
5. **Development**: Speed up development and testing cycles

The seeded data provides a complete, realistic plant care experience that showcases all the app's features and capabilities!
