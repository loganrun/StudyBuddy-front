import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import useSocket from '../components/UseSocket';

function TextEditor({ id }) {
  const documentId = id;
  const socket = useSocket('https://www.2sigmasolution.com');
  const SAVE_INTERVAL_MS = 2000;
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current === null) return;

    // Create toolbar container
    const toolbarContainer = document.createElement('div');
    editorRef.current.appendChild(toolbarContainer);

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: toolbarContainer,
          handlers: {
            // Add any custom handlers here
          }
        },
      }
    });

    // Set up toolbar options
    quill.getModule('toolbar').addHandler('image', imageHandler);

    quillRef.current = quill;

    return () => {
      quillRef.current = null;
    };
  }, []);

  // Image handler function (you can customize this as needed)
  function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const range = quillRef.current.getSelection(true);
          quillRef.current.insertEmbed(range.index, 'image', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
  }

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

  useEffect(() => {
    const toolbar = document.querySelector('.ql-toolbar');
    if (toolbar) {
      toolbar.classList.add('bg-white', 'text-black');
    }
  }, []);

  return (
    <div className="container mx-auto p-4 h-screen">
      <h1 className="text-2xl font-bold mb-4">Tutoring Session</h1>
      <div ref={editorRef} className="h-full bg-white text-black shadow rounded"></div>
    </div>
  );
}

export default TextEditor;

// function TextEditor({ id }) {
//   const documentId = id;
//   const socket = useSocket('https://www.2sigmasolution.com');
//   const SAVE_INTERVAL_MS = 2000;
//   const quillRef = useRef(null);
//   const editorRef = useRef(null);

//   useEffect(() => {
//     if (editorRef.current === null) return;

//     // Only initialize Quill once
//     if (quillRef.current === null) {
//       const quill = new Quill(editorRef.current, {
//         theme: 'snow',
//         modules: {
//           toolbar: [
//             ['bold', 'italic', 'underline', 'strike'],
//             [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
//             [{ 'indent': '-1'}, { 'indent': '+1' }],
//             [{ 'direction': 'rtl' }],
//             [{ 'size': ['small', false, 'large', 'huge'] }],
//             [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
//             [{ 'color': [] }, { 'background': [] }],
//             [{ 'font': [] }],
//             [{ 'align': [] }],
//             ['clean']
//           ],
//         },
//       });

//       //quill.getModule('toolbar').addHandler('image', imageHandler);
//       quillRef.current = quill;
//     }

//     return () => {
//       quillRef.current = null;
//     };
//   }, []);

//   // Image handler function (you can customize this as needed)
//   // function imageHandler() {
//   //   const input = document.createElement('input');
//   //   input.setAttribute('type', 'file');
//   //   input.setAttribute('accept', 'image/*');
//   //   input.click();

//   //   input.onchange = () => {
//   //     const file = input.files[0];
//   //     if (file) {
//   //       const reader = new FileReader();
//   //       reader.onload = (e) => {
//   //         const range = quillRef.current.getSelection(true);
//   //         quillRef.current.insertEmbed(range.index, 'image', e.target.result);
//   //       };
//   //       reader.readAsDataURL(file);
//   //     }
//   //   };
//   // }

//   useEffect(() => {
//     if (socket == null || quillRef.current == null) return;

//     const quill = quillRef.current;

//     socket.once("load-document", document => {
//       quill.setContents(document);
//       quill.enable();
//     });

//     socket.emit("get-document", documentId);

//     const interval = setInterval(() => {
//       socket.emit("save-document", quill.getContents());
//     }, SAVE_INTERVAL_MS);

//     const handler = (delta, oldDelta, source) => {
//       if (source !== "user") return;
//       socket.emit("send-changes", delta);
//     };

//     quill.on("text-change", handler);

//     const receiveHandler = delta => {
//       quill.updateContents(delta);
//     };

//     socket.on("receive-changes", receiveHandler);

//     return () => {
//       clearInterval(interval);
//       quill.off("text-change", handler);
//       socket.off("receive-changes", receiveHandler);
//     };
//   }, [socket, documentId]);

//   useEffect(() => {
//     const toolbar = document.querySelector('.ql-toolbar');
//     if (toolbar) {
//       toolbar.classList.add('bg-white', 'text-black');
//     }
//   }, []);

//   return (
//     <div className="container mx-auto p-4 h-screen ">
//       <h1 className="text-2xl font-bold mb-4">Tutoring Session</h1>
//       <div ref={editorRef} className="h-full bg-white text-black shadow rounded"></div>
//     </div>
//   );
// }

// export default TextEditor;
