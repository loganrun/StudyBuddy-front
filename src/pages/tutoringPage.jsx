import React from 'react'
import Navbar from '../components/NavBar'
import { useParams,useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TextEditor from '../components/TextEditor'
import VoiceChat from '../components/VoiceChat'
import OpenAiInterface from '../components/OpenAiInterface'
import ConversationThread from '../components/ConversationThread'

function tutoringPage({socket}) {
  //const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
  
  const {roomId, userType} = useParams()

  console.log(userType)


  return (
  <>
    <Navbar />
    <div className="relative min-h-screen p-4">
   
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
          <TextEditor socket={socket} id={roomId} />
          </div>
          <div className="space-y-4">
          {/* <ConversationThread/> */}
          <OpenAiInterface/>
          </div>
        </div>
      </div>
    </div>
  </>

)
}

export default tutoringPage