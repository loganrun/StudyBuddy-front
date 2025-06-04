import { useCallback, useEffect, useState, useRef } from "react";
import {
    BarVisualizer,
    DisconnectButton,
    RoomAudioRenderer,
    RoomContext,
    VoiceAssistantControlBar,
    useVoiceAssistant,
    useLocalParticipant,
    useTrackTranscription,
} from "@livekit/components-react";
import LoadingSpinner from './LoadingSpinner';
import { Track } from "livekit-client";
import ReactMarkdown from 'react-markdown'
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../reducers/agentVoiceReducer';


const components = {
    // Headings
    h1: ({ node, ...props }) => (
        <h1 className="text-4xl font-bold mb-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <h2 className="text-3xl font-semibold mb-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
        <h3 className="text-2xl font-medium mb-2" {...props} />
    ),

    // Paragraphs
    p: ({ node, ...props }) => (
        <p className="mb-4 text-base leading-relaxed" {...props} />
    ),

    // Links
    a: ({ node, ...props }) => (
        <a className="text-blue-600 hover:underline" {...props} />
    ),

    // Lists
    li: ({ node, ordered, ...props }) => (
        <li className="mb-2 list-disc ml-5" {...props} />
    ),

    // Blockquotes
    blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" {...props} />
    ),

    // Code Blocks & Inline Code
    code: ({ node, inline, className, children, ...props }) => {
        return !inline ? (
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-auto my-4">
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        ) : (
            <code className="bg-gray-100 rounded-sm px-1 font-mono text-sm" {...props}>
                {children}
            </code>
        );
    }
};


// const Message = ({ type, text }) => {
//     return <div >
//       <strong className={`message-${type}`}>
//         {type === "agent" ? "Agent: " : "You: "}
//       </strong>
//       <span className="message-text">{text}</span>
//     </div>;
//   };


const SimpleVoiceAssistant = ({ isLoading }) => {
    const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
    const localParticipant = useLocalParticipant();
    const messages = useSelector((state) => state.aiVoice.messages);

    const dispatch = useDispatch();
    const chatEndRef = useRef(null);
    const lastAgentIndex = useRef(0);
    const lastUserIndex = useRef(0);


    const { segments: userTranscriptions } = useTrackTranscription({
        publication: localParticipant.microphoneTrack,
        source: Track.Source.Microphone,
        participant: localParticipant.localParticipant
    })
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    //const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Add new agent messages
        if (Array.isArray(agentTranscriptions)) {
            for (let i = lastAgentIndex.current; i < agentTranscriptions.length; i++) {
                dispatch(addMessage({ type: 'agent', text: agentTranscriptions[i].text || agentTranscriptions[i] }));
            }
            lastAgentIndex.current = agentTranscriptions.length;
        }
        // Add new user messages
        if (Array.isArray(userTranscriptions)) {
            for (let i = lastUserIndex.current; i < userTranscriptions.length; i++) {
                dispatch(addMessage({ type: 'user', text: userTranscriptions[i].text || userTranscriptions[i] }));
            }
            lastUserIndex.current = userTranscriptions.length;
        }
    }, [agentTranscriptions, userTranscriptions, dispatch]);

    return (
        <div className="flex flex-col items-center w-full max-w-[1200px] mx-auto p-5 h-full">
            <div className="flex-1 max-h-[calc(100vh-21rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`p-2 my-2 rounded-md ${message.type === 'user' ? ' text-blue-400 text-2xl text-center self-start ' : ' text-white self-end '}`}
                    >
                        {message.type === 'user' ? (
                            message.text
                        ) : (
                            message.text
                        )}
                    </div>
                ))}
                {isLoading && messages.length > 0 && <LoadingSpinner />}
                <div ref={chatEndRef} />

            </div>
            {/* <div className="flex-1 max-h-[calc(100vh-21rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ">
                {messages.map((msg, index) => (
                    <Message key={msg.id || index} type={msg.type} text={msg.text} />
                ))}
            </div>
            <div className="w-full max-w-[800px] h-[300px] mx-auto">
                <BarVisualizer state={state} barCount={7} trackRef={audioTrack} />
            </div> */}
            {/* <div className="control-section">
                <VoiceAssistantControlBar />
            
            </div> */}
        </div>
    );

}

export default SimpleVoiceAssistant;