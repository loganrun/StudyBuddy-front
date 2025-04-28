import React, { useEffect, useRef, useState } from "react"; // Import React explicitly if needed for JSX transform or specific React APIs

// Removed the 'AgentState' type import as it's TypeScript-specific.
// Removed the 'NoAgentNotificationProps' interface definition.

/**
 * Renders a notification if no agent connects after a specified time.
 * @param {object} props - Component props.
 * @param {string} props.state - The current state of the agent connection (e.g., "connecting", "listening").
 * @param {React.ReactNode} [props.children] - Optional children (though not used in this component).
 */
// Use prop destructuring ({ state }) instead of typed props parameter.
export function NoAgentNotification({ state }) {
  // Time to wait before showing the notification (in milliseconds)
  const timeToWaitMs = 10_000;
  // Ref to store the timeout ID. Removed <number | null> generic type.
  const timeoutRef = useRef(null);
  // State to control whether the notification is shown
  const [showNotification, setShowNotification] = useState(false);
  // Ref to track if an agent has ever successfully connected in this component instance
  const agentHasConnected = useRef(false);

  // --- Logic to track if an agent has connected ---
  // If the agent enters an active state, mark that it has connected at least once.
  // This prevents the notification from showing if the agent connects, disconnects,
  // and then gets stuck reconnecting later.
  if (
    ["listening", "thinking", "speaking"].includes(state) && // Use destructured 'state'
    agentHasConnected.current == false
  ) {
    agentHasConnected.current = true;
  }

  // --- Effect to handle the timeout logic ---
  useEffect(() => {
    // If the state is 'connecting' (and an agent hasn't connected before)
    if (state === "connecting") {
      // Clear any existing timeout before setting a new one
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      // Set a timeout to potentially show the notification
      timeoutRef.current = window.setTimeout(() => {
        // Check again *inside* the timeout callback:
        // Only show notification if still 'connecting' AND agent never connected.
        if (state === "connecting" && agentHasConnected.current === false) {
          setShowNotification(true);
        }
        // Clear the ref after the timeout runs
        timeoutRef.current = null;
      }, timeToWaitMs);
    } else {
      // If the state is *not* 'connecting' (e.g., disconnected, listening, etc.)
      // Clear any pending timeout
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Ensure the notification is hidden
      setShowNotification(false);
    }

    // --- Cleanup function ---
    // This runs when the component unmounts or before the effect runs again
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null; // Clear ref on cleanup too
      }
    };
  }, [state]); // Dependency array: effect runs when 'state' changes

  // --- Render the notification ---
  return (
    <>
      {/* Conditionally render the notification div based on state */}
      {showNotification ? (
        <div className="fixed text-sm left-1/2 max-w-[90vw] -translate-x-1/2 flex top-6 items-center gap-4 bg-[#1F1F1F] px-4 py-3 rounded-lg">
          {/* Warning Icon */}
          <div>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.85068 3.63564C10.8197 2.00589 13.1793 2.00589 14.1484 3.63564L21.6323 16.2223C22.6232 17.8888 21.4223 20 19.4835 20H4.51555C2.57676 20 1.37584 17.8888 2.36671 16.2223L9.85068 3.63564ZM12 8.5C12.2761 8.5 12.5 8.72386 12.5 9V13.5C12.5 13.7761 12.2761 14 12 14C11.7239 14 11.5 13.7761 11.5 13.5V9C11.5 8.72386 11.7239 8.5 12 8.5ZM12.75 16C12.75 16.4142 12.4142 16.75 12 16.75C11.5858 16.75 11.25 16.4142 11.25 16C11.25 15.5858 11.5858 15.25 12 15.25C12.4142 15.25 12.75 15.5858 12.75 16Z"
                fill="#666666"
              />
            </svg>
          </div>
          {/* Notification Text */}
          <p className="text-pretty w-max">
            It&apos;s quiet... too quiet. Is your agent lost? Ensure your agent is properly
            configured and running on your machine.
          </p>
          {/* Link to Documentation */}
          <a
            href="https://docs.livekit.io/agents/quickstarts/s2s/"
            target="_blank"
            rel="noopener noreferrer" // Added for security best practice
            className="underline whitespace-nowrap"
          >
            View guide
          </a>
          {/* Close Button */}
          <button onClick={() => setShowNotification(false)}>
            {/* Close Icon SVG */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.16602 3.16666L12.8327 12.8333M12.8327 3.16666L3.16602 12.8333"
                stroke="#999999"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
