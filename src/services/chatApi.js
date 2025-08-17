import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_NOTES_URL;


// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error scenarios
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please check your connection');
    }
    
    if (!error.response) {
      throw new Error('Network error - please check your internet connection');
    }
    
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        throw new Error('Authentication failed - please log in again');
      case 403:
        throw new Error('Access denied - insufficient permissions');
      case 404:
        throw new Error('Service not found - please try again later');
      case 429:
        throw new Error('Too many requests - please wait before trying again');
      case 500:
        throw new Error('Server error - please try again later');
      default:
        throw new Error(data?.message || `Request failed with status ${status}`);
    }
  }
);

/**
 * Save chat conversation to the server
 * @param {Object} chatData - The chat data to save
 * @param {Array} chatData.contents - Array of message objects
 * @param {string} chatData.name - Name for the chat
 * @returns {Promise<Object>} - Promise that resolves with the saved chat data
 */
export const saveChat = async (chatData) => {
  const notebookId = chatData.notebookId
  try {
    // Validate input data
    if (!chatData || !Array.isArray(chatData.contents)) {
      throw new Error('Invalid chat data: contents must be an array');
    }

    if (chatData.contents.length === 0) {
      throw new Error('Cannot save empty chat');
    }

    if (!chatData.name || typeof chatData.name !== 'string') {
      throw new Error('Chat name is required and must be a string');
    }

    // Prepare the request payload
    const payload = {
      content: chatData.contents,
      title: chatData.name.trim(),
      timestamp: new Date().toISOString(),
    };

    // Make the API request
    const response = await apiClient.post(`/${notebookId}`, payload);

    // Return the response data
    return {
      success: true,
      data: response.data,
      message: 'Chat saved successfully'
    };

  } catch (error) {
    // Re-throw with enhanced error information
    throw new Error(error.message || 'Failed to save chat');
  }
};

/**
 * Get saved chats for the current user
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of chats per page (default: 10)
 * @returns {Promise<Object>} - Promise that resolves with the list of saved chats
 */
export const getSavedChats = async (options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    
    const response = await apiClient.get('/chats', {
      params: { page, limit }
    });

    return {
      success: true,
      data: response.data,
      message: 'Chats retrieved successfully'
    };

  } catch (error) {
    throw new Error(error.message || 'Failed to retrieve saved chats');
  }
};

/**
 * Delete a saved chat
 * @param {string} chatId - The ID of the chat to delete
 * @returns {Promise<Object>} - Promise that resolves when chat is deleted
 */
export const deleteChat = async (chatId) => {
  try {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    const response = await apiClient.delete(`/chats/${chatId}`);

    return {
      success: true,
      data: response.data,
      message: 'Chat deleted successfully'
    };

  } catch (error) {
    throw new Error(error.message || 'Failed to delete chat');
  }
};

/**
 * Get a specific saved chat by ID
 * @param {string} chatId - The ID of the chat to retrieve
 * @returns {Promise<Object>} - Promise that resolves with the chat data
 */
export const getChat = async (chatId) => {
  try {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    const response = await apiClient.get(`/chats/${chatId}`);

    return {
      success: true,
      data: response.data,
      message: 'Chat retrieved successfully'
    };

  } catch (error) {
    throw new Error(error.message || 'Failed to retrieve chat');
  }
};

export default {
  saveChat,
  getSavedChats,
  deleteChat,
  getChat,
};