import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const VoiceChat = ({roomId}) => {
const [isCallActive, setIsCallActive] = useState(false);
const [socket, setSocket] = useState(null);
const localAudioRef = useRef(null);
const remoteAudioRef = useRef(null);
const peerConnectionRef = useRef(null);

useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('offer', handleOffer);
    newSocket.on('answer', handleAnswer);
    newSocket.on('ice-candidate', handleNewICECandidateMsg);

    return () => newSocket.disconnect();
}, []);

const startCall = async () => {
    try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localAudioRef.current.srcObject = stream;

    peerConnectionRef.current = new RTCPeerConnection();

    stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
    });

    peerConnectionRef.current.ontrack = ({ streams: [stream] }) => {
        remoteAudioRef.current.srcObject = stream;
    };

    peerConnectionRef.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
        socket.emit('ice-candidate', candidate);
        }
    };

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit('offer', { offer, roomId });

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

    peerConnectionRef.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
        socket.emit('ice-candidate', candidate);
        }
    };

    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socket.emit('answer', answer);

    setIsCallActive(true);
    } catch (error) {
    console.error('Error handling offer:', error);
    }
};

const handleAnswer = async (answer) => {
    try {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
    console.error('Error handling answer:', error);
    }
};

const handleNewICECandidateMsg = async (candidate) => {
    try {
    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
    console.error('Error adding ice candidate:', error);
    }
};

return (
    <div className="mt-4">
    <button 
        onClick={startCall} 
        disabled={isCallActive}
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