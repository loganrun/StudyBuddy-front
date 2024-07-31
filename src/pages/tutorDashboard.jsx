import React, {useState} from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaVideo, FaUserPlus } from 'react-icons/fa';

const TutorDashboard = () => {
  const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
  //console.log(tutor)
  const [inviteLink, setInviteLink] = useState('');
  const navigate = useNavigate();


  const generateInviteLink = () => {
    const link = `${window.location.origin}/join/${tutor.roomId}`;
    setInviteLink(link);
  };

  const startMeeting = () => {
    //socket.emit('create_room', tutor.roomId);
    navigate(`/tutoring/${tutor.roomId}/${tutor.name}`, { state: { tutor, isHost: true } });
  };


  return (
    <div className="flex items-center justify-center h-screen">
      <div className="space-y-6">
        <div className="space-x-6 flex">
          <button
            className="w-64 p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={startMeeting}
          >
            <FaVideo className="text-4xl mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl text-black font-semibold text-center">Start a Meeting</h2>
          </button>
          <button
            className="w-64 p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={generateInviteLink}
          >
            <FaUserPlus className="text-4xl mx-auto mb-4 text-green-500" />
            <h2 className="text-xl text-black font-semibold text-center">Generate Invite Link</h2>
          </button>
        </div>
        {inviteLink && (
          <div className="text-center">
            <p className="mb-2">Share this link with your student:</p>
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="w-full p-2 border rounded text-black"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboard;