import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  error: null,
};

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    signupSuccess: (state, action) => {
      state.user = action.payload;
      state.error = null;
    },
    signupError: (state, action) => {
      state.user = null;
      state.error = action.payload;
    },
  },
});

export const { signupSuccess, signupError } = signupSlice.actions;
export default signupSlice.reducer;
