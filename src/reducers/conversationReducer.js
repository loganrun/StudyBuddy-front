// conversationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, clearMessages } = conversationSlice.actions;
export default conversationSlice.reducer;
