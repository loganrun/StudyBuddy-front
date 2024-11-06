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

const VideoPlayer = ({ 
  videoTrack, 
  audioTrack, 
  onMicToggle, 
  onCameraToggle, 
  onCallToggle, 
  micOn, 
  cameraOn, 
  calling 
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

      {/* Start/Stop Call Button in the Upper Right */}
      <button
        className={`absolute top-0 right-0 px-4 py-2 rounded bg-${calling ? 'red' : 'green'}-500 text-white text-sm`}
        onClick={onCallToggle}
      >
        {calling ? 'End Call' : 'Start Call'}
      </button>

      {/* Mic and Camera Toggle Buttons Centered */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-black bg-opacity-50 p-4 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="p-3 rounded-full  shadow-lg" onClick={onMicToggle}>
          <i className={`${micOn ? 'text-blue-500' : 'text-red-500'} text-lg`}>🎤</i>
        </button>
        <button className="p-3 rounded-full  shadow-lg" onClick={onCameraToggle}>
          <i className={`${cameraOn ? 'text-blue-500' : 'text-red-500'} text-lg`}>📷</i>
        </button>
      </div>
    </div>
  );
};

export const VideoCall = ({ roomID }) => {
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [token, setToken] = useState("");

  const appId = import.meta.env.VITE_APP_ID;
  const channel = roomID;

  useJoin({ appid: appId, channel: channel, token: token ? token : null }, calling);

  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
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
                  cameraOn={cameraOn}
                  micOn={micOn}
                  videoTrack={localCameraTrack}
                  cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                >
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded z-10 text-xs">You</span>
                  <VideoPlayer
                    videoTrack={localCameraTrack}
                    audioTrack={localMicrophoneTrack}
                    onMicToggle={() => setMic((prev) => !prev)}
                    onCameraToggle={() => setCamera((prev) => !prev)}
                    onCallToggle={() => setCalling((prev) => !prev)}
                    micOn={micOn}
                    cameraOn={cameraOn}
                    calling={calling}
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
            <Button
              className="p-6 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              onClick={() => setCalling(true)}
            >
              <span>Join Session</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;






