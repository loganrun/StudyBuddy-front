// conversationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  conversationId: null,
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
    updateLastMessage: (state, action) => {
      console.log(action.payload)
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.type === 'response') {
        lastMessage.text += action.payload.text;
        state.conversationId = action.payload.conversationId;
      }
    },
  },
});

export const { addMessage, clearMessages, updateLastMessage } = conversationSlice.actions;
export default conversationSlice.reducer;
