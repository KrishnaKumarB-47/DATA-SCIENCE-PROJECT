import React from 'react';
import { motion } from 'framer-motion';

const RemindersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Reminders
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Manage your plant care reminders and tasks
      </p>
    </div>
  );
};

export default RemindersPage;
