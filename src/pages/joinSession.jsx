import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const JoinSession = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const user = useSelector(state => state.auth.user.payload.user);
  //console.log(user)
  const userType = user.userType
  const userId = user.id
  
  

  const joinSession = () => {
    const regex = /\/join\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex)
    const roomId = match ? match[2] : null;
    // console.log(roomId)
    const documentId = match ? match[1] : null;
    //console.log(documentId)
    if (roomId) {
    //   socket.emit('join_room', roomId);
      navigate(`/tutoring/${documentId}/${roomId}/${userId}/${userType}`);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-64 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl text-black font-semibold text-center mb-4">Join a Session</h2>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Room ID"
          className="w-full p-2 text-black mb-4 border rounded"
        />
        <button
          onClick={joinSession}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default JoinSession;