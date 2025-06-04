import { CloseIcon } from '../components/CloseIcon';
import { NoAgentNotification } from "../components/NoAgentNotification"
import TranscriptionView from "../components/TranscriptionView";
import {
  BarVisualizer,
  DisconnectButton,
  RoomAudioRenderer,
  RoomContext,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
//import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Mic, MicOff, Settings, Volume2, VolumeX, PlayCircle, StopCircle } from 'lucide-react';


const voiceAgentUrl = import.meta.env.VITE_VOICE_AGENT_URL

export default function VoiceAgentPage() {
  //const {state, audioTrack} = useVoiceAssistant();

  const [room] = useState(new Room());
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsData, setSettingsData] = useState({
    voiceType: 'neutral',
    responseSpeed: 1,
    autoConnect: false,
  });

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const onConnectButtonClicked = useCallback(async () => {
    if (isConnected) {
      await room.disconnect(); // Correct: disconnect from the LiveKit room instance
      setIsConnected(false); // Update the connection state.  
      setIsListening(false); // Update the listening state.
      setIsLoading(false);
    } else {
      try {
        // Fetch connection details (server URL, token) from the API route.
        setIsLoading(true);
        const response = await axios.get(voiceAgentUrl)
        // Check if the response is valid and contains the expected data.
        const connectionDetailsData = await response.data;
        console.log(connectionDetailsData)
        // Connect to the LiveKit room using the fetched details.
        await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
        setIsConnected(true); // Update the connection state.
        // Enable the local participant's microphone.
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsListening(true); // Update the listening state.
      } catch (error) {
        console.error("Failed to connect to LiveKit room:", error);
        // Optionally, display an error message to the user here.
        alert(`Failed to start the conversation: ${error.message}`);
      }
    }
  }, [room, isConnected]); // Add isConnected to dependencies

  /**
   * useEffect hook to handle LiveKit media device errors.
   */
  useEffect(() => {
    // Register the error handler function for media device errors.
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    // Cleanup function: Unregister the error handler when the component unmounts.
    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
    };
  }, [room]); // Dependency array includes 'room'


  return (
    <main className="flex items-center justify-center min-h-screen">
      <RoomContext.Provider value={room}>
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center p-4 rounded-lg space-y-6">
          <RoomAudioRenderer muted={isMuted} />
          {isConnected && (
            <div
              className="w-full max-w-2xl flex-1 overflow-y-auto"
              style={{
                maxHeight: 'calc(100vh - 10rem)', // 10rem = control panel + paddings, adjust as needed
                paddingBottom: '6rem', // matches the control panel height
              }}
            >
              <TranscriptionView />
            </div>
          )}
        </div>
        {/* Control panel: centered if not connected, fixed bottom if connected */}
        {isConnected ? (
          <div className="fixed bottom-0 left-0 w-full flex justify-center z-50 pointer-events-none">
            <VoiceAgentControlPanel
              isConnected={isConnected}
              isListening={isListening}
              isMuted={isMuted}
              onConnectButtonClicked={onConnectButtonClicked}
              onToggleMute={handleToggleMute}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className="pointer-events-auto">
              <VoiceAgentControlPanel
                isConnected={isConnected}
                isListening={isListening}
                isMuted={isMuted}
                onConnectButtonClicked={onConnectButtonClicked}
                onToggleMute={handleToggleMute}
              />
            </div>
          </div>
        )}
      </RoomContext.Provider>
    </main>
  );
}





/**
 * Handles errors related to accessing media devices (microphone/camera).
 * @param {Error} error - The error object.
 */
// Removed the ': Error' type annotation for the error parameter from TypeScript.
function onDeviceFailure(error) {
  console.error("Media device error:", error);
  // Display a user-friendly alert message.
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab."
  );
}

function VoiceAgentControlPanel({
  isConnected,
  isListening,
  isMuted,
  onConnectButtonClicked,
  onToggleMute
}) {
  return (
    <div
      className={`w-full max-w-md flex flex-row items-center justify-center space-x-8 bg-white/90 dark:bg-gray-900/90 shadow-lg rounded-xl py-4 px-2 pointer-events-auto transition-all duration-300`}
    >
      <div className="flex flex-col items-center">
        <button
          onClick={onConnectButtonClicked}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors mb-1 ${isConnected
            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
            : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
            }`}
        >
          {isConnected ? <StopCircle size={32} /> : <PlayCircle size={32} />}
        </button>
        <span className="text-sm">{isConnected ? 'Disconnect' : 'Connect'}</span>
      </div>
      <div className="flex flex-col items-center">
        <button
          // onClick={handleToggleListening}
          disabled={!isConnected}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors mb-1 ${!isConnected
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : isListening
              ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
            }`}
        >
          {isListening ? <MicOff size={32} /> : <Mic size={32} />}
        </button>
        <span className="text-sm">{isListening ? 'Stop Listening' : 'Start Listening'}</span>
      </div>
      <div className="flex flex-col items-center">
        <button
          onClick={onToggleMute}
          disabled={!isConnected}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors mb-1 ${!isConnected
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : isMuted
              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800'
              : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
            }`}
        >
          {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
        </button>
        <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
      </div>
    </div>
  );
}
