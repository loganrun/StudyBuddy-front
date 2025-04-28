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

const voiceAgentUrl = import.meta.env.VITE_VOICE_AGENT_URL

export default function VoiceAgentPage() {

  const [room] = useState(new Room());

  const onConnectButtonClicked = useCallback(async () => {
    
    try {
        // Fetch connection details (server URL, token) from the API route.
        const response = await  axios.get(voiceAgentUrl)
        
        // Check if the response is valid and contains the expected data.
        const connectionDetailsData = await response.data;
        console.log(connectionDetailsData)

        // Connect to the LiveKit room using the fetched details.
        await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
        // Enable the local participant's microphone.
        await room.localParticipant.setMicrophoneEnabled(true);

    } catch (error) {
        console.error("Failed to connect to LiveKit room:", error);
        // Optionally, display an error message to the user here.
        alert(`Failed to start the conversation: ${error.message}`);
    }
  }, [room]); // Dependency array includes 'room'

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
        <div className="flex flex-col items-center justify-center p-4 w-full max-w-md">
       {/* Render the voice assistant UI, passing the connect handler */}
        <SimpleVoiceAssistant onConnectButtonClicked={onConnectButtonClicked} />
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

function SimpleVoiceAssistant({ onConnectButtonClicked }) {
//   // Get the current state of the voice assistant from the LiveKit hook.
   const { state: agentState } = useVoiceAssistant();

   return (
    <>
       {/* Animate the appearance/disappearance of the connect button */}
       <AnimatePresence>
//         {/* Show button only when disconnected */}
         {agentState === "disconnected" && (
          // <motion.button
          //   initial={{ opacity: 0, top: 0 }}
          //   animate={{ opacity: 1 }}
          //   exit={{ opacity: 0, top: "-10px" }}
          //   transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
          //   className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
          //   // Call the passed-in handler on click
          //   onClick={() => onConnectButtonClicked()}
          // >
          //   Start a conversation
          // </motion.button>
            <button
            className="px-6 py-3 bg-white text-black uppercase rounded-md shadow-md hover:bg-gray-200 transition"
            onClick={() => onConnectButtonClicked()}
            >  
          
            start a conversation
          </button>
        )}
       </AnimatePresence>
       {/* Container for the transcription view */}
       <div className="w-3/4 lg:w-1/2 mx-auto h-full">
         <TranscriptionView />
       </div>

       {/* Renders audio tracks from the room */}
       <RoomAudioRenderer />
       {/* Shows notifications based on agent state */}
       <NoAgentNotification state={agentState} />
       {/* Fixed container for the control bar at the bottom */}
       <div className="fixed bottom-0 w-full px-4 py-2">
         <ControlBar />
      </div>
     </>
   );
 }

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
              {/* Standard LiveKit controls (mic, etc.), leave button hidden */}
              <VoiceAssistantControlBar controls={{ leave: false }} />
              {/* Custom disconnect button */}
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
