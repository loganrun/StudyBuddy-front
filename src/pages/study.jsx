import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  LogOut, 
  Upload, 
  Send, 
  FileText, 
  BookOpen, 
  Menu,
  X,
  Star,
  Heart,
  Smile,
  Award,
  
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, updateLastMessage, clearMessages } from '../reducers/conversationReducer';
import { logoutSuccess, logoutError } from '../reducers/authReducer';
import ReactMarkdown from 'react-markdown'
//import LoadingSpinner from '../components/LoadingSpinner';
import { useLocation, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import HomeworkUploader from '../components/HomeworkUploader';
import SaveChatDialog from '../components/SaveChatDialog';
import SettingsPanel, { theme, backgrounds, defaultUserAvatars, defaultCharacters } from '../components/SettingsPanel';
import { getSubjectIcon } from '../utils/subjectIcons';
//import StudyTimer from '../components/StudyTimer';
import BreakTimer from '../components/BreakTimer';
//import StudyStats from '../components/StudyStats';
import BrainBreak from '../components/BrainBreak';
import StudyStreakCounter from '../components/StudyStreakCounter';


const openUrl = import.meta.env.VITE_OPENAI_URL
const addHomeworkUrl = import.meta.env.VITE_ADDHOMEWORK_URL ;

const Study = () => {
  const [activePanel, setActivePanel] = useState('chat');
  const [ageGroup, setAgeGroup] = useState('1-5'); // '1-5' or '6-8'
  const [background, setBackground] = useState('forest');
  const [tysonCharacter, setTysonCharacter] = useState('robot');
  const [userAvatar, setUserAvatar] = useState('student');
  const [darkMode, setDarkMode] = useState(false);
  const params = useLocation()
  const [input, setInput] = useState('');
  const messages = useSelector((state) => state.conversation.messages);
  const conversationId = useSelector((state) => state.conversation.conversationId);
  const origin = useSelector((state) => state.conversation.origin);
  const user = useSelector((state) => state.auth.user.payload.user);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { subject,_id, notes,userId, currentStreak, longestStreak, lastActivityDate } = params.state;
  const dispatch = useDispatch();
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const mobileChatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const greetingInitialized = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'logout' or 'navigate'
  const [showConversationDialog, setShowConversationDialog] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showBreakTimer, setShowBreakTimer] = useState(false);
  const navigate = useNavigate();

  //console.log(notes)
  //console.log(user)  
  //console.log(_id)
  console.log(currentStreak, longestStreak, lastActivityDate )

  // Using shared subject icon utility
  const IconComponent = getSubjectIcon(subject);
  
  // Using imported characters and user avatars from SettingsPanel
  const characters = defaultCharacters;
  const userAvatars = defaultUserAvatars;

  // Dark mode theme configuration
  // Extended theme for study.jsx specific properties
  const extendedTheme = {
    light: {
      ...theme.light,
      textSecondary: 'text-blue-800', // Custom override for this page
      chatBg: 'bg-white/90',
      inputBg: 'bg-white',
      inputBorder: 'border-gray-300',
      inputText: 'text-black',
    },
    dark: {
      ...theme.dark,
      chatBg: 'bg-gray-800/90',
      inputBg: 'bg-gray-700',
      inputBorder: 'border-gray-600',
      inputText: 'text-white',
    }
  };

  const currentTheme = darkMode ? extendedTheme.dark : extendedTheme.light;

  const components = {
    // Headings
    h1: ({ node, ...props }) => (
      <h1 className="text-4xl font-bold mb-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-3xl font-semibold mb-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-2xl font-medium mb-2" {...props} />
    ),

    // Paragraphs
    p: ({ node, ...props }) => (
      <p className="mb-4 text-base leading-relaxed" {...props} />
    ),

    // Links
    a: ({ node, ...props }) => (
      <a className="text-blue-600 hover:underline" {...props} />
    ),

    // Lists
    li: ({ node, ordered, ...props }) => (
      <li className="mb-2 list-disc ml-5" {...props} />
    ),

    // Blockquotes
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-blue-800 my-4" {...props} />
    ),

    // Code Blocks & Inline Code
    code: ({ node, inline, className, children, ...props }) => {
      return !inline ? (
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-auto my-4">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="bg-gray-100 rounded-sm px-1 font-mono text-sm" {...props}>
          {children}
        </code>
      );
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!input.trim()) return; // Don't submit empty messages
      setIsLoading(true);
      dispatch(addMessage({ type: 'question', text: input }));
      
    if(origin === 'homework') {
      // Add empty response message for homework streaming to update
      dispatch(addMessage({ type: 'response', text: '' }));
      try {
        const eventSource = new EventSource(`${addHomeworkUrl}/?prompt=${encodeURIComponent(input)}&userId=${encodeURIComponent(user.id)}&conversationId=${encodeURIComponent(conversationId)}  `);
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data)
          //console.log(data)
          if (data.content) {
            //console.log(data)
            dispatch(updateLastMessage({ text: data.content, conversationId: data.conversationId, origin: 'homework'  }));
            // Scroll to bottom during streaming
            setTimeout(() => {
              scrollToBottom();
            }, 50);
            //console.log(data.content)
          }
          if (data.done) {
            setInput("")
            eventSource.close();
            setIsLoading(false);
            // Trigger study activity event for streak counter
            window.dispatchEvent(new CustomEvent('studyActivityDetected'));
            // Focus the input after submission
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
              if (mobileInputRef.current) {
                mobileInputRef.current.focus();
              }
            }, 100);
          }
        };
  
        eventSource.onerror = (error) => {
          console.error('EventSource failed:', error);
          eventSource.close();
          setIsLoading(false);
        }
  
      } catch (error) {
        console.error(error);
        setIsLoading(false);
  
      }
    } else {
      // Add empty response message for regular streaming to update
      dispatch(addMessage({ type: 'response', text: '' }));
      try {
        const eventSource = new EventSource(`${openUrl}?prompt=${encodeURIComponent(input)}&userId=${encodeURIComponent(user.id)}&conversationId=${encodeURIComponent(conversationId)}  `);
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data)
          //console.log(data)
          if (data.content) {
            //console.log(data)
            dispatch(updateLastMessage({ text: data.content, conversationId: data.conversationId }));
            // Scroll to bottom during streaming
            setTimeout(() => {
              scrollToBottom();
            }, 50);
            //console.log(data.content)
          }
          if (data.done) {
            setInput("")
            eventSource.close();
            setIsLoading(false);
            // Trigger study activity event for streak counter
            window.dispatchEvent(new CustomEvent('studyActivityDetected'));
            // Focus the input after submission
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
              if (mobileInputRef.current) {
                mobileInputRef.current.focus();
              }
            }, 100);
          }
        };
  
        eventSource.onerror = (error) => {
          console.error('EventSource failed:', error);
          eventSource.close();
          setIsLoading(false);
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false); 
      }
      setInput('')
    
    }
  } 

  useEffect(() => {
    if (origin === 'homework') {
      setShowUploader(false)
    }
  }, [origin]);

  const scrollToBottom = () => {
    // Scroll desktop chat container
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    // Scroll mobile chat container  
    if (mobileChatContainerRef.current) {
      mobileChatContainerRef.current.scrollTop = mobileChatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

    // Clear messages and add greeting when component mounts
    useEffect(() => {
      // Only run once when component mounts
      if (greetingInitialized.current) return;
      greetingInitialized.current = true;
      
      // Clear any existing messages first
      dispatch(clearMessages());
      
      // Add greeting after a short delay
      setTimeout(() => {
        const greetingMessages = [
          `Hi there! I'm Tyson, your friendly learning buddy! 🤖`,
          `I see we're working on ${subject || 'something awesome'} today - that's fantastic! 📚`,
          `I'm here to help you learn, answer questions, and make studying fun! What would you like to explore first? 🚀`
        ];
        
        dispatch(addMessage({ 
          type: 'response', 
          text: greetingMessages.join('\n\n')
        }));
      }, 500);
    }, []); // Empty dependency array - only run on mount

 

  const currentBg = backgrounds[background];
  const currentChar = characters[tysonCharacter];
  const currentUser = userAvatars[userAvatar];

  // Age-appropriate styling
  const ageStyles = {
    '1-5': {
      fontSize: 'text-lg',
      buttonSize: 'px-6 py-4 text-lg',
      panelPadding: 'p-6',
      borderRadius: 'rounded-3xl',
      iconSize: 'h-8 w-8',
      titleSize: 'text-2xl',
      spacing: 'space-y-6'
    },
    '6-8': {
      fontSize: 'text-base',
      buttonSize: 'px-4 py-3 text-base',
      panelPadding: 'p-4',
      borderRadius: 'rounded-2xl',
      iconSize: 'h-6 w-6',
      titleSize: 'text-xl',
      spacing: 'space-y-4'
    }
  };

  const handleLogout = () => {
    if (messages.length > 1) {
      // Show save dialog
      setPendingAction('logout');
      setShowSaveDialog(true);
    } else {
      // No messages to save, proceed with logout
      executeLogout();
    }
  };

  const executeLogout = () => {
    try {
      dispatch(clearMessages());
      dispatch(logoutSuccess());
      navigate('/');
    } catch (error) {
      dispatch(logoutError({ error }));
    }
  };

  const handleChevronClick = () => {
    if (messages.length > 1) {
      // Show save dialog
      setPendingAction('navigate');
      setShowSaveDialog(true);
    } else {
      // No messages to save, proceed with navigation
      dispatch(clearMessages());
      navigate('/dashboard');
    }
  };

  const handleSaveDialogConfirm = () => {
    // Clear messages and execute pending action
    dispatch(clearMessages());
    
    if (pendingAction === 'logout') {
      executeLogout();
    } else if (pendingAction === 'navigate') {
      navigate('/dashboard');
    }
    
    // Reset state
    setShowSaveDialog(false);
    setPendingAction(null);
  };

  const handleSaveDialogClose = () => {
    // Reset state without executing action
    setShowSaveDialog(false);
    setPendingAction(null);
  };

  // Handle break suggestion from StudyTimer
  const handleBreakSuggested = () => {
    setShowBreakTimer(true);
  };

  // Handle break completion from BreakTimer
  const handleBreakComplete = (breakDuration) => {
    setShowBreakTimer(false);
    // Optional: You could show a notification or update some state here
    console.log(`Break completed after ${Math.floor(breakDuration / 60)} minutes`);
  };

  const styles = ageStyles[ageGroup];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentBg.gradient} relative overflow-hidden`}>
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
          <button onClick={handleChevronClick}>
            <ChevronLeft className={`h-6 w-6 ${currentTheme.textPrimary} cursor-pointer hover:scale-110 transition-transform`} />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-4xl">{currentChar.emoji}</span>
            <div>
              <h1 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary}`}>Ask Tyson</h1>
              <p className={`${currentTheme.textSecondary} text-sm`}>Your Learning Buddy</p>
            </div>
          </div>
        </div>
        
        {/* Settings Menu and Logout Button */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full ${currentTheme.panelBg} hover:scale-105 transition-all shadow-lg`}
          >
            <Menu className={`h-5 w-5 ${currentTheme.textPrimary}`} />
          </button>
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
        onAgeGroupChange={setAgeGroup}
        showCharacterSelection={true}
        characters={characters}
        currentCharacter={tysonCharacter}
        onCharacterChange={setTysonCharacter}
        showUserAvatar={true}
        userAvatars={userAvatars}
        currentUserAvatar={userAvatar}
        onUserAvatarChange={setUserAvatar}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:flex relative z-10 h-[calc(100vh-80px)] gap-4 p-4">
       
        {/* Left Panel - Transcripts & Notes */}
        <div className={`w-1/4 ${currentTheme.panelBg} backdrop-blur-md ${styles.borderRadius} ${styles.panelPadding} shadow-xl border ${currentTheme.panelBorder} overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
          <h2 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary} mb-10 flex items-center gap-2`}>
            <FileText className={styles.iconSize} />
            Resources
          </h2>
           <div className="space-y-3">
              <h3 className={`font-semibold ${currentTheme.textSecondary} flex items-center gap-2`}>
                <BookOpen className="h-5 w-5" />
                Saved Notes
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {notes.slice().reverse().map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedConversation(item);
                      setShowConversationDialog(true);
                    }}
                    className={`w-full text-left ${styles.borderRadius} ${darkMode ? 'bg-gradient-to-r from-indigo-600/40 to-cyan-600/40 hover:from-indigo-500/50 hover:to-cyan-500/50 border border-indigo-500' : 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200'} p-3 hover:scale-105 transition-all shadow-sm`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="h-6 w-6 text-blue-800" />
                      <span className={`font-medium ${currentTheme.textPrimary} ${ageGroup === '1-5' ? 'text-sm' : 'text-xs'}`}>
                        {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`${darkMode ? 'text-blue-300 bg-gray-700/70' : 'text-blue-800 bg-white/70'} text-bold ${ageGroup === '1-5' ? 'text-sm' : 'text-xs'} px-2 py-1 rounded-full font-medium`}>
                         {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          
          <div className="mt-10">
            <div className="space-y-3">
              <h3 className={`font-semibold ${currentTheme.textSecondary} flex items-center gap-2`}>
                <BookOpen className="h-5 w-5" />
                References
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  { emoji: "🧮", title: "Math: Fractions Basics", date: "Today" },
                  { emoji: "📖", title: "Reading: Character Analysis", date: "Yesterday" },
                  { emoji: "🌍", title: "Geography: World Capitals", date: "2 days ago" },
                  { emoji: "🔬", title: "Science: Water Cycle", date: "3 days ago" },
                  { emoji: "📚", title: "History: Ancient Egypt", date: "1 week ago" },
                ].map((item, index) => (
                  <button
                    key={index}
                    className={`w-full text-left ${styles.borderRadius} ${darkMode ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 hover:from-blue-800/40 hover:to-purple-800/40 border border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200'} p-3 hover:scale-105 transition-all shadow-sm`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.emoji}</span>
                      <span className={`font-medium ${currentTheme.textPrimary} ${ageGroup === '1-5' ? 'text-sm' : 'text-xs'}`}>
                        {item.title}
                      </span>
                    </div>
                    <div className={`${currentTheme.textSecondary} ${ageGroup === '1-5' ? 'text-xs' : 'text-xs'}`}>
                      {item.date}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Chat */}
        <div className={`w-1/2 ${currentTheme.chatBg} backdrop-blur-md ${styles.borderRadius} shadow-xl border ${currentTheme.panelBorder} flex flex-col`}>
          <div className={`${styles.panelPadding} border-b ${currentTheme.panelBorder}`}>
            <div className="flex items-center justify-between">
              <h2 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary} flex items-center gap-2`}>
                <span className="text-2xl">{currentChar.emoji}</span>
                Chat with Tyson
              </h2>
              <div className="flex gap-2">
                <button className={`${styles.buttonSize} ${styles.borderRadius} bg-gradient-to-r from-orange-400 to-red-500 text-white font-medium hover:scale-105 transition-transform shadow-lg flex items-center gap-2`}
                onClick={ () => setShowUploader(!showUploader) }>
                  <Upload className="h-5 w-5" />
                  {ageGroup === '1-5' ? 'Homework Helper' : 'Homework Helper'}
                </button>
                
              <Link to="/voiceAgent">
                <button 
                  
                  className={`${styles.buttonSize} ${styles.borderRadius} bg-rose-600 text-white font-medium  opacity-60 flex items-center gap-2`}
                >
                  🎤 Talk to Mel
                </button>
              </Link>
                
              </div>
              
            </div>
          </div>
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}>
                <div className={` ${styles.borderRadius} ${styles.panelPadding} ${
                  message.type === 'question' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                } shadow-lg`}>
                  {message.type === 'question' ? (
                    <div className="flex items-center gap-2 mb-2 justify-end">
                      <span className="font-semibold text-sm text-white">You</span>
                      <span className="text-lg">{currentUser.emoji}</span>
                    </div>
                    
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{currentChar.emoji}</span>
                      <span className="font-semibold text-sm">Tyson</span>
                    </div>
                  )}
                  <ReactMarkdown components={components}>{message.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className={`${styles.panelPadding} border-t ${currentTheme.panelBorder}`}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={ageGroup === '1-5' ? "Ask me anything! 😊" : "What would you like to learn?"}
                className={`flex-1 ${styles.borderRadius} ${currentTheme.inputText} ${currentTheme.inputBg} px-4 py-3 border-2 ${currentTheme.inputBorder} focus:border-blue-500 focus:outline-none ${styles.fontSize}`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`${styles.buttonSize} ${styles.borderRadius} bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Study Tools & Progress */}
        <div className={`w-1/4 ${currentTheme.panelBg} backdrop-blur-md ${styles.borderRadius} ${styles.panelPadding} shadow-xl border ${currentTheme.panelBorder} overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
          <h2 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary} mb-4 flex items-center gap-2`}>
            <Star className={styles.iconSize} />
            {ageGroup === '1-5' ? 'Study Tools' : 'Study Dashboard'}
          </h2>
          
          <div className={styles.spacing}>
            
            <BrainBreak
            notebookId={_id}
              darkMode={darkMode}              
            />

            {/* Break Timer (only visible when break is suggested) */}
            <BreakTimer
              darkMode={darkMode}
              isVisible={showBreakTimer}
              onBreakComplete={handleBreakComplete}
              className="mb-4"
            />
            <StudyStreakCounter
              darkMode={darkMode}
              size="normal"
              showAnimation={true}
              notebookId={_id}
              current={currentStreak || 0}
              longest={longestStreak || 0}
              lastStudyDate={lastActivityDate || ""}
            />  �

            {/* Additional Achievement Cards */}
            <div className="space-y-3">
              <div className={`${styles.borderRadius} bg-gradient-to-r from-green-400 to-blue-500 text-white p-3 text-center`}>
                <Heart className="h-6 w-6 mx-auto mb-2" />
                <p className="font-bold text-sm">Questions Answered</p>
                <p className="text-lg font-bold">42 ⭐</p>
              </div>
              
              <div className={`${styles.borderRadius} bg-gradient-to-r from-pink-400 to-purple-500 text-white p-3 text-center`}>
                <Smile className="h-6 w-6 mx-auto mb-2" />
                <p className="font-bold text-sm">Fun Level</p>
                <p className="text-lg font-bold">Amazing! 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden relative z-10 h-[calc(100vh-80px)] flex flex-col">
        {/* Tab Navigation */}
        <div className={`${currentTheme.panelBg} backdrop-blur-md flex border-b ${currentTheme.panelBorder}`}>
          {[
            { id: 'chat', label: 'Chat', icon: currentChar.emoji },
            { id: 'resources', label: 'Resources', icon: '📚' },
            { id: 'progress', label: 'Progress', icon: '⭐' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className={`flex-1 ${styles.panelPadding} text-center transition-all ${
                activePanel === tab.id 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : `${currentTheme.textSecondary} hover:${currentTheme.panelBg}`
              }`}
            >
              <div className="text-2xl mb-1">{tab.icon}</div>
              <div className={`font-medium ${ageGroup === '1-5' ? 'text-lg' : 'text-sm'}`}>
                {tab.label}
              </div>
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-hidden">
          {/* Chat Panel */}
          {activePanel === 'chat' && (
            <div className={`h-full ${currentTheme.chatBg} backdrop-blur-md flex flex-col`}>
              <div className={`${styles.panelPadding} border-b ${currentTheme.panelBorder} flex justify-between items-center`}>
                <h2 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary} flex items-center gap-2`}>
                  <span className="text-2xl">{currentChar.emoji}</span>
                  Tyson
                </h2>
                <div className="flex gap-2">
                  <button 
                    className={`${styles.buttonSize} ${styles.borderRadius} bg-gradient-to-r from-orange-400 to-red-500 text-white font-medium hover:scale-105 transition-transform shadow-lg flex items-center gap-2`}
                    onClick={() => setShowUploader(!showUploader)}
                  >
                    <Upload className="h-4 w-4" />
                    {ageGroup === '1-5' ? 'Homework Helper' : 'Homework Helper'}
                  </button>
                  <Link to="/voiceAgent">
                  <button 
                    
                    className={`${styles.buttonSize} ${styles.borderRadius} bg-rose-600 text-white font-medium  opacity-60 flex items-center gap-2 text-sm`}
                  >
                    🎤 Talk to Mel
                  </button>
                  </Link>
                </div>
              </div>
              
                <div ref={mobileChatContainerRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 space-y-4 pb-24">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${styles.borderRadius} ${styles.panelPadding} ${
                  message.type === 'question' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                } shadow-lg`}>
                  {message.type === 'question' ? (
                    <div className="flex items-center gap-2 mb-2 justify-end">
                      <span className="font-semibold text-sm text-white">You</span>
                      <span className="text-lg">{currentUser.emoji}</span>
                    </div>
                    
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{currentChar.emoji}</span>
                      <span className="font-semibold text-sm">Tyson</span>
                    </div>
                  )}
                  <ReactMarkdown components={components}>{message.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
            </div>
          )}

          {/* Resources Panel */}
          {activePanel === 'resources' && (
            <div className={`h-full ${currentTheme.panelBg} backdrop-blur-md ${styles.panelPadding} overflow-y-auto pb-24`}>
              <div className={styles.spacing}>
                <div className="space-y-4">
                  <h3 className={`font-bold ${currentTheme.textPrimary} flex items-center gap-2`}>
                    <BookOpen className="h-6 w-6" />
                    Saved Notes
                  </h3>
                  <div className="space-y-2">
                    {notes.slice().reverse().map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedConversation(item);
                          setShowConversationDialog(true);
                        }}
                        className={`w-full text-left ${styles.borderRadius} ${darkMode ? 'bg-gradient-to-r from-indigo-600/40 to-cyan-600/40 hover:from-indigo-500/50 hover:to-cyan-500/50 border border-indigo-500' : 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200'} p-3 hover:scale-105 transition-all shadow-sm`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="h-6 w-6 text-blue-800" />
                          <span className={`font-medium ${currentTheme.textPrimary} ${ageGroup === '1-5' ? 'text-base' : 'text-sm'}`}>
                            {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`${darkMode ? 'text-blue-300 bg-gray-700/70' : 'text-blue-800 bg-white/70'} text-bold ${ageGroup === '1-5' ? 'text-sm' : 'text-xs'} px-2 py-1 rounded-full font-medium`}>
                             {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className={`font-bold ${currentTheme.textPrimary} flex items-center gap-2`}>
                    <BookOpen className="h-6 w-6" />
                    References
                  </h3>
                  <div className="space-y-2">
                    {[
                      { emoji: "🧮", title: "Math: Fractions Basics", date: "Today" },
                      { emoji: "📖", title: "Reading: Character Analysis", date: "Yesterday" },
                      { emoji: "🌍", title: "Geography: World Capitals", date: "2 days ago" },
                      { emoji: "🔬", title: "Science: Water Cycle", date: "3 days ago" },
                      { emoji: "📚", title: "History: Ancient Egypt", date: "1 week ago" },
                    ].map((item, index) => (
                      <button
                        key={index}
                        className={`w-full text-left ${styles.borderRadius} ${darkMode ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 hover:from-blue-800/40 hover:to-purple-800/40 border border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200'} p-3 hover:scale-105 transition-all shadow-sm`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{item.emoji}</span>
                          <span className={`font-medium ${currentTheme.textPrimary} ${ageGroup === '1-5' ? 'text-base' : 'text-sm'}`}>
                            {item.title}
                          </span>
                        </div>
                        <div className={`${currentTheme.textSecondary} ${ageGroup === '1-5' ? 'text-sm' : 'text-xs'}`}>
                          {item.date}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Panel */}
          {activePanel === 'progress' && (
            <div className={`h-full ${currentTheme.panelBg} backdrop-blur-md ${styles.panelPadding} overflow-y-auto pb-24`}>
              <div className={styles.spacing}>
                {/* Study Timer */}
                 <BrainBreak
            notebookId={_id}
              darkMode={darkMode}              
            />

                {/* Break Timer (only visible when break is suggested) */}
                <BreakTimer
                  darkMode={darkMode}
                  isVisible={showBreakTimer}
                  onBreakComplete={handleBreakComplete}
                />
                <StudyStreakCounter
              darkMode={darkMode}
              size="normal"
              showAnimation={true}
              notebookId={_id}
              current={currentStreak || 0}
              longest={longestStreak || 0}
              lastStudyDate={lastActivityDate || ""}
            /> 

               
                
                {/* Additional Achievement Cards */}
                <div className={`${styles.borderRadius} bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 text-center`}>
                  <Heart className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold">Questions Answered</p>
                  <p className="text-2xl font-bold">42 ⭐</p>
                </div>
                
                <div className={`${styles.borderRadius} bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4 text-center`}>
                  <Smile className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold">Fun Level</p>
                  <p className="text-2xl font-bold">Amazing! 🎉</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Input Field for Mobile/Tablet - Only show on chat panel */}
        {activePanel === 'chat' && (
          <div className={`fixed bottom-0 left-0 right-0 ${currentTheme.chatBg} backdrop-blur-md border-t ${currentTheme.panelBorder} ${styles.panelPadding} z-20`}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={mobileInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={ageGroup === '1-5' ? "Ask me anything! 😊" : "What would you like to learn?"}
                className={`flex-1 ${styles.borderRadius} ${currentTheme.inputText} ${currentTheme.inputBg} px-4 py-3 border-2 ${currentTheme.inputBorder} focus:border-blue-500 focus:outline-none ${styles.fontSize}`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`${styles.buttonSize} ${styles.borderRadius} bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* HomeworkUploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4 bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Homework Helper</h2>
              <button
                onClick={() => setShowUploader(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6 text-blue-800" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto h-full pb-16">
              <HomeworkUploader id={_id} userId={userId} />
            </div>
          </div>
        </div>
      )}

      {/* Save Chat Dialog */}
      <SaveChatDialog
        isOpen={showSaveDialog}
        onClose={handleSaveDialogClose}
        onConfirm={handleSaveDialogConfirm}
        messages={messages}
        notebookId={_id}
      />

      {/* Conversation Dialog */}
      {showConversationDialog && selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-4 bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center gap-3">
                <IconComponent className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedConversation.title.charAt(0).toUpperCase() + selectedConversation.title.slice(1)}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    📅 {new Date(selectedConversation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowConversationDialog(false);
                  setSelectedConversation(null);
                }}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* Dialog Content - Conversation */}
            <div className="overflow-y-auto h-full pb-16 p-4 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="space-y-4 max-w-3xl mx-auto">
                {selectedConversation.content && selectedConversation.content.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${styles.borderRadius} ${styles.panelPadding} max-w-[80%] ${
                      message.type === 'question' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                    } shadow-lg`}>
                      {message.type === 'question' ? (
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <span className="font-semibold text-sm text-white">You</span>
                          <span className="text-lg">{currentUser.emoji}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{currentChar.emoji}</span>
                          <span className="font-semibold text-sm">Tyson</span>
                        </div>
                      )}
                      <ReactMarkdown components={components}>{message.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Study;
