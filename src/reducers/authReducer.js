
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
    addNotebook: (state, action) => {
      if (state.user && state.user.payload && state.user.payload.user) {
        if (!state.user.payload.user.notebooks) {
          state.user.payload.user.notebooks = [];
        }
        state.user.payload.user.notebooks.push(action.payload);
      }
    },
    deleteNotebook: (state, action) => {
      if (state.user && state.user.payload && state.user.payload.user && state.user.payload.user.notebooks) {
        state.user.payload.user.notebooks = state.user.payload.user.notebooks.filter(
          notebook => notebook._id !== action.payload
        );
      }
    },
  },
});

export const { loginSuccess, loginError, logoutSuccess, logoutError, addNotebook, deleteNotebook } = authSlice.actions;
export default authSlice.reducer;
