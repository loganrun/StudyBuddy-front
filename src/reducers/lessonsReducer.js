// conversationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lessons: [],
};

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    addLessons: (state, action) => {
      state.lessons.push(action.payload);
    },
    clearLessons: (state) => {
      state.lessons = [];
    },
    updateLastLesson: (state, action) => {
      const lastLesson = state.lessons[state.lessons.length - 1];
      if (lastLesson && lastLesson.type === 'response') {
        lastLesson.text += action.payload.text;
      }
    },
  },
});

export const { addLessons, clearLessons, updateLastLesson } = lessonsSlice.actions;
export default lessonsSlice.reducer;
