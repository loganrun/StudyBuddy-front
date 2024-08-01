// ConversationThread.js
import React from 'react';
import { useSelector } from 'react-redux';
//import Message from './Message';

const ConversationThread = (props) => {
  //console.log(props)
  //const messages = useSelector((state) => state.coersation.nvmessages);

  return (
    <div className="w-full h-96 p-2 border border-gray-500 rounded-md overflow-y-scroll">
      {/* {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))} */}
      <p>{props.response}</p>
    </div>
  );
};

export default ConversationThread;
