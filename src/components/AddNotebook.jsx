import React, { useState } from 'react';
import { X, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addNotebook } from '../reducers/authReducer';
import axios from 'axios';

const AddNotebook = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user.payload.user);
  const addNotebookUrl = import.meta.env.VITE_ADDNOTEBOOK_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', { name, value }); // Debug log
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('New form data:', newData); // Debug log
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user makes changes
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare submission data
      const submissionData = {
        name: formData.name,
        subject: formData.subject,
        owner: user.id
      };

      // Submit to backend
      const response = await axios.post(addNotebookUrl, submissionData, {
        // headers: {
        //   'Content-Type': 'application/json',
        //   'Accept': 'application/json',
        // },
        // withCredentials: true,
        // timeout: 10000 // 10 second timeout
      });

      // Update Redux state - add new notebook to user.notebooks
      const newNotebook = response.data;
      //console.log(newNotebook)
      dispatch(addNotebook(newNotebook));

      // Navigate to study page with the new notebook data
      navigate('/study', {
        state: {
          subject: formData.subject,
          name: formData.name,
          url: '',
          transcript: '',
          date: new Date().toLocaleDateString(),
          _id: newNotebook._id || `notebook_${Date.now()}`,
          notes: [],
          summary: '',
          roomId: `room_${Date.now()}`
        }
      });
      
      // Reset form and close modal
      setFormData({ name: '', subject: '' });
      setErrors({});
      setIsSubmitting(false);
      onClose();

    } catch (error) {
      console.error('Error creating notebook:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        setErrors({ submit: 'CORS error: Please configure backend CORS settings or use a proxy.' });
      } else if (error.response) {
        setErrors({ submit: `Server error: ${error.response.data?.message || 'Failed to create notebook'}` });
      } else {
        setErrors({ submit: 'Network error: Please check your connection and try again.' });
      }
      
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', subject: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Create New Notebook</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 text-lg">
              Let's create a new learning notebook! Fill in the details below to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="h-4 w-4" />
                Notebook Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter a name for your notebook (e.g., My Math Notes)"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 placeholder-gray-500 ${
                  errors.name 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-blue-500 bg-white'
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="font-medium">⚠️</span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Subject Input */}
            <div>
              <label htmlFor="subject" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="h-4 w-4" />
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter the subject (e.g., Mathematics, Science, History)"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 placeholder-gray-500 ${
                  errors.subject 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-blue-500 bg-white'
                }`}
              />
              {errors.subject && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span className="font-medium">⚠️</span>
                  {errors.subject}
                </p>
              )}
            </div>

            {/* Subject Suggestions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Popular Subjects:</h4>
              <div className="flex flex-wrap gap-2">
                {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art', 'Music', 'Physical Education'].map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, subject }));
                      // Clear subject error when selecting from suggestions
                      if (errors.subject) {
                        setErrors(prev => ({ ...prev, subject: '' }));
                      }
                      // Clear submit error when user makes changes
                      if (errors.submit) {
                        setErrors(prev => ({ ...prev, submit: '' }));
                      }
                    }}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm transition-colors"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Submission Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 flex items-center gap-2">
                  <span className="font-medium">⚠️</span>
                  {errors.submit}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </div>
            ) : (
              'Create Notebook'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNotebook;