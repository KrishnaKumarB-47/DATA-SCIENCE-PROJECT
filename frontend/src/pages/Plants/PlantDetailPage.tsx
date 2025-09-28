import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const PlantDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Plant Detail - {id}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Detailed view for individual plant management
      </p>
    </div>
  );
};

export default PlantDetailPage;
