import React from 'react'
import {useState} from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { ScrollArea } from '../components/ScrollArea'
import { Button } from '../components/Button';
import { Play, ChevronDown, CircleArrowLeft, Trash2, CircleArrowLeftIcon } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer'
import { Link } from 'react-router-dom'
import OpenAiInterface from '../components/OpenAiInterface'
import Navbar from '../components/NavBar'
import ConversationThread from '../components/ConversationThread'
import TextEditor from '../components/TextEditor'
import { updateLectures } from '../reducers/lecturesSlice'
import axios from 'axios'
import Alert from '../components/Alert'
import OpenAIInterface from '../components/OpenAiInterface'

const notesApi = import.meta.env.VITE_NOTES_URL


function study() {
    const [isOpen, setIsOpen] = useState(false);
    const [summaryIsOpen, setSummaryIsOpen] = useState(false);
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

{/* <Navbar id="study" /> */}
<Alert message={alertMessage} />
        <div className="relative p-4">
          <div className="container mx-auto">
            <div className='flex items-center space-x-2'>
              <Link to="/dashboard"  >
              <CircleArrowLeftIcon className='h-8 w-8 mb-2 mx-2'/>
              </Link>
              
            <h1 className="text-4xl font-bold mb-2 ">{subject} Notes</h1>
            </div>
                <div className="grid grid-cols-1 lg: grid-cols-[1fr,2fr,1fr] gap-4">
                  <div>
                    <Card className="w-full relative h-[calc(100vh-5rem)] border-0 bg-black">
                      <CardHeader>
                        <CardTitle className="text-lg">Transcripts</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                              <div className="flex items-center space-x-2 mb-4">
                                <AudioPlayer audioUrl={url} />
                              </div>
                              <div className="space-y-2">
                                <Button
                                  variant="outline"
                                  className="w-full justify-between"
                                  onClick={() => setIsOpen(!isOpen)}
                                >
                                  Lecture Transcript <ChevronDown className="h-4 w-4" />
                                </Button>
                                {isOpen && (
                                  <ScrollArea className="h-48 w-full rounded-md border-0">
                                    <div className="p-4">
                                      {transcript}
                                    </div>
                                  </ScrollArea>
                                )}
                                <Button
                                  variant="outline"
                                  className="w-full justify-between"
                                  onClick={() => setSummaryIsOpen(!summaryIsOpen)}
                                >
                                  Summary <ChevronDown className="h-4 w-4" />
                                </Button>
                                {summaryIsOpen && (
                                  <ScrollArea className="h-48 w-full rounded-md border-0">
                                  <div className="p-4">
                                    {summary}
                                  </div>
                                </ScrollArea>
                                )}
                              </div>
                            </CardContent>

                    </Card>
                  </div>
                  <div className="">
                  <Card className="w-full  relative h-[calc(100vh-5rem)] bg-black border-0"> 
                    <CardContent className="">
                        <CardHeader>
                          <CardTitle className="text-lg">Chats</CardTitle>
                        </CardHeader>
                        <OpenAIInterface roomId={roomId} />
                    </CardContent>
                  </Card>
                  </div>
                  <div className="">
                  <Card className="w-full relative h-[calc(100vh-5rem)] border-0 bg-black">
                  <CardContent className="">
                      <CardHeader>
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                  </CardContent>

                  </Card>     
                  </div>
                </div>
              </div>
            </div>           
    </>    
  )
}

export default study