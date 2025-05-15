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
import SimpleVoiceAssistant from "../components/SimpleVoiceAssistant";

const voiceAgentUrl = import.meta.env.VITE_VOICE_AGENT_URL

export default function VoiceAgentPage() {

  const [room] = useState(new Room());
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
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
      Room.disconnect(); // Disconnect from the LiveKit room.
      setIsConnected(false); // Update the connection state.  
      setIsListening(false); // Update the listening state.
    }else{
    
    try {
        // Fetch connection details (server URL, token) from the API route.
        const response = await  axios.get(voiceAgentUrl)
        
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
  }}, [room]); // Dependency array includes 'room'

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
    <main className="flex items-center justify-center min-h-screen bg-slate-900">
      <RoomContext.Provider value={room}>
        {/* <div className="flex flex-col items-center justify-center p-4 w-full max-w-md">
       
        <SimpleVoiceAssistant /> 
        </div> */}
        
        <div className=" p-4 shadow-md">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center justify-center space-y-2">
            <RoomAudioRenderer muted={isMuted} />
            <SimpleVoiceAssistant /> 
              <button
                onClick={onConnectButtonClicked}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                  isConnected
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
                    : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                }`}
              >
                {isConnected ? <StopCircle size={32} /> : <PlayCircle size={32} />}
              </button>
              <span className="text-sm">{isConnected ? 'Disconnect' : 'Connect'}</span>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2">
              <button
                // onClick={handleToggleListening}
                disabled={!isConnected}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                  !isConnected
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

            <div className="flex flex-col items-center justify-center space-y-2">
              <button
                onClick={handleToggleMute}
                disabled={!isConnected}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                  !isConnected
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
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-md font-medium mb-3">Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Voice Type</label>
                  <select 
                    value={settingsData.voiceType}
                    onChange={(e) => handleSettingChange('voiceType', e.target.value)}
                    className="w-full rounded-md bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 py-1 px-2"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Response Speed</label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1"
                    value={settingsData.responseSpeed}
                    onChange={(e) => handleSettingChange('responseSpeed', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    id="autoConnect"
                    checked={settingsData.autoConnect}
                    onChange={(e) => handleSettingChange('autoConnect', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="autoConnect" className="text-sm">Auto-connect on start</label>
                </div>
              </div>
            </div>
          )}
        </div>
      </RoomContext.Provider>
      
    </main>
  );
}



// /**
//  * Component rendering the core voice assistant UI elements.
//  * @param {object} props - Component props.
//  * @param {Function} props.onConnectButtonClicked - Callback function to initiate connection.
//  */

// function SimpleVoiceAssistant({ onConnectButtonClicked }) {
// //   // Get the current state of the voice assistant from the LiveKit hook.
//    const { state: agentState } = useVoiceAssistant();

//    return (
//     <>
       
//        {/* Container for the transcription view */}
//        <div className="w-3/4 lg:w-1/2 mx-auto h-full">
//          <TranscriptionView />
//        </div>

//        {/* Renders audio tracks from the room */}
//        <RoomAudioRenderer />
//        {/* Shows notifications based on agent state */}
//        <NoAgentNotification state={agentState} />
//        {/* Fixed container for the control bar at the bottom */}
//        <div className="fixed bottom-0 w-full px-4 py-2">
//          <ControlBar />
//       </div>
//      </>
//    );
//  }

// /**
//  * Component rendering the bottom control bar with visualizer and buttons.
//  */
function ControlBar() {
  
  const { state: agentState, audioTrack } = useVoiceAssistant();

  return (
    <div className="relative h-[100px]">
      {/* Animate the appearance/disappearance of the control bar */}
      <AnimatePresence>
        {/* Show control bar only when connected/active */}
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex absolute w-full h-full justify-between px-8 sm:px-4"
          >
            {/* Audio visualizer for the agent's track */}
            <BarVisualizer
              state={agentState}
              barCount={5}
              trackRef={audioTrack} // Pass the agent's audio track
              className="agent-visualizer w-24 gap-2"
              options={{ minHeight: 12 }}
            />
            {/* Container for control buttons */}
            <div className="flex items-center">
              <VoiceAssistantControlBar controls={{ leave: false }} />    
              <DisconnectButton>
                <CloseIcon />
              </DisconnectButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
