import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface Reminder {
  _id: string;
  plant: {
    _id: string;
    name: string;
    species: string;
    image?: { url: string };
  };
  user: string;
  type: 'watering' | 'fertilizing' | 'repotting' | 'pruning' | 'checkup' | 'custom';
  title: string;
  description?: string;
  scheduledDate: string;
  frequency: 'once' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'custom';
  customFrequency?: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  isCompleted: boolean;
  completedAt?: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notifications: {
    email: {
      enabled: boolean;
      sent: boolean;
      sentAt?: string;
    };
    push: {
      enabled: boolean;
      sent: boolean;
      sentAt?: string;
    };
  };
  metadata?: {
    originalScheduleDate?: string;
    rescheduledCount?: number;
    lastRescheduledAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  daysUntil?: number;
  isOverdue?: boolean;
}

interface ReminderContextType {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  fetchReminders: (params?: any) => Promise<void>;
  addReminder: (reminderData: Partial<Reminder>) => Promise<Reminder | null>;
  updateReminder: (id: string, reminderData: Partial<Reminder>) => Promise<Reminder | null>;
  deleteReminder: (id: string) => Promise<boolean>;
  completeReminder: (id: string) => Promise<boolean>;
  rescheduleReminder: (id: string, newDate: string) => Promise<boolean>;
  getReminder: (id: string) => Reminder | null;
  getUpcomingReminders: (days?: number) => Reminder[];
  getOverdueReminders: () => Reminder[];
  getTodayReminders: () => Reminder[];
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};

interface ReminderProviderProps {
  children: ReactNode;
}

export const ReminderProvider: React.FC<ReminderProviderProps> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = async (params: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/reminders', { params });
      setReminders(response.data.reminders || []);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch reminders';
      setError(message);
      console.error('Error fetching reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReminder = async (reminderData: Partial<Reminder>): Promise<Reminder | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/reminders', reminderData);
      const newReminder = response.data.reminder;
      
      setReminders(prev => [...prev, newReminder]);
      return newReminder;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add reminder';
      setError(message);
      console.error('Error adding reminder:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReminder = async (id: string, reminderData: Partial<Reminder>): Promise<Reminder | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.put(`/reminders/${id}`, reminderData);
      const updatedReminder = response.data.reminder;
      
      setReminders(prev => prev.map(reminder => 
        reminder._id === id ? updatedReminder : reminder
      ));
      return updatedReminder;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update reminder';
      setError(message);
      console.error('Error updating reminder:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReminder = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.delete(`/reminders/${id}`);
      setReminders(prev => prev.filter(reminder => reminder._id !== id));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete reminder';
      setError(message);
      console.error('Error deleting reminder:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeReminder = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`/reminders/${id}/complete`);
      const updatedReminder = response.data.reminder;
      
      setReminders(prev => prev.map(reminder => 
        reminder._id === id ? updatedReminder : reminder
      ));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to complete reminder';
      setError(message);
      console.error('Error completing reminder:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rescheduleReminder = async (id: string, newDate: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`/reminders/${id}/reschedule`, { newDate });
      const updatedReminder = response.data.reminder;
      
      setReminders(prev => prev.map(reminder => 
        reminder._id === id ? updatedReminder : reminder
      ));
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reschedule reminder';
      setError(message);
      console.error('Error rescheduling reminder:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getReminder = (id: string): Reminder | null => {
    return reminders.find(reminder => reminder._id === id) || null;
  };

  const getUpcomingReminders = (days: number = 7): Reminder[] => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return reminders.filter(reminder => {
      const scheduledDate = new Date(reminder.scheduledDate);
      return scheduledDate >= now && 
             scheduledDate <= futureDate && 
             !reminder.isCompleted && 
             reminder.isActive;
    });
  };

  const getOverdueReminders = (): Reminder[] => {
    const now = new Date();
    
    return reminders.filter(reminder => {
      const scheduledDate = new Date(reminder.scheduledDate);
      return scheduledDate < now && 
             !reminder.isCompleted && 
             reminder.isActive;
    });
  };

  const getTodayReminders = (): Reminder[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return reminders.filter(reminder => {
      const scheduledDate = new Date(reminder.scheduledDate);
      return scheduledDate >= today && 
             scheduledDate < tomorrow && 
             !reminder.isCompleted && 
             reminder.isActive;
    });
  };

  // Load reminders on mount
  useEffect(() => {
    fetchReminders();
  }, []);

  const value: ReminderContextType = {
    reminders,
    isLoading,
    error,
    fetchReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    rescheduleReminder,
    getReminder,
    getUpcomingReminders,
    getOverdueReminders,
    getTodayReminders,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};
