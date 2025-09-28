# 🌱 Plant Care Reminder App - FSD Mini Project

A modern, full-stack web application to help you take care of your plants with personalized reminders, beautiful UI, and comprehensive plant management features.

**Repository**: [https://github.com/KrishnaKumarB-47/DATA-SCIENCE-PROJECT.git](https://github.com/KrishnaKumarB-47/DATA-SCIENCE-PROJECT.git)

![Plant Care App](https://img.shields.io/badge/Plant%20Care-v1.0.0-green) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Features

### 🌿 Core Features
- **User Authentication**: Secure signup, login, and session management
- **Plant Management**: Add, edit, delete, and organize your plant collection
- **Smart Reminders**: Automated notifications for watering, fertilizing, and other care tasks
- **Calendar View**: Visual schedule of upcoming plant care tasks
- **Dashboard**: Overview of all your plants and their care status

### 🎨 UI/UX Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Beautiful Animations**: Smooth transitions powered by Framer Motion
- **PWA Support**: Installable app with offline capabilities
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

### 🔧 Technical Features
- **RESTful API**: Well-structured backend with Express.js
- **Database**: MongoDB with Mongoose for data persistence
- **Email Notifications**: Automated reminders via email
- **File Upload**: Image support for plant photos
- **PDF Export**: Generate care schedules as PDF
- **Docker Ready**: Complete containerization setup

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Beautiful notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **node-cron** - Scheduled tasks
- **nodemailer** - Email sending
- **multer** - File upload handling

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd plant-care-app
   ```

2. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp backend/env.example backend/.env
   
   # Edit the .env file with your settings
   nano backend/.env
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Manual Installation

#### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/plant-care

# Session Secret (CHANGE IN PRODUCTION!)
SESSION_SECRET=your-super-secret-session-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in your `.env` file

## 📱 Usage

### Getting Started
1. **Register**: Create a new account or use the demo account
   - Demo credentials: `demo@example.com` / `demo123`

2. **Add Plants**: Start by adding your first plant with care instructions

3. **Set Reminders**: The app automatically creates watering reminders based on your plant's needs

4. **Track Care**: Mark tasks as completed and monitor your plant's health

### Key Features

#### Plant Management
- Add detailed plant information including species, care instructions, and photos
- Set watering frequency, sunlight needs, and other care requirements
- Track plant status (healthy, needs attention, sick, dormant)
- Organize plants with tags and location tracking

#### Smart Reminders
- Automated email notifications for upcoming care tasks
- Daily and weekly summary emails
- Overdue task alerts
- Customizable reminder frequencies

#### Calendar View
- Visual calendar showing all upcoming plant care tasks
- Filter by plant type, care type, or date range
- Quick task completion from calendar view

## 🏗️ Project Structure

```
plant-care-app/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Plants, etc.)
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── Dockerfile
├── backend/                 # Node.js backend API
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic services
│   ├── server.js           # Main server file
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Docker orchestration
├── nginx.conf              # Nginx configuration
├── mongo-init.js           # MongoDB initialization
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Plants
- `GET /api/plants` - Get all plants (with filtering)
- `GET /api/plants/:id` - Get single plant
- `POST /api/plants` - Create new plant
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant
- `POST /api/plants/:id/water` - Mark as watered
- `POST /api/plants/:id/fertilize` - Mark as fertilized

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `POST /api/reminders/:id/complete` - Mark as completed
- `POST /api/reminders/:id/reschedule` - Reschedule reminder

### Calendar
- `GET /api/calendar/events` - Get calendar events
- `GET /api/calendar/today` - Get today's tasks
- `GET /api/calendar/upcoming` - Get upcoming tasks
- `GET /api/calendar/statistics` - Get care statistics

## 🚀 Deployment

### Production Deployment

1. **Prepare for production**
   ```bash
   # Update environment variables for production
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   SESSION_SECRET=your-secure-production-secret
   ```

2. **Build and deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set up SSL certificates** (optional)
   ```bash
   # Place your SSL certificates in the ssl/ directory
   # Update nginx.conf to use HTTPS
   ```

### Environment-specific Configurations

#### Development
- Hot reloading enabled
- Debug logging
- CORS enabled for localhost

#### Production
- Optimized builds
- Security headers
- Rate limiting
- SSL/TLS encryption

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🌟 Features Roadmap

### Planned Features
- [ ] Mobile app (React Native)
- [ ] Plant identification via AI
- [ ] Community features (plant sharing)
- [ ] Weather integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Plant care tips and guides
- [ ] Social sharing features

### Recent Updates
- ✅ Initial release with core features
- ✅ Docker containerization
- ✅ PWA support
- ✅ Dark mode
- ✅ Email notifications

---

**Made with 🌱 by the Plant Care Team**

*Keep your plants healthy and thriving!*
