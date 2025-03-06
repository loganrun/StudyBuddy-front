import React, { useState } from 'react'
import TutorToolbar from '../components/TutorToolbar'
import StudentToolbar from '../components/StudentToolbar';
import StartButton from '../components/modal/StartButton';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
} from "../components/Card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/Tabs";
import Whiteboard from '../components/WhiteBoard';
import TextEditor from '../components/TextEditor'
import OpenAiInterface from '../components/OpenAiInterface'
import VideoChat from '../components/VideoChat';
import LessonPlanner from '../components/LessonPlanner';

function TutoringPage({socket}) {
  const {documentId, roomId, id, userType} = useParams()
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("TextEditor");
  const [selectedTutorTab, setSelectedTutorTab] = useState("VideoChat");

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
  };

  const renderTabs = (isTutor) => (
    <div className="w-full">
      <Tabs 
        defaultValue='TextEditor' 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger 
            value="WhiteBoard" 
            className={`rounded-full ${activeTab === 'WhiteBoard' ? 'bg-white text-black' : 'text-gray-400'}`}
          >
            WhiteBoard
          </TabsTrigger>
          <TabsTrigger 
            value="TextEditor" 
            className={`rounded-full ${activeTab === 'TextEditor' ? 'bg-white text-black' : 'text-gray-400'}`}
          >
            Text Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="TextEditor" className="w-full">
          <Card className="border-0 w-full ">
            <CardContent className="p-0 w-full ">
              <TextEditor socket={socket} id={documentId} purpose={'Tutoring Session'} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="WhiteBoard" className="w-full">
          <Card className="border-0 w-full">
            <CardContent className="p-0 w-full">
              <Whiteboard socket={socket} id={documentId} roomId={roomId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderTutorSpecificTabs = () => (
    <Tabs 
      defaultValue='VideoChat'
      value={selectedTutorTab}
      onValueChange={setSelectedTutorTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger 
          value="VideoChat" 
          className={`rounded-full ${selectedTutorTab === 'VideoChat' ? 'bg-white text-black' : 'text-gray-400'}`}
        >
          Video Chat
        </TabsTrigger>
        <TabsTrigger 
          value="LessonPlanner" 
          className={`rounded-full ${selectedTutorTab === 'LessonPlanner' ? 'bg-white text-black' : 'text-gray-400'}`}
        >
          Lesson Planner
        </TabsTrigger>
      </TabsList>

      <TabsContent value="VideoChat" className="w-full">
        <Card className="border-0 w-full">
          <CardContent className="p-0 w-full flex flex-col">
            <VideoChat 
              roomID={roomId} 
              userId={id} 
              isVideoOn={isVideoOn} 
              isMuted={isMuted} 
              isCalling={isCalling}
            />             
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="LessonPlanner" className="w-full">
        <Card className="border-0 w-full">
          <CardContent className="p-0 w-full">
            <LessonPlanner/>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  if(userType === 'student'){
    return (
      <>
        {isModalOpen && (
          <StartButton
            buttonText="Join Session"
            onStart={handleStartSession}
            onCancel={handleCancel}
          />
        )}
        <div className="relative min-h-screen p-4 flex flex-col">
          <div className="container mx-auto flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {renderTabs()}
              <div className="flex items-center justify-center">
                <VideoChat 
                  roomID={roomId} 
                  userId={id} 
                  userType={userType} 
                  isVideoOn={isVideoOn} 
                  isMuted={isMuted} 
                  isCalling={isCalling}
                /> 
              </div>
            </div>
          </div>
        </div>
        <StudentToolbar 
          toggleVideo={toggleVideo} 
          toggleMute={toggleMute} 
          isVideoOn={isVideoOn} 
          isMuted={isMuted} 
          toggleCall={toggleCall} 
          isCalling={isCalling} 
        />
      </>
    )
  } else {
    return (
      <>
        {isModalOpen && (
          <StartButton
            buttonText="Start Session"
            onStart={handleStartSession}
            onCancel={handleCancel}
          />
        )}
        <div className="relative min-h-screen p-4 flex flex-col">
          <div className="container mx-auto flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {renderTabs()}
              
              {renderTutorSpecificTabs()}
              
            </div>
          </div>
        </div>
        <TutorToolbar 
          toggleVideo={toggleVideo} 
          toggleMute={toggleMute} 
          isVideoOn={isVideoOn} 
          isMuted={isMuted} 
          toggleCall={toggleCall} 
          isCalling={isCalling} 
        />
      </>
    )
  } 
}

export default TutoringPage

// import React, {useState} from 'react'
// import TutorToolbar from '../components/TutorToolbar'
// import StudentToolbar from '../components/StudentToolbar';
// import StartButton from '../components/modal/StartButton';
// import { useParams,useLocation } from 'react-router-dom';
// import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle,} from "../components/Card";
// import {Tabs,TabsContent,TabsList,TabsTrigger,} from "../components/Tabs";
// import Whiteboard from '../components/WhiteBoard';
// //import { useSelector } from 'react-redux';
// import TextEditor from '../components/TextEditor'
// //import VoiceChat from '../components/VoiceChat'
// import OpenAiInterface from '../components/OpenAiInterface'
// import VideoChat from '../components/VideoChat';
// import LessonPlanner from '../components/LessonPlanner';

// function tutoringPage({socket}) {
//   //const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
  
//   const {documentId, roomId, id, userType} = useParams()
  
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(true);
//   const [isActive, setIsActive] = useState("TextEditor");
//   const [selected, setSelected] = useState("VideoChat");

//   // Control functions
//   const toggleVideo = () => setIsVideoOn((prev) => !prev);
//   const toggleMute = () => setIsMuted((prev) => !prev);
//   const toggleCall = () => setIsCalling((prev) => !prev);

//   const handleStartSession = () => {
//     setIsCalling(true)
//     setIsModalOpen(false);
    
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     // Additional logic for canceling, if needed
//   };

//   if(userType === 'student'){

//     return (
//       <>
//       {isModalOpen && (
//         <StartButton
//           buttonText="Join Session"
//           onStart={handleStartSession}
//           onCancel={handleCancel}
//         />
//       )}
//         <div className="relative min-h-screen p-4">
//           <div className="container mx-auto">
//             <div className="grid grid-cols-1 md:grid-cols-2">
//               <Tabs defaultValue='TextEditor' >
//                 <TabsList className="grid w-full grid-cols-2">
//                   <TabsTrigger className={`rounded-full ${isActive === 'WhiteBoard' ? 'bg-white text-black w-32' : 'text-gray-400'}`} 
//                   value="WhiteBoard" onClick={() => setIsActive('WhiteBoard')}>WhiteBoard</TabsTrigger>
//                   <TabsTrigger className={`rounded-full ${isActive === 'TextEditor' ? 'bg-white text-black w-32' : 'text-gray-400'}`}
//                   value="TextEditor" onClick={() => setIsActive('TextEditor')}>Text Editor</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="TextEditor" >
//                   <Card className="border-0 ">
//                     <CardContent className="container mx-auto flex  flex-col  ">
//                     <TextEditor socket={socket} id={documentId} purpose={'Tutoring Session'} />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//                 <TabsContent value="WhiteBoard" >
//                   <Card className="border-0 ">
//                     <CardContent>
//                     <Whiteboard socket={socket} id={documentId} roomId={roomId} />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//               <div className="space-y-4">
//               <VideoChat roomID={roomId} userId={id} userType={userType} isVideoOn={isVideoOn} isMuted={isMuted} isCalling={isCalling}/> 
//               </div> 
//             </div>
//           </div>
//         </div>
//         <StudentToolbar toggleVideo={toggleVideo} toggleMute={toggleMute} isVideoOn={isVideoOn} isMuted={isMuted} toggleCall={toggleCall} isCalling={isCalling} />
//       </>
    
//     )

//   }else{
//     return (
//       <>
//       {isModalOpen && (
//         <StartButton
//           buttonText="Start Session"
//           onStart={handleStartSession}
//           onCancel={handleCancel}
//         />
//       )}
//         <div className="relative min-h-screen p-4">
//           <div className="container mx-auto">
//             <div className="grid grid-cols-1 md:grid-cols-2">
//             <Tabs defaultValue='TextEditor' >
//                 <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger className={`rounded-full ${isActive === 'WhiteBoard' ? 'bg-white text-black w-32' : 'text-gray-400'}`} 
//                   value="WhiteBoard" onClick={() => setIsActive('WhiteBoard')}>WhiteBoard</TabsTrigger>
//                   <TabsTrigger className={`rounded-full ${isActive === 'TextEditor' ? 'bg-white text-black w-32' : 'text-gray-400'}`}
//                   value="TextEditor" onClick={() => setIsActive('TextEditor')}>Text Editor</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="TextEditor" >
//                   <Card className="border-0 ">
//                     <CardContent className="container mx-auto  h-[calc(100vh-6rem)] flex  flex-col">
//                     <TextEditor socket={socket} id={documentId} purpose={'Tutoring Session'} />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//                 <TabsContent value="WhiteBoard" >
//                   <Card className="border-0 ">
//                     <CardContent>
//                     <Whiteboard socket={socket} id={documentId} roomId={roomId} />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>
//               <div className="space-y-4">
//                 <Tabs defaultValue='VideoChat'>
//                 <TabsList className="grid w-full grid-cols-2">
//                   <TabsTrigger className={`rounded-full ${selected === 'VideoChat' ? 'bg-white text-black w-32' : 'text-gray-400'}`}
//                   value="VideoChat" onClick={() => setSelected('VideoChat')}>Video Chat</TabsTrigger>
//                   <TabsTrigger className={`rounded-full ${selected === 'LessonPlanner' ? 'bg-white text-black w-32' : 'text-gray-400'}`} 
//                   value="LessonPlanner" onClick={() => setSelected('LessonPlanner')}>Lesson Planner</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="VideoChat" >
//                   <Card className="border-0 ">
//                     <CardContent className="container mx-auto  h-[calc(100vh-6rem)] flex  flex-col">
//                     <VideoChat roomID={roomId} userId={id} isVideoOn={isVideoOn} isMuted={isMuted} isCalling={isCalling}/>             
//                       <OpenAiInterface/>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//                 <TabsContent className="w-full" value="LessonPlanner" >
//                   <Card className="border-0 ">
//                     <CardContent className="container mx-auto  w-full h-[calc(100vh-6rem)] flex  flex-col">
//                     <LessonPlanner/>
                    
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 </Tabs>
                
//               </div>
//             </div>
//           </div>
//         </div>
//         <TutorToolbar toggleVideo={toggleVideo} toggleMute={toggleMute} isVideoOn={isVideoOn} isMuted={isMuted} toggleCall={toggleCall} isCalling={isCalling} />
//       </>
//     )

//   } 
// }

// export default tutoringPage