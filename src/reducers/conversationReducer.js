// conversationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  conversationId: null,
  origin: "", 
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      console.log('Adding message:', action.payload);
      state.messages.push(action.payload);
      if (action.payload.conversationId) {
        state.conversationId = action.payload.conversationId;
      }
      if (action.payload.origin) {
        state.origin = action.payload.origin;
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    updateLastMessage: (state, action) => {
      //console.log(action.payload)
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.type === 'response') {
        lastMessage.text += action.payload.text;
        state.conversationId = action.payload.conversationId;
        state.origin = action.payload.origin;
      }
    },
  },
});

export const { addMessage, clearMessages, updateLastMessage } = conversationSlice.actions;
export default conversationSlice.reducer;
