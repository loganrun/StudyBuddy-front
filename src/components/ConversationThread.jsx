// ConversationThread.js
import React from 'react';
import { useSelector } from 'react-redux';
import Message from './Message';

const ConversationThread = () => {
  const messages = useSelector((state) => state.conversation.messages);

  return (
    <div className="max-w-3xl mx-auto p-8">
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
    </div>
  );
};

export default ConversationThread;
