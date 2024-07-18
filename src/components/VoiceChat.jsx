import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';



const VoiceChat = ({ socket }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
  const roomId  = tutor.roomId
    //console.log(roomId);
  

  useEffect(() => {
    if (!socket) return;

    socket.on('voice-offer', (data) =>{
      console.log('Received voice offer', data);
      handleOffer(data)
    });
    
    socket.on('voice-answer', (data) => {
        console.log('Received voice answer', data);
        handleAnswer(data);
    });
  
    //socket.on('voice-answer', handleAnswer);
    socket.on('ice-candidate', (data) => {
        console.log('Received ICE candidate', data);
        handleNewICECandidateMsg(data);
    })
    //socket.on('ice-candidate', handleNewICECandidateMsg);

    return () => {
      socket.off('voice-offer');
      socket.off('voice-answer');
      socket.off('ice-candidate');
    };
  }, [socket]);

  const startCall = async () => {
    if (!socket) {
      console.error('Socket is not initialized');
      return;
    }
    try {
      // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // localAudioRef.current.srcObject = stream;
      console.log('Attempting to get user media');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('User media obtained');
      localAudioRef.current.srcObject = stream;

      peerConnectionRef.current = new RTCPeerConnection();

      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      peerConnectionRef.current.ontrack = ({ streams: [stream] }) => {
        console.log('Received remote stream');
        remoteAudioRef.current.srcObject = stream;
      };

      peerConnectionRef.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
          console.log('Sending ICE candidate');
          socket.emit('ice-candidate', roomId, candidate);
        }
      };
      console.log('Creating offer');
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit('voice-offer', roomId, offer);

      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  
const handleOffer = async (data) => {
    const { offer, roomId: incomingRoomId } = data;
    if (incomingRoomId !== roomId) return;

    try {
    peerConnectionRef.current = new RTCPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localAudioRef.current.srcObject = stream;

    stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
    });

    peerConnectionRef.current.ontrack = ({ streams: [stream] }) => {
        remoteAudioRef.current.srcObject = stream;
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate', event.candidate);
        socket.emit('ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    // peerConnectionRef.current.onicecandidate = ({ candidate }) => {
    //     if (candidate) {
    //     socket.emit('ice-candidate', candidate);
    //     }
    // };

    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    console.log('Sending voice answer');
    socket.emit('answer', roomId, answer);

    setIsCallActive(true);
    } catch (error) {
    console.error('Error starting call:', error);
    }
};

 const handleAnswer = async (answer) => {
    try {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
    console.error('Error handling answer:', error);
    }
};

const handleNewICECandidateMsg = async (data) => {
  console.log('Received ICE candidate data:', data);
  const { candidate } = data;
  try {
    if (!candidate || (!candidate.sdpMid && candidate.sdpMLineIndex === null)) {
      console.warn('Invalid ICE candidate received:', candidate);
      return;
    }
    console.log('Adding ICE candidate');
    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    console.log('ICE candidate added successfully');
  } catch (error) {
    console.error('Error adding ice candidate:', error);
  }
};
// const handleNewICECandidateMsg = async (data) => {
//   const {candidate} = data
//     try {
//     console.log('Adding ICE candidate');
//     await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//     console.log('ICE candidate added successfully');
//     } catch (error) {
//     console.error('Error adding ice candidate:', error);
//     }
// };

  return (
    <div className="absolute top-4 right-4 mt-4">
      <button 
      onClick={startCall} 
      disabled={isCallActive || !socket}
      className="bg-green-500 text-white p-2 rounded"
      >
        {isCallActive ? 'Call in progress' : 'Start Voice Call'}
      </button>
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
};

export default VoiceChat;

