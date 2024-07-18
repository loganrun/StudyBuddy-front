import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaVideo, FaUserPlus } from 'react-icons/fa';

const TutorDashboard = () => {
  const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
  //console.log(tutor)
  //const sessionLink = `${window.location.origin}/session/${tutor.roomId}`;
 
  
  return (
    // <div>
    //   <h1>Welcome, {tutor.name}</h1>
    //   <p>Your session link: <Link to={`/session/${tutor.roomId}`}>{sessionLink}</Link></p>
    //   <p>Share this link with your student to start the session.</p>
    // </div>
 
  <div className="flex items-center justify-center h-screen">
      <div className="space-x-6 flex">
        <Link className="w-64 p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
        to={'/tutoring'} state={tutor}>
          <FaVideo className="text-4xl mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl text-black font-semibold text-center">Start a Meeting</h2>

        </Link>
        <div className="w-64 p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer">
          <FaUserPlus className="text-4xl mx-auto mb-4 text-green-500" />
          <h2 className="text-xl text-black font-semibold text-center">Join a Meeting</h2>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;