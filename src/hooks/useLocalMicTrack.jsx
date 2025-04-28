import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useMemo } from "react";

/**
 * Custom hook to get a TrackReferenceOrPlaceholder object for the local microphone track.
 * @returns {object} An object containing participant, source, and publication for the local mic track.
 */
export default function useLocalMicTrack() {
  // Get the local participant and their microphone track publication
  const { microphoneTrack, localParticipant } = useLocalParticipant();

  // Use useMemo to create the track reference object, recalculating only when dependencies change.
  // Removed the ': TrackReferenceOrPlaceholder' type annotation from TypeScript.
  const micTrackRef = useMemo(() => {
    return {
      participant: localParticipant,
      source: Track.Source.Microphone, // Use the Track enum from livekit-client
      publication: microphoneTrack,
    };
  }, [localParticipant, microphoneTrack]); // Dependencies for useMemo

  // Return the memoized track reference object
  return micTrackRef;
}