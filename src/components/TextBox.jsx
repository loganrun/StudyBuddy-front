import React, { useState } from 'react';


const TextBox = ({ initialText }) => {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditEnd = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex items-center space-x-2">
    <div className="w-1/4"></div>
    <div className="flex-1 border border-gray-300 rounded-md p-2 h20 w-40 bg-white">
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          onBlur={handleEditEnd}
          autoFocus
          className="w-full outline-none"
        />
      ) : (
        <div onClick={handleEditStart}>{text}</div>
      )}
    </div>
  </div>
  );
};

export default TextBox;
