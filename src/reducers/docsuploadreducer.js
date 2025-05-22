import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    docuploads: [],
    loading: false,
    error: null
};

const docUploadSlice = createSlice({
    name: 'docUpload',
    initialState,
    reducers: {
        // Create
        addDocument: (state, action) => {
            state.docuploads.push(action.payload);
        },

        // Read
        setDocuments: (state, action) => {
            state.docuploads = action.payload;
        },

        // Update
        updateDocument: (state, action) => {
            const { id, updatedData } = action.payload;
            const index = state.docuploads.findIndex(doc => doc.id === id);
            if (index !== -1) {
                state.docuploads[index] = { ...state.docuploads[index], ...updatedData };
            }
        },

        // Delete
        deleteDocument: (state, action) => {
            state.docuploads = state.docuploads.filter(doc => doc.id !== action.payload);
        },

        // Loading state
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        // Error handling
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    addDocument,
    setDocuments,
    updateDocument,
    deleteDocument,
    setLoading,
    setError
} = docUploadSlice.actions;

export default docUploadSlice.reducer;
