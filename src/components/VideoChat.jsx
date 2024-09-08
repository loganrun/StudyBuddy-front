import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Button } from './Button';


const VideoChat = ({ roomID, userId, userType }) => {
  console.log(roomID, userId);
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [isChatActive, setIsChatActive] = useState(false);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    socketRef.current = io.connect("https://www.2sigmasolution.com");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("join room", roomID);
        socketRef.current.on("all users", users => {
            const peers = [];
            users.forEach(userID => {
                const peer = createPeer(userID, socketRef.current.id, stream);
                peersRef.current.push({
                    peerID: userID,
                    peer,
                })
                peers.push(peer);
            })
            setPeers(peers);
        })

        socketRef.current.on("user joined", payload => {
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.current.push({
                peerID: payload.callerID,
                peer,
            })

            setPeers(users => [...users, peer]);
        });

        socketRef.current.on("receiving returned signal", payload => {
            const item = peersRef.current.find(p => p.peerID === payload.id);
            item.peer.signal(payload.signal);
        });
    })
}, []);
  // useEffect(() => {
  //   if (isChatActive) {
  //     socketRef.current = io.connect('https://www.2sigmasolution.com');
  //     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  //     //console.log(roomID)
  //       .then(stream => {
  //         //setStream(stream);
  //         userVideo.current.srcObject = stream;
  //         socketRef.current.emit('join room', roomID, userId);


  //         socketRef.current.on("all users", users => {  
  //           const peers = [];
  //           users.forEach(userID => {
  //               const peer = createPeer(userID, socketRef.current.id, stream);
  //               peersRef.current.push({
  //                   peerID: userID,
  //                   peer,
  //               })
  //               peers.push(peer);
  //           })
  //           setPeers(peers);
  //         })


  //         socketRef.current.on("user joined", payload => {
  //           const peer = addPeer(payload.signal, payload.callerID, stream);
  //           peersRef.current.push({
  //               peerID: payload.callerID,
  //               peer,
  //           })


  //           setPeers(users => [...users, peer]);
  //         });


  //         socketRef.current.on("receiving returned signal", payload => {
  //             const item = peersRef.current.find(p => p.peerID === payload.id);
  //             item.peer.signal(payload.signal);
  //         });


  //         // socketRef.current.on('user-connected', (peerId) => {
  //         //   connectToNewUser(peerId, stream, false);
  //         // });


  //         // socketRef.current.on('user-disconnected', (peerId) => {
  //         //   if (peersRef.current[peerId]) {
  //         //     peersRef.current[peerId].destroy();
  //         //     const newPeers = { ...peers };
  //         //     delete newPeers[peerId];
  //         //     setPeers(newPeers);
  //         //   }
  //         // });


  //         // socketRef.current.on('existing-users', (users) => {
  //         //   users.forEach(peerId => connectToNewUser(peerId, stream, true));
  //         // });


  //         // socketRef.current.on('signal', (from, signal) => {
  //         //   if (peersRef.current[from]) {
  //         //     peersRef.current[from].signal(signal);
  //         //   }
  //         // });
  //       });
  //   }


  //   return () => {
  //     if (isChatActive) {
  //       stopChat();
  //     }
  //   };
  // }, [isChatActive]);


  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
    });


    peer.on("signal", signal => {
        socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
    })


    return peer;
}


function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
    })


    peer.on("signal", signal => {
        socketRef.current.emit("returning signal", { signal, callerID })
    })


    peer.signal(incomingSignal);


    return peer;
}


  // function connectToNewUser(peerId, stream, isInitiator = false) {
  //   const peer = new Peer({
  //     initiator: isInitiator,
  //     trickle: false,
  //     stream,
  //   });
 
  //   peer.on('signal', signal => {
  //     socketRef.current.emit('signal', { to: peerId, from: userId, signal });
  //   });
 
  //   peer.on('stream', peerStream => {
  //     setPeers(peers => ({
  //       ...peers,
  //       [peerId]: peerStream,
  //     }));
  //   });
 
  //   peer.on('close', () => {
  //     peer.destroy();
  //   });
 
  //   peersRef.current[peerId] = peer;
  // }
 


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
    setPeers([]);
    peersRef.current = {};


    // Set chat inactive
    setIsChatActive(false);
  };


  return (
    <div>
      <video playsInline muted ref={userVideo} autoPlay />
      {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
      <div>
        {!isChatActive && <Button variant= "outline" onClick={startChat}>Start Chat</Button>}
        {isChatActive && <Button variant= "outline" onClick={stopChat}>Stop Chat</Button>}
      </div>
    </div>
  );
};


// const Video = ({ peer }) => {
//   // 1. Component definition and prop destructuring
 
//   const ref = useRef();
//   // 2. Creating a ref to hold a reference to the video element


//   useEffect(() => {
//     ref.current.srcObject = peer;
//   }, [peer]);
//   // 3. Side effect to set the video source when the peer changes


//   return <video playsInline ref={ref} autoPlay />;
//   // 4. Rendering the video element
// };
const Video = (props) => {
  const ref = useRef();


  useEffect(() => {
      props.peer.on("stream", stream => {
          ref.current.srcObject = stream;
      })
  }, []);


  return (
    <video playsInline ref={ref} autoPlay />
  );
}


export default VideoChat;

// import React, { useEffect, useRef, useState } from 'react';
// import io from 'socket.io-client';
// import Peer from 'simple-peer';
// import { Button } from './Button';

// const VideoChat = ({ roomId, userId }) => {
//   //console.log(roomId, userId);
//   const [peers, setPeers] = useState({});
//   const [stream, setStream] = useState(null);
//   const [isChatActive, setIsChatActive] = useState(false);
//   const socketRef = useRef();
//   const userVideo = useRef();
//   const peersRef = useRef({});

//   useEffect(() => {
//     if (isChatActive) {
//       socketRef.current = io.connect('https://www.2sigmasolution.com');
//       navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//         .then(stream => {
//           setStream(stream);
//           userVideo.current.srcObject = stream;
//           socketRef.current.emit('join-room', roomId, userId);

//           socketRef.current.on('user-connected', (peerId) => {
//             connectToNewUser(peerId, stream, false);
//           });

//           socketRef.current.on('user-disconnected', (peerId) => {
//             if (peersRef.current[peerId]) {
//               peersRef.current[peerId].destroy();
//               const newPeers = { ...peers };
//               delete newPeers[peerId];
//               setPeers(newPeers);
//             }
//           });

//           socketRef.current.on('existing-users', (users) => {
//             users.forEach(peerId => connectToNewUser(peerId, stream, true));
//           });

//           socketRef.current.on('signal', (from, signal) => {
//             if (peersRef.current[from]) {
//               peersRef.current[from].signal(signal);
//             }
//           });
//         });
//     }

//     return () => {
//       if (isChatActive) {
//         stopChat();
//       }
//     };
//   }, [isChatActive]);

//   function connectToNewUser(peerId, stream, isInitiator = false) {
//     const peer = new Peer({
//       initiator: isInitiator,
//       trickle: false,
//       stream,
//     });
  
//     peer.on('signal', signal => {
//       socketRef.current.emit('signal', { to: peerId, from: userId, signal });
//     });
  
//     peer.on('stream', peerStream => {
//       setPeers(peers => ({
//         ...peers,
//         [peerId]: peerStream,
//       }));
//     });
  
//     peer.on('close', () => {
//       peer.destroy();
//     });
  
//     peersRef.current[peerId] = peer;
//   }
  

//   const startChat = () => {
//     setIsChatActive(true);
//   };

//   const stopChat = () => {
//     // Disconnect from socket
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//     }

//     // Destroy all peers
//     Object.values(peersRef.current).forEach(peer => peer.destroy());

//     // Stop the user's media stream
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//     }

//     // Clear the state
//     setStream(null);
//     setPeers({});
//     peersRef.current = {};

//     // Set chat inactive
//     setIsChatActive(false);
//   };

//   return (
//     <div>
//       <video playsInline muted ref={userVideo} autoPlay />
//       {Object.entries(peers).map(([peerId, stream]) => (
//         <Video key={peerId} peer={stream} />
//       ))}
//       <div>
//         {!isChatActive && <Button variant= "outline" onClick={startChat}>Start Chat</Button>}
//         {isChatActive && <Button variant= "outline" onClick={stopChat}>Stop Chat</Button>}
//       </div>
//     </div>
//   );
// };

// const Video = ({ peer }) => {
//   // 1. Component definition and prop destructuring
  
//   const ref = useRef();
//   // 2. Creating a ref to hold a reference to the video element

//   useEffect(() => {
//     ref.current.srcObject = peer;
//   }, [peer]);
//   // 3. Side effect to set the video source when the peer changes

//   return <video playsInline ref={ref} autoPlay />;
//   // 4. Rendering the video element
// };

// export default VideoChat;

// import React, { useEffect, useRef, useState } from 'react';
// import io from 'socket.io-client';
// import Peer from 'simple-peer';
// import { Button } from './Button';

// const VideoChat = ({ roomId, userId }) => {
//   const [peers, setPeers] = useState({});
//   const [stream, setStream] = useState(null);
//   const [isChatActive, setIsChatActive] = useState(false);
//   const socketRef = useRef();
//   const userVideo = useRef();
//   const peersRef = useRef({});

//   useEffect(() => {
//     if (isChatActive) {
//       socketRef.current = io.connect('https://www.2sigmasolution.com');
//       navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//         .then(stream => {
//           setStream(stream);
//           userVideo.current.srcObject = stream;
//           socketRef.current.emit('join-room', roomId, userId);

//           socketRef.current.on('user-connected', (peerId) => {
//             connectToNewUser(peerId, stream);
//           });

//           socketRef.current.on('user-disconnected', (peerId) => {
//             if (peersRef.current[peerId]) {
//               peersRef.current[peerId].destroy();
//               const newPeers = { ...peers };
//               delete newPeers[peerId];
//               setPeers(newPeers);
//             }
//           });

//           socketRef.current.on('existing-users', (users) => {
//             users.forEach(peerId => connectToNewUser(peerId, stream));
//           });

//           socketRef.current.on('signal', (from, signal) => {
//             if (peersRef.current[from]) {
//               peersRef.current[from].signal(signal);
//             }
//           });
//         });
//     }

//     return () => {
//       if (isChatActive) {
//         stopChat();
//       }
//     };
//   }, [isChatActive]);

//   function connectToNewUser(peerId, stream) {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream,
//     });

//     peer.on('signal', signal => {
//       socketRef.current.emit('signal', peerId, userId, signal);
//     });

//     peer.on('stream', peerStream => {
//       setPeers(peers => ({
//         ...peers,
//         [peerId]: peerStream,
//       }));
//     });

//     peersRef.current[peerId] = peer;
//   }

//   const startChat = () => {
//     setIsChatActive(true);
//   };

//   const stopChat = () => {
//     // Disconnect from socket
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//     }

//     // Destroy all peers
//     Object.values(peersRef.current).forEach(peer => peer.destroy());

//     // Stop the user's media stream
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//     }

//     // Clear the state
//     setStream(null);
//     setPeers({});
//     peersRef.current = {};

//     // Set chat inactive
//     setIsChatActive(false);
//   };

//   return (
//     <div>
//       <video playsInline muted ref={userVideo} autoPlay />
//       {Object.entries(peers).map(([peerId, stream]) => (
//         <Video key={peerId} peer={stream} />
//       ))}
//       <div>
//         {!isChatActive && <Button variant= "outline" onClick={startChat}>Start Chat</Button>}
//         {isChatActive && <Button variant= "outline" onClick={stopChat}>Stop Chat</Button>}
//       </div>
//     </div>
//   );
// };

// const Video = ({ peer }) => {
//   const ref = useRef();

//   useEffect(() => {
//     ref.current.srcObject = peer;
//   }, [peer]);

//   return <video playsInline ref={ref} autoPlay />;
// };

// export default VideoChat;

