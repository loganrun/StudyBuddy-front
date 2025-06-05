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
  "bg-gradient-to-r from-pink-500 to-yellow-500",
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
    <Card className={`w-full max-w-sm h-64 mx-auto mb-4 relative p-2 flex flex-col justify-between items-center aspect-square ${gradient}`}>

      <CardHeader className="flex flex-col items-center justify-center space-y-1 pb-1 px-2 w-full">
        <CardTitle className="text-lg font-medium truncate w-full text-center">{subject}</CardTitle>
        <div className="text-xs text-muted-foreground text-center w-full">{date}</div>
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
        {/* <div className="space-y-1 w-full">
          <Button
            variant="outline"
            className="w-full justify-between text-xs px-2 py-1"
            onClick={() => setSummaryIsOpen(!summaryIsOpen)}
          >
            Summary <ChevronDown className="h-3 w-3" />
          </Button>
          {summaryIsOpen && (
            <div className="text-xs text-muted-foreground mt-1 max-h-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {summary}
            </div>
          )}
        </div> */}
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

