import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../components/Card";
import { Play, Pause,Plus } from "lucide-react";
import { Button } from "../components/Button";
import { Slider } from "../components/Slider";

export default function AudioPlayer({ audioUrl, mimeType }) {
  const audioPlayer = useRef(null);
  const audioSource = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioPlayer.current && audioSource.current) {
      audioSource.current.src = audioUrl;
      audioPlayer.current.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioPlayer.current;
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', () => {});
    };
  }, []);

  const updateProgress = () => {
    setCurrentTime(audioPlayer.current.currentTime);
  };

  const togglePlayPause = () => {
    const prevValue = isPlaying;
    setIsPlaying(!prevValue);
    if (!prevValue) {
      audioPlayer.current.play();
    } else {
      audioPlayer.current.pause();
    }
  };

  const handleSliderChange = (newValue) => {
    const [value] = newValue;
    audioPlayer.current.currentTime = value;
    setCurrentTime(value);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <audio ref={audioPlayer} className="hidden">
          <source ref={audioSource} type={mimeType} />
        </audio>
        <div className="flex items-center justify-between mb-4">
        
          {/* <Button variant="ghost" size="icon">
            <SkipBack className="h-4 w-4" />
          </Button> */}
          <Button onClick={togglePlayPause} variant="outline" size="icon" className="mr-3.5">
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          {/* <Button variant="ghost" size="icon">
            <SkipForward className="h-4 w-4" />
          </Button> */}
          <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        </div>
        {/* <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSliderChange}
          className="w-full"
        /> */}
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// import { useEffect, useRef } from "react";

// export default function AudioPlayer(props) {
//     const audioPlayer = useRef(null);
//     const audioSource = useRef(null);

//     // Updates src when url changes
//     useEffect(() => {
//         if (audioPlayer.current && audioSource.current) {
//             audioSource.current.src = props.audioUrl;
//             audioPlayer.current.load();
//         }
//     }, [props.audioUrl]);

//     return (
//         <div className='flex relative z-10 p-4 w-full'>
//             <audio
//                 ref={audioPlayer}
//                 controls
//                 className='w-full h-14 rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10'
//             >
//                 <source ref={audioSource} type={props.mimeType}></source>
//             </audio>
//         </div>
//     );
// }
