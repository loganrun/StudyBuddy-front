import React from 'react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "../components/Sheets"






import { ScrollArea } from '../components/ScrollArea'
import { Button } from '../components/Button';
import { CircleArrowLeftIcon } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer'
import { Link } from 'react-router-dom'
//import { updateLectures } from '../reducers/lecturesSlice'
//import axios from 'axios'
import Alert from '../components/Alert'
import OpenAIInterface from '../components/OpenAiInterface'
import DownloadSources from '../components/DownloadSources'

const notesApi = import.meta.env.VITE_NOTES_URL


function study() {
  //const [isOpen, setIsOpen] = useState(false);
  //const [summaryIsOpen, setSummaryIsOpen] = useState(false);
  const params = useLocation()
  //const [newNotes, setNewNotes] = useState('')
  const { url, subject, transcript, date, _id, notes, summary, roomId } = params.state;
  //const dispatch = useDispatch()
  const [alertMessage, setAlertMessage] = useState('');

  //const title = subject
  //console.log(title)
  //console.log(notes)

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const apiNotes = `${notesApi}${_id}`
  //   try { 
  //     const response = await axios({
  //       method: "put",
  //       url: apiNotes,
  //       data: {
  //         notes: newNotes
  //       },
  //       headers: {
  //         "Content-Type": "application/json"
  //       }
  //     })

  //     setAlertMessage('Notes Saved');

  //     dispatch(updateLectures(response.data))    

  //   } catch (error) {
  //     setAlertMessage(error.message)
  //   }

  // }

  return (
    <>
      <Alert message={alertMessage} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="flex items-center space-x-2 p-4">
          <Link to="/dashboard">
            <CircleArrowLeftIcon className='h-8 w-8 text-white' />
          </Link>
          <h1 className="text-2xl font-bold text-white">{subject} Notes</h1>
        </div>

        <div className="flex gap-4 p-4 h-[calc(100vh-5rem)]">
          {/* Left Panel - Transcripts */}
          <div className="w-1/4">
            <Card className="h-full bg-slate-800 shadow-lg rounded-xl border border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg text-white">Transcripts</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <DownloadSources />
                  <AudioPlayer audioUrl={url} />
                </div>
                <div className="space-y-2">
                  <Sheet>
                    <SheetTrigger>
                      <Button variant="outline" className="w-full justify-between hover:bg-slate-700 text-white border-slate-600">
                        <h1 className='text-lg'>Lecture Transcript</h1>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetDescription className="max-h-[calc(100vh-14rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="text-lg text-slate-300 mt-2">
                          {transcript}
                        </div>
                      </SheetDescription>
                      <SheetFooter>
                        <SheetClose>Close</SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                  <Sheet>
                    <SheetTrigger>
                      <Button variant="outline" className="w-full justify-between hover:bg-slate-700 text-white border-slate-600">
                        <h1 className='text-lg'>Summary</h1>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetDescription className="max-h-[calc(100vh-14rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="text-sm text-slate-300 mt-2">
                          {summary}
                        </div>
                      </SheetDescription>
                      <SheetFooter>
                        <SheetClose>Close</SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Chat */}
          <div className="w-2/4">
            <Card className="h-full bg-slate-800 shadow-lg rounded-xl border border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Chat</CardTitle>
                  <Link to="/voiceAgent">
                    <button className="flex items-center justify-center px-6 py-2 bg-rose-600 text-white uppercase rounded-md hover:bg-gray-200 hover:text-rose-600 transition">
                      Talk to mel
                    </button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <OpenAIInterface roomId={roomId} />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Notes */}
          <div className="w-1/4">
            <Card className="h-full bg-slate-800 shadow-lg rounded-xl border border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg text-white">Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* Add your notes content here */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default study