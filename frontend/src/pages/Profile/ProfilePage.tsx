import React from 'react';
import { motion } from 'framer-motion';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Profile
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Manage your account settings and preferences
      </p>
    </div>
  );
};

export default ProfilePage;
