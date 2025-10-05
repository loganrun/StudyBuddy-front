import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, ArrowRight } from 'lucide-react';

const BreakTimer = ({ 
  darkMode = false, 
  isVisible = false,
  onBreakComplete,
  className = ""
}) => {
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [showReturnReminder, setShowReturnReminder] = useState(false);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const accumulatedTimeRef = useRef(0);

  // Theme configuration
  const theme = {
    light: {
      bg: 'bg-green-50/95',
      border: 'border-green-300',
      text: 'text-green-800',
      textSecondary: 'text-green-600',
      button: 'bg-green-500 hover:bg-green-600',
      pauseButton: 'bg-orange-500 hover:bg-orange-600',
      resetButton: 'bg-gray-500 hover:bg-gray-600',
      returnReminder: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    dark: {
      bg: 'bg-green-900/50',
      border: 'border-green-600',
      text: 'text-green-200',
      textSecondary: 'text-green-300',
      button: 'bg-green-600 hover:bg-green-700',
      pauseButton: 'bg-orange-600 hover:bg-orange-700',
      resetButton: 'bg-gray-600 hover:bg-gray-700',
      returnReminder: 'bg-blue-900/50 border-blue-600 text-blue-200'
    }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if return reminder should be shown
  const shouldShowReturnReminder = (currentTime) => {
    return currentTime >= 300; // 5 minutes
  };

  // Start break timer
  const startBreak = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const sessionTime = Math.floor((now - startTimeRef.current) / 1000);
        const totalTime = accumulatedTimeRef.current + sessionTime;
        
        setTime(totalTime);
        
        // Check for return reminder
        if (shouldShowReturnReminder(totalTime) && !showReturnReminder) {
          setShowReturnReminder(true);
        }
      }, 1000);
    }
  };

  // Pause break timer
  const pauseBreak = () => {
    if (isRunning && intervalRef.current) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
      
      // Update accumulated time
      const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      accumulatedTimeRef.current += sessionTime;
    }
  };

  // Reset break timer
  const resetBreak = () => {
    setIsRunning(false);
    setTime(0);
    setShowReturnReminder(false);
    accumulatedTimeRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Return to study
  const returnToStudy = () => {
    resetBreak();
    if (onBreakComplete) {
      onBreakComplete(time);
    }
  };

  // Auto-start when component becomes visible
  useEffect(() => {
    if (isVisible && !isRunning && time === 0) {
      startBreak();
    }
  }, [isVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`${currentTheme.bg} backdrop-blur-md rounded-2xl p-4 shadow-lg border ${currentTheme.border} ${className}`}>
      {/* Return Reminder */}
      {showReturnReminder && (
        <div className={`${currentTheme.returnReminder} border rounded-lg p-3 mb-4`}>
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium text-sm">Ready to get back to studying?</span>
          </div>
          <p className="text-xs mb-2">You've had a good break! Your brain is refreshed and ready to learn.</p>
          <button 
            onClick={returnToStudy}
            className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Study
          </button>
        </div>
      )}

      {/* Break Timer Display */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coffee className={`h-5 w-5 ${currentTheme.text}`} />
          <span className={`font-semibold ${currentTheme.text}`}>Break Time</span>
        </div>
        <div className={`text-3xl font-mono font-bold ${currentTheme.text}`}>
          {formatTime(time)}
        </div>
        <div className={`text-sm ${currentTheme.textSecondary} mt-1`}>
          {isRunning ? 'Taking a break...' : time > 0 ? 'Break paused' : 'Break ready'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-2 mb-3">
        {!isRunning ? (
          <button
            onClick={startBreak}
            className={`${currentTheme.button} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-all shadow-md`}
          >
            <Play className="h-4 w-4" />
            Start Break
          </button>
        ) : (
          <button
            onClick={pauseBreak}
            className={`${currentTheme.pauseButton} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-all shadow-md`}
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        )}
        
        <button
          onClick={resetBreak}
          className={`${currentTheme.resetButton} text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-all shadow-md`}
          title="Reset break timer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Return to Study Button */}
      <button
        onClick={returnToStudy}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-md"
      >
        <ArrowRight className="h-4 w-4" />
        Return to Study
      </button>

      {/* Break Stats */}
      {time > 0 && (
        <div className={`mt-3 pt-3 border-t ${currentTheme.border}`}>
          <div className="flex justify-between text-sm">
            <span className={currentTheme.textSecondary}>Break time:</span>
            <span className={currentTheme.text}>{formatTime(time)}</span>
          </div>
          <div className="text-center mt-2">
            {time >= 300 && time < 900 && ( // 5-15 minutes
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                😌 Perfect break duration!
              </span>
            )}
            {time >= 900 && ( // 15+ minutes
              <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                ⏰ Long break - ready to focus again?
              </span>
            )}
          </div>
        </div>
      )}

      {/* Break Tips */}
      <div className={`mt-3 pt-3 border-t ${currentTheme.border}`}>
        <div className={`text-xs ${currentTheme.textSecondary} text-center`}>
          💡 Try: stretch, hydrate, or take a short walk
        </div>
      </div>
    </div>
  );
};

export default BreakTimer;