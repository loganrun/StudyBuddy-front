import React from 'react'
import {useState} from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import AudioPlayer from '../components/AudioPlayer'
import OpenAiInterface from '../components/OpenAiInterface'
import Navbar from '../components/NavBar'
import ConversationThread from '../components/ConversationThread'
import TextEditor from '../components/TextEditor'
import { updateLectures } from '../reducers/lecturesSlice'
import axios from 'axios'
import Alert from '../components/Alert'

const notesApi = import.meta.env.VITE_NOTES_URL


function study() {
    const [isOpen, setIsOpen] = useState(false);
    const [summaryIsOpen, setsummaryIsOpen] = useState(false);
    const params = useLocation()
    const [newNotes, setNewNotes] = useState('')
    const {url, subject, transcript, date, _id, notes, summary, roomId} = params.state;
    const dispatch = useDispatch()
    const [alertMessage, setAlertMessage] = useState('');
    const title = subject
    //console.log(title)
    //console.log(notes)

const handleSubmit = async (e) => {
  e.preventDefault();
  const apiNotes = `${notesApi}${_id}`
  try { 
    const response = await axios({
      method: "put",
      url: apiNotes,
      data: {
        notes: newNotes
      },
      headers: {
        "Content-Type": "application/json"
      }
    })

    setAlertMessage('Notes Saved');

    dispatch(updateLectures(response.data))    

  } catch (error) {
    setAlertMessage(error.message)
  }
  
}

  return (
<>

<Navbar id="study" />
<Alert message={alertMessage} />
        <div className="relative min-h-screen p-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <TextEditor title={title}/>
              </div>
              <div className="space-y-4">
              <OpenAiInterface/>
              </div>
            </div>
          </div>
        </div>

    
    </>    
  )
}

export default study