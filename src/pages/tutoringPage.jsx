import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom';
//import { useSelector } from 'react-redux';
import Navbar from '../components/NavBar'
import TextEditor from '../components/TextEditor'
import VoiceChat from '../components/VoiceChat'
import OpenAiInterface from '../components/OpenAiInterface'
import ConversationThread from '../components/ConversationThread'
import io from 'socket.io-client';

function TutoringPage() {
  const location = useLocation();
  const { roomId } = useParams();
  const [participants, setParticipants] = useState([]);
  //const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor);
  const isHost = location.state?.isHost || false;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketUrl = location.state?.socketUrl;
    if (socketUrl) {
      const newSocket = io(socketUrl);
      setSocket(newSocket);

      if (isHost) {
        console.log('Host joining room:', roomId);
        newSocket.emit('join_room', roomId, { isHost: true });
      } else {
        console.log('Participant joining room:', roomId);
        newSocket.emit('join_room', roomId, { isHost: false });
      }

      newSocket.on('user_joined', (userId) => {
        console.log('User joined:', userId);
        setParticipants(prev => [...prev, userId]);
      });

      newSocket.on('user_left', (userId) => {
        console.log('User left:', userId);
        setParticipants(prev => prev.filter(id => id !== userId));
      });

      return () => {
        newSocket.off('user_joined');
        newSocket.off('user_left');
        newSocket.close();
      };
    }
  }, [location.state, roomId, isHost]);

  // if (!socket) {
  //   return <div>Loading...</div>;
  // }

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen p-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <TextEditor socket={socket} isHost={isHost} />
            </div>
            <div className="space-y-4">
              <ConversationThread />
              <OpenAiInterface />
              {/* <VoiceChat socket={socket} roomId={roomId} participants={participants} isHost={isHost}/> */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TutoringPage;


// import React from 'react'
// import Navbar from '../components/NavBar'
// import { useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import TextEditor from '../components/TextEditor'
// import VoiceChat from '../components/VoiceChat'
// import OpenAiInterface from '../components/OpenAiInterface'
// import ConversationThread from '../components/ConversationThread'

// function tutoringPage({socket}) {
//   const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
//     //const tutor = useParams();
//     //console.log(tutor.roomId)


//   return (<>
//     <Navbar />
//     <div className="relative min-h-screen p-4">
   
//       <div className="container mx-auto">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//           <TextEditor socket={socket} />
//           </div>
//           <div className="space-y-4">
//           <ConversationThread/>
//           <OpenAiInterface/>
//           </div>
//         </div>
//       </div>
//     </div>
//     {/* <div>Tutoring Session : {roomId}</div>
   
    
    
//      */}
//   </>

// )
// }

// export default tutoringPage