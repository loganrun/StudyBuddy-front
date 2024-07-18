import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tutor: null,
  error: null,
};

const tutorAuthSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.tutor = action.payload;
      state.error = null;
    },
    loginError: (state, action) => {
      state.tutor = null;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.tutor = null;
      state.error = null;
    },
    logoutError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, loginError, logoutSuccess, logoutError } = tutorAuthSlice.actions;
export default tutorAuthSlice.reducer;
