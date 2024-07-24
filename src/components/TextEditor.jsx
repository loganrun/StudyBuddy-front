import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useQuill } from 'react-quilljs';
// import VoiceChat from '../components/VoiceChat'
import 'quill/dist/quill.snow.css';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import useSocket from '../components/UseSocket';

function TextEditor({id}) {
  console.log(id)
  const documentId = id
  const socket = useSocket('http://localhost:4000');
  //console.log(roomId)
  //const tutor = useSelector(state => state.tutorauth.tutor.payload.tutor); 
    //const roomId  = tutor.roomId
    //console.log(roomId);
    //const userName = tutor.userName 
    //console.log(userName);

    const SAVE_INTERVAL_MS = 2000

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
    if (socket == null || quill == null) return

  
    const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        toolbar.classList.add('bg-white', 'text-black');
    }

    socket.once("load-document", document => {
      console.log("loading docs")
      quill.setContents(document)
      quill.enable()
    })

    socket.emit("get-document", documentId)
  }, [socket, quill, documentId])

  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = delta => {
      quill.updateContents(delta)
    }
    socket.on("receive-changes", handler)

    return () => {
      socket.off("receive-changes", handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return
      socket.emit("send-changes", delta)
    }
    quill.on("text-change", handler)

    return () => {
      quill.off("text-change", handler)
    }
  }, [socket, quill])

  // const wrapperRef = useCallback(wrapper => {
  //   if (wrapper == null) return

  //   wrapper.innerHTML = ""
  //   const editor = document.createElement("div")
  //   wrapper.append(editor)
  //   const q = new Quill(editor, {
  //     theme: "snow",
  //     modules: { toolbar: TOOLBAR_OPTIONS },
  //   })
  //   q.disable()
  //   q.setText("Loading...")
  //   setQuill(q)
  // }, [])

  // useEffect(() => {
    
    

  //   if (quill && socket) {
  //     // Apply custom styles to the toolbar
  //     const toolbar = document.querySelector('.ql-toolbar');
  //     if (toolbar) {
  //       toolbar.classList.add('bg-white', 'text-black');
  //     }

  //     socket.emit('join-room', {id});

  //     // Handle incoming changes
  //     socket.on('text-change', (delta) => {
  //       quill.updateContents(delta);
  //     });



  //     // Send changes to server
  //     quill.on('text-change', (delta, oldDelta, source) => {
  //       if (source === 'user') {
  //         socket.emit('text-change', delta);
  //       }
  //     });

  //     return () => {
  //       socket.disconnect();
  //     };
  //   }
  // }, [quill,socket, id]);

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



