import React from 'react'
import {useState} from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import AudioPlayer from '../components/AudioPlayer'
import OpenAiInterface from '../components/OpenAiInterface'
import Navbar from '../components/NavBar'
import ConversationThread from '../components/ConversationThread'
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
    //console.log(_id)
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
    <Navbar id = "study" />
    <Alert message={alertMessage} />
    <div className="container mx-auto mt-4">
    <h1 className="text-2xl font-bold mb-4">Lesson Review</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 justify-center mt-20 max-w-screen-lg mx-auto">
    
    <div className="bg-white rounded-lg  p-4" id={_id}>
            <AudioPlayer audioUrl={url}/>
        <div className="flex items-center mb-2">
            <i className="fas fa-volume-up mr-2 text-gray-500"></i> 
            <p  className="text-sky-800 text-xl font-bold">{subject}</p>
            <p className="text-sky-800  mx-6 font-bold">{date}</p>
            
        </div>
        <div className="border rounded-md p-4">
    <button
        className="flex justify-between items-center w-full py-2 px-4 bg-rose-600 rounded-md mb-4 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
    >
        <span className="text-lg font-semibold">Review Lecture</span>
        <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 transition-transform transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'}
        />
        </svg>
    </button>
    {isOpen && (
        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
        <p className="text-gray-700 overflow-hidden text-ellipsis">{transcript}</p>
        </div>
    )}
    </div>
    <div className=" rounded-md p-4">
                <button
                    className="flex justify-between items-center w-full py-2 px-4 bg-rose-600 rounded-md  focus:outline-none"
                    onClick={() => setsummaryIsOpen(!summaryIsOpen)}
                >
                    <span className="text-lg font-semibold">Summary</span>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transition-transform transform ${summaryIsOpen ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={summaryIsOpen ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'}
                    />
                    </svg>
                </button>
                    {summaryIsOpen && (
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                        <p className="text-gray-700 overflow-hidden text-ellipsis">{summary}</p>
                        </div>
                    )}
        
            </div>
    <div>     
    </div>
    </div>
    <div>
    <textarea 
      className="h-80 overflow-y-auto resize-none w-full border border-gray-300 rounded-md text-sky-800 text-base font-bold"
      placeholder="Add your Notes"
      value={notes}
      onChange={(e) => setNewNotes(e.target.value)}
    ></textarea>
    <div>
    <button className="bg-rose-600 text-white font-bold py-2 px-4 rounded"
      value={newNotes}
      onClick={handleSubmit}
    >Save</button>

    </div>
    

    </div>
    
    </div>
    <ConversationThread/>
    <OpenAiInterface/>

    </div>
    </>    
  )
}

export default study