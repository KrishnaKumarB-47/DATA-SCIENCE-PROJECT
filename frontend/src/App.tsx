import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { PlantProvider } from './contexts/PlantContext';
import { ReminderProvider } from './contexts/ReminderContext';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PlantsPage from './pages/Plants/PlantsPage';
import PlantDetailPage from './pages/Plants/PlantDetailPage';
import AddPlantPage from './pages/Plants/AddPlantPage';
import EditPlantPage from './pages/Plants/EditPlantPage';
import CalendarPage from './pages/Calendar/CalendarPage';
import RemindersPage from './pages/Reminders/RemindersPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Loading component
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlantProvider>
          <ReminderProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout>
                        <DashboardPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/plants" element={
                    <ProtectedRoute>
                      <Layout>
                        <PlantsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/plants/new" element={
                    <ProtectedRoute>
                      <Layout>
                        <AddPlantPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/plants/:id" element={
                    <ProtectedRoute>
                      <Layout>
                        <PlantDetailPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/plants/:id/edit" element={
                    <ProtectedRoute>
                      <Layout>
                        <EditPlantPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <Layout>
                        <CalendarPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reminders" element={
                    <ProtectedRoute>
                      <Layout>
                        <RemindersPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback Routes */}
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
                
                {/* Global Loading Overlay */}
                <LoadingSpinner />
              </div>
            </Router>
          </ReminderProvider>
        </PlantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
