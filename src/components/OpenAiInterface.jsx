import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage } from '../reducers/conversationReducer';
import ConversationThread from './ConversationThread';

const openUrl = import.meta.env.VITE_OPENAI_URL


const OpenAIInterface = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const dispatch = useDispatch();



const handleSubmit = async (e) => {
  e.preventDefault();
  //setIsLoading(true);
  console.log(input)
  dispatch(addMessage(input));
  

  try {
    

    const eventSource = new EventSource(`${openUrl}?prompt=${encodeURIComponent(input)}`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.content){
        setResponse(prevResponse => prevResponse + data.content);
        console.log(data.content)
        //dispatch(addMessage(response));
      }{
        if(data.done){
          setInput("")
          //setResponse("")
          eventSource.close();
          
        }
      }
    };


    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    }
    
  } catch (error) {
    console.error(error);
    
  }
  setInput('')
  };
 

  return (
    <>
    

    {/* //<div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex items-center">
    //   <input
    //     type="text"
    //     className="flex-1 border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //     placeholder="Type your message..."
    //     value={prompt}
    //     onChange={(e) => setPrompt(e.target.value)}
    //     // onKeyDown={(e) => {
    //     //   if (e.key === 'Enter') handleSend();
    //     // }}
    //   />
    //   <button
    //     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md"
    //     //onClick={handleSend}
    //   >
    //     Send
    //   </button>
    // </div> */}

    

<div className="max-w-3xl mx-auto p-8">
  <ConversationThread response={response} />

</div>

<div className="fixed bottom-0 max-w-3xl mx-auto p-8 w-full">
      <h1 className="text-2xl font-bold mb-4">Ask Tyson</h1>
      <div className="flex items-center">
        <textarea
          className="w-full p-4 rounded-md bg-[#1D1F20] text-white resize-none"
          rows="3"
          placeholder="Enter your question here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>
        <button
          className="bg-rose-600 text-white p-2 rounded-full ml-4 flex items-center justify-center"
          onClick={handleSubmit}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-9 w-9"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12.414V14a1 1 0 11-2 0V5.586L5.707 9.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 5.586z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    {/* <div className=" fixed bottom-0 max-w-3xl mx-auto p-8 w-full">
      <h1 className="text-2xl font-bold mb-4">Ask Tyson</h1>
      <textarea
        className=" flex-grow w-full p-4  rounded-md mb-4  bg-[#1D1F20] resize-none overflow-y-auto "
        rows="5"
        placeholder="Enter your question here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ minHeight: '48px', maxHeight: '200px' }}
      ></textarea>
      <button
        className="bg-rose-600 text-white py-2 px-4 rounded-md mb-4"
        onClick={handleSubmit}
      >
        Submit
      </button>
      
    </div> */}
    </>
  );
};

export default OpenAIInterface;

// import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { setInput, setResponse, setIsLoading } from '../reducers/openaiReducer';
// import axios from 'axios';

// const OpenAIInterface = () => {
//   const input = useSelector((state) => state.openAI.input);
//   const response = useSelector((state) => state.openAI.response);
//   const isLoading = useSelector((state) => state.openAI.isLoading);
//   const dispatch = useDispatch();

//   const handleSubmit = async () => {
//     dispatch(setIsLoading(true));
//     try {
//       const apiResponse = await axios.post('http://localhost:3000/api/chat/chat', {
//         prompt: input,
//       });
//       const data = apiResponse.data;
//       dispatch(setResponse(data.content));
//     } catch (error) {
//       console.error(error.message);
//     } finally {
//       dispatch(setIsLoading(false));
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-8">
//       <h1 className="text-2xl font-bold mb-4">Ask Your Study Buddy</h1>
//       <textarea
//         className="w-full p-4 rounded-md mb-4 bg-[#1D1F20]"
//         rows="5"
//         placeholder="Enter your text here..."
//         value={input}
//         onChange={(e) => dispatch(setInput(e.target.value))}
//       ></textarea>
//       <button className="bg-rose-600 text-white py-2 px-4 rounded-md mb-4" onClick={handleSubmit} disabled={isLoading}>
//         {isLoading ? 'Loading...' : 'Submit'}
//       </button>
//       {response && (
//         <div className="p-4 rounded-md bg-[#1D1F20]">
//           <h2 className="text-lg font-bold mb-2">Response:</h2>
//           <p>{response}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OpenAIInterface;



