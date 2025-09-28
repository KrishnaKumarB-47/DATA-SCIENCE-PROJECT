import React from 'react';
import { motion } from 'framer-motion';

const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Calendar
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        View your plant care schedule in calendar format
      </p>
    </div>
  );
};

export default CalendarPage;
