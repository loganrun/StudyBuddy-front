import React, { useEffect, useRef, useState } from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import io from 'socket.io-client';
import { useParams} from 'react-router-dom';
import { useSelector } from 'react-redux';

function TextEditor({socket}) {
    const { roomId } = useParams();
    
    const [currentRoomId, setCurrentRoomId] = useState(roomId);

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
    // if (!roomId) {
    //     socket.emit('create-room', (newRoomId) => {
    //         setCurrentRoomId(newRoomId);
    //         history.push(`/room/${newRoomId}`);
    //     });
    //   } else {
    //     socket.emit('join-room', currentRoomId);
    //   }

    if (quill) {
      // Apply custom styles to the toolbar
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        toolbar.classList.add('bg-white', 'text-black');
      }

      // Set up Socket.io connection
      const socket = io('http://localhost:4000');

      // Handle incoming changes
      socket.on('text-change', (delta) => {
        quill.updateContents(delta);
      });

      // Send changes to server
      quill.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          socket.emit('text-change', currentRoomId, delta);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [quill, currentRoomId]);

  const roomUrl = window.location.href;

  return (
    <div className="container mx-auto p-4 h-screen">
    <h1 className="text-2xl font-bold mb-4">Tutoring Session</h1>
    <div ref={editorContainerRef} className="h-2/3 mb-4 bg-white text-black shadow rounded"></div>
      {/* Add chat component here */}
    </div>
  );
}

export default TextEditor;



