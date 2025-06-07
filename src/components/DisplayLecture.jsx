import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { deleteLecture } from '../reducers/lecturesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { Button } from '../components/Button';
import { Play, ChevronDown, Trash2, MoreVertical } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

const baseDeleteUrl = import.meta.env.VITE_DELETE_URL;

const gradientClasses = [
  "bg-gradient-to-r from-[#09203F] to-[#537895]",
  //"bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D]",
  "bg-gradient-to-r from-[#0F3460] to-[#16537e]",
  "bg-gradient-to-r from-[#FF8A80] to-[#FF5722]",
  "bg-gradient-to-r from-[#4A90E2] to-[#7BB3F0]",
  // "bg-gradient-to-r from-pink-500 to-yellow-500",
  "bg-gradient-to-r from-green-400 to-blue-500",
  "bg-gradient-to-r from-purple-500 to-pink-500",
  //"bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500",
  "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
  // Add more as you like!
];

function DisplayLecture({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [summaryIsOpen, setSummaryIsOpen] = useState(false);
  const { url, subject, transcript, date, _id, notes, summary } = data;
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [gradient, setGradient] = useState(gradientClasses[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newSubject, setNewSubject] = useState(subject);

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
      <div 
        className="absolute inset-0 z-0 cursor-pointer"
        onClick={() => navigate('/study', { state: { url, subject: newSubject, transcript, date, _id, notes, summary } })}
      />

      <CardHeader className="flex flex-col items-center justify-center space-y-2 pb-2 px-4 w-full relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
        {menuOpen && (
          <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 w-32">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setIsRenaming(true);
                setMenuOpen(false);
              }}
            >
              Rename
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
              onClick={() => {
                setShowModal(true);
                setMenuOpen(false);
              }}
            >
              Delete
            </button>
          </div>
        )}
        {isRenaming ? (
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onBlur={() => setIsRenaming(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsRenaming(false);
            }}
            className="text-xl md:text-2xl font-medium w-full text-center bg-transparent text-white border-b border-white focus:outline-none py-1"
            autoFocus
          />
        ) : (
          <CardTitle
            className="text-xl md:text-2xl font-medium line-clamp-2 w-full text-center text-white drop-shadow-md leading-tight py-1"
            onClick={() => setIsRenaming(true)}
          >
            {newSubject}
          </CardTitle>
        )}
        <div className="text-base md:text-lg text-white/90 bg-black/20 px-3 py-1.5 rounded-full text-center w-auto mt-1">
          {date}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-center items-center w-full px-2 py-1">
        {/* Content area remains clickable via the overlay */}
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
