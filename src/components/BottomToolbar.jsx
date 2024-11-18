// BottomToolbar.js
import React from 'react';

import {Camera, CameraOff,  Mic, MicOff, House, LogOut} from 'lucide-react'


const BottomToolbar = ({ toggleVideo, toggleMute, isVideoOn, isMuted, toggleCall, isCalling }) => {



  return (
    <div className="fixed bottom-0 w-full bg-[#1C2C50] text-white shadow-lg">
      <div className="flex justify-around items-center ">
        <button className="flex flex-col items-center hover:bg-gray-700 p-1 rounded-md transition ease-in-out duration-200">
          <House className="w-3 h-3 md:w-5 md:h-5" />
          <span className="text-xs md:text-sm mt-1">Home</span>
        </button>
        
        <button 
        onClick={toggleMute}
        className="flex flex-col items-center hover:bg-gray-700 p-1 rounded-md transition ease-in-out duration-200">
            {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            )}
          <span className="text-xs md:text-sm">Audio</span>
        </button>
        
        <button 
        onClick={toggleVideo}
        className="flex flex-col items-center hover:bg-gray-700 p-1 rounded-md transition ease-in-out duration-200">
            {isVideoOn? (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16"/><path d="M9.5 4h5L17 7h3a2 2 0 0 1 2 2v7.5"/><path d="M14.121 15.121A3 3 0 1 1 9.88 10.88"/></svg>
            )}

          <span className="text-xs md:text-sm">Video</span>
        </button>
        
        <button
        onClick={toggleCall} 
        className="flex flex-col items-center hover:bg-gray-700  p-1 rounded-md transition ease-in-out duration-200">
          {isCalling? (
            <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span className="text-xs md:text-sm ">End Call</span>
            </div>
          ) : (
            <div>
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              <span className="text-xs md:text-sm ">Start Call</span>
            </div>
          )}
          
        </button>
      </div>
    </div>
  );
};

export default BottomToolbar;
