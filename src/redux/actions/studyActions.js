// Study Actions for Timer and Streak Components

// Timer action types
export const START_STUDY_SESSION = 'START_STUDY_SESSION';
export const END_STUDY_SESSION = 'END_STUDY_SESSION';
export const PAUSE_STUDY_SESSION = 'PAUSE_STUDY_SESSION';
export const RESUME_STUDY_SESSION = 'RESUME_STUDY_SESSION';
export const TAKE_BREAK = 'TAKE_BREAK';
export const RESUME_FROM_BREAK = 'RESUME_FROM_BREAK';

// Streak action types
export const UPDATE_STREAK = 'UPDATE_STREAK';
export const GET_STREAK_STATUS = 'GET_STREAK_STATUS';
export const RESET_STREAK = 'RESET_STREAK';

// Stats action types
export const GET_STUDY_STATS = 'GET_STUDY_STATS';
export const UPDATE_STUDY_TIME = 'UPDATE_STUDY_TIME';
export const CLEAR_STUDY_STATS = 'CLEAR_STUDY_STATS';

// API action types
export const STUDY_API_REQUEST = 'STUDY_API_REQUEST';
export const STUDY_API_SUCCESS = 'STUDY_API_SUCCESS';
export const STUDY_API_ERROR = 'STUDY_API_ERROR';

// Timer Actions
export const startStudySession = (notebookId) => ({
  type: START_STUDY_SESSION,
  payload: {
    notebookId,
    startTime: Date.now(),
    isActive: true
  }
});

export const endStudySession = (notebookId, duration, breakCount = 0) => ({
  type: END_STUDY_SESSION,
  payload: {
    notebookId,
    duration, // in seconds
    endTime: Date.now(),
    breakCount,
    isActive: false
  }
});

export const pauseStudySession = () => ({
  type: PAUSE_STUDY_SESSION,
  payload: {
    pauseTime: Date.now()
  }
});

export const resumeStudySession = () => ({
  type: RESUME_STUDY_SESSION,
  payload: {
    resumeTime: Date.now()
  }
});

export const takeBreak = (duration) => ({
  type: TAKE_BREAK,
  payload: {
    duration, // break duration in seconds
    breakStartTime: Date.now(),
    onBreak: true
  }
});

export const resumeFromBreak = () => ({
  type: RESUME_FROM_BREAK,
  payload: {
    onBreak: false,
    breakEndTime: Date.now()
  }
});

// Streak Actions
export const updateStreak = (activityData) => ({
  type: UPDATE_STREAK,
  payload: activityData
});

export const getStreakStatus = (userId) => ({
  type: GET_STREAK_STATUS,
  payload: { userId }
});

export const resetStreak = (reason = 'manual') => ({
  type: RESET_STREAK,
  payload: { reason, resetTime: Date.now() }
});

// Stats Actions
export const getStudyStats = (notebookId, userId) => ({
  type: GET_STUDY_STATS,
  payload: { notebookId, userId }
});

export const updateStudyTime = (notebookId, duration, sessionData = {}) => ({
  type: UPDATE_STUDY_TIME,
  payload: {
    notebookId,
    duration,
    sessionData: {
      date: new Date().toISOString(),
      ...sessionData
    }
  }
});

export const clearStudyStats = (notebookId) => ({
  type: CLEAR_STUDY_STATS,
  payload: { notebookId }
});

// Async Actions (for API calls)
export const saveStudySessionToAPI = (sessionData) => {
  return async (dispatch, getState) => {
    dispatch({ type: STUDY_API_REQUEST });
    
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/study/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getState().auth.token}`
        },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      dispatch({
        type: STUDY_API_SUCCESS,
        payload: data
      });
      
      // Also update local state
      dispatch(updateStudyTime(sessionData.notebookId, sessionData.duration, sessionData));
      
      return data;
      
    } catch (error) {
      dispatch({
        type: STUDY_API_ERROR,
        payload: error.message
      });
      
      // Fall back to local storage
      const existingData = JSON.parse(localStorage.getItem('studyTimes') || '[]');
      existingData.push(sessionData);
      localStorage.setItem('studyTimes', JSON.stringify(existingData));
      
      console.warn('API call failed, saved to localStorage:', error.message);
      throw error;
    }
  };
};

export const saveStreakToAPI = (streakData) => {
  return async (dispatch, getState) => {
    dispatch({ type: STUDY_API_REQUEST });
    
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/study/streak', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getState().auth.token}`
        },
        body: JSON.stringify(streakData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      dispatch({
        type: STUDY_API_SUCCESS,
        payload: data
      });
      
      // Update local state
      dispatch(updateStreak(data));
      
      return data;
      
    } catch (error) {
      dispatch({
        type: STUDY_API_ERROR,
        payload: error.message
      });
      
      // Fall back to local storage
      localStorage.setItem('studyStreak', JSON.stringify(streakData));
      
      console.warn('Streak API call failed, saved to localStorage:', error.message);
      throw error;
    }
  };
};

export const fetchStudyStats = (notebookId, userId) => {
  return async (dispatch, getState) => {
    dispatch({ type: STUDY_API_REQUEST });
    
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch(`/api/study/stats/${notebookId}?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${getState().auth.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      dispatch({
        type: STUDY_API_SUCCESS,
        payload: data
      });
      
      dispatch(getStudyStats(notebookId, userId));
      
      return data;
      
    } catch (error) {
      dispatch({
        type: STUDY_API_ERROR,
        payload: error.message
      });
      
      // Fall back to local storage
      const studyTimes = JSON.parse(localStorage.getItem('studyTimes') || '[]');
      const notebookStats = studyTimes.filter(session => 
        session.notebookId === notebookId && session.userId === userId
      );
      
      dispatch(getStudyStats(notebookId, userId));
      
      console.warn('Stats API call failed, using localStorage:', error.message);
      return { studyTimes: notebookStats };
    }
  };
};