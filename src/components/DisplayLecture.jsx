import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { deleteLecture } from '../reducers/lecturesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { Button } from '../components/Button';
import { Play, ChevronDown, Trash2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

const baseDeleteUrl = import.meta.env.VITE_DELETE_URL;

function DisplayLecture({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [summaryIsOpen, setSummaryIsOpen] = useState(false);
  const { url, subject, transcript, date, _id, notes, summary } = data;
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

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
    <Card className="w-full mb-4 relative h-64 bg-gradient-to-r from-[#09203F] to-[#537895]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-4xl font-medium">{subject}</CardTitle>
        <div className="text-lg text-muted-foreground">{date}</div>
      </CardHeader>
      <CardContent>
        {/* <div className="flex items-center space-x-2 mb-4">
          <AudioPlayer audioUrl={url} />
        </div> */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="default" asChild>
            <Link
              to="/study"
              state={{ url, subject, transcript, date, _id, notes, summary }}
            >
             Review 
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowModal(true)}
          >
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        </div>
        <div className="space-y-2">
          {/* <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            Lecture Transcript <ChevronDown className="h-4 w-4" />
          </Button>
          {isOpen && (
            <div className="text-sm text-muted-foreground mt-2">
              {transcript}
            </div>
          )} */}
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setSummaryIsOpen(!summaryIsOpen)}
          >
            Summary <ChevronDown className="h-4 w-4" />
          </Button>
          {summaryIsOpen && (
            <div className="text-sm text-muted-foreground mt-2">
              {summary}
            </div>
          )}
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

