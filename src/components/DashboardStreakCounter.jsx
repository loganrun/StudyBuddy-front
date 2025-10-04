import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Flame, Trophy, Calendar, Target, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const DashboardStreakCounter = forwardRef(({ 
  darkMode = false, 
  className = "",
  showAnimation = true,
  size = "normal",
  current = 0,
  longest = 0,
  lastStudyDate = null,
  userId = null
}, ref) => {
  const [streakData, setStreakData] = useState({
    current: 0,
    longest: 0,
    lastStudyDate: null,
    missedDays: 0,
    isActive: true
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const updateActivities = import.meta.env.VITE_UPDATE_ACTIVITIES;

  // Theme configuration
  const theme = {
    light: {
      bg: 'bg-white/90',
      border: 'border-gray-300',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      streakBg: 'bg-orange-100',
      streakText: 'text-orange-800',
      graceBg: 'bg-yellow-100',
      graceText: 'text-yellow-800',
      celebrationBg: 'bg-green-100',
      celebrationText: 'text-green-800'
    },
    dark: {
      bg: 'bg-gray-800/90',
      border: 'border-gray-600',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      streakBg: 'bg-orange-900/50',
      streakText: 'text-orange-200',
      graceBg: 'bg-yellow-900/50',
      graceText: 'text-yellow-200',
      celebrationBg: 'bg-green-900/50',
      celebrationText: 'text-green-200'
    }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'p-3',
      title: 'text-sm',
      number: 'text-2xl',
      subtitle: 'text-xs',
      icon: 'h-4 w-4',
      spacing: 'space-y-2'
    },
    normal: {
      container: 'p-4',
      title: 'text-base',
      number: 'text-3xl',
      subtitle: 'text-sm',
      icon: 'h-5 w-5',
      spacing: 'space-y-3'
    },
    large: {
      container: 'p-6',
      title: 'text-lg',
      number: 'text-4xl',
      subtitle: 'text-base',
      icon: 'h-6 w-6',
      spacing: 'space-y-4'
    }
  };

  const currentSize = sizeConfig[size];

  // Load streak data from props when they change
  useEffect(() => {
    console.log('DashboardStreakCounter props:', { current, longest, lastStudyDate, userId });
    if (current !== undefined && longest !== undefined) {
      const calculatedMissedDays = calculateMissedDays(lastStudyDate);
      const newData = {
        current: current || 0,
        longest: longest || 0,
        lastStudyDate: lastStudyDate,
        missedDays: calculatedMissedDays,
        isActive: calculatedMissedDays <= 3
      };
      console.log('Setting dashboard streak data:', newData);
      setStreakData(newData);
    }
  }, [current, longest, lastStudyDate, userId]);

  // Auto-update streak when user visits dashboard (indicates study activity)
  useEffect(() => {
    const checkAndUpdateStreak = () => {
      if (!userId || !streakData.lastStudyDate) return;
      
      const today = new Date().toDateString();
      const lastStudy = streakData.lastStudyDate ? new Date(streakData.lastStudyDate).toDateString() : null;
      
      // If they haven't studied today, update their streak (visiting dashboard counts as activity)
      if (lastStudy !== today) {
        console.log('Dashboard activity detected - updating overall streak');
        updateStreak();
      }
    };

    // Only run after initial data is loaded and user is actively on dashboard
    if (streakData.current !== undefined && streakData.lastStudyDate !== undefined) {
      // Wait a few seconds to ensure they're actively using the app, not just passing through
      const timeoutId = setTimeout(checkAndUpdateStreak, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [streakData.current, streakData.lastStudyDate, userId]);

  // Calculate missed days since last study
  const calculateMissedDays = (lastDate) => {
    if (!lastDate) return 0;
    
    const today = new Date();
    const lastStudy = new Date(lastDate);
    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysDiff);
  };

  // Encouraging messages based on streak length
  const getEncouragementMessage = (streak) => {
    if (streak === 0) return "Ready to start your learning journey? 🚀";
    if (streak === 1) return "Great start! Keep it up! 💪";
    if (streak <= 3) return "Building momentum! 🌟";
    if (streak <= 7) return "You're on fire! 🔥";
    if (streak <= 14) return "Incredible consistency! 🎯";
    if (streak <= 30) return "Study champion! 🏆";
    if (streak <= 60) return "Legendary dedication! 👑";
    return "Study master! You're unstoppable! 🌟";
  };

  // Get grace period status
  const getGracePeriodStatus = () => {
    if (streakData.missedDays === 1) {
      return {
        show: true,
        message: "1 day missed - you're still in the grace period! 💫",
        icon: AlertTriangle
      };
    }
    if (streakData.missedDays === 2) {
      return {
        show: true,
        message: "2 days missed - study today to keep your streak! ⚡",
        icon: AlertTriangle
      };
    }
    if (streakData.missedDays === 3) {
      return {
        show: true,
        message: "Last chance! Study today to save your streak! 🚨",
        icon: AlertTriangle
      };
    }
    return { show: false };
  };

  const gracePeriodStatus = getGracePeriodStatus();

  // Manual streak update function (can be called from parent)
  const updateStreak = async () => {
    if (!userId) {
      console.error('Cannot update streak: userId is required');
      return;
    }

    if (!updateActivities) {
      console.error('Cannot update streak: VITE_UPDATE_ACTIVITIES environment variable not set');
      return;
    }

    const today = new Date().toDateString();
    const lastStudy = streakData.lastStudyDate ? new Date(streakData.lastStudyDate).toDateString() : null;
    console.log('Updating dashboard streak:', { today, lastStudy, rawLastStudy: streakData.lastStudyDate });
    if (lastStudy === today) {
      // Already studied today
      console.log('Already studied today - skipping update');
      return;
    }
 
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newCurrent = streakData.current;
    let newLongest = streakData.longest;

    if (lastStudy === yesterdayStr || streakData.current === 0) {
      // Consecutive day or first day
      newCurrent += 1;
    } else {
      // Gap in studying
      const lastDate = new Date(streakData.lastStudyDate);
      const daysDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 3) {
        // Within grace period
        newCurrent += 1;
      } else {
        // Streak broken
        newCurrent = 1;
      }
    }

    // Update longest streak
    if (newCurrent > newLongest) {
      newLongest = newCurrent;
      
      // Show celebration for new record
      if (showAnimation && newCurrent > 1) {
        setCelebrationMessage(`New record! ${newCurrent} days! 🎉`);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } else if (showAnimation && [3, 7, 14, 30, 60, 100].includes(newCurrent)) {
      // Show celebration for milestones
      setCelebrationMessage(`${newCurrent} day milestone! 🏆`);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    // Update local state
    const updatedData = {
      current: newCurrent,
      longest: newLongest,
      lastStudyDate: today,
      missedDays: 0,
      isActive: true
    };
    
    setStreakData(updatedData);

    // Save to backend
    try {
      const submissionData = {
        current: newCurrent,
        longest: newLongest,
        lastStudyDate: today
      };

      console.log('Updating dashboard streak:', {
        url: `${updateActivities}/user/${userId}`,
        data: submissionData,
        userId
      });

      const response = await axios.put(`${updateActivities}/user/${userId}`, submissionData);
      console.log('Dashboard streak updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating dashboard streak:', error.response?.data || error.message);
    }
  };

  // Expose updateStreak to parent component
  useImperativeHandle(ref, () => ({
    updateStreak
  }));

  return (
    <div className={`${currentTheme.bg} backdrop-blur-md rounded-2xl ${currentSize.container} shadow-lg border ${currentTheme.border} relative ${className}`}>
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl animate-pulse">
          <div className={`${currentTheme.celebrationBg} ${currentTheme.celebrationText} px-4 py-2 rounded-lg font-medium text-center shadow-lg`}>
            {celebrationMessage}
          </div>
        </div>
      )}

      <div className={currentSize.spacing}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`${currentSize.icon} ${currentTheme.streakText}`} />
            <span className={`font-semibold ${currentSize.title} ${currentTheme.text}`}>
              Overall Streak
            </span>
          </div>
          {streakData.longest > 0 && (
            <div className="flex items-center gap-1">
              <Trophy className={`h-4 w-4 ${currentTheme.textSecondary}`} />
              <span className={`text-xs ${currentTheme.textSecondary}`}>
                Best: {streakData.longest}
              </span>
            </div>
          )}
        </div>

        {/* Current Streak */}
        <div className="text-center">
          <div className={`${currentSize.number} font-bold ${currentTheme.streakText} flex items-center justify-center gap-2`}>
            <span>{streakData.current}</span>
            {streakData.current > 0 && (
              <span className="animate-bounce">🔥</span>
            )}
          </div>
          <div className={`${currentSize.subtitle} ${currentTheme.textSecondary}`}>
            {streakData.current === 1 ? 'day streak' : 'days streak'}
          </div>
        </div>

        {/* Encouragement Message */}
        <div className={`text-center ${currentSize.subtitle} ${currentTheme.textSecondary}`}>
          {getEncouragementMessage(streakData.current)}
        </div>

        {/* Grace Period Warning */}
        {gracePeriodStatus.show && (
          <div className={`${currentTheme.graceBg} ${currentTheme.graceText} border rounded-lg p-2 flex items-center gap-2`}>
            <gracePeriodStatus.icon className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs">{gracePeriodStatus.message}</span>
          </div>
        )}

        {/* Last Study Date */}
        {streakData.lastStudyDate && (
          <div className="flex items-center justify-center gap-2 text-xs">
            <Calendar className={`h-3 w-3 ${currentTheme.textSecondary}`} />
            <span className={currentTheme.textSecondary}>
              Last studied: {new Date(streakData.lastStudyDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Progress to Next Milestone */}
        {streakData.current > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className={currentTheme.textSecondary}>Next milestone</span>
              <span className={currentTheme.textSecondary}>
                {streakData.current < 7 ? `${7 - streakData.current} days to 1 week` :
                 streakData.current < 30 ? `${30 - streakData.current} days to 1 month` :
                 streakData.current < 100 ? `${100 - streakData.current} days to 100 days` :
                 'You\'re a legend! 🌟'}
              </span>
            </div>
            {streakData.current < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${streakData.current < 7 ? (streakData.current / 7) * 100 :
                            streakData.current < 30 ? ((streakData.current - 7) / 23) * 100 :
                            ((streakData.current - 30) / 70) * 100}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

DashboardStreakCounter.displayName = 'DashboardStreakCounter';

export default DashboardStreakCounter;