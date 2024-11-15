import React, { useEffect } from 'react';

const StartButton = ({ buttonText = "Start Session", onStart, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-80 text-center">
        <h2 className="text-lg font-semibold mb-4">{buttonText}</h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onStart}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {buttonText}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartButton;
