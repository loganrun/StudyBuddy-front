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
import VideoChat from '../components/VideoChat';
import LessonPlanner from '../components/LessonPlanner';

function TutoringPage({socket}) {
  const {documentId, roomId, id, userType} = useParams()
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  
  // For tablet and mobile: Single tab selection across all available tabs
  const [activeSmallScreenTab, setActiveSmallScreenTab] = useState("VideoChat");
  
  // For large desktop: Separate tab selections for main content
  const [activeMainTab, setActiveMainTab] = useState("TextEditor");
  const [activeTutorTab, setActiveTutorTab] = useState("VideoChat");

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

  // Desktop layout tabs for main content (Whiteboard/TextEditor) - first column for both user types
  const renderDesktopMainTabs = () => (
    <div className="w-full">
      <Tabs 
        defaultValue='TextEditor' 
        value={activeMainTab} 
        onValueChange={setActiveMainTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger 
            value="WhiteBoard" 
            className={`rounded-full ${activeMainTab === 'WhiteBoard' ? 'bg-white text-black' : 'text-gray-400'}`}
          >
            WhiteBoard
          </TabsTrigger>
          <TabsTrigger 
            value="TextEditor" 
            className={`rounded-full ${activeMainTab === 'TextEditor' ? 'bg-white text-black' : 'text-gray-400'}`}
          >
            Text Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="TextEditor" className="w-full">
          <Card className="border-0 w-full">
            <CardContent className="p-0 w-full">
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

  // Desktop layout tabs for tutor's second column (VideoChat and LessonPlanner)
  const renderDesktopTutorTabs = () => (
    <Tabs 
      defaultValue='VideoChat'
      value={activeTutorTab}
      onValueChange={setActiveTutorTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger 
          value="VideoChat" 
          className={`rounded-full ${activeTutorTab === 'VideoChat' ? 'bg-white text-black' : 'text-gray-400'}`}
        >
          Video Chat
        </TabsTrigger>
        <TabsTrigger 
          value="LessonPlanner" 
          className={`rounded-full ${activeTutorTab === 'LessonPlanner' ? 'bg-white text-black' : 'text-gray-400'}`}
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
            <LessonPlanner activeSmallScreenTab={activeSmallScreenTab}/>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  // Mobile/Tablet layout with single column and all tabs accessible at the top
  const renderSmallScreenTabs = () => {
    // Define all available tabs based on user type
    const allTabs = ["VideoChat", "TextEditor", "WhiteBoard"]
    if (userType === 'tutor') {
      allTabs.push("LessonPlanner")
    }

    return (
      <div className="w-full">
        <Tabs 
          defaultValue='VideoChat' 
          value={activeSmallScreenTab} 
          onValueChange={setActiveSmallScreenTab}
          className="w-full"
        >
          <TabsList className="flex w-full overflow-x-auto">
            {allTabs.map(tab => (
              <TabsTrigger 
                key={tab}
                value={tab} 
                className={`flex-1 rounded-full ${activeSmallScreenTab === tab ? 'bg-white text-black' : 'text-gray-400'}`}
              >
                {tab === "WhiteBoard" ? "Whiteboard" : 
                 tab === "TextEditor" ? "Text Editor" :
                 tab === "VideoChat" ? "Video Chat" : "Lesson Planner"}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="VideoChat" className="w-full">
            <Card className="border-0 w-full">
              <CardContent className="p-0 w-full">
                <VideoChat 
                  roomID={roomId} 
                  userId={id} 
                  userType={userType} 
                  isVideoOn={isVideoOn} 
                  isMuted={isMuted} 
                  isCalling={isCalling}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="TextEditor" className="w-full">
            <Card className="border-0 w-full">
              <CardContent className="p-0 w-full">
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

          {userType === 'tutor' && (
            <TabsContent value="LessonPlanner" className="w-full">
              <Card className="border-0 w-full">
                <CardContent className="p-0 w-full">
                  <LessonPlanner/>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
  };

  return (
    <>
      {isModalOpen && (
        <StartButton
          buttonText={userType === 'tutor' ? "Start Session" : "Join Session"}
          onStart={handleStartSession}
          onCancel={handleCancel}
        />
      )}
      <div className="relative min-h-screen p-4 flex flex-col">
        <div className="container mx-auto flex-grow">
          {/* For tablet and medium screens */}
          <div className="block lg:hidden w-full">
            {renderSmallScreenTabs()}
          </div>
          
          {/* For large desktop screens only */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-4 h-full">
            {/* First column: WhiteBoard/TextEditor tabs for all users */}
            {renderDesktopMainTabs()}
            
            {/* Second column: Different for students and tutors */}
            {userType === 'tutor' ? (
              // Tutor gets VideoChat/LessonPlanner tabs in second column
              renderDesktopTutorTabs()
            ) : (
              // Student always gets VideoChat component (no tabs) in second column
              <div className="flex w-full">
                <Card className="border-0 w-full">
                  <CardContent className="p-0 w-full">
                    <VideoChat 
                      roomID={roomId} 
                      userId={id} 
                      userType={userType} 
                      isVideoOn={isVideoOn} 
                      isMuted={isMuted} 
                      isCalling={isCalling}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      {userType === 'student' ? (
        <StudentToolbar 
          toggleVideo={toggleVideo} 
          toggleMute={toggleMute} 
          isVideoOn={isVideoOn} 
          isMuted={isMuted} 
          toggleCall={toggleCall} 
          isCalling={isCalling} 
        />
      ) : (
        <TutorToolbar 
          toggleVideo={toggleVideo} 
          toggleMute={toggleMute} 
          isVideoOn={isVideoOn} 
          isMuted={isMuted} 
          toggleCall={toggleCall} 
          isCalling={isCalling} 
        />
      )}
    </>
  );
}

export default TutoringPage

// import React, { useState } from 'react'
// import TutorToolbar from '../components/TutorToolbar'
// import StudentToolbar from '../components/StudentToolbar';
// import StartButton from '../components/modal/StartButton';
// import { useParams } from 'react-router-dom';
// import {
//   Card,
//   CardContent,
// } from "../components/Card";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "../components/Tabs";
// import Whiteboard from '../components/WhiteBoard';
// import TextEditor from '../components/TextEditor'
// import VideoChat from '../components/VideoChat';
// import LessonPlanner from '../components/LessonPlanner';

// function TutoringPage({socket}) {
//   const {documentId, roomId, id, userType} = useParams()
  
//   const [isVideoOn, setIsVideoOn] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(true);
  
//   // For tablet and mobile: Single tab selection across all available tabs
//   const [activeSmallScreenTab, setActiveSmallScreenTab] = useState("VideoChat");
  
//   // For large desktop: Separate tab selections for each section
//   const [activeMainTab, setActiveMainTab] = useState("TextEditor");
//   const [activeTutorTab, setActiveTutorTab] = useState("VideoChat");

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
//   };

//   // Desktop layout tabs for main content (Whiteboard/TextEditor)
//   const renderDesktopMainTabs = () => (
//     <div className="w-full">
//       <Tabs 
//         defaultValue='TextEditor' 
//         value={activeMainTab} 
//         onValueChange={setActiveMainTab}
//         className="w-full"
//       >
//         <TabsList className="grid grid-cols-2 w-full">
//           <TabsTrigger 
//             value="WhiteBoard" 
//             className={`rounded-full ${activeMainTab === 'WhiteBoard' ? 'bg-white text-black' : 'text-gray-400'}`}
//           >
//             WhiteBoard
//           </TabsTrigger>
//           <TabsTrigger 
//             value="TextEditor" 
//             className={`rounded-full ${activeMainTab === 'TextEditor' ? 'bg-white text-black' : 'text-gray-400'}`}
//           >
//             Text Editor
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="TextEditor" className="w-full">
//           <Card className="border-0 w-full">
//             <CardContent className="p-0 w-full">
//               <TextEditor socket={socket} id={documentId} purpose={'Tutoring Session'} />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="WhiteBoard" className="w-full">
//           <Card className="border-0 w-full">
//             <CardContent className="p-0 w-full">
//               <Whiteboard socket={socket} id={documentId} roomId={roomId} />
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );

//   // Desktop layout tabs for tutor-specific content
//   const renderDesktopTutorTabs = () => (
//     <Tabs 
//       defaultValue='VideoChat'
//       value={activeTutorTab}
//       onValueChange={setActiveTutorTab}
//       className="w-full"
//     >
//       <TabsList className="grid grid-cols-2 w-full">
//         <TabsTrigger 
//           value="VideoChat" 
//           className={`rounded-full ${activeTutorTab === 'VideoChat' ? 'bg-white text-black' : 'text-gray-400'}`}
//         >
//           Video Chat
//         </TabsTrigger>
//         <TabsTrigger 
//           value="LessonPlanner" 
//           className={`rounded-full ${activeTutorTab === 'LessonPlanner' ? 'bg-white text-black' : 'text-gray-400'}`}
//         >
//           Lesson Planner
//         </TabsTrigger>
//       </TabsList>

//       <TabsContent value="VideoChat" className="w-full">
//         <Card className="border-0 w-full">
//           <CardContent className="p-0 w-full flex flex-col">
//             <VideoChat 
//               roomID={roomId} 
//               userId={id} 
//               isVideoOn={isVideoOn} 
//               isMuted={isMuted} 
//               isCalling={isCalling}
//             />             
//           </CardContent>
//         </Card>
//       </TabsContent>

//       <TabsContent value="LessonPlanner" className="w-full">
//         <Card className="border-0 w-full">
//           <CardContent className="p-0 w-full">
//             <LessonPlanner activeSmallScreenTab={activeSmallScreenTab}/>
//           </CardContent>
//         </Card>
//       </TabsContent>
//     </Tabs>
//   );

//   // Mobile/Tablet layout with single column and all tabs accessible at the top
//   const renderSmallScreenTabs = () => {
//     // Define all available tabs based on user type
//     const allTabs = ["VideoChat", "TextEditor", "WhiteBoard"]
//     if (userType === 'tutor') {
//       allTabs.push("LessonPlanner")
//     }

//     return (
//       <div className="w-full">
//         <Tabs 
//           defaultValue='VideoChat' 
//           value={activeSmallScreenTab} 
//           onValueChange={setActiveSmallScreenTab}
//           className="w-full"
//         >
//           <TabsList className="flex w-full overflow-x-auto">
//             {allTabs.map(tab => (
//               <TabsTrigger 
//                 key={tab}
//                 value={tab} 
//                 className={`flex-1 rounded-full ${activeSmallScreenTab === tab ? 'bg-white text-black' : 'text-gray-400'}`}
//               >
//                 {tab === "WhiteBoard" ? "Whiteboard" : 
//                  tab === "TextEditor" ? "Text Editor" :
//                  tab === "VideoChat" ? "Video Chat" : "Lesson Planner"}
//               </TabsTrigger>
//             ))}
//           </TabsList>

//           <TabsContent value="VideoChat" className="w-full">
//             <Card className="border-0 w-full">
//               <CardContent className="p-0 w-full">
//                 <VideoChat 
//                   roomID={roomId} 
//                   userId={id} 
//                   userType={userType} 
//                   isVideoOn={isVideoOn} 
//                   isMuted={isMuted} 
//                   isCalling={isCalling}
//                 />
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="TextEditor" className="w-full">
//             <Card className="border-0 w-full">
//               <CardContent className="p-0 w-full">
//                 <TextEditor socket={socket} id={documentId} purpose={'Tutoring Session'} />
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="WhiteBoard" className="w-full">
//             <Card className="border-0 w-full">
//               <CardContent className="p-0 w-full">
//                 <Whiteboard socket={socket} id={documentId} roomId={roomId} />
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {userType === 'tutor' && (
//             <TabsContent value="LessonPlanner" className="w-full">
//               <Card className="border-0 w-full">
//                 <CardContent className="p-0 w-full">
//                   <LessonPlanner/>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           )}
//         </Tabs>
//       </div>
//     );
//   };

//   return (
//     <>
//       {isModalOpen && (
//         <StartButton
//           buttonText={userType === 'tutor' ? "Start Session" : "Join Session"}
//           onStart={handleStartSession}
//           onCancel={handleCancel}
//         />
//       )}
//       <div className="relative min-h-screen p-4 flex flex-col">
//         <div className="container mx-auto flex-grow">
//           {/* For tablet and medium screens */}
//           <div className="block lg:hidden w-full">
//             {renderSmallScreenTabs()}
//           </div>
          
//           {/* For large desktop screens only */}
//           <div className="hidden lg:grid lg:grid-cols-2 gap-4 h-full">
//             {renderDesktopMainTabs()}
//             {userType === 'tutor' ? (
//               renderDesktopTutorTabs()
//             ) : (
//               <div className="flex items-center justify-center">
//                 <VideoChat 
//                   roomID={roomId} 
//                   userId={id} 
//                   userType={userType} 
//                   isVideoOn={isVideoOn} 
//                   isMuted={isMuted} 
//                   isCalling={isCalling}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       {userType === 'student' ? (
//         <StudentToolbar 
//           toggleVideo={toggleVideo} 
//           toggleMute={toggleMute} 
//           isVideoOn={isVideoOn} 
//           isMuted={isMuted} 
//           toggleCall={toggleCall} 
//           isCalling={isCalling} 
//         />
//       ) : (
//         <TutorToolbar 
//           toggleVideo={toggleVideo} 
//           toggleMute={toggleMute} 
//           isVideoOn={isVideoOn} 
//           isMuted={isMuted} 
//           toggleCall={toggleCall} 
//           isCalling={isCalling} 
//         />
//       )}
//     </>
//   );
// }

// export default TutoringPage


