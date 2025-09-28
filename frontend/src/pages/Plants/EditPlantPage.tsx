import React from 'react';
import { useParams } from 'react-router-dom';

const EditPlantPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Edit Plant - {id}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Edit plant information and care settings
      </p>
    </div>
  );
};

export default EditPlantPage;
