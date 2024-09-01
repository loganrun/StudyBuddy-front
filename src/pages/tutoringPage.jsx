import React from 'react'
import Navbar from '../components/NavBar'
import { useParams,useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TextEditor from '../components/TextEditor'
//import VoiceChat from '../components/VoiceChat'
import OpenAiInterface from '../components/OpenAiInterface'
import VideoChat from '../components/VideoChat';

function tutoringPage({socket}) {
  //const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
  
  const {documentId, roomId, id, userType} = useParams()

  console.log(id)

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
        <Navbar />
        <div className="relative min-h-screen p-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <TextEditor socket={socket} id={documentId} roomId={roomId} />
              </div>
              <div className="space-y-4">
                <VideoChat roomID={roomId} userId={id}/>             
              <OpenAiInterface/>
              </div>
            </div>
          </div>
        </div>
      </>
    )

  } 
}

export default tutoringPage