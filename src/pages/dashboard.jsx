import React, { useState } from 'react';
import { 
  Plus, 
  User, 
  LogOut, 
  BookOpen, 
  Calculator, 
  Beaker, 
  Globe, 
  Palette, 
  Music,
  Award,
  Target,
  Clock,
  Menu,
  X,
  Languages,
  Microscope,
  Atom,
  MapPin,
  Landmark,
  Camera,
  Gamepad2,
  Computer,
  Dumbbell
} from 'lucide-react';
import AddNotebook from '../components/AddNotebook';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { useDispatch, useSelector } from 'react-redux';
import { deleteNotebook } from '../reducers/authReducer';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [ageGroup, setAgeGroup] = useState('1-5');
  const [background, setBackground] = useState('forest');
  const [userAvatar, setUserAvatar] = useState('student');
  const [userName, setUserName] = useState('Alex'); // Added user name
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddNotebook, setShowAddNotebook] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user.payload.user);

  // Background themes
  const backgrounds = {
    forest: {
      name: "Magical Forest",
      gradient: "from-green-400 via-blue-500 to-purple-600",
      pattern: "🌲🌟🦋",
    },
    ocean: {
      name: "Ocean Adventure", 
      gradient: "from-blue-400 via-cyan-500 to-teal-600",
      pattern: "🌊🐠🏝️",
    },
    space: {
      name: "Space Explorer",
      gradient: "from-purple-600 via-pink-500 to-red-500",
      pattern: "🚀⭐🪐",
    },
    garden: {
      name: "Secret Garden",
      gradient: "from-pink-400 via-purple-500 to-indigo-600", 
      pattern: "🌸🦋🌈",
    }
  };

  // User avatar options
  const userAvatars = {
    student: { emoji: "👤", name: "Student" },
    explorer: { emoji: "🧭", name: "Explorer" },
    scientist: { emoji: "🔬", name: "Scientist" },
    artist: { emoji: "🎨", name: "Artist" },
    athlete: { emoji: "⚽", name: "Athlete" },
    musician: { emoji: "🎵", name: "Musician" },
    chef: { emoji: "👨‍🍳", name: "Chef" },
    detective: { emoji: "🕵️", name: "Detective" },
    astronaut: { emoji: "👨‍🚀", name: "Astronaut" },
    superhero: { emoji: "🦸", name: "Superhero" }
  };

  const currentBg = backgrounds[background];
  const currentUser = userAvatars[userAvatar];

  // Dark mode theme configuration
  const theme = {
    light: {
      panelBg: 'bg-white/90',
      panelBorder: 'border-white/50',
      headerBg: 'bg-white/95',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-600',
      textTertiary: 'text-gray-500',
      cardBg: 'bg-white/80',
      settingsBg: 'bg-white/95',
      settingsPanel: 'bg-gray-100',
      settingsSelected: 'bg-blue-500 text-white',
    },
    dark: {
      panelBg: 'bg-gray-800/90',
      panelBorder: 'border-gray-700/50',
      headerBg: 'bg-gray-800/95',
      textPrimary: 'text-white',
      textSecondary: 'text-gray-300',
      textTertiary: 'text-gray-400',
      cardBg: 'bg-gray-700/80',
      settingsBg: 'bg-gray-800/95',
      settingsPanel: 'bg-gray-700',
      settingsSelected: 'bg-blue-600 text-white',
    }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

  // Age-appropriate styling
  const ageStyles = {
    '1-5': {
      fontSize: 'text-lg',
      buttonSize: 'px-6 py-4 text-lg',
      cardPadding: 'p-6',
      borderRadius: 'rounded-3xl',
      titleSize: 'text-3xl',
      cardTitleSize: 'text-xl',
      spacing: 'space-y-6'
    },
    '6-8': {
      fontSize: 'text-base',
      buttonSize: 'px-4 py-3 text-base',
      cardPadding: 'p-5',
      borderRadius: 'rounded-2xl',
      titleSize: 'text-2xl',
      cardTitleSize: 'text-lg',
      spacing: 'space-y-4'
    }
  };

  const styles = ageStyles[ageGroup];

  // Icon mapping for different subjects
  const subjectIconMap = {
    'Math': Calculator,
    'Mathematics': Calculator,
    'Algebra': Calculator,
    'Geometry': Calculator,
    'Calculus': Calculator,
    'Statistics': Calculator,
    'Reading': BookOpen,
    'Literature': BookOpen,
    'English': BookOpen,
    'Language Arts': Languages,
    'Spanish': Languages,
    'French': Languages,
    'German': Languages,
    'Science': Beaker,
    'Chemistry': Beaker,
    'Physics': Atom,
    'Biology': Microscope,
    'Anatomy': Microscope,
    'Botany': Microscope,
    'Geography': Globe,
    'History': Landmark,
    'Social Studies': Globe,
    'Civics': Landmark,
    'Government': Landmark,
    'Art': Palette,
    'Drawing': Palette,
    'Painting': Palette,
    'Photography': Camera,
    'Music': Music,
    'Band': Music,
    'Orchestra': Music,
    'Computer Science': Computer,
    'Programming': Computer,
    'Technology': Computer,
    'Physical Education': Dumbbell,
    'PE': Dumbbell,
    'Health': Dumbbell,
    'Fitness': Dumbbell,
    'Games': Gamepad2,
    'Recreation': Gamepad2,
    'default': BookOpen
  };

  // Gradient colors for different subjects
  const subjectGradientMap = {
    'Math': 'from-blue-400 to-blue-600',
    'Mathematics': 'from-blue-400 to-blue-600',
    'Algebra': 'from-blue-500 to-indigo-600',
    'Geometry': 'from-cyan-400 to-blue-500',
    'Calculus': 'from-indigo-400 to-blue-600',
    'Statistics': 'from-blue-400 to-purple-500',
    'Reading': 'from-orange-400 to-red-500',
    'Literature': 'from-orange-400 to-red-500',
    'English': 'from-orange-400 to-red-500',
    'Language Arts': 'from-red-400 to-pink-500',
    'Spanish': 'from-yellow-400 to-red-500',
    'French': 'from-blue-400 to-purple-500',
    'German': 'from-red-400 to-yellow-500',
    'Science': 'from-purple-400 to-pink-500',
    'Chemistry': 'from-purple-400 to-pink-500',
    'Physics': 'from-indigo-400 to-purple-600',
    'Biology': 'from-green-400 to-emerald-500',
    'Anatomy': 'from-red-400 to-pink-500',
    'Botany': 'from-green-400 to-teal-500',
    'Geography': 'from-green-400 to-blue-500',
    'History': 'from-yellow-400 to-orange-500',
    'Social Studies': 'from-yellow-400 to-orange-500',
    'Civics': 'from-blue-400 to-indigo-500',
    'Government': 'from-slate-400 to-gray-600',
    'Art': 'from-pink-400 to-purple-500',
    'Drawing': 'from-purple-400 to-pink-500',
    'Painting': 'from-pink-400 to-rose-500',
    'Photography': 'from-gray-400 to-slate-600',
    'Music': 'from-indigo-400 to-purple-600',
    'Band': 'from-purple-400 to-indigo-600',
    'Orchestra': 'from-violet-400 to-purple-600',
    'Computer Science': 'from-cyan-400 to-blue-600',
    'Programming': 'from-green-400 to-cyan-500',
    'Technology': 'from-slate-400 to-blue-500',
    'Physical Education': 'from-orange-400 to-red-600',
    'PE': 'from-orange-400 to-red-600',
    'Health': 'from-emerald-400 to-teal-500',
    'Fitness': 'from-red-400 to-orange-500',
    'Games': 'from-purple-400 to-indigo-600',
    'Recreation': 'from-teal-400 to-cyan-500',
    'default': 'from-gray-400 to-gray-600'
  };

  // Transform user.notebooks into subjects format
  const subjects = user.notebooks ? user.notebooks.map(notebook => ({
    name: notebook.name,
    subject: notebook.subject,
    _id: notebook._id,
    owner: notebook.owner,
    icon: subjectIconMap[notebook.subject] || subjectIconMap.default,
    gradient: subjectGradientMap[notebook.subject] || subjectGradientMap.default,
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    progress: Math.floor(Math.random() * 40) + 60, // Random progress between 60-100%
    // Additional data for study page
    url: notebook.url || '',
    transcript: notebook.transcript || '',
    notes: notebook.notes || '',
    summary: notebook.summary || '',
    roomId: notebook.roomId || `room_${notebook._id}_${Date.now()}`
  })) : [];

  const handleCardClick = (subjectData) => {
    console.log(`Opening notebook: ${subjectData.name}`);
    // Navigate to study page with all notebook data
    navigate('/study', {
      state: {
        subject: subjectData.subject,
        name: subjectData.name,
        url: subjectData.url,
        transcript: subjectData.transcript,
        date: subjectData.date,
        _id: subjectData._id,
        notes: subjectData.notes,
        summary: subjectData.summary,
        roomId: subjectData.roomId,
        owner: subjectData.owner,
        progress: subjectData.progress,
        userId: user.id
      }
    });
  };

  const handleStartTutoring = (subject) => {
    console.log(`Starting tutoring for ${subject}`);
    // Navigate to the Ask Tyson interface
  };

  const handleDeleteClick = (e, subject) => {
    e.stopPropagation();
    setNotebookToDelete(subject);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notebookToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // TODO: Add API call to delete notebook from backend
      // const deleteUrl = import.meta.env.VITE_DELETE_NOTEBOOK_URL;
      // await axios.delete(`${deleteUrl}/${notebookToDelete._id}`);
      
      // Update Redux state
      dispatch(deleteNotebook(notebookToDelete._id));
      
      // Close dialog and reset state
      setShowDeleteDialog(false);
      setNotebookToDelete(null);
      setIsDeleting(false);
      
      console.log(`Notebook "${notebookToDelete.name}" deleted successfully`);
      
    } catch (error) {
      console.error('Error deleting notebook:', error);
      setIsDeleting(false);
      // TODO: Show error message to user
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setNotebookToDelete(null);
    setIsDeleting(false);
  };

  const handleLogout = () => {
    console.log('Logging out');
    // Handle logout logic
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentBg.gradient} relative overflow-hidden `}>
      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="text-6xl animate-pulse grid grid-cols-6 gap-8 p-8">
          {Array.from({length: 24}).map((_, i) => (
            <div key={i} className="transform rotate-12">
              {currentBg.pattern.split('')[i % 3]}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className={`relative z-10 flex items-center justify-between p-4 ${darkMode ? 'bg-slate-800/95' : 'bg-slate-100/95'} backdrop-blur-md border-b ${currentTheme.panelBorder}`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">{currentUser.emoji}</span>
            <div>
              <h1 className={`text-xl font-bold ${currentTheme.textPrimary}`}>Study Buddy</h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Start Tutoring Button */}
          <Link to="/joinsession">
            <button 
              className={`px-4 py-2 text-base ${styles.borderRadius} bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:scale-105 transition-transform shadow-lg flex items-center gap-2`}
            >
              <Target className="h-4 w-4" />
              Start Tutoring
            </button>
          </Link>

          {/* Settings Menu */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full ${currentTheme.panelBg} hover:scale-105 transition-all shadow-lg`}
          >
            <Menu className={`h-4 w-4 ${currentTheme.textPrimary}`} />
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className={`p-2 rounded-full bg-red-500 hover:bg-red-600 text-white hover:scale-105 transition-all shadow-lg`}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {isMenuOpen && (
        <div className={`absolute top-0 right-0 w-80 h-full ${currentTheme.settingsBg} backdrop-blur-md z-50 p-6 overflow-y-auto`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${currentTheme.textPrimary}`}>Settings</h2>
            <button onClick={() => setIsMenuOpen(false)}>
              <X className={`h-6 w-6 ${currentTheme.textPrimary}`} />
            </button>
          </div>
          
          {/* Dark Mode Toggle */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Theme</h3>
            <div className="flex items-center justify-between">
              <span className={currentTheme.textSecondary}>Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Age Group Selection */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Age Group</h3>
            <div className="space-y-2">
              {['1-5', '6-8'].map(age => (
                <button
                  key={age}
                  onClick={() => setAgeGroup(age)}
                  className={`w-full p-3 rounded-xl text-left ${
                    ageGroup === age ? currentTheme.settingsSelected : currentTheme.settingsPanel
                  } ${ageGroup === age ? '' : currentTheme.textPrimary}`}
                >
                  Grades {age}
                </button>
              ))}
            </div>
          </div>

          {/* Background Selection */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Background Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(backgrounds).map(([key, bg]) => (
                <button
                  key={key}
                  onClick={() => setBackground(key)}
                  className={`p-3 rounded-xl bg-gradient-to-br ${bg.gradient} text-white text-sm font-medium ${
                    background === key ? 'ring-4 ring-blue-500' : ''
                  }`}
                >
                  {bg.name}
                </button>
              ))}
            </div>
          </div>

          {/* User Avatar Selection */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Choose Your Avatar</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {Object.entries(userAvatars).map(([key, avatar]) => (
                <button
                  key={key}
                  onClick={() => setUserAvatar(key)}
                  className={`p-3 rounded-xl ${currentTheme.settingsPanel} text-center ${
                    userAvatar === key ? 'ring-4 ring-green-500 bg-green-50' : ''
                  }`}
                >
                  <div className="text-2xl mb-1">{avatar.emoji}</div>
                  <div className={`text-xs font-medium ${currentTheme.textPrimary}`}>{avatar.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Welcome Message */}
        <div className={`${currentTheme.cardBg} backdrop-blur-md ${styles.borderRadius} ${styles.cardPadding} shadow-lg border ${currentTheme.panelBorder} mb-6`}>
          <div className="text-center">
            <h2 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary} mb-2`}>
              {ageGroup === '1-5' ? `Welcome back, ${user.firstName}! 🌟` : `Welcome back, ${user.firstName}!`}
            </h2>
            <p className={`${currentTheme.textSecondary} ${styles.fontSize}`}>
              {ageGroup === '1-5' 
                ? `Ready for another awesome day of learning? Let's explore together! 🚀` 
                : `Ready to continue your learning journey? Let's make today productive!`
              }
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6`}>
          <div className={`${currentTheme.cardBg} backdrop-blur-md ${styles.borderRadius} p-4 shadow-lg border ${currentTheme.panelBorder} text-center`}>
            <Award className={`h-6 w-6 mx-auto mb-2 ${currentTheme.textPrimary}`} />
            <p className={`font-bold ${currentTheme.textPrimary} text-sm`}>Learning Streak</p>
            <p className={`text-xl font-bold ${currentTheme.textPrimary}`}>7 Days! 🔥</p>
          </div>
          
          <div className={`${currentTheme.cardBg} backdrop-blur-md ${styles.borderRadius} p-4 shadow-lg border ${currentTheme.panelBorder} text-center`}>
            <Target className={`h-6 w-6 mx-auto mb-2 ${currentTheme.textPrimary}`} />
            <p className={`font-bold ${currentTheme.textPrimary} text-sm`}>Total Sessions</p>
            <p className={`text-xl font-bold ${currentTheme.textPrimary}`}>24 ⭐</p>
          </div>
          
          <div className={`${currentTheme.cardBg} backdrop-blur-md ${styles.borderRadius} p-4 shadow-lg border ${currentTheme.panelBorder} text-center`}>
            <Clock className={`h-6 w-6 mx-auto mb-2 ${currentTheme.textPrimary}`} />
            <p className={`font-bold ${currentTheme.textPrimary} text-sm`}>Study Time</p>
            <p className={`text-xl font-bold ${currentTheme.textPrimary}`}>12h 30m ⏰</p>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary}`}>My WorkBooks</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Existing Subjects */}
            {subjects.map((subject, index) => {
              const IconComponent = subject.icon;
              return (
                <div
                  key={index}
                  className={`${styles.borderRadius} bg-gradient-to-br ${subject.gradient} text-white shadow-lg hover:scale-105 transition-transform cursor-pointer relative overflow-hidden`}
                  onClick={() => handleCardClick(subject)}
                >
                  <div className={`relative z-10 ${styles.cardPadding}`}>
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className="h-8 w-8" />
                      <button 
                        className="p-1 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors group"
                        onClick={(e) => handleDeleteClick(e, subject)}
                        title="Delete notebook"
                      >
                        <svg className="h-4 w-4 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    
                    <h3 className={`${styles.cardTitleSize} font-bold mb-2`}>{subject.name}</h3>
                    <p className="text-white/80 text-sm mb-4">{subject.date}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{subject.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${subject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button 
                      className={`w-full ${styles.borderRadius} bg-white/20 hover:bg-white/30 text-white font-medium py-2 transition-colors`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(subject);
                      }}
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Add New Subject Card */}
            <div 
              className={`${styles.borderRadius} ${currentTheme.cardBg} backdrop-blur-md border-2 border-dashed ${currentTheme.panelBorder} shadow-lg hover:scale-105 transition-all cursor-pointer group`}
              onClick={() => setShowAddNotebook(true)}
            >
              <div className={`${styles.cardPadding} text-center h-full flex flex-col justify-center items-center`}>
                <Plus className={`h-12 w-12 ${currentTheme.textTertiary} group-hover:${currentTheme.textSecondary} transition-colors mb-4`} />
                <h3 className={`${styles.cardTitleSize} font-bold ${currentTheme.textPrimary} mb-2`}>
                  {ageGroup === '1-5' ? 'Add New Subject' : 'New Subject'}
                </h3>
                <p className={`${currentTheme.textSecondary} text-sm`}>
                  {ageGroup === '1-5' ? 'Click to add a fun new subject!' : 'Create a new learning topic'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${currentTheme.cardBg} backdrop-blur-md ${styles.borderRadius} ${styles.cardPadding} shadow-lg border ${currentTheme.panelBorder}`}>
          <h3 className={`${styles.cardTitleSize} font-bold ${currentTheme.textPrimary} mb-4`}>Recent Activity</h3>
          <div className="space-y-3">
            {[
              { subject: 'Math', activity: 'Completed fractions worksheet', time: '2 hours ago', emoji: '🧮' },
              { subject: 'Reading', activity: 'Finished "Charlotte\'s Web" chapter 5', time: '1 day ago', emoji: '📖' },
              { subject: 'Science', activity: 'Learned about the water cycle', time: '2 days ago', emoji: '🔬' },
            ].map((item, index) => (
              <div key={index} className={`flex items-center gap-4 p-3 rounded-xl ${currentTheme.settingsPanel} hover:scale-105 transition-transform`}>
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className={`font-medium ${currentTheme.textPrimary}`}>{item.activity}</p>
                  <p className={`text-sm ${currentTheme.textSecondary}`}>{item.subject} • {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AddNotebook Modal */}
      <AddNotebook 
        isOpen={showAddNotebook} 
        onClose={() => setShowAddNotebook(false)} 
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        notebookName={notebookToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default StudentDashboard;
// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import DisplayLecture from '../components/DisplayLecture';
// import Navbar from '../components/NavBar';
// import { setLectures } from '../reducers/lecturesSlice';
// import axios from 'axios';
// const apiLecture = import.meta.env.VITE_LECTURE_URL;



// function Dashboard() {
//   const lectures = useSelector((state) => state.lectures.lectures);
//   const isLoading = useSelector((state) => state.lectures.isLoading);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const findLectures = async () => {
//       try {
//         let response = await axios({
//           method: 'get',
//           url: apiLecture,
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//         //console.log(response);
//         dispatch(setLectures(response.data));
//       } catch (error) {
//         console.error(error.message);
//       }
//     };
//     findLectures();
//   }, [dispatch]);

    

//   return (
//     <>
//     <Navbar id="dashboard" />
//     <div className="container mx-auto mt-4">
//     <h1 className="text-2xl font-bold mb-4">Lessons</h1>
//     <div className="grid gap-1 gap-y-4 mt-20 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    
// {isLoading ? (
//         <p className="text-center">Loading...</p>
//     ) : (
//         lectures.map((item) => (
//         <DisplayLecture key={item._id} data={item} /> 
//         ))
//     )}
//     </div>
//     </div>
//     </>    
// )
// }

// export default Dashboard
