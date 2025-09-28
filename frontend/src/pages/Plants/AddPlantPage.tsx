import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Image as ImageIcon, Droplets, Sun, Thermometer, Calendar } from 'lucide-react';
import { usePlants } from '../../contexts/PlantContext';
import { Button } from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const AddPlantPage: React.FC = () => {
  const navigate = useNavigate();
  const { addPlant, isLoading } = usePlants();
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    scientificName: '',
    description: '',
    image: null as File | null,
    careInstructions: {
      wateringFrequency: 7,
      sunlightNeeds: 'medium' as 'low' | 'medium' | 'high' | 'full-sun' | 'partial-shade' | 'full-shade',
      soilType: 'loamy' as 'clay' | 'loamy' | 'sandy' | 'silt' | 'peaty' | 'chalky',
      fertilizerFrequency: 30,
      repottingFrequency: 365,
      temperature: {
        min: 18,
        max: 24
      },
      humidity: {
        min: 40,
        max: 60
      }
    },
    notes: '',
    tags: [] as string[],
    location: '',
    purchaseDate: '',
    status: 'healthy' as 'healthy' | 'needs-attention' | 'sick' | 'dormant'
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be smaller than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plant name is required';
    }

    if (!formData.species.trim()) {
      newErrors.species = 'Species is required';
    }

    if (formData.careInstructions.wateringFrequency < 1 || formData.careInstructions.wateringFrequency > 365) {
      newErrors.wateringFrequency = 'Watering frequency must be between 1 and 365 days';
    }

    if (formData.careInstructions.fertilizerFrequency < 1 || formData.careInstructions.fertilizerFrequency > 365) {
      newErrors.fertilizerFrequency = 'Fertilizer frequency must be between 1 and 365 days';
    }

    if (formData.careInstructions.temperature.min >= formData.careInstructions.temperature.max) {
      newErrors.temperature = 'Minimum temperature must be less than maximum temperature';
    }

    if (formData.careInstructions.humidity.min >= formData.careInstructions.humidity.max) {
      newErrors.humidity = 'Minimum humidity must be less than maximum humidity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      const success = await addPlant(formData);
      if (success) {
        toast.success('Plant added successfully!');
        navigate('/plants');
      }
    } catch (error) {
      toast.error('Failed to add plant. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Adding your plant..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/plants')}
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Plant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new plant to your collection
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8"
      >
        {/* Basic Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-plant-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plant Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., My Fiddle Leaf Fig"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Species *
              </label>
              <input
                type="text"
                name="species"
                value={formData.species}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200 ${
                  errors.species ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Ficus lyrata"
              />
              {errors.species && (
                <p className="mt-1 text-sm text-red-600">{errors.species}</p>
              )}
            </div>

            {/* Scientific Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scientific Name
              </label>
              <input
                type="text"
                name="scientificName"
                value={formData.scientificName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Ficus lyrata"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Living room, Kitchen window"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
              placeholder="Tell us about your plant..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plant Photo
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Upload className="h-4 w-4" />
                <span>Choose Image</span>
              </label>
              {formData.image && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.image.name}
                </span>
              )}
            </div>
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>
        </div>

        {/* Care Instructions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Droplets className="h-5 w-5 mr-2 text-blue-600" />
            Care Instructions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Watering Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Watering Frequency (days) *
              </label>
              <input
                type="number"
                name="careInstructions.wateringFrequency"
                value={formData.careInstructions.wateringFrequency}
                onChange={handleInputChange}
                min="1"
                max="365"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200 ${
                  errors.wateringFrequency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.wateringFrequency && (
                <p className="mt-1 text-sm text-red-600">{errors.wateringFrequency}</p>
              )}
            </div>

            {/* Sunlight Needs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sunlight Needs *
              </label>
              <select
                name="careInstructions.sunlightNeeds"
                value={formData.careInstructions.sunlightNeeds}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
              >
                <option value="low">Low Light</option>
                <option value="medium">Medium Light</option>
                <option value="high">High Light</option>
                <option value="full-sun">Full Sun</option>
                <option value="partial-shade">Partial Shade</option>
                <option value="full-shade">Full Shade</option>
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Soil Type
              </label>
              <select
                name="careInstructions.soilType"
                value={formData.careInstructions.soilType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
              >
                <option value="clay">Clay</option>
                <option value="loamy">Loamy</option>
                <option value="sandy">Sandy</option>
                <option value="silt">Silt</option>
                <option value="peaty">Peaty</option>
                <option value="chalky">Chalky</option>
              </select>
            </div>

            {/* Fertilizer Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fertilizer Frequency (days)
              </label>
              <input
                type="number"
                name="careInstructions.fertilizerFrequency"
                value={formData.careInstructions.fertilizerFrequency}
                onChange={handleInputChange}
                min="1"
                max="365"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200 ${
                  errors.fertilizerFrequency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.fertilizerFrequency && (
                <p className="mt-1 text-sm text-red-600">{errors.fertilizerFrequency}</p>
              )}
            </div>
          </div>

          {/* Temperature Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Thermometer className="h-4 w-4 mr-2 text-orange-600" />
              Temperature Range (°C)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum
                </label>
                <input
                  type="number"
                  name="careInstructions.temperature.min"
                  value={formData.careInstructions.temperature.min}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200 ${
                    errors.temperature ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum
                </label>
                <input
                  type="number"
                  name="careInstructions.temperature.max"
                  value={formData.careInstructions.temperature.max}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200 ${
                    errors.temperature ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
            </div>
            {errors.temperature && (
              <p className="mt-1 text-sm text-red-600">{errors.temperature}</p>
            )}
          </div>

          {/* Humidity Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Humidity Range (%)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum
                </label>
                <input
                  type="number"
                  name="careInstructions.humidity.min"
                  value={formData.careInstructions.humidity.min}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200 ${
                    errors.humidity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum
                </label>
                <input
                  type="number"
                  name="careInstructions.humidity.max"
                  value={formData.careInstructions.humidity.max}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200 ${
                    errors.humidity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
            </div>
            {errors.humidity && (
              <p className="mt-1 text-sm text-red-600">{errors.humidity}</p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Additional Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
              >
                <option value="healthy">Healthy</option>
                <option value="needs-attention">Needs Attention</option>
                <option value="sick">Sick</option>
                <option value="dormant">Dormant</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-plant-100 text-plant-800 dark:bg-plant-900 dark:text-plant-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-plant-600 hover:text-plant-800 dark:text-plant-400 dark:hover:text-plant-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
                placeholder="Add a tag..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
              >
                Add Tag
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plant-500 focus:border-transparent transition-all duration-200"
              placeholder="Any additional notes about your plant..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/plants')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-plant-600 hover:bg-plant-700"
          >
            Add Plant
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default AddPlantPage;
