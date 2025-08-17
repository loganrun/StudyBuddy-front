import { useState, useCallback } from 'react';
import { saveChat } from '../services/chatApi';

/**
 * Custom hook for managing chat save operations
 * @returns {Object} Hook interface with save function and state
 */
export const useSaveChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Generate a default chat name with timestamp
   * @returns {string} Default chat name
   */
  const generateDefaultName = useCallback(() => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `Chat - ${date} ${time}`;
  }, []);

  /**
   * Save chat with the provided data
   * @param {Array} messages - Array of chat messages
   * @param {string} name - Optional custom name for the chat
   * @returns {Promise<Object>} Promise that resolves with save result
   */
  const saveChatData = useCallback(async (messages, name = '', notebookId) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Validate messages
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('No messages to save');
      }

      // Generate name if not provided
      const finalName = name.trim() || generateDefaultName();

      // Filter out any invalid messages
      const validMessages = messages.filter(message => 
        message && 
        typeof message === 'object' && 
        message.text && 
        message.type
      );

      if (validMessages.length === 0) {
        throw new Error('No valid messages to save');
      }

      // Prepare chat data
      const chatData = {
        contents: validMessages,
        name: finalName,
        notebookId: notebookId 
      };

      // Call API to save chat
      const result = await saveChat(chatData);

      setSuccess(true);
      setIsLoading(false);

      return {
        success: true,
        data: result.data,
        message: 'Chat saved successfully',
        chatName: finalName
      };

    } catch (err) {
      const errorMessage = err.message || 'Failed to save chat';
      setError(errorMessage);
      setIsLoading(false);
      
      throw new Error(errorMessage);
    }
  }, [generateDefaultName]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  /**
   * Clear only the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear only the success state
   */
  const clearSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  return {
    // State
    isLoading,
    error,
    success,
    
    // Actions
    saveChatData,
    reset,
    clearError,
    clearSuccess,
    generateDefaultName,
  };
};

export default useSaveChat;