import React, { useEffect, useRef, useState } from 'react';
import { useQuill } from 'react-quilljs';
// import VoiceChat from '../components/VoiceChat'
import 'quill/dist/quill.snow.css';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import useSocket from '../components/UseSocket';

function TextEditor({roomId}) {
  const socket = useSocket('http://localhost:4000');
  //console.log(roomId)
  //const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
    //const roomId  = tutor.roomId
    //console.log(roomId);
    //const userName = tutor.userName 
    //console.log(userName);



  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction
      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']                                         // remove formatting button
    ]
  };

  const { quill, quillRef: editorContainerRef } = useQuill({ modules, theme: 'snow' });

  useEffect(() => {
    
    

    if (quill && socket) {
      // Apply custom styles to the toolbar
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        toolbar.classList.add('bg-white', 'text-black');
      }

      // Set up Socket.io connection
      //const socket = io('http://localhost:4000');
      //setSocket(newSocket);

      socket.emit('join-room', {roomId});

      // Handle incoming changes
      socket.on('text-change', (delta) => {
        quill.updateContents(delta);
      });



      // Send changes to server
      quill.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          socket.emit('text-change', delta);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [quill,socket, roomId]);

  const roomUrl = window.location.href;

  return (
    <div className="container mx-auto p-4 h-screen">
    <h1 className="text-2xl font-bold mb-4">Tutoring Session</h1>
    <div ref={editorContainerRef} className="h-2/3 mb-4 bg-white text-black shadow rounded"></div>
  
      {/* {socket && <VoiceChat socket={socket}/> } */}
    </div>
  );
}

export default TextEditor;



