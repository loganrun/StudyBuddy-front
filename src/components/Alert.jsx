import React, { useState, useEffect } from 'react';

const Alert = ({ message }) => {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    let timeout;

    if (message) {
      setShowAlert(true);
      timeout = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    }

    return () => clearTimeout(timeout);
  }, [message]);

  const handleDismiss = () => {
    setShowAlert(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showAlert ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-green-500 text-white py-3 px-4 flex justify-between items-center">
        <span>{message}</span>
        <button
          className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
          onClick={handleDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default Alert;