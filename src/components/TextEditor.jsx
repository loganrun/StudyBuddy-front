
import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import useSocket from '../components/UseSocket';

function TextEditor({ id, title }) {
  //console.log(title)
  //const purpose1= purpose
  //console.log(id)
  const documentId = id;
  const socket = useSocket('https://www.2sigmasolution.com');
  const editorContainerRef = useRef(null);
  const quillRef = useRef(null);

  const SAVE_INTERVAL_MS = 2000;

  useEffect(() => {
    if (quillRef.current || !editorContainerRef.current) return;

    quillRef.current = new Quill(editorContainerRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
          [ 'link', 'image' ]
        ]
      }
    });

    //const quill = quillRef.current;

    // Adding custom class to the toolbar
    const toolbar = document.querySelector('.ql-toolbar');
    if (toolbar) {
      toolbar.classList.add();

    }
  }, []);

  useEffect(() => {
    if (socket == null || quillRef.current == null) return;

    const quill = quillRef.current;

    socket.once("load-document", document => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit("get-document", documentId);

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    const receiveHandler = delta => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", receiveHandler);

    return () => {
      clearInterval(interval);
      quill.off("text-change", handler);
      socket.off("receive-changes", receiveHandler);
    };
  }, [socket, documentId]);

  return (
    <div className="container mx-auto  h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div ref={editorContainerRef} className=" flex-grow overflow-y-auto shadow rounded "></div>
    </div>
  );
}

export default TextEditor;
