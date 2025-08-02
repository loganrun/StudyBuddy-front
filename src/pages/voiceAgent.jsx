import { CloseIcon } from '../components/CloseIcon';
import { NoAgentNotification } from "../components/NoAgentNotification"
import TranscriptionView from "../components/TranscriptionView";
import AgentAvatar from '../components/AgentAvatar';
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
import { 
  Mic, 
  MicOff, 
  Settings, 
  Volume2, 
  VolumeX, 
  PlayCircle, 
  StopCircle, 
  ChevronLeft,
  Menu,
  X 
} from 'lucide-react';
import { Link } from 'react-router-dom';


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

  // Theme and styling state (matching study.jsx)
  const [darkMode, setDarkMode] = useState(false);
  const [ageGroup, setAgeGroup] = useState('1-5');
  const [background, setBackground] = useState('forest');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Voice visualization state
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [voiceIntensity, setVoiceIntensity] = useState(0);
  
  // Reset voice states when disconnected
  useEffect(() => {
    if (!isConnected) {
      setIsAgentSpeaking(false);
      setVoiceIntensity(0);
    }
  }, [isConnected]);

  // Background themes (matching study.jsx and dashboard.jsx)
  const backgrounds = {
    forest: {
      name: "Magical Forest",
      gradient: "from-green-400 via-blue-500 to-purple-600",
      pattern: "🌲🌟🦋",
    },
    ocean: {
      name: "Ocean Adventure", 
      gradient: "from-blue-400 via-cyan-500 to-teal-600",
      pattern: "🌊🐠🏝️",
    },
    space: {
      name: "Space Explorer",
      gradient: "from-purple-600 via-pink-500 to-red-500",
      pattern: "🚀⭐🪐",
    },
    garden: {
      name: "Secret Garden",
      gradient: "from-pink-400 via-purple-500 to-indigo-600", 
      pattern: "🌸🦋🌈",
    }
  };

  // Dark mode theme configuration (matching study.jsx)
  const theme = {
    light: {
      panelBg: 'bg-white/90',
      panelBorder: 'border-white/50',
      headerBg: 'bg-white/95',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-600',
      textTertiary: 'text-gray-500',
      cardBg: 'bg-white/80',
      settingsBg: 'bg-white/95',
      settingsPanel: 'bg-gray-100',
      settingsSelected: 'bg-blue-500 text-white',
    },
    dark: {
      panelBg: 'bg-gray-800/90',
      panelBorder: 'border-gray-700/50',
      headerBg: 'bg-gray-800/95',
      textPrimary: 'text-white',
      textSecondary: 'text-gray-300',
      textTertiary: 'text-gray-400',
      cardBg: 'bg-gray-700/80',
      settingsBg: 'bg-gray-800/95',
      settingsPanel: 'bg-gray-700',
      settingsSelected: 'bg-blue-600 text-white',
    }
  };

  // Age-appropriate styling (matching study.jsx)
  const ageStyles = {
    '1-5': {
      fontSize: 'text-lg',
      buttonSize: 'px-6 py-4 text-lg',
      panelPadding: 'p-6',
      borderRadius: 'rounded-3xl',
      iconSize: 'h-8 w-8',
      titleSize: 'text-2xl',
      spacing: 'space-y-6'
    },
    '6-8': {
      fontSize: 'text-base',
      buttonSize: 'px-4 py-3 text-base',
      panelPadding: 'p-4',
      borderRadius: 'rounded-2xl',
      iconSize: 'h-6 w-6',
      titleSize: 'text-xl',
      spacing: 'space-y-4'
    }
  };

  const currentBg = backgrounds[background];
  const currentTheme = darkMode ? theme.dark : theme.light;
  const styles = ageStyles[ageGroup];

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const onConnectButtonClicked = useCallback(async () => {
    if (isConnected) {
      try {
        setIsLoading(true);
        await room.disconnect(); // Correct: disconnect from the LiveKit room instance
        setIsConnected(false); // Update the connection state.  
        setIsListening(false); // Update the listening state.
      } catch (error) {
        console.error("Failed to disconnect from LiveKit room:", error);
      } finally {
        setIsLoading(false);
      }
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
      } finally {
        setIsLoading(false);
      }
    }
  }, [room, isConnected]); // Add isConnected to dependencies

  /**
   * useEffect hook to handle LiveKit media device errors and voice activity.
   */
  useEffect(() => {
    // Register the error handler function for media device errors.
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    // Register event listeners for AI agent voice activity detection
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === 'audio' && !participant.isLocal) {
        // This is the AI agent's audio track
        console.log('AI Agent audio track subscribed:', participant.identity);
        
        // Get the audio track's MediaStreamTrack
        const mediaStreamTrack = track.mediaStreamTrack;
        
        if (mediaStreamTrack) {
          // Create audio context for real-time analysis
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const stream = new MediaStream([mediaStreamTrack]);
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);
          
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          let animationId;
          
          // Monitor AI agent's voice levels
          const checkAIVoiceLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            const intensity = Math.min(average / 128, 1); // Normalize to 0-1
            
            // Update states based on AI voice activity
            const isAISpeaking = intensity > 0.05; // Lower threshold for AI detection
            
            // Debug logging for AI speech detection
            if (isAISpeaking && intensity > 0.1) {
              console.log(`AI speaking detected - intensity: ${intensity.toFixed(3)}`);
            }
            
            setVoiceIntensity(intensity);
            setIsAgentSpeaking(isAISpeaking);
            
            if (isConnected) {
              animationId = requestAnimationFrame(checkAIVoiceLevel);
            }
          };
          
          // Start monitoring
          checkAIVoiceLevel();
          
          // Store cleanup function
          track.on('ended', () => {
            if (animationId) {
              cancelAnimationFrame(animationId);
            }
            audioContext.close();
            setIsAgentSpeaking(false);
            setVoiceIntensity(0);
          });
        }
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      if (track.kind === 'audio' && !participant.isLocal) {
        console.log('AI Agent audio track unsubscribed');
        setIsAgentSpeaking(false);
        setVoiceIntensity(0);
      }
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      if (participant.isAgent) {
        setIsAgentSpeaking(false);
        setVoiceIntensity(0);
      }
    });

    // Cleanup function: Unregister the error handler when the component unmounts.
    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
      setIsAgentSpeaking(false);
      setVoiceIntensity(0);
    };
  }, [room, isConnected]); // Dependency array includes 'room' and 'isConnected'


  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentBg.gradient} relative overflow-hidden`}>
      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="text-6xl animate-pulse grid grid-cols-6 gap-8 p-8">
          {Array.from({length: 24}).map((_, i) => (
            <div key={i} className="transform rotate-12">
              {currentBg.pattern.split('')[i % 3]}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className={`relative z-10 flex items-center justify-between p-4 ${darkMode ? 'bg-slate-800/95' : 'bg-slate-100/95'} backdrop-blur-md border-b ${currentTheme.panelBorder}`}>
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <ChevronLeft className={`h-6 w-6 ${currentTheme.textPrimary} cursor-pointer hover:scale-110 transition-transform`} />
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-4xl">🎤</span>
            <div>
              <h1 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary}`}>Talk to Mel</h1>
              <p className={`${currentTheme.textSecondary} text-sm`}>Voice Assistant</p>
            </div>
          </div>
        </div>
        
        {/* Settings Menu */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-full ${currentTheme.panelBg} hover:scale-105 transition-all shadow-lg`}
        >
          <Menu className={`h-5 w-5 ${currentTheme.textPrimary}`} />
        </button>
      </div>

      {/* Settings Panel */}
      {isMenuOpen && (
        <div className={`absolute top-0 right-0 w-80 h-full ${currentTheme.settingsBg} backdrop-blur-md z-50 p-6 overflow-y-auto`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${currentTheme.textPrimary}`}>Settings</h2>
            <button onClick={() => setIsMenuOpen(false)}>
              <X className={`h-6 w-6 ${currentTheme.textPrimary}`} />
            </button>
          </div>
          
          {/* Dark Mode Toggle */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Theme</h3>
            <div className="flex items-center justify-between">
              <span className={currentTheme.textSecondary}>Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Age Group Selection */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Age Group</h3>
            <div className="space-y-2">
              {['1-5', '6-8'].map(age => (
                <button
                  key={age}
                  onClick={() => setAgeGroup(age)}
                  className={`w-full p-3 rounded-xl text-left ${
                    ageGroup === age ? currentTheme.settingsSelected : currentTheme.settingsPanel
                  } ${ageGroup === age ? '' : currentTheme.textPrimary}`}
                >
                  Grades {age}
                </button>
              ))}
            </div>
          </div>

          {/* Background Selection */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Background Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(backgrounds).map(([key, bg]) => (
                <button
                  key={key}
                  onClick={() => setBackground(key)}
                  className={`p-3 rounded-xl bg-gradient-to-br ${bg.gradient} text-white text-sm font-medium ${
                    background === key ? 'ring-4 ring-blue-500' : ''
                  }`}
                >
                  {bg.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <RoomContext.Provider value={room}>
          {/* Only render the main content panel when connected */}
          {isConnected ? (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center p-4">
              <RoomAudioRenderer muted={isMuted} />
              
              {/* Large Agent Avatar Visualization */}
              <div className="flex flex-col items-center mb-6">
                <AgentAvatar 
                  isSpeaking={isAgentSpeaking}
                  size={ageGroup === '1-5' ? 'xl' : 'large'}
                  color={isAgentSpeaking ? 'blue' : 'green'}
                  showSpeakingIndicator={true}
                  className="mb-4"
                />
                
                {/* Enhanced Status text */}
                <div className="text-center">
                  <p className={`${styles.fontSize} font-semibold ${currentTheme.textPrimary} mb-3`}>
                    {!isListening && !isAgentSpeaking && 'Mel is Ready to Chat'}
                    {isListening && !isAgentSpeaking && 'Mel is Listening...'}
                    {isAgentSpeaking && 'Mel is Speaking'}
                  </p>
                  
                  {/* Enhanced Voice activity indicator */}
                  {(isListening || isAgentSpeaking) && (
                    <div className="mt-3 flex justify-center space-x-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 rounded-full transition-all duration-150 ${
                            voiceIntensity * 5 > i ? 'bg-gradient-to-t from-blue-400 to-blue-600' : 'bg-gray-300'
                          }`}
                          style={{
                            height: `${12 + (voiceIntensity * 5 > i ? voiceIntensity * 20 : 0)}px`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expanded Transcription View - Temporarily commented out */}
              {/* <div
                className={`w-full flex-1 overflow-y-auto overflow-x-hidden ${styles.borderRadius} ${currentTheme.cardBg} p-4`}
                style={{
                  height: 'calc(100vh - 16rem)', // Fixed height for transcriptions
                  minHeight: '300px', // Minimum readable height
                }}
              >
                <div 
                  className="w-full h-full overflow-y-auto overflow-x-hidden"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#9CA3AF #F3F4F6'
                  }}
                >
                  <TranscriptionView />
                </div>
              </div> */}
            </div>
          ) : (
            /* Welcome screen when not connected */
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl mb-4">🎤</div>
              <p className={`${styles.fontSize} font-semibold ${currentTheme.textPrimary} mb-2`}>
                Ready to Connect
              </p>
              <p className={`text-sm ${currentTheme.textSecondary}`}>
                Press the connect button below to start talking with Mel
              </p>
            </div>
          )}
          {/* Control panel: centered if not connected, fixed bottom if connected */}
          {isConnected ? (
            <div className="fixed bottom-4 left-0 w-full flex justify-center z-50 pointer-events-none">
              <VoiceAgentControlPanel
                isConnected={isConnected}
                isListening={isListening}
                isMuted={isMuted}
                onConnectButtonClicked={onConnectButtonClicked}
                onToggleMute={handleToggleMute}
                styles={styles}
                currentTheme={currentTheme}
                isLoading={isLoading}
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
                  styles={styles}
                  currentTheme={currentTheme}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </RoomContext.Provider>
      </main>
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


function VoiceAgentControlPanel({
  isConnected,
  isListening,
  isMuted,
  onConnectButtonClicked,
  onToggleMute,
  styles,
  currentTheme,
  isLoading
}) {
  return (
    <div
      className={`w-full max-w-2xl mx-auto flex flex-row items-center justify-center space-x-8 ${currentTheme.panelBg} backdrop-blur-md shadow-xl ${styles.borderRadius} ${styles.panelPadding} border ${currentTheme.panelBorder} pointer-events-auto transition-all duration-300`}
    >
      <div className="flex flex-col items-center">
        <button
          onClick={onConnectButtonClicked}
          disabled={isLoading}
          className={`w-16 h-16 ${styles.borderRadius} flex items-center justify-center transition-all duration-300 mb-2 shadow-lg hover:scale-105 ${
            isLoading 
              ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
              : isConnected
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : isConnected ? (
            <StopCircle size={28} />
          ) : (
            <PlayCircle size={28} />
          )}
        </button>
        <span className={`${styles.fontSize} font-medium ${currentTheme.textPrimary}`}>
          {isLoading ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
        </span>
      </div>
      
      <div className="flex flex-col items-center">
        <button
          disabled={!isConnected}
          className={`w-16 h-16 ${styles.borderRadius} flex items-center justify-center transition-all duration-300 mb-2 shadow-lg ${
            !isConnected
              ? 'bg-gray-400 text-gray-300 cursor-not-allowed opacity-60'
              : isListening
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:scale-105'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105'
          }`}
        >
          {isListening ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
        <span className={`${styles.fontSize} font-medium ${currentTheme.textPrimary}`}>
          {isListening ? 'Listening' : 'Microphone'}
        </span>
      </div>
      
      <div className="flex flex-col items-center">
        <button
          onClick={onToggleMute}
          disabled={!isConnected}
          className={`w-16 h-16 ${styles.borderRadius} flex items-center justify-center transition-all duration-300 mb-2 shadow-lg ${
            !isConnected
              ? 'bg-gray-400 text-gray-300 cursor-not-allowed opacity-60'
              : isMuted
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:scale-105'
          }`}
        >
          {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
        </button>
        <span className={`${styles.fontSize} font-medium ${currentTheme.textPrimary}`}>
          {isMuted ? 'Unmute' : 'Audio'}
        </span>
      </div>
    </div>
  );
}
