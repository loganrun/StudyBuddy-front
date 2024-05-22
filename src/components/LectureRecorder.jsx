import React, { useState } from 'react';

const AudioRecorder = () => {
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);

  const startRecording = async () => {
	try {
  	const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
  	setStream(audio);

  	const mediaRecorder = new MediaRecorder(stream);
  	setMediaRecorder(mediaRecorder);

  	mediaRecorder.start();
  	setIsRecording(true);

  	mediaRecorder.addEventListener('dataavailable', (event) => {
    	setAudioChunks((prev) => [...prev, event.data]);
  	});
	} catch (err) {
  	console.error('Error accessing media devices:', err);
	}
  };

  const stopRecording = () => {
	mediaRecorder.stop();
	setIsRecording(false);
  };

  const downloadAudio = async () => {
	const blob = new Blob(audioChunks, { type: 'audio/wav' });
	const formData = new FormData();
  console.log(formData)
	formData.append('audio', blob, 'recording.wav');

	try {
  	const response = await fetch('/upload', {
    	method: 'POST',
    	body: formData,
  	});

  	if (response.ok) {
    	console.log('Audio uploaded successfully');
  	} else {
    	console.error('Error uploading audio');
  	}
	} catch (err) {
  	console.error('Error uploading audio:', err);
	}
  };

  return (
	<div>
  	<button onClick={isRecording ? stopRecording : startRecording}>
    	{isRecording ? 'Stop Recording' : 'Start Recording'}
  	</button>
  	{isRecording && <p>Recording...</p>}
  	{!isRecording && audioChunks.length > 0 && (
    	<button onClick={downloadAudio}>Download Audio</button>
  	)}
	</div>
  );
};

export default AudioRecorder;
