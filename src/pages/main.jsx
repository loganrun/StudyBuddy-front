import React, { useState } from 'react';
import { AudioManager } from "../components/AudioManager";
import { useDispatch } from 'react-redux';
import { useTranscriber } from "../hooks/use.Transcriber";
import Navbar from "../components/NavBar";
import { addSubject } from '../reducers/lecturesSlice';



function main() {

const transcriber = useTranscriber();
const dispatch = useDispatch();


  const handleChange = (e) => {
    const subjectValue = e.target.value;
    dispatch(addSubject(subjectValue));
  };


return (
    <>
    <Navbar id="record"/>
    <div className='flex  min-h-screen'>
        <div className='container flex flex-col  justify-center items-center'>
        <p>Add the topic of the lecture</p>
        <div  className="bg-white p-10 rounded-lg shadow-lg flex">
    <form 
        
    >
        
        <input 
        type="text"
        onChange={handleChange}
        className="border border-gray-200 p-6 rounded-l-lg flex-grow mr-6 text-black"
        placeholder="Subject"
        />
    </form>
    <AudioManager transcriber={transcriber}  />

    </div>
                    
    </div> 
        
    </div>
    </>
);
}

export default main