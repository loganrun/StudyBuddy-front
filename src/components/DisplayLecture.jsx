import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { deleteLecture } from '../reducers/lecturesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { Button } from '../components/Button';
import { Play, ChevronDown, Trash2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

const baseDeleteUrl = import.meta.env.VITE_DELETE_URL;

const gradientClasses = [
  "bg-gradient-to-r from-[#09203F] to-[#537895]",
  "bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D]",
  "bg-gradient-to-r from-[#0F3460] to-[#16537e]",
  "bg-gradient-to-r from-[#FF8A80] to-[#FF5722]",
  "bg-gradient-to-r from-[#4A90E2] to-[#7BB3F0]",
  // "bg-gradient-to-r from-pink-500 to-yellow-500",
  "bg-gradient-to-r from-green-400 to-blue-500",
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500",
  "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
  // Add more as you like!
];

function DisplayLecture({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [summaryIsOpen, setSummaryIsOpen] = useState(false);
  const { url, subject, transcript, date, _id, notes, summary } = data;
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const [gradient, setGradient] = useState(gradientClasses[0]);

  useEffect(() => {
    setGradient(gradientClasses[Math.floor(Math.random() * gradientClasses.length)]);
  }, []);

  const handleDelete = async () => {
    const deleteApi = `${baseDeleteUrl}${_id}`;
    try {
      await axios.delete(deleteApi);
      dispatch(deleteLecture(_id));
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting lecture:', error);
    }
  };

  return (
    <Card className={`w-full max-w-xs md:max-w-sm h-64 mx-auto mb-6 relative p-4 flex flex-col justify-between items-center aspect-[4/3] ${gradient}`}>

      <CardHeader className="flex flex-col items-center justify-center space-y-2 pb-2 px-4 w-full">
        <CardTitle className="text-lg md:text-xl font-medium line-clamp-2 w-full text-center text-white drop-shadow-md">
          {subject}
        </CardTitle>
        <div className="text-sm md:text-base text-white/90 bg-black/20 px-2 py-1 rounded-full text-center w-auto">
          {date}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-center items-center w-full px-2 py-1">
        <div className="flex justify-between items-center w-full mb-2">
          <Button variant="default" asChild size="sm">
            <Link
              to="/study"
              state={{ url, subject, transcript, date, _id, notes, summary }}
            >
              <span className='text-sm'>Notes</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowModal(true)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>

      </CardContent>

      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#0F172A] p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Delete Lesson?</h3>
            <p className="mb-4 ">This is permanent and cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default DisplayLecture;
