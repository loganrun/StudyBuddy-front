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

  // Effect hook to scroll the view to the latest transcription
  React.useEffect(() => {
    // Get the last transcription segment from the array
    const transcription = combinedTranscriptions[combinedTranscriptions.length - 1];
    if (transcription) {
      // Find the corresponding DOM element by its ID
      const transcriptionElement = document.getElementById(transcription.id);
      if (transcriptionElement) {
        // If the element exists, scroll it into view smoothly
        transcriptionElement.scrollIntoView({ behavior: "smooth", block: "end" }); // Added block: "end" for potentially better scrolling
      }
    }
    // This effect depends on the combinedTranscriptions array
  }, [combinedTranscriptions]);

  // Render the list of transcriptions
  return (
    // Container div: full height, column layout, gap between items, vertical scroll
    <div className="h-full flex flex-col gap-2 overflow-y-auto p-2"> {/* Added padding for better spacing */}
      {/* Map over the transcriptions array to render each segment */}
      {combinedTranscriptions.map((segment) => (
        // Each segment is a div with a unique ID and key
        <div
          id={segment.id} // ID used for scrolling
          key={segment.id} // Key for React list rendering
          // Apply conditional styling based on the 'role' of the segment
          className={
            segment.role === "assistant"
              ? "p-2 self-start fit-content max-w-[85%] bg-gray-200 text-gray-900 rounded-md" // Example styling for assistant
              : "bg-blue-600 text-white rounded-md p-2 self-end fit-content max-w-[85%]" // Example styling for user
          }
        >
          {/* Display the text content of the segment */}
          {segment.text}
        </div>
      ))}
    </div>
  );
}
