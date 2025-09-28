import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TreePine, 
  Bell, 
  Calendar, 
  Plus, 
  Droplets, 
  Sun, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlants } from '../../contexts/PlantContext';
import { useReminders } from '../../contexts/ReminderContext';
import { Button } from '../../components/UI/Button';
import { formatDate, getPlantStatusColor, getSunlightIcon } from '../../lib/utils';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { plants, isLoading: plantsLoading, fetchPlants } = usePlants();
  const { 
    reminders, 
    isLoading: remindersLoading, 
    fetchReminders,
    getTodayReminders,
    getOverdueReminders,
    getUpcomingReminders
  } = useReminders();

  useEffect(() => {
    fetchPlants();
    fetchReminders();
  }, [fetchPlants, fetchReminders]);

  const todayReminders = getTodayReminders();
  const overdueReminders = getOverdueReminders();
  const upcomingReminders = getUpcomingReminders(7);

  const plantsNeedingWater = plants.filter(plant => plant.needsWatering);
  const plantsNeedingAttention = plants.filter(plant => plant.status === 'needs-attention' || plant.status === 'sick');

  const stats = [
    {
      name: 'Total Plants',
      value: plants.length,
      icon: TreePine,
      color: 'text-plant-600',
      bgColor: 'bg-plant-100 dark:bg-plant-900',
    },
    {
      name: 'Needs Watering',
      value: plantsNeedingWater.length,
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      name: 'Today\'s Tasks',
      value: todayReminders.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      name: 'Overdue',
      value: overdueReminders.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900',
    },
  ];

  if (plantsLoading || remindersLoading) {
    return <LoadingSpinner text="Loading your plant care dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-plant-500 to-plant-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 🌱
            </h1>
            <p className="text-plant-100 text-lg">
              {plants.length > 0 
                ? `You have ${plants.length} plant${plants.length === 1 ? '' : 's'} to care for today.`
                : "Ready to start your plant care journey? Add your first plant!"
              }
            </p>
          </div>
          <div className="hidden md:block">
            <Link to="/plants/new">
              <Button 
                variant="secondary"
                className="bg-white text-plant-600 hover:bg-plant-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Plant
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/plants/new">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
              <Plus className="h-6 w-6" />
              <span>Add Plant</span>
            </Button>
          </Link>
          <Link to="/calendar">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Calendar</span>
            </Button>
          </Link>
          <Link to="/reminders">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
              <Bell className="h-6 w-6" />
              <span>Reminders</span>
            </Button>
          </Link>
          <Link to="/plants">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
              <TreePine className="h-6 w-6" />
              <span>All Plants</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Today's Tasks */}
      {todayReminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Today's Tasks
            </h2>
            <Link to="/reminders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {todayReminders.slice(0, 5).map((reminder) => (
              <div key={reminder._id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {reminder.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reminder.plant.name} • {reminder.type}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Complete
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Overdue Tasks */}
      {overdueReminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Overdue Tasks
            </h2>
            <Link to="/reminders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {overdueReminders.slice(0, 5).map((reminder) => (
              <div key={reminder._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {reminder.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reminder.plant.name} • Due {formatDate(reminder.scheduledDate)}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Complete
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Plants */}
      {plants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Plants
            </h2>
            <Link to="/plants">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plants.slice(0, 6).map((plant) => (
              <Link key={plant._id} to={`/plants/${plant._id}`}>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-plant-400 to-plant-600 rounded-lg flex items-center justify-center">
                      <TreePine className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {plant.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {plant.species}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlantStatusColor(plant.status)}`}>
                          {plant.status}
                        </span>
                        {plant.needsWatering && (
                          <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                            Needs Water
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {plants.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center py-12"
        >
          <TreePine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No plants yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start your plant care journey by adding your first plant!
          </p>
          <Link to="/plants/new">
            <Button className="bg-plant-600 hover:bg-plant-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Plant
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;
