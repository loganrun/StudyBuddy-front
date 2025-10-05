// hooks/useStreak.js
import { useState, useEffect, useCallback } from 'react';
import { streakService } from '../services/streakService';

export const useStreak = (userId) => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    loading: true,
    error: null
  });

  const [celebrationQueue, setCelebrationQueue] = useState([]);

  const recordActivity = useCallback(async (activityType, metadata = {}) => {
    try {
      const result = await streakService.recordActivity(userId, activityType, metadata);
      
      setStreakData(prev => ({
        ...prev,
        currentStreak: result.currentStreak,
        longestStreak: result.longestStreak,
        lastActivityDate: result.lastActivityDate
      }));

      // Queue celebration if milestone reached
      if (result.celebrationData) {
        setCelebrationQueue(prev => [...prev, result.celebrationData]);
      }

      return result;
    } catch (error) {
      setStreakData(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, [userId]);

  const dismissCelebration = useCallback(() => {
    setCelebrationQueue(prev => prev.slice(1));
  }, []);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const data = await streakService.getStreak(userId);
        setStreakData({ ...data, loading: false, error: null });
      } catch (error) {
        setStreakData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
      }
    };

    if (userId) {
      fetchStreakData();
    }
  }, [userId]);

  return {
    ...streakData,
    recordActivity,
    celebrationQueue,
    dismissCelebration
  };
};