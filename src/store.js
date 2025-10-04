import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import signupReducer from './reducers/signupReducer';
import lecturesReducer from './reducers/lecturesSlice';
import openaiReducer from './reducers/openaiReducer';
import conversationReducer from './reducers/conversationReducer';
import tutorauthReducer from './reducers/tutorauthReducer';
import lessonsReducer from './reducers/lessonsReducer';
import docuploadReducer from './reducers/docsuploadreducer';
import studyReducer from './reducers/studyReducer';


const store = configureStore({
  reducer: {
    auth: authReducer,
    signup: signupReducer,
    lectures: lecturesReducer,
    openai: openaiReducer,
    conversation: conversationReducer,
    tutorauth: tutorauthReducer,
    lessons: lessonsReducer,
    docupload: docuploadReducer,
    study: studyReducer,
    
  },
});

export default store;
