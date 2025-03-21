import React from 'react'
import {useState} from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import {Sheet, SheetClose,SheetContent,SheetDescription,SheetFooter,SheetHeader,SheetTitle,SheetTrigger,} from "../components/Sheets"
import { ScrollArea } from '../components/ScrollArea'
import { Button } from '../components/Button';
import { CircleArrowLeftIcon } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer'
import { Link } from 'react-router-dom'
//import { updateLectures } from '../reducers/lecturesSlice'
//import axios from 'axios'
import Alert from '../components/Alert'
import OpenAIInterface from '../components/OpenAiInterface'

const notesApi = import.meta.env.VITE_NOTES_URL


function study() {
    //const [isOpen, setIsOpen] = useState(false);
    //const [summaryIsOpen, setSummaryIsOpen] = useState(false);
    const params = useLocation()
    //const [newNotes, setNewNotes] = useState('')
    const {url, subject, transcript, date, _id, notes, summary, roomId} = params.state;
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
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr,1fr] gap-4">
                  <div>
                    <Card className="w-full relative h-[calc(100vh-5rem)] border-0">
                      <CardHeader>
                        <CardTitle className="text-lg">Transcripts</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                              <div className="flex items-center space-x-2 mb-4">
                                <AudioPlayer audioUrl={url} />
                              </div>
                              <div className="space-y-2">
                                <Sheet className="flex w-full mt-6">
                                  <SheetTrigger>
                                    <Button
                                      variant="outline"
                                      className="flex w-full justify-between mt-6"
                                    >
                                      <h1 className='text-lg'>Lecture Transcript</h1>
                                    </Button>
                                  </SheetTrigger>
                                  <SheetContent side="left">
                                    <SheetDescription className="max-h-[calc(100vh-14rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                      <div className="text-lg text-muted-foreground mt-2">
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
                                    <Button
                                      variant="outline"
                                      className=" flex w-full justify-between p-4 mt-6"
                                    >
                                      <h1 className='text-lg p-4'>Summary</h1>
                                    </Button>
                                  </SheetTrigger>
                                  <SheetContent side="left">
                                    <SheetDescription className="max-h-[calc(100vh-14rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                      <div className="text-sm text-muted-foreground mt-2">
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
                  <div className="">
                  <Card className="w-full  relative h-[calc(100vh-5rem)] border-0 pb-10"> 
                    <CardContent className="">
                        <CardHeader>
                          <CardTitle className="text-lg">Chats</CardTitle>
                        </CardHeader>
                        <OpenAIInterface roomId={roomId} />
                    </CardContent>
                  </Card>
                  </div>
                  <div className="">
                  <Card className="w-full relative h-[calc(100vh-5rem)] border-0 ">
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