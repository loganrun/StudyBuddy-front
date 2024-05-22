import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  input: null,
  response: '',
  isLoading: false,
};

const openAISlice = createSlice({
  name: 'openAI',
  initialState,
  reducers: {
    setInput: (state, action) => {
      state.input = action.payload;
    },
    setResponse: (state, action) => {
      state.response = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setInput, setResponse, setIsLoading } = openAISlice.actions;
export default openAISlice.reducer;
