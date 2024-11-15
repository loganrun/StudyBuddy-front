import React, {useState} from 'react'
import Navbar from '../components/NavBar'
import BottomToolbar from '../components/BottomToolbar'
import StartButton from '../components/modal/StartButton';
import { useParams,useLocation } from 'react-router-dom';
//import { useSelector } from 'react-redux';
import TextEditor from '../components/TextEditor'
//import VoiceChat from '../components/VoiceChat'
import OpenAiInterface from '../components/OpenAiInterface'
import VideoChat from '../components/VideoChat';

function tutoringPage({socket}) {
  //const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
  
  const {documentId, roomId, id, userType} = useParams()
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Control functions
  const toggleVideo = () => setIsVideoOn((prev) => !prev);
  const toggleMute = () => setIsMuted((prev) => !prev);
  const toggleCall = () => setIsCalling((prev) => !prev);

  const handleStartSession = () => {
    setIsCalling(true)
    setIsModalOpen(false);
    
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    // Additional logic for canceling, if needed
  };

  if(userType === 'student'){

    return (
      <>
        <Navbar id="study" />
        <div className="relative min-h-screen p-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <TextEditor socket={socket} id={documentId} purpose={'Tutoring Session'} />
              </div>
              <div className="space-y-4">
              <VideoChat roomID={roomId} userId={id} userType={userType}/> 
              </div> 
            </div>
          </div>
        </div>
        
      </>
    
    )

  }else{
    return (
      <>
      {isModalOpen && (
        <StartButton
          buttonText="Start Session"
          onStart={handleStartSession}
          onCancel={handleCancel}
        />
      )}
        <div className="relative min-h-screen p-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div>
              <TextEditor socket={socket} id={documentId} roomId={roomId} />
              </div>
              <div className="space-y-4">
                <VideoChat roomID={roomId} userId={id} isVideoOn={isVideoOn} isMuted={isMuted} isCalling={isCalling}/>             
              <OpenAiInterface/>
              </div>
            </div>
          </div>
        </div>
        <BottomToolbar toggleVideo={toggleVideo} toggleMute={toggleMute} isVideoOn={isVideoOn} isMuted={isMuted} toggleCall={toggleCall} isCalling={isCalling} />
      </>
    )

  } 
}

export default tutoringPage