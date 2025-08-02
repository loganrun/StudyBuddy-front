import useCombinedTranscriptions from "../hooks/useCominedTranscriptions" // Custom hook to fetch transcriptions
import React from "react"; // Standard React import

/**
 * Component that displays a list of transcriptions, scrolling to the bottom
 * when new transcriptions are added.
 * Assumes `useCombinedTranscriptions` returns an array of objects, where each object
 * has at least `id` (string/number), `role` (string, e.g., 'assistant' or 'user'),
 * and `text` (string).
 */
export default function TranscriptionView() {
  // Fetch the combined transcriptions using the custom hook
  const combinedTranscriptions = useCombinedTranscriptions();

  // Create a ref for the scroll container
  const scrollContainerRef = React.useRef(null);
  const [isUserScrolling, setIsUserScrolling] = React.useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);

  // Function to scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: behavior
      });
    }
  };

  // Check if user is at the bottom of the scroll
  const isAtBottom = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const threshold = 100; // 100px from bottom
      return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    }
    return true;
  };

  // Handle scroll events
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const atBottom = isAtBottom();
      setShowScrollToBottom(!atBottom);
      
      // If user scrolled up, set user scrolling flag
      if (!atBottom) {
        setIsUserScrolling(true);
      } else {
        setIsUserScrolling(false);
      }
    }
  };

  // Effect hook to scroll the view to the latest transcription
  React.useEffect(() => {
    // Always scroll to bottom when new messages arrive
    if (scrollContainerRef.current && combinedTranscriptions.length > 0) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
    }
  }, [combinedTranscriptions]);

  // Render the list of transcriptions
  return (
    <>
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .transcript-container::-webkit-scrollbar {
          width: 8px;
        }
        .transcript-container::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .transcript-container::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }
        .transcript-container::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .scroll-to-bottom-btn {
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .scroll-to-bottom-btn:hover {
          transform: scale(1.1);
        }
      `}</style>
      
      {/* Container wrapper for relative positioning */}
      <div className="relative w-full h-full">
        {/* Container div: scrollable area */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="transcript-container w-full h-full overflow-y-scroll overscroll-contain" 
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #F3F4F6'
          }}
        >
          {/* Messages container with proper spacing and padding */}
          <div className="flex flex-col gap-3 p-3 pb-6"> 
      {/* Map over the transcriptions array to render each segment */}
      {combinedTranscriptions.map((segment) => (
        // Each segment is a div with a unique ID and key
        <div
          id={segment.id} // ID used for scrolling
          key={segment.id} // Key for React list rendering
          // Apply conditional styling based on the 'role' of the segment
          className={
            segment.role === "assistant"
              ? "p-3 self-start max-w-[85%] bg-gray-100 text-gray-900 rounded-lg shadow-sm border border-gray-200" // Enhanced assistant styling
              : "p-3 self-end max-w-[85%] bg-blue-500 text-white rounded-lg shadow-sm" // Enhanced user styling
          }
        >
          {/* Display the text content of the segment */}
          <div className="whitespace-pre-wrap break-words">
            {segment.text}
          </div>
        </div>
      ))}
      
          {/* Show message when no transcriptions */}
          {combinedTranscriptions.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500 text-center">
              <div>
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">Your conversation will appear here</p>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="scroll-to-bottom-btn absolute bottom-4 right-4 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg z-10"
            title="Scroll to bottom"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
