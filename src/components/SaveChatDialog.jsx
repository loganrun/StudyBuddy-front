import React, { useState } from 'react';
import { X, Save, MessageSquare, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { useSaveChat } from '../hooks/useSaveChat';

const SaveChatDialog = ({ isOpen, onClose, onConfirm, messages, notebookId }) => {
  //console.log(notebookId)
  const [dialogState, setDialogState] = useState('confirmation'); // 'confirmation', 'form', 'loading', 'success', 'error'
  const [chatName, setChatName] = useState('');
  const { saveChatData, isLoading, error, success, generateDefaultName, reset } = useSaveChat();

  if (!isOpen) return null;

  const handleSaveChat = async () => {
    try {
      setDialogState('loading');

      // Use the hook to save chat data
      await saveChatData(messages, chatName, notebookId);
      
      setDialogState('success');
    } catch (err) {
      setDialogState('error');
    }
  };

  const handleContinue = () => {
    // Reset dialog state
    setDialogState('confirmation');
    setChatName('');
    reset();
    onConfirm();
  };

  const handleDeleteWithoutSaving = () => {
    // Reset dialog state
    setDialogState('confirmation');
    setChatName('');
    reset();
    onConfirm();
  };

  const handleCancel = () => {
    // Reset dialog state
    setDialogState('confirmation');
    setChatName('');
    reset();
    onClose();
  };

  const handleTryAgain = () => {
    setDialogState('form');
  };

  const renderConfirmationState = () => (
    <>
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-blue-800">Save Chat</h2>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 rounded-full hover:bg-blue-100 transition-colors"
        >
          <X className="h-5 w-5 text-blue-600" />
        </button>
      </div>
      
      {/* Modal Content */}
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your chat will be deleted. Would you like to save it as a note?
          </h3>
          
          <p className="text-gray-600 mb-4">
            You have <span className="font-semibold text-gray-900">{messages.length} messages</span> in this conversation.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm font-medium flex items-center gap-2 justify-center">
              <Save className="h-4 w-4" />
              Save your chat to review it later.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => setDialogState('form')}
          className="px-6 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save Chat
        </button>
        <button
          onClick={handleDeleteWithoutSaving}
          className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
        >
          Continue Without Saving
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </>
  );

  const renderFormState = () => (
    <>
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Save className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-800">Save Chat</h2>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 rounded-full hover:bg-green-100 transition-colors"
        >
          <X className="h-5 w-5 text-green-600" />
        </button>
      </div>
      
      {/* Modal Content */}
      <div className="p-6">
        <div className="mb-6">
          <label htmlFor="chatName" className="block text-sm font-medium text-gray-700 mb-2">
            Chat Name 
          </label>
          <input
            id="chatName"
            type="text"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder="Enter topic? (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black outline-none"
            autoFocus
          />
          
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveChat}
          className="px-6 py-2 bg-green-600 text-white border border-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </button>
      </div>
    </>
  );

  const renderLoadingState = () => (
    <>
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-full">
            <Loader className="h-6 w-6 text-gray-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Saving Chat</h2>
        </div>
      </div>
      
      {/* Modal Content */}
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Loader className="h-8 w-8 text-gray-600 animate-spin" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Saving chat...
          </h3>
          
          <p className="text-gray-600">
            Please wait while we save your conversation.
          </p>
        </div>
      </div>
    </>
  );

  const renderSuccessState = () => (
    <>
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-800">Chat Saved</h2>
        </div>
      </div>
      
      {/* Modal Content */}
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chat saved successfully!
          </h3>
          
          <p className="text-gray-600">
            Your conversation has been saved and you can access it later.
          </p>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleContinue}
          className="px-6 py-2 bg-green-600 text-white border border-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Continue
        </button>
      </div>
    </>
  );

  const renderErrorState = () => (
    <>
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-800">Save Failed</h2>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 rounded-full hover:bg-red-100 transition-colors"
        >
          <X className="h-5 w-5 text-red-600" />
        </button>
      </div>
      
      {/* Modal Content */}
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to save chat. Would you like to try again?
          </h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleTryAgain}
          className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
        <button
          onClick={handleDeleteWithoutSaving}
          className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
        >
          Continue Without Saving
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </>
  );

  const renderCurrentState = () => {
    switch (dialogState) {
      case 'confirmation':
        return renderConfirmationState();
      case 'form':
        return renderFormState();
      case 'loading':
        return renderLoadingState();
      case 'success':
        return renderSuccessState();
      case 'error':
        return renderErrorState();
      default:
        return renderConfirmationState();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {renderCurrentState()}
      </div>
    </div>
  );
};

export default SaveChatDialog;