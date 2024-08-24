import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const VideoChat = ({ roomId, userId }) => {
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [isChatActive, setIsChatActive] = useState(false);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef({});

  useEffect(() => {
    if (isChatActive) {
      socketRef.current = io.connect('http://localhost:4000');
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          setStream(stream);
          userVideo.current.srcObject = stream;
          socketRef.current.emit('join-room', roomId, userId);

          socketRef.current.on('user-connected', (peerId) => {
            connectToNewUser(peerId, stream);
          });

          socketRef.current.on('user-disconnected', (peerId) => {
            if (peersRef.current[peerId]) {
              peersRef.current[peerId].destroy();
              const newPeers = { ...peers };
              delete newPeers[peerId];
              setPeers(newPeers);
            }
          });

          socketRef.current.on('existing-users', (users) => {
            users.forEach(peerId => connectToNewUser(peerId, stream));
          });

          socketRef.current.on('signal', (from, signal) => {
            if (peersRef.current[from]) {
              peersRef.current[from].signal(signal);
            }
          });
        });
    }

    return () => {
      if (isChatActive) {
        stopChat();
      }
    };
  }, [isChatActive]);

  function connectToNewUser(peerId, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', peerId, userId, signal);
    });

    peer.on('stream', peerStream => {
      setPeers(peers => ({
        ...peers,
        [peerId]: peerStream,
      }));
    });

    peersRef.current[peerId] = peer;
  }

  const startChat = () => {
    setIsChatActive(true);
  };

  const stopChat = () => {
    // Disconnect from socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Destroy all peers
    Object.values(peersRef.current).forEach(peer => peer.destroy());

    // Stop the user's media stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    // Clear the state
    setStream(null);
    setPeers({});
    peersRef.current = {};

    // Set chat inactive
    setIsChatActive(false);
  };

  return (
    <div>
      <video playsInline muted ref={userVideo} autoPlay />
      {Object.entries(peers).map(([peerId, stream]) => (
        <Video key={peerId} peer={stream} />
      ))}
      <div>
        {!isChatActive && <button onClick={startChat}>Start Chat</button>}
        {isChatActive && <button onClick={stopChat}>Stop Chat</button>}
      </div>
    </div>
  );
};

const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    ref.current.srcObject = peer;
  }, [peer]);

  return <video playsInline ref={ref} autoPlay />;
};

export default VideoChat;
