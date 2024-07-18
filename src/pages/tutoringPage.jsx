import React from 'react'
import Navbar from '../components/NavBar'
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TextEditor from '../components/TextEditor'
import VoiceChat from '../components/VoiceChat'
import OpenAiInterface from '../components/OpenAiInterface'
import ConversationThread from '../components/ConversationThread'

function tutoringPage({socket}) {
  const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
    //const tutor = useParams();
    //console.log(tutor.roomId)


  return (<>
    <Navbar />
    <div className="relative min-h-screen p-4">
   
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
          <TextEditor socket={socket} />
          </div>
          <div className="space-y-4">
          <ConversationThread/>
          <OpenAiInterface/>
          </div>
        </div>
      </div>
    </div>
    {/* <div>Tutoring Session : {roomId}</div>
   
    
    
     */}
  </>

)
}

export default tutoringPage