import React, { useState, useMemo } from "react";
import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import { Button } from "./Button";

const VideoPlayer = ({ videoTrack, audioTrack }) => {
  return (
    <div className="relative w-full h-full">
      {videoTrack && (
        <div 
          ref={(ref) => {
            if (ref) videoTrack.play(ref);
          }} 
          className="absolute inset-0 w-full h-full object-cover"
        ></div>
      )}
      {audioTrack && audioTrack.play()}
    </div>
  );
};

export const VideoCall = ({ roomID }) => {
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState("");
  const [channel, setChannel] = useState("");
  const [token, setToken] = useState("");

  useJoin({ appid: appId, channel: channel, token: token ? token : null }, calling);

  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  usePublish([localMicrophoneTrack, localCameraTrack]);

  const remoteUsers = useRemoteUsers();

  const gridClassName = useMemo(() => {
    const totalUsers = remoteUsers.length + 1;
    if (totalUsers === 1) return 'grid-cols-1';
    if (totalUsers === 2) return 'grid-cols-2';
    if (totalUsers <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  }, [remoteUsers.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-hidden">
        {isConnected ? (
          <div className="h-full p-2">
            <div className={`grid ${gridClassName} gap-2 h-full`}>
              <div className="relative aspect-video">
                <LocalUser
                  audioTrack={localMicrophoneTrack}
                  cameraOn={cameraOn}
                  micOn={micOn}
                  videoTrack={localCameraTrack}
                  cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                >
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded z-10 text-xs">You</span>
                  <VideoPlayer videoTrack={localCameraTrack} audioTrack={localMicrophoneTrack} />
                </LocalUser>
              </div>
              {remoteUsers.map((user) => (
                <div className="relative aspect-video" key={user.uid}>
                  <RemoteUser cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg" user={user}>
                    <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded z-10 text-xs">{user.uid}</span>
                    <VideoPlayer videoTrack={user.videoTrack} audioTrack={user.audioTrack} />
                  </RemoteUser>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <input
              className="w-full p-2 border rounded text-sm"
              onChange={e => setAppId(e.target.value)}
              placeholder="<Your app ID>"
              value={appId}
            />
            <input
              className="w-full p-2 border rounded text-sm"
              onChange={e => setChannel(e.target.value)}
              placeholder="<Your channel Name>"
              value={channel}
            />
            <input
              className="w-full p-2 border rounded text-sm"
              onChange={e => setToken(e.target.value)}
              placeholder="<Your token>"
              value={token}
            /> 
            <Button
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              onClick={() => setCalling(true)}
            >
              <span>Join Channel</span>
            </Button>
          </div>
        )}
      </div>
      {isConnected && (
        <div className="flex justify-between items-center p-2 bg-gray-100">
          <div className="space-x-2">
            <button className="p-1 rounded-full bg-white shadow" onClick={() => setMic(a => !a)}>
              <i className={`${micOn ? 'text-blue-500' : 'text-red-500'} text-sm`}>🎤</i>
            </button>
            <button className="p-1 rounded-full bg-white shadow" onClick={() => setCamera(a => !a)}>
              <i className={`${cameraOn ? 'text-blue-500' : 'text-red-500'} text-sm`}>📷</i>
            </button>
          </div>
          <button
            className={`p-1 rounded-full ${calling ? 'bg-red-500' : 'bg-green-500'} text-white text-sm`}
            onClick={() => setCalling(a => !a)}
          >
            {calling ? '📞' : '📞'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;

// import React, { useEffect, useRef, useState } from 'react';
// //import io from 'socket.io-client';
// //import Peer from 'simple-peer';
// import {
//   LocalUser,
//   RemoteUser,
//   useIsConnected,
//   useJoin,
//   useLocalMicrophoneTrack,
//   useLocalCameraTrack,
//   usePublish,
//   useRemoteUsers,
// } from "agora-rtc-react";
// import { Button } from './Button';
// const VideoChat = ({ roomID, userId, userType }) => {
//   const [calling, setCalling] = useState(false); // Is calling
//   //const [appId, setAppId] = useState(""); // Store the app ID state
//   //const [channel, setChannel] = useState(""); // Store the channel name state 
//   //const [token, setToken] = useState(""); // Store the token state
//   const appId = import.meta.env.appId;
//   const isConnected = useIsConnected();
//   const token = null

//   useJoin({appid: appId, channel: roomID, token: token ? token : null}, calling)

//   const [micOn, setMic] = useState(true);
//   const [cameraOn, setCamera] = useState(true);
//   const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
//   const { localCameraTrack } = useLocalCameraTrack(cameraOn);
//   usePublish([localMicrophoneTrack, localCameraTrack]);

//   const remoteUsers = useRemoteUsers();

//   return (
//     <>
//       <div className="room">
        
//         {isConnected ? (
//           <div className="user-list">
//             <div className="user">
//               <LocalUser
//                 audioTrack={localMicrophoneTrack}
//                 cameraOn={cameraOn}
//                 micOn={micOn}
//                 videoTrack={localCameraTrack}
//                 cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
//               >
//                 <samp className="user-name">You</samp>
//               </LocalUser>
//             </div>
//             {remoteUsers.map((user) => (
//               <div className="user" key={user.uid}>
//                 <RemoteUser cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg" user={user}>
//                   <samp className="user-name">{user.uid}</samp>
//                 </RemoteUser>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="join-room">
//             {/* <img alt="agora-logo" className="logo" src={agoraLogo} /> */}
//             {/* <input
//               onChange={e => setAppId(e.target.value)}
//               placeholder="<Your app ID>"
//               value={appId}
//             />
//             <input
//               onChange={e => setChannel(e.target.value)}
//               placeholder="<Your channel Name>"
//               value={channel}
//             />
//             <input
//               onChange={e => setToken(e.target.value)}
//               placeholder="<Your token>"
//               value={token}
//             /> */}

//             <Button
//               className={`join-channel ${!appId || !channel ? "disabled" : ""}`}
//               disabled={!appId || !channel}
//               onClick={() => setCalling(true)}
//             >
//               <span>Start Chat</span>
//             </Button>
//           </div>
//         )}
//       </div>
//       {isConnected && (
//         <div className="control">
//           <div className="left-control">
//             <button className="btn" onClick={() => setMic(a => !a)}>
//               <i className={`i-microphone ${!micOn ? "off" : ""}`} />
//             </button>
//             <button className="btn" onClick={() => setCamera(a => !a)}>
//               <i className={`i-camera ${!cameraOn ? "off" : ""}`} />
//             </button>
//           </div>
//           <button
//             className={`btn btn-phone ${calling ? "btn-phone-active" : ""}`}
//             onClick={() => setCalling(a => !a)}
//           >
//             {calling ? <i className="i-phone-hangup" /> : <i className="i-mdi-phone" />}
//           </button>
//         </div>
//       )}
//     </>
//   );
// }

// export default VideoChat;



