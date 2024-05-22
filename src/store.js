import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import signupReducer from './reducers/signupReducer';
import lecturesReducer from './reducers/lecturesSlice';
import openaiReducer from './reducers/openaiReducer';
import conversationReducer from './reducers/conversationReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    signup: signupReducer,
    lectures: lecturesReducer,
    openai: openaiReducer,
    conversation: conversationReducer,
  },
});

export default store;
