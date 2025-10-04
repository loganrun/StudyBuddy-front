import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';


const BrainBreakTimer = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef(null);
  const startTimeoutRef = useRef(null);
  const user = useSelector((state) => state.auth.user?.payload?.user);
  const grade = user.grade;
  //console.log("User grade from Redux:", grade);

  // Determine timer duration based on grade level
  const getTimerDuration = () => {
    if (typeof grade === 'string') {
      const gradeNum = grade.toLowerCase();
      if (gradeNum === 'k' || ['1', '2', '3', '4', '5'].includes(gradeNum)) {
        return 15 * 60; // 15 minutes in seconds
    } else if (['6', '7', '8', '9'].includes(gradeNum)) {
        return 25 * 60; // 25 minutes in seconds
    }
    }
    if (typeof grade === 'number') {
      if (grade <= 5) {
        return 15 * 60;
    } else if (grade <= 9) {
        return 25 * 60;
    }
    }
    return 30 * 60; // 30 minutes default
  };

  const totalDuration = getTimerDuration(grade);

  // Initialize timer after 10 seconds
  useEffect(() => {
    setTimeLeft(totalDuration);
    
    // Start countdown after 10 seconds
    startTimeoutRef.current = setTimeout(() => {
      setIsRunning(true);
      setHasStarted(true);
    }, 10000);

    // Cleanup on unmount (resets timer when navigating away)
    return () => {
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [totalDuration]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowPopup(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handlePause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalDuration);
    setHasStarted(false);
    setShowPopup(false);
    
    // Clear existing timeout and set new one
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
    }
    startTimeoutRef.current = setTimeout(() => {
      setIsRunning(true);
      setHasStarted(true);
    }, 10000);
  };

  const handlePopupDismiss = () => {
    setShowPopup(false);
    handleReset();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const isInitialDelay = !hasStarted && timeLeft === totalDuration;

  return (
    <>
      <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-4 shadow-lg text-white">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white mb-1">🧠 Study Break</h2>
          <p className="text-blue-100 text-sm">
            {isInitialDelay ? 'Starting in a few seconds...' : 
             `Grade ${grade} • ${Math.floor(totalDuration / 60)} minutes`}
          </p>
        </div>

        {/* Progress Circle */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ffffff40"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isInitialDelay ? "#fbbf24" : "#ffffff"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          {/* Timer display in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {isInitialDelay ? '⏳' : formatTime(timeLeft)}
              </div>
              <div className="text-xs text-blue-100 mt-1">
                {isInitialDelay ? 'Loading...' : (isRunning ? 'Running' : 'Paused')}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handlePause}
            disabled={isInitialDelay}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
              isInitialDelay 
                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                : 'bg-white/20 hover:bg-white/30 text-white shadow-md hover:shadow-lg backdrop-blur-sm'
            }`}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Pause' : 'Play'}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-semibold transition-colors shadow-md hover:shadow-lg backdrop-blur-sm"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {/* Fun encouragement */}
        <div className="text-center mt-3">
          <p className="text-blue-100 text-sm">
            {timeLeft > totalDuration * 0.5 ? '💪 Keep focusing!' : 
             timeLeft > totalDuration * 0.2 ? '🌟 Almost break time!' : 
             timeLeft > 0 ? '🎉 Break time is near!' : ''}
          </p>
        </div>
      </div>

      {/* Break Time Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-purple-800 mb-4">
              Brain Break!
            </h3>
            <p className="text-purple-600 mb-6">
              Great job focusing! Time to take a break, stretch, and recharge your brain! 🧠✨
            </p>
            <button
              onClick={handlePopupDismiss}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Thanks! Start New Timer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BrainBreakTimer;