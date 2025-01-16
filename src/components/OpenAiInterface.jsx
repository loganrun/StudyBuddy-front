import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, updateLastMessage } from '../reducers/conversationReducer';
//import { ScrollArea } from './ScrollArea';
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
<div className="max-w-3xl mx-auto  text-white">
  <div className="flex-1 max-h-[calc(100vh-19rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
  
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
<div className="flex-1 fixed bottom-20 lg:w-{38rem} xl:w-[36rem]">
  <h1 className="text-2xl font-bold mb-4">Ask Tyson</h1>
  <div className="flex items-center space-x-4">
    <textarea
      className="w-full rounded-md bg-[#1D1F20] text-white resize-none"
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
</div>


  </>
  );
};

export default OpenAIInterface;

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>


