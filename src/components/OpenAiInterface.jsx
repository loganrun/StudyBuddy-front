import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, updateLastMessage } from '../reducers/conversationReducer';
//import ConversationThread from './ConversationThread';
//import Message from './Message';

const openUrl = import.meta.env.VITE_OPENAI_URL


const OpenAIInterface = () => {
  const [input, setInput] = useState('');
  const messages = useSelector((state) => state.conversation.messages);
  const [response, setResponse] = useState('');
  const dispatch = useDispatch();
  const chatEndRef = useRef(null);



const handleSubmit = async (e) => {
  e.preventDefault();
  //setIsLoading(true);
  //console.log(input)
  dispatch(addMessage({ type: 'question', text: input }));
  dispatch(addMessage({ type: 'response', text: '' }));
  

  try {
    const eventSource = new EventSource(`${openUrl}?prompt=${encodeURIComponent(input)}`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.content){
        dispatch(updateLastMessage({ text: data.content }));
        //console.log(data.content)
      }{
        if(data.done){
          setInput("")
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 

  return (
<>
<div className="max-w-3xl mx-auto p-4 text-white">
  
  <div className="flex-1 overflow-y-auto pb-32">
  
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 my-2 rounded-md ${message.type === 'question' ? ' text-blue-400 text-2xl text-center  self-start ' : ' text-white self-end '}`}
          >
            {message.text}
          </div>
        ))}
        <div ref={chatEndRef} />

</div>
</div>

<div className="fixed bottom-0 p-4 sm:p-6 md:p-8 w-full max-w-full md:max-w-3xl mx-auto">
  <h1 className="text-2xl font-bold mb-4">Ask Tyson</h1>
  <div className="flex items-center space-x-4">
    <textarea
      className="w-full sm:w-3/5 md:w-2/5 lg:w-3/5 xl:w-10/12   rounded-md bg-[#1D1F20] text-white resize-none"
      rows='2'
      placeholder="Enter your question here..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
    ></textarea>
    <button
      className="bg-rose-600 text-white p-1.5 rounded-full flex items-center justify-center"
      onClick={handleSubmit}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12.414V14a1 1 0 11-2 0V5.586L5.707 9.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 5.586z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
</div>
  </>
  );
};

export default OpenAIInterface;





