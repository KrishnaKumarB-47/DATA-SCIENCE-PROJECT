import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Droplets, Sun, Calendar, MapPin } from 'lucide-react';
import { usePlants } from '../../contexts/PlantContext';
import { Button } from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PlantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { plants, isLoading } = usePlants();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.species.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingSpinner text="Loading your plants..." />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'sick':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'dormant':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Plants
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {plants.length === 0 ? 'Start building your plant collection' : `${plants.length} plant${plants.length === 1 ? '' : 's'} in your collection`}
          </p>
        </div>
        <Button 
          className="bg-plant-600 hover:bg-plant-700"
          onClick={() => navigate('/plants/add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Plant
        </Button>
      </div>

      {/* Search and Filter */}
      {plants.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="needs-attention">Needs Attention</option>
            <option value="sick">Sick</option>
            <option value="dormant">Dormant</option>
          </select>
        </div>
      )}

      {/* Plants Grid or Empty State */}
      {plants.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="max-w-md mx-auto">
            {/* Plant Icon */}
            <div className="mx-auto w-24 h-24 bg-plant-100 dark:bg-plant-900 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-plant-600 dark:text-plant-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Plant Care!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Start your plant care journey by adding your first plant. We'll help you track watering schedules, 
              care instructions, and keep your plants healthy and thriving.
            </p>
            
            <Button 
              className="bg-plant-600 hover:bg-plant-700 text-lg px-8 py-3"
              onClick={() => navigate('/plants/add')}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Plant
            </Button>
            
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              <p>✨ Track watering schedules</p>
              <p>🌱 Set care reminders</p>
              <p>📱 Access anywhere</p>
            </div>
          </div>
        </motion.div>
      ) : filteredPlants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No plants found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant, index) => (
            <motion.div
              key={plant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => navigate(`/plants/${plant._id}`)}
            >
              {/* Plant Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                {plant.image?.url ? (
                  <img
                    src={plant.image.url}
                    alt={plant.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plant.status)}`}>
                    {plant.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Plant Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-plant-600 dark:group-hover:text-plant-400 transition-colors duration-200">
                  {plant.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {plant.species}
                </p>

                {/* Care Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                    Water every {plant.careInstructions.wateringFrequency} days
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                    {plant.careInstructions.sunlightNeeds.replace('-', ' ')}
                  </div>
                  {plant.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {plant.location}
                    </div>
                  )}
                </div>

                {/* Next Care */}
                {plant.nextWatering && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                    Next watering: {formatDate(plant.nextWatering)}
                  </div>
                )}

                {/* Tags */}
                {plant.tags && plant.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {plant.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-plant-100 text-plant-800 dark:bg-plant-900 dark:text-plant-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {plant.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        +{plant.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group-hover:bg-plant-50 dark:group-hover:bg-plant-900/20"
                  >
                    View Details →
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantsPage;