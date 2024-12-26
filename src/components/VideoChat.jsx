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
//import { Button } from "./Button";

const VideoPlayer = ({ 
  videoTrack, 
  audioTrack,
  //isMuted
}) => {
  return (
    <div className="relative w-full h-full group">
      {videoTrack && (
        <div 
          ref={(ref) => {
            if (ref) videoTrack.play(ref);
          }} 
          className="absolute inset-0 w-full h-full object-cover"
        ></div>
      )}
      {audioTrack && audioTrack.play()}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-black bg-opacity-50 p-4 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button>
        {isMuted && (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        )}
        </button> 
      </div> */}
    </div>
  );
};

export const VideoCall = ({ roomID, isVideoOn, isMuted, isCalling }) => {
  //const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [token, setToken] = useState("");

  const appId = import.meta.env.VITE_APP_ID;
  const channel = roomID;

  useJoin({ appid: appId, channel: channel, token: token ? token : null }, isCalling);

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(!isMuted);
  const { localCameraTrack } = useLocalCameraTrack(isVideoOn);
  usePublish([localMicrophoneTrack, localCameraTrack]);

  const remoteUsers = useRemoteUsers();

  const gridClassName = useMemo(() => {
    const totalUsers = remoteUsers.length + 1;
    if (totalUsers === 1) return 'grid-cols-2';
    if (totalUsers === 2) return 'grid-cols-2';
    if (totalUsers <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  }, [remoteUsers.length]);

  return (
    <div className="flex flex-col pt-4 ">
      <div className="flex-grow overflow-hidden">
        {isConnected ? (
          <div className="h-full p-2">
            <div className={`grid ${gridClassName} gap-2 h-full`}>
              <div className="relative aspect-video">
                <LocalUser
                  audioTrack={localMicrophoneTrack}
                  cameraOn={isVideoOn}
                  micOn={!isMuted}
                  videoTrack={localCameraTrack}
                  cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                >
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded z-10 text-xs">You</span>
                  <VideoPlayer
                    videoTrack={localCameraTrack}
                    audioTrack={localMicrophoneTrack}
                    onCallToggle={isCalling}
                    micOn={!isMuted}
                    cameraOn={isVideoOn}
                    calling={isCalling}
                  />
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
          <div className="flex flex-col items-center justify-center h-4/6 space-y-2">
            {/* <Button
              className="p-6 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              onClick={() => setCalling(true)}
            >
              <span>Join Session</span>
            </Button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;






