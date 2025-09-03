import React, { useState } from 'react';
import { 
  Plus, 
  LogOut, 
  Award,
  Target,
  Clock,
  Menu
} from 'lucide-react';
import AddNotebook from '../components/AddNotebook';
import { getSubjectIcon } from '../utils/subjectIcons';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import SettingsPanel, { theme, backgrounds, defaultUserAvatars } from '../components/SettingsPanel';
import { useDispatch, useSelector } from 'react-redux';
import { deleteNotebook } from '../reducers/authReducer';
import { Link, useNavigate } from 'react-router-dom';
import { logoutSuccess, logoutError } from '../reducers/authReducer';

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
  
  // Use imported defaultUserAvatars as userAvatars
  const userAvatars = defaultUserAvatars;

  const currentBg = backgrounds[background];
  const currentUser = userAvatars[userAvatar];

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
    icon: getSubjectIcon(notebook.subject),
    gradient: subjectGradientMap[notebook.subject] || subjectGradientMap.default,
    date: new Date(notebook.createdAt).toLocaleDateString('en-US', { 
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
    //console.log(`Opening notebook: ${subjectData.name}`);
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
        userId: user.id,
        
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
    try {
        dispatch(logoutSuccess())
        navigate('/')
        
      } catch (error) {
        dispatch(logoutError({ error}))
      }
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
        
        <div className="flex items-center gap-3 mr-4">
          {/* Start Tutoring Button */}
          {/* <Link to="/joinsession">
            <button 
              className={`px-4 py-2 text-base ${styles.borderRadius} bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:scale-105 transition-transform shadow-lg flex items-center gap-2`}
            >
              <Target className="h-4 w-4" />
              Start Tutoring
            </button>
          </Link> */}

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
      <SettingsPanel
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
        background={background}
        onBackgroundChange={setBackground}
        ageGroup={ageGroup}
        showUserAvatar={true}
        userAvatars={userAvatars}
        currentUserAvatar={userAvatar}
        onUserAvatarChange={setUserAvatar}
      />

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
            <h2 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary}`}>My NoteBooks</h2>
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
                    {/* <div className="mb-4">
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
                    </div> */}
                    
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
