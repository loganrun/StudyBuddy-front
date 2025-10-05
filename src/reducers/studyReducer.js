import {
  START_STUDY_SESSION,
  END_STUDY_SESSION,
  PAUSE_STUDY_SESSION,
  RESUME_STUDY_SESSION,
  TAKE_BREAK,
  RESUME_FROM_BREAK,
  UPDATE_STREAK,
  GET_STREAK_STATUS,
  RESET_STREAK,
  GET_STUDY_STATS,
  UPDATE_STUDY_TIME,
  CLEAR_STUDY_STATS,
  STUDY_API_REQUEST,
  STUDY_API_SUCCESS,
  STUDY_API_ERROR
} from '../redux/actions/studyActions';

const initialState = {
  // Current study session
  currentSession: {
    notebookId: null,
    startTime: null,
    pauseTime: null,
    isActive: false,
    isPaused: false,
    onBreak: false,
    breakStartTime: null,
    totalBreakTime: 0,
    breakCount: 0
  },
  
  // Streak tracking
  streak: {
    current: 0,
    longest: 0,
    lastStudyDate: null,
    missedDays: 0,
    isActive: true,
    gracePeriod: false
  },
  
  // Study statistics per notebook
  notebooks: {},
  
  // API state
  loading: false,
  error: null,
  lastSynced: null
};

const studyReducer = (state = initialState, action) => {
  switch (action.type) {
    // Session Management
    case START_STUDY_SESSION:
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          notebookId: action.payload.notebookId,
          startTime: action.payload.startTime,
          isActive: true,
          isPaused: false,
          onBreak: false,
          pauseTime: null
        },
        error: null
      };

    case END_STUDY_SESSION:
      const { notebookId, duration, breakCount } = action.payload;
      const sessionData = {
        date: new Date().toISOString(),
        duration,
        breakCount,
        endTime: action.payload.endTime
      };

      // Update notebook stats
      const currentNotebook = state.notebooks[notebookId] || {
        totalTime: 0,
        todayTime: 0,
        sessions: [],
        lastStudied: null
      };

      // Calculate today's time
      const today = new Date().toDateString();
      const isToday = new Date(sessionData.date).toDateString() === today;
      
      const updatedNotebook = {
        ...currentNotebook,
        totalTime: currentNotebook.totalTime + duration,
        todayTime: isToday ? currentNotebook.todayTime + duration : currentNotebook.todayTime,
        sessions: [...currentNotebook.sessions, sessionData],
        lastStudied: sessionData.date
      };

      return {
        ...state,
        currentSession: {
          ...initialState.currentSession
        },
        notebooks: {
          ...state.notebooks,
          [notebookId]: updatedNotebook
        }
      };

    case PAUSE_STUDY_SESSION:
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          isPaused: true,
          pauseTime: action.payload.pauseTime
        }
      };

    case RESUME_STUDY_SESSION:
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          isPaused: false,
          pauseTime: null
        }
      };

    case TAKE_BREAK:
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          onBreak: true,
          breakStartTime: action.payload.breakStartTime,
          breakCount: state.currentSession.breakCount + 1
        }
      };

    case RESUME_FROM_BREAK:
      const breakDuration = action.payload.breakEndTime - state.currentSession.breakStartTime;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          onBreak: false,
          breakStartTime: null,
          totalBreakTime: state.currentSession.totalBreakTime + breakDuration
        }
      };

    // Streak Management
    case UPDATE_STREAK:
      return {
        ...state,
        streak: {
          ...state.streak,
          ...action.payload
        }
      };

    case GET_STREAK_STATUS:
      // This would typically be handled by middleware for API calls
      return state;

    case RESET_STREAK:
      return {
        ...state,
        streak: {
          ...initialState.streak,
          longest: state.streak.longest // Preserve longest streak
        }
      };

    // Statistics Management
    case GET_STUDY_STATS:
      // This would typically trigger an API call
      return state;

    case UPDATE_STUDY_TIME:
      const { notebookId: statsNotebookId, duration: statsDuration, sessionData: statsSessionData } = action.payload;
      
      const existingNotebook = state.notebooks[statsNotebookId] || {
        totalTime: 0,
        todayTime: 0,
        sessions: [],
        lastStudied: null
      };

      const todayStr = new Date().toDateString();
      const isSessionToday = new Date(statsSessionData.date).toDateString() === todayStr;

      const updatedStatsNotebook = {
        ...existingNotebook,
        totalTime: existingNotebook.totalTime + statsDuration,
        todayTime: isSessionToday ? existingNotebook.todayTime + statsDuration : existingNotebook.todayTime,
        sessions: [...existingNotebook.sessions, { ...statsSessionData, duration: statsDuration }],
        lastStudied: statsSessionData.date
      };

      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [statsNotebookId]: updatedStatsNotebook
        }
      };

    case CLEAR_STUDY_STATS:
      const { notebookId: clearNotebookId } = action.payload;
      const { [clearNotebookId]: removed, ...remainingNotebooks } = state.notebooks;
      
      return {
        ...state,
        notebooks: remainingNotebooks
      };

    // API State Management
    case STUDY_API_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case STUDY_API_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        lastSynced: Date.now()
      };

    case STUDY_API_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

// Selectors
export const selectCurrentSession = (state) => state.study?.currentSession || initialState.currentSession;
export const selectStreak = (state) => state.study?.streak || initialState.streak;
export const selectNotebookStats = (state, notebookId) => 
  state.study?.notebooks?.[notebookId] || {
    totalTime: 0,
    todayTime: 0,
    sessions: [],
    lastStudied: null
  };
export const selectAllNotebookStats = (state) => state.study?.notebooks || {};
export const selectStudyLoading = (state) => state.study?.loading || false;
export const selectStudyError = (state) => state.study?.error;

// Helper function to calculate streak from session data
export const calculateStreakFromSessions = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return { current: 0, longest: 0, lastStudyDate: null, missedDays: 0, isActive: false };
  }

  // Sort sessions by date
  const sortedSessions = sessions
    .map(session => ({
      ...session,
      date: new Date(session.date).toDateString()
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group by date and calculate daily totals
  const dailyTotals = {};
  sortedSessions.forEach(session => {
    if (!dailyTotals[session.date]) {
      dailyTotals[session.date] = 0;
    }
    dailyTotals[session.date] += session.duration;
  });

  // Filter days with at least 10 minutes of study (600 seconds)
  const studyDays = Object.keys(dailyTotals)
    .filter(date => dailyTotals[date] >= 600)
    .sort((a, b) => new Date(a) - new Date(b));

  if (studyDays.length === 0) {
    return { current: 0, longest: 0, lastStudyDate: null, missedDays: 0, isActive: false };
  }

  // Calculate current streak
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const lastStudyDate = studyDays[studyDays.length - 1];
  
  // Check if streak is still active
  const isActive = lastStudyDate === today || lastStudyDate === yesterday;
  
  // Calculate streaks
  for (let i = 0; i < studyDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = new Date(studyDays[i]);
      const previousDate = new Date(studyDays[i - 1]);
      const dayDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else if (dayDiff <= 3) {
        // Grace period: count as continuation if within 3 days
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Current streak is the streak ending on the last study day
    if (i === studyDays.length - 1) {
      currentStreak = tempStreak;
    }
  }

  // Calculate missed days
  const lastDate = new Date(lastStudyDate);
  const todayDate = new Date();
  const missedDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

  return {
    current: isActive ? currentStreak : 0,
    longest: longestStreak,
    lastStudyDate,
    missedDays: Math.max(0, missedDays),
    isActive
  };
};

export default studyReducer;