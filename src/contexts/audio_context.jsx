import { createContext, useContext, useMemo } from "react";
import axios from "axios";

const AudioContext= createContext()


export function AudioProvider({children}) {

const uploadAudio = async(Blob) =>{
  let file = Blob

  const formData = new FormData();
  const uniqueFilename = `recording-${Date.now()}.webm`; // Generate unique filename
  formData.append('file', file, uniqueFilename);

  try {
    await axios.post('http://localhost:3000/api/audio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
  }

//   console.log(Blob)
//   console.log("click")

      // const formData = new FormData();
      // formData.append('file', Blob);
    
      // try {
      //   const response = await axios.post('/api/audio/upload', formData, {
      //     headers: {
      //       'Content-Type': 'multipart/form-data',
      //     },
      //   });
      //   console.log(response.data); 
      // } catch (error) {
      //   console.error(error);
      // }
}

const value = useMemo(
    ()=>({
        uploadAudio

    }),[])
    return(
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    )

}

export const useAudio = () =>{
    return useContext(AudioContext)
}