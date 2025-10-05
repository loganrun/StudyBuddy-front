import React, { useState, useEffect } from 'react';
import { Clock, Target, Award, TrendingUp, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';

const StudyStats = ({ 
  notebookId,
  darkMode = false, 
  className = "",
  showMilestones = true,
  size = "normal" // "small", "normal", "large"
}) => {
  const [stats, setStats] = useState({
    totalTime: 0, // in seconds
    todayTime: 0, // in seconds
    sessionCount: 0,
    averageSession: 0,
    longestSession: 0,
    lastStudied: null
  });
  
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState('');

  const user = useSelector((state) => state.auth.user?.payload?.user);

  // Theme configuration
  const theme = {
    light: {
      bg: 'bg-white/90',
      border: 'border-gray-300',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      statBg: 'bg-blue-50',
      statText: 'text-blue-800',
      milestoneBg: 'bg-purple-50',
      milestoneText: 'text-purple-800',
      progressBg: 'bg-gray-200',
      progressFill: 'bg-blue-500'
    },
    dark: {
      bg: 'bg-gray-800/90',
      border: 'border-gray-600',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      statBg: 'bg-blue-900/50',
      statText: 'text-blue-200',
      milestoneBg: 'bg-purple-900/50',
      milestoneText: 'text-purple-200',
      progressBg: 'bg-gray-700',
      progressFill: 'bg-blue-400'
    }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'p-3',
      title: 'text-sm',
      statNumber: 'text-lg',
      statLabel: 'text-xs',
      icon: 'h-4 w-4',
      spacing: 'space-y-2'
    },
    normal: {
      container: 'p-4',
      title: 'text-base',
      statNumber: 'text-xl',
      statLabel: 'text-sm',
      icon: 'h-5 w-5',
      spacing: 'space-y-3'
    },
    large: {
      container: 'p-6',
      title: 'text-lg',
      statNumber: 'text-2xl',
      statLabel: 'text-base',
      icon: 'h-6 w-6',
      spacing: 'space-y-4'
    }
  };

  const currentSize = sizeConfig[size];

  // Format time as hours and minutes
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Get milestone data
  const getMilestones = () => [
    { threshold: 1800, label: '30 min', emoji: '⏰', message: 'Great start! First 30 minutes!' },
    { threshold: 3600, label: '1 hour', emoji: '🎯', message: 'Awesome! One hour of focus!' },
    { threshold: 18000, label: '5 hours', emoji: '🌟', message: 'Impressive! 5 hours of dedication!' },
    { threshold: 36000, label: '10 hours', emoji: '🏆', message: 'Outstanding! 10 hours achieved!' },
    { threshold: 90000, label: '25 hours', emoji: '👑', message: 'Legendary! 25 hours mastered!' },
    { threshold: 180000, label: '50 hours', emoji: '🎉', message: 'Incredible! 50 hours conquered!' },
    { threshold: 360000, label: '100 hours', emoji: '🌈', message: 'Phenomenal! 100 hours milestone!' }
  ];

  // Check for milestone achievement
  const checkMilestone = (newTotalTime, oldTotalTime) => {
    const milestones = getMilestones();
    
    for (const milestone of milestones) {
      if (newTotalTime >= milestone.threshold && oldTotalTime < milestone.threshold) {
        if (showMilestones) {
          setMilestoneMessage(`${milestone.emoji} ${milestone.message}`);
          setShowMilestone(true);
          setTimeout(() => setShowMilestone(false), 4000);
        }
        break;
      }
    }
  };

  // Load stats from localStorage
  const loadStats = () => {
    try {
      const studyTimes = JSON.parse(localStorage.getItem('studyTimes') || '[]');
      const notebookStudyTimes = studyTimes.filter(session => 
        session.notebookId === notebookId && session.userId === user?.id
      );

      if (notebookStudyTimes.length === 0) {
        setStats({
          totalTime: 0,
          todayTime: 0,
          sessionCount: 0,
          averageSession: 0,
          longestSession: 0,
          lastStudied: null
        });
        return;
      }

      const totalTime = notebookStudyTimes.reduce((sum, session) => sum + session.duration, 0);
      const sessionCount = notebookStudyTimes.length;
      const averageSession = Math.floor(totalTime / sessionCount);
      const longestSession = Math.max(...notebookStudyTimes.map(session => session.duration));

      // Calculate today's time
      const today = new Date().toDateString();
      const todayTime = notebookStudyTimes
        .filter(session => new Date(session.date).toDateString() === today)
        .reduce((sum, session) => sum + session.duration, 0);

      // Get last studied date
      const lastStudied = notebookStudyTimes.length > 0 
        ? new Date(Math.max(...notebookStudyTimes.map(session => new Date(session.date))))
        : null;

      setStats({
        totalTime,
        todayTime,
        sessionCount,
        averageSession,
        longestSession,
        lastStudied
      });

    } catch (error) {
      console.error('Error loading study stats:', error);
    }
  };

  // Update stats when new study time is recorded
  const updateStats = (newDuration) => {
    const oldTotalTime = stats.totalTime;
    const newTotalTime = oldTotalTime + newDuration;
    
    setStats(prev => ({
      ...prev,
      totalTime: newTotalTime,
      todayTime: prev.todayTime + newDuration,
      sessionCount: prev.sessionCount + 1,
      averageSession: Math.floor(newTotalTime / (prev.sessionCount + 1)),
      longestSession: Math.max(prev.longestSession, newDuration),
      lastStudied: new Date()
    }));

    // Check for milestone
    checkMilestone(newTotalTime, oldTotalTime);
  };

  // Get next milestone
  const getNextMilestone = () => {
    const milestones = getMilestones();
    return milestones.find(milestone => milestone.threshold > stats.totalTime);
  };

  // Get progress to next milestone
  const getMilestoneProgress = () => {
    const nextMilestone = getNextMilestone();
    if (!nextMilestone) return { progress: 100, label: 'All milestones achieved! 🌟' };

    const previousThreshold = getMilestones()
      .filter(m => m.threshold <= stats.totalTime)
      .pop()?.threshold || 0;

    const progress = ((stats.totalTime - previousThreshold) / (nextMilestone.threshold - previousThreshold)) * 100;
    const remaining = nextMilestone.threshold - stats.totalTime;

    return {
      progress: Math.min(progress, 100),
      label: `${formatTime(remaining)} to ${nextMilestone.label}`,
      milestone: nextMilestone
    };
  };

  // Load stats on mount and when notebookId changes
  useEffect(() => {
    if (notebookId) {
      loadStats();
    }
  }, [notebookId, user?.id]);

  // Listen for study time updates
  useEffect(() => {
    const handleStudyTimeUpdate = (event) => {
      if (event.detail.notebookId === notebookId) {
        updateStats(event.detail.duration);
      }
    };

    window.addEventListener('studyTimeRecorded', handleStudyTimeUpdate);
    return () => window.removeEventListener('studyTimeRecorded', handleStudyTimeUpdate);
  }, [notebookId, stats.totalTime]);

  const milestoneProgress = getMilestoneProgress();

  return (
    <div className={`${currentTheme.bg} backdrop-blur-md rounded-2xl ${currentSize.container} shadow-lg border ${currentTheme.border} relative ${className}`}>
      {/* Milestone Celebration */}
      {showMilestone && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl animate-pulse">
          <div className={`${currentTheme.milestoneBg} ${currentTheme.milestoneText} px-4 py-2 rounded-lg font-medium text-center shadow-lg`}>
            {milestoneMessage}
          </div>
        </div>
      )}

      <div className={currentSize.spacing}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <TrendingUp className={`${currentSize.icon} ${currentTheme.statText}`} />
          <span className={`font-semibold ${currentSize.title} ${currentTheme.text}`}>
            Study Statistics
          </span>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Time */}
          <div className={`${currentTheme.statBg} rounded-lg p-3 text-center`}>
            <Clock className={`${currentSize.icon} ${currentTheme.statText} mx-auto mb-1`} />
            <div className={`${currentSize.statNumber} font-bold ${currentTheme.statText}`}>
              {formatTime(stats.totalTime)}
            </div>
            <div className={`${currentSize.statLabel} ${currentTheme.textSecondary}`}>
              Total Time
            </div>
          </div>

          {/* Today's Time */}
          <div className={`${currentTheme.statBg} rounded-lg p-3 text-center`}>
            <Calendar className={`${currentSize.icon} ${currentTheme.statText} mx-auto mb-1`} />
            <div className={`${currentSize.statNumber} font-bold ${currentTheme.statText}`}>
              {formatTime(stats.todayTime)}
            </div>
            <div className={`${currentSize.statLabel} ${currentTheme.textSecondary}`}>
              Today
            </div>
          </div>

          {/* Session Count */}
          <div className={`${currentTheme.statBg} rounded-lg p-3 text-center`}>
            <Target className={`${currentSize.icon} ${currentTheme.statText} mx-auto mb-1`} />
            <div className={`${currentSize.statNumber} font-bold ${currentTheme.statText}`}>
              {stats.sessionCount}
            </div>
            <div className={`${currentSize.statLabel} ${currentTheme.textSecondary}`}>
              Sessions
            </div>
          </div>

          {/* Average Session */}
          <div className={`${currentTheme.statBg} rounded-lg p-3 text-center`}>
            <Award className={`${currentSize.icon} ${currentTheme.statText} mx-auto mb-1`} />
            <div className={`${currentSize.statNumber} font-bold ${currentTheme.statText}`}>
              {formatTime(stats.averageSession)}
            </div>
            <div className={`${currentSize.statLabel} ${currentTheme.textSecondary}`}>
              Average
            </div>
          </div>
        </div>

        {/* Milestone Progress */}
        {showMilestones && milestoneProgress.milestone && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`${currentSize.statLabel} ${currentTheme.textSecondary}`}>
                Next Milestone
              </span>
              <span className={`${currentSize.statLabel} ${currentTheme.text} font-medium`}>
                {milestoneProgress.milestone.emoji} {milestoneProgress.milestone.label}
              </span>
            </div>
            <div className={`w-full ${currentTheme.progressBg} rounded-full h-2`}>
              <div 
                className={`${currentTheme.progressFill} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${milestoneProgress.progress}%` }}
              ></div>
            </div>
            <div className={`text-center ${currentSize.statLabel} ${currentTheme.textSecondary}`}>
              {milestoneProgress.label}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {stats.longestSession > 0 && (
          <div className="flex justify-between text-xs border-t pt-2">
            <div>
              <span className={currentTheme.textSecondary}>Longest: </span>
              <span className={currentTheme.text}>{formatTime(stats.longestSession)}</span>
            </div>
            {stats.lastStudied && (
              <div>
                <span className={currentTheme.textSecondary}>Last: </span>
                <span className={currentTheme.text}>
                  {stats.lastStudied.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyStats;