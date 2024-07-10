import React from 'react'
import Navbar from '../components/NavBar'
import TextEditor from '../components/TextEditor'
import VoiceChat from '../components/VoiceChat'

function tutoringPage() {
  return (<React.Fragment>
    <Navbar />
    <div>tutoringPage</div>
    <VoiceChat />
    <TextEditor />
  </React.Fragment>
   
  )
}

export default tutoringPage