import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface Plant {
  _id: string;
  name: string;
  species: string;
  scientificName?: string;
  description?: string;
  image?: {
    url: string;
    publicId?: string;
  };
  careInstructions: {
    wateringFrequency: number;
    sunlightNeeds: string;
    soilType?: string;
    fertilizerFrequency?: number;
    repottingFrequency?: number;
    temperature?: {
      min?: number;
      max?: number;
    };
    humidity?: {
      min?: number;
      max?: number;
    };
  };
  notes?: string;
  tags?: string[];
  location?: string;
  purchaseDate?: string;
  lastWatered?: string;
  lastFertilized?: string;
  lastRepotted?: string;
  status: 'healthy' | 'needs-attention' | 'sick' | 'dormant';
  owner: string;
  createdAt: string;
  updatedAt: string;
  nextWatering?: string;
  needsWatering?: boolean;
  needsFertilizing?: boolean;
}

interface PlantContextType {
  plants: Plant[];
  isLoading: boolean;
  error: string | null;
  fetchPlants: (params?: any) => Promise<void>;
  addPlant: (plantData: any) => Promise<boolean>;
  updatePlant: (id: string, plantData: Partial<Plant>) => Promise<Plant | null>;
  deletePlant: (id: string) => Promise<boolean>;
  waterPlant: (id: string) => Promise<boolean>;
  fertilizePlant: (id: string) => Promise<boolean>;
  getPlant: (id: string) => Plant | null;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const usePlants = () => {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
};

interface PlantProviderProps {
  children: ReactNode;
}

export const PlantProvider: React.FC<PlantProviderProps> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlants = async (params: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/plants', { params });
      setPlants(response.data.plants || []);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch plants';
      setError(message);
      console.error('Error fetching plants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPlant = async (plantData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Add all the basic fields
      Object.keys(plantData).forEach(key => {
        if (key === 'image' && plantData[key]) {
          formData.append('image', plantData[key]);
        } else if (key === 'careInstructions') {
          formData.append('careInstructions', JSON.stringify(plantData[key]));
        } else if (key === 'tags') {
          formData.append('tags', JSON.stringify(plantData[key]));
        } else if (plantData[key] !== null && plantData[key] !== undefined) {
          formData.append(key, plantData[key]);
        }
      });

      const response = await axios.post('/plants', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newPlant = response.data.plant;
      setPlants(prev => [...prev, newPlant]);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add plant';
      setError(message);
      console.error('Error adding plant:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlant = async (id: string, plantData: Partial<Plant>): Promise<Plant | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.put(`/plants/${id}`, plantData);
      const updatedPlant = response.data.plant;
      
      setPlants(prev => prev.map(plant => 
        plant._id === id ? updatedPlant : plant
      ));
      return updatedPlant;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update plant';
      setError(message);
      console.error('Error updating plant:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlant = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.delete(`/plants/${id}`);
      setPlants(prev => prev.filter(plant => plant._id !== id));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete plant';
      setError(message);
      console.error('Error deleting plant:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const waterPlant = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`/plants/${id}/water`);
      const updatedPlant = response.data.plant;
      
      setPlants(prev => prev.map(plant => 
        plant._id === id ? updatedPlant : plant
      ));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to water plant';
      setError(message);
      console.error('Error watering plant:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fertilizePlant = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`/plants/${id}/fertilize`);
      const updatedPlant = response.data.plant;
      
      setPlants(prev => prev.map(plant => 
        plant._id === id ? updatedPlant : plant
      ));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fertilize plant';
      setError(message);
      console.error('Error fertilizing plant:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getPlant = (id: string): Plant | null => {
    return plants.find(plant => plant._id === id) || null;
  };

  // Load plants on mount
  useEffect(() => {
    fetchPlants();
  }, []);

  const value: PlantContextType = {
    plants,
    isLoading,
    error,
    fetchPlants,
    addPlant,
    updatePlant,
    deletePlant,
    waterPlant,
    fertilizePlant,
    getPlant,
  };

  return (
    <PlantContext.Provider value={value}>
      {children}
    </PlantContext.Provider>
  );
};
