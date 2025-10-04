import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

const StudyTimer = ({ 
  notebookId, 
  darkMode = false, 
  isVisible = true,
  onBreakSuggested,
  className = ""
}) => {
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [lastBreakTime, setLastBreakTime] = useState(0);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const accumulatedTimeRef = useRef(0);
  
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user?.payload?.user);

  // Theme configuration with Brain Break styling
  const theme = {
    light: {
      bg: 'bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100',
      border: 'border-purple-300',
      text: 'text-purple-900',
      textSecondary: 'text-purple-700',
      iconColor: 'text-purple-600',
      button: 'bg-purple-500 hover:bg-purple-600',
      pauseButton: 'bg-orange-500 hover:bg-orange-600',
      resetButton: 'bg-gray-500 hover:bg-gray-600',
      breakReminder: 'bg-amber-50 border-amber-200 text-amber-800',
      timerBg: 'bg-white/80'
    },
    dark: {
      bg: 'bg-gradient-to-br from-purple-900/70 via-blue-900/50 to-indigo-900/60',
      border: 'border-purple-600',
      text: 'text-purple-100',
      textSecondary: 'text-purple-200',
      iconColor: 'text-purple-300',
      button: 'bg-purple-600 hover:bg-purple-700',
      pauseButton: 'bg-orange-600 hover:bg-orange-700',
      resetButton: 'bg-gray-600 hover:bg-gray-700',
      breakReminder: 'bg-amber-900/50 border-amber-600 text-amber-200',
      timerBg: 'bg-gray-800/80'
    }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if break reminder should be shown
  const shouldShowBreakReminder = React.useCallback((currentTime) => {
    const timeSinceLastBreak = currentTime - lastBreakTime;
    return timeSinceLastBreak >= 1500; // 25 minutes
  }, [lastBreakTime]);

  // Start timer
  const startTimer = React.useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const sessionTime = Math.floor((now - startTimeRef.current) / 1000);
        const totalTime = accumulatedTimeRef.current + sessionTime;
        
        setTime(totalTime);
        
        // Check for break reminder
        if (shouldShowBreakReminder(totalTime) && !showBreakReminder) {
          setShowBreakReminder(true);
          if (onBreakSuggested) {
            onBreakSuggested();
          }
        }
      }, 1000);
    }
  }, [isRunning, showBreakReminder, onBreakSuggested, shouldShowBreakReminder]);

  // Pause timer
  const pauseTimer = () => {
    if (isRunning && intervalRef.current) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
      
      // Update accumulated time
      const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      accumulatedTimeRef.current += sessionTime;
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    setShowBreakReminder(false);
    accumulatedTimeRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Handle break taken
  const handleBreakTaken = () => {
    setLastBreakTime(time);
    setShowBreakReminder(false);
  };

  // Save study time to localStorage
  const saveStudyTime = () => {
    if (time > 0 && notebookId) {
      const studyData = {
        notebookId,
        duration: time,
        date: new Date().toISOString(),
        userId: user?.id
      };
      
      // Save to localStorage
      const existingData = JSON.parse(localStorage.getItem('studyTimes') || '[]');
      existingData.push(studyData);
      localStorage.setItem('studyTimes', JSON.stringify(existingData));
      
      // TODO: Save to backend via Redux action
      // dispatch(saveStudyTime(studyData));
    }
  };

  // Auto-save on unmount or navigation
  useEffect(() => {
    return () => {
      if (time > 0) {
        saveStudyTime();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [time, notebookId]);

  // Auto-start timer when component mounts
  useEffect(() => {
    if (isVisible && !isRunning && time === 0) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        setIsRunning(true);
        startTimeRef.current = Date.now();
        accumulatedTimeRef.current = 0;
        
        intervalRef.current = setInterval(() => {
          const now = Date.now();
          const sessionTime = Math.floor((now - startTimeRef.current) / 1000);
          const totalTime = accumulatedTimeRef.current + sessionTime;
          
          setTime(totalTime);
          
          // Check for break reminder
          const timeSinceLastBreak = totalTime - lastBreakTime;
          if (timeSinceLastBreak >= 1500 && !showBreakReminder) { // 25 minutes
            setShowBreakReminder(true);
            if (onBreakSuggested) {
              onBreakSuggested();
            }
          }
        }, 1000);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isRunning, time, lastBreakTime, showBreakReminder, onBreakSuggested]);

  // Handle visibility change (browser tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // Browser tab is hidden, continue running but save current state
        saveStudyTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, time]);

  if (!isVisible) return null;

  return (
    <div className={`${currentTheme.bg} backdrop-blur-md rounded-2xl p-4 shadow-lg border ${currentTheme.border} ${className} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="text-4xl transform rotate-12 grid grid-cols-4 gap-4 p-2">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="animate-pulse">
              🧠
            </div>
          ))}
        </div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Break Reminder */}
        {showBreakReminder && (
          <div className={`${currentTheme.breakReminder} border rounded-lg p-3 mb-4 animate-pulse`}>
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="h-4 w-4" />
              <span className="font-medium text-sm">Time for a brain break!</span>
            </div>
            <p className="text-xs mb-2">You've been studying for 25+ minutes. Taking a break helps with retention!</p>
            <div className="flex gap-2">
              <button 
                onClick={handleBreakTaken}
                className="text-xs px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
              >
                Taking Break
              </button>
              <button 
                onClick={() => setShowBreakReminder(false)}
                className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Keep Studying
              </button>
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Brain className={`h-6 w-6 ${currentTheme.iconColor} animate-pulse`} />
            <span className={`font-bold text-lg ${currentTheme.text}`}>Brain Break</span>
          </div>
          <div className={`${currentTheme.timerBg} rounded-xl p-4 border ${currentTheme.border}`}>
            <div className={`text-3xl font-mono font-bold ${currentTheme.text} mb-1`}>
              {formatTime(time)}
            </div>
            <div className={`text-sm ${currentTheme.textSecondary}`}>
              {isRunning ? '🧠 Focused learning mode' : time > 0 ? '⏸️ Study paused' : '🚀 Getting ready...'}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="relative z-10">
        <div className="flex justify-center gap-2 mb-3">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className={`${currentTheme.button} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-all shadow-md`}
            >
              <Play className="h-4 w-4" />
              Start Focus
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className={`${currentTheme.pauseButton} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-all shadow-md`}
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className={`${currentTheme.resetButton} text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-all shadow-md`}
            title="Reset timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Study Stats */}
        {time > 0 && (
          <div className={`${currentTheme.timerBg} rounded-lg p-3 border ${currentTheme.border}`}>
            <div className="flex justify-between text-sm mb-2">
              <span className={currentTheme.textSecondary}>Focus time:</span>
              <span className={`${currentTheme.text} font-semibold`}>{formatTime(time)}</span>
            </div>
            {time >= 600 && time < 1800 && ( // 10-30 minutes
              <div className="text-center">
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                  🎯 Good momentum!
                </span>
              </div>
            )}
            {time >= 1800 && ( // 30 minutes
              <div className="text-center">
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  🧠 Brain power activated!
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;