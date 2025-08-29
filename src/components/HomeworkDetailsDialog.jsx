import React, { useState } from 'react';
import { Upload, User, BookOpen, GraduationCap, HelpCircle, Target, X } from 'lucide-react';

const HomeworkDetailsDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  extractedText, 
  fileName, 
  fileType,
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    gradeLevel: '',
    helpType: '',
    specificInstructions: '',
    difficultyLevel: '',
    
  });

  const [errors, setErrors] = useState({});

  // Subject options
  const subjects = [
    'Math', 'English', 'Science', 'History', 'Geography', 
    'Art', 'Music', 'Physical Education', 'Computer Science',
    'Foreign Language', 'Literature', 'Biology', 'Chemistry',
    'Physics', 'Algebra', 'Geometry', 'Calculus', 'Statistics'
  ];

  // Grade level options
  const gradeLevels = [
    '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
    '11th Grade', '12th Grade', 'College/University', 'Adult Education'
  ];

  // Help type options
  const helpTypes = [
    { value: 'explanation', label: 'Explanation', description: 'Help me understand the concept' },
    { value: 'step-by-step', label: 'Step-by-step Solution', description: 'Guide me through the solution' },
    { value: 'hint', label: 'Hint', description: 'Give me a hint to figure it out myself' },
    { value: 'proofreading', label: 'Proofreading', description: 'Review my work for errors' },
    { value: 'feedback', label: 'Feedback on Writing', description: 'Provide feedback on my writing' }
  ];

  // Difficulty levels
  const difficultyLevels = ['Easy', 'Medium', 'Hard'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.gradeLevel) {
      newErrors.gradeLevel = 'Grade level is required';
    }
    
    if (!formData.helpType) {
      newErrors.helpType = 'Type of help needed is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare structured data for LLM
    const submissionData = {
      studentInfo: {
        
        subject: formData.subject,
        // gradeLevel: formData.gradeLevel,
        // helpType: formData.helpType,
        // specificInstructions: formData.specificInstructions,
        // difficultyLevel: formData.difficultyLevel || 'Medium'
      },
      
      llmPrompt: generateLLMPrompt()
    };
    
    onSubmit(submissionData);
  };

const generateLLMPrompt = () => {
    const helpTypeInstructions = {
      'explanation': 'Please provide a clear explanation of the concept',
      'step-by-step': 'Please provide a step-by-step solution',
      'hint': 'Please provide a helpful hint without giving away the full answer',
      'proofreading': 'Please review this work for errors and provide corrections',
      'feedback': 'Please provide constructive feedback on this writing'
    };
    
    return `You are an AI tutor specializing in personalized learning support. Your role is to guide students through their educational journey, fostering deep understanding and problem-solving skills. Focus on providing helpful, step-by-step guidance and support, rather than directly giving answers. Remember that learning is a process, and your role is to facilitate that process for the student.

Specifically:
* Begin by reading the homework question carefully
* Analyze the student's grade level and subject to tailor your response
* Use the provided homework content to understand the context
* Ask clarifying questions to understand the student's current understanding
* Break down complex problems into smaller, manageable steps
* Provide constructive feedback and encouragement
* Avoid giving direct answers unless necessa
Grade: ${formData.gradeLevel}
Subject: ${formData.subject}
Homework Question: ${extractedText}
Help Needed: ${helpTypeInstructions[formData.helpType]}
Difficulty: ${formData.difficultyLevel || 'Medium'}
${formData.specificInstructions ? `Specific Instructions: ${formData.specificInstructions}` : ''}

Please provide age-appropriate help for a ${formData.gradeLevel} student studying ${formData.subject}.`;
};

  const handleClose = () => {
    setFormData({
      subject: '',
      gradeLevel: '',
      helpType: '',
      specificInstructions: '',
      difficultyLevel: '',
      additionalAttachment: null
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 my-8 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Tell Us About Your Homework</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <p className="text-gray-600 text-lg">
              We need a few details to provide you with the best help possible. 
              This information helps us tailor our assistance to your grade level and needs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Homework File Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Uploaded File:</h3>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{fileName}</span>
                <span className="text-blue-600">({fileType})</span>
              </div>
            </div>

          {/* Student Name */}
          {/* <div>
            <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="h-4 w-4" />
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
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
          </div> */}

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <BookOpen className="h-4 w-4" />
              Subject *
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 ${
                errors.subject 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 focus:border-blue-500 bg-white'
              }`}
            >
              <option value="">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="font-medium">⚠️</span>
                {errors.subject}
              </p>
            )}
          </div>

          {/* Grade Level */}
          <div>
            <label htmlFor="gradeLevel" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <GraduationCap className="h-4 w-4" />
              Grade Level *
            </label>
            <select
              id="gradeLevel"
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 ${
                errors.gradeLevel 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 focus:border-blue-500 bg-white'
              }`}
            >
              <option value="">Select your grade level</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {errors.gradeLevel && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="font-medium">⚠️</span>
                {errors.gradeLevel}
              </p>
            )}
          </div>

          {/* Help Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Target className="h-4 w-4" />
              What type of help do you need? *
            </label>
            <div className="space-y-3">
              {helpTypes.map(type => (
                <label key={type.value} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                  formData.helpType === type.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="helpType"
                    value={type.value}
                    checked={formData.helpType === type.value}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.helpType && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="font-medium">⚠️</span>
                {errors.helpType}
              </p>
            )}
          </div>

          {/* Specific Instructions (Optional) */}
          <div>
            <label htmlFor="specificInstructions" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <HelpCircle className="h-4 w-4" />
              Specific Instructions (Optional)
            </label>
            <textarea
              id="specificInstructions"
              name="specificInstructions"
              value={formData.specificInstructions}
              onChange={handleInputChange}
              placeholder="Any specific questions or areas you'd like us to focus on?"
              rows={3}
              className="w-full text-black px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Difficulty Level (Optional) */}
          <div>
            <label htmlFor="difficultyLevel" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Target className="h-4 w-4" />
              Difficulty Level (Optional)
            </label>
            <select
              id="difficultyLevel"
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select difficulty level</option>
              {difficultyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
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
                Processing...
              </div>
            ) : (
              'Get Help with My Homework'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeworkDetailsDialog;