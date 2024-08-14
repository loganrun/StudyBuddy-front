import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useQuill } from 'react-quilljs';
// import VoiceChat from '../components/VoiceChat'
import 'quill/dist/quill.snow.css';
import io from 'socket.io-client';
import useSocket from '../components/UseSocket';

function TextEditor({id}) {
  //console.log(id)
  const documentId = id
  const socket = useSocket('https://www.2sigmasolution.com');
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
      //console.log("loading docs")
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

  //const roomUrl = window.location.href;

  return (
    <div className="container mx-auto p-4 h-screen ">
    <h1 className="text-2xl font-bold mb-4">Tutoring Session</h1>
    <div ref={editorContainerRef} className="h-full bg-white text-black shadow rounded "></div>
  
    </div>
  );
}

export default TextEditor;



