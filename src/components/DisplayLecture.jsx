import React, {useState} from 'react'
import AudioPlayer from './AudioPlayer';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { deleteLecture } from '../reducers/lecturesSlice';
import { useDispatch } from'react-redux';

const baseDeleteUrl = import.meta.env.VITE_DELETE_URL



function DisplayLecture({ data}) {
    const [isOpen, setIsOpen] = useState(false);
    const [summaryIsOpen, setsummaryIsOpen] = useState(false);
    const {url, subject, transcript, date, _id, notes,summary} = data;
    const [showModal, setShowModal] = useState(false);
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const dispatch = useDispatch()

    const handleDelete = async () => {

        const deleteApi = `${baseDeleteUrl}${_id}`
        try {
            const response = await axios({
                method: "delete",
                url: deleteApi,
            });
        
            console.log(response);
            dispatch(deleteLecture(_id));
            setShowModal(false);
            
        } catch (error) {
            console.log(error);
        }
        
    };
    
    const handleButton = () => {
        setShowModal(true);
    };
    
    
    return (
        <div
        className="bg-white rounded-lg shadow-md p-4 relative"
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
    >
        {showDeleteButton && (
            <button
                className="absolute top-2 left-2 text-red-500 hover:text-red-700"
                onClick={handleButton}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        )}

        <div>
            {showModal && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 rounded-lg z-40">
                    <div className="bg-white p-4 rounded-md ">
                        <p className="text-gray-800 font-bold mb-2">Delete Lesson?</p>
                        <p className="text-gray-800 mb-2">This is permanent and cannot be undone</p>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                        <button
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg  p-4">
            <AudioPlayer audioUrl={url}/>
            <div className="flex items-center mb-2">
                    
                    <i className="fas fa-volume-up mr-2 text-gray-500"></i> 
                    <p  className="text-sky-800 text-xl font-bold">{subject}</p>
                    <p className="text-sky-800  mx-6 font-bold">{date}</p>
                    <Link className="bg-sky-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    to={'/study'} state = {{url,subject,transcript, date, _id, notes, summary}}
                    >Study</Link>
            </div>
            <div className=" rounded-md p-4">
                <button
                    className="flex justify-between items-center w-full py-2 px-4 bg-rose-600 rounded-md  focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="text-lg font-semibold">Lecture Transcript</span>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transition-transform transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isOpen ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'}
                    />
                    </svg>
                </button>
                    {isOpen && (
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                        <p className="text-gray-700 overflow-hidden text-ellipsis">{transcript}</p>
                        </div>
                    )}
        
            </div>
            <div className=" rounded-md p-4">
                <button
                    className="flex justify-between items-center w-full py-2 px-4 bg-rose-600 rounded-md  focus:outline-none"
                    onClick={() => setsummaryIsOpen(!summaryIsOpen)}
                >
                    <span className="text-lg font-semibold">Summary</span>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transition-transform transform ${summaryIsOpen ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={summaryIsOpen ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'}
                    />
                    </svg>
                </button>
                    {summaryIsOpen && (
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                        <p className="text-gray-700 overflow-hidden text-ellipsis">{summary}</p>
                        </div>
                    )}
        
            </div>
        </div>

    </div>
    </div>
        
    );
}

export default DisplayLecture