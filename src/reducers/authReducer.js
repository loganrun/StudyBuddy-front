
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.error = null;
    },
    loginError: (state, action) => {
      state.user = null;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.error = null;
    },
    logoutError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, loginError, logoutSuccess, logoutError } = authSlice.actions;
export default authSlice.reducer;
