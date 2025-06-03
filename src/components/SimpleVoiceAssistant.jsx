import { useCallback, useEffect, useState } from "react";
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

  import { Track } from "livekit-client";
  import ReactMarkdown from 'react-markdown'

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


const Message = ({ type, text }) => {
    return <div >
      <strong className={`message-${type}`}>
        {type === "agent" ? "Agent: " : "You: "}
      </strong>
      <span className="message-text">{text}</span>
    </div>;
  };


const SimpleVoiceAssistant = () => {
    const {state, audioTrack, agentTranscriptions} = useVoiceAssistant();
    const localParticipant = useLocalParticipant();

    const {segments: userTranscriptions} =useTrackTranscription({
        publication: localParticipant.microphoneTrack,
        source: Track.Source.Microphone,
        participant: localParticipant.localParticipant
    })

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const allMessages = [
            ...(agentTranscriptions?.map((t) => ({ ...t, type: "agent" })) ?? []),
            ...(userTranscriptions?.map((t) => ({ ...t, type: "user" })) ?? []),
        ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);
        setMessages(allMessages);
        }, [agentTranscriptions, userTranscriptions]);

    return (
            <div className="flex flex-col items-center w-full max-w-[1200px] mx-auto p-5 h-full">
            <div className="flex-1 max-h-[calc(100vh-21rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ">
                {messages.map((msg, index) => (
                    <Message key={msg.id || index} type={msg.type} text={msg.text} />
                ))}
            </div>
            <div className="w-full max-w-[800px] h-[300px] mx-auto">
                <BarVisualizer state={state} barCount={7} trackRef={audioTrack} />
            </div>
            {/* <div className="control-section">
                <VoiceAssistantControlBar />
            
            </div> */}
            </div>
    );

}

export default SimpleVoiceAssistant;