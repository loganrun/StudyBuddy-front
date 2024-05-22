import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addMessage } from '../reducers/conversationReducer';


const OpenAIInterface = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const dispatch = useDispatch();

  

  const handleSubmit = async (e) => {
    // Make API request to OpenAI with input
    e.preventDefault()
    //console.log(input)
    dispatch(addMessage(input));

    const apiResponse = await axios.post("https://studybuddy-api.onrender.com/api/chat/chat", {

      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        prompt: `${input}`,
      },
    });
    const data = apiResponse.data;
    console.log(data)
    dispatch(addMessage(data.content))
    setResponse(data.content);
    setInput('')
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* {response && (
        <div className=" p-4 rounded-md  bg-[#1D1F20]">
          <h2 className="text-lg font-bold mb-2">Response:</h2>
          <p>{response}</p>
        </div>
      )} */}
      <h1 className="text-2xl font-bold mb-4">Ask Tyson</h1>
      <textarea
        className="w-full p-4  rounded-md mb-4  bg-[#1D1F20] "
        rows="5"
        placeholder="Enter your question here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <button
        className="bg-rose-600 text-white py-2 px-4 rounded-md mb-4"
        onClick={handleSubmit}
      >
        Submit
      </button>
      
    </div>
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



