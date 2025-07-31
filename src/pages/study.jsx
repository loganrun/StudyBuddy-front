import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  Upload, 
  Send, 
  FileText, 
  BookOpen, 
  Menu,
  X,
  Star,
  Award,
  Heart,
  Smile
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, updateLastMessage, clearMessages } from '../reducers/conversationReducer';
import ReactMarkdown from 'react-markdown'
import LoadingSpinner from '../components/LoadingSpinner';
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import HomeworkUploader from '../components/HomeworkUploader';


const openUrl = import.meta.env.VITE_OPENAI_URL
const addHomeworkUrl = import.meta.env.VITE_ADDHOMEWORK_URL ;



const Study = () => {
  const [activePanel, setActivePanel] = useState('chat');
  const [ageGroup, setAgeGroup] = useState('1-5'); // '1-5' or '6-8'
  const [background, setBackground] = useState('forest');
  const [tysonCharacter, setTysonCharacter] = useState('robot');
  const [userAvatar, setUserAvatar] = useState('student');
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState('');
  const params = useLocation()
  const [input, setInput] = useState('');
  const messages = useSelector((state) => state.conversation.messages);
  const conversationId = useSelector((state) => state.conversation.conversationId);
  const origin = useSelector((state) => state.conversation.origin);
  const user = useSelector((state) => state.auth.user.payload.user);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
   const { url, subject, transcript, date, _id, notes, summary, roomId, userId } = params.state;
  const dispatch = useDispatch();
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const mobileChatContainerRef = useRef(null);
  const greetingInitialized = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  
  //console.log(_id)

  

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

  // Character options
  const characters = {
    robot: { emoji: "🤖", name: "Robot Tyson", color: "text-blue-400" },
    owl: { emoji: "🦉", name: "Wise Owl", color: "text-amber-600" },
    dragon: { emoji: "🐲", name: "Friendly Dragon", color: "text-green-500" },
    unicorn: { emoji: "🦄", name: "Magic Unicorn", color: "text-pink-500" },
    bear: { emoji: "🐻", name: "Study Bear", color: "text-brown-500" },
    rocket: { emoji: "🚀", name: "Rocket Tyson", color: "text-red-500" }
  };

  // User avatar options
  const userAvatars = {
    student: { emoji: "👤", name: "Student", color: "text-gray-600" },
    explorer: { emoji: "🧭", name: "Explorer", color: "text-blue-500" },
    scientist: { emoji: "🔬", name: "Scientist", color: "text-green-500" },
    artist: { emoji: "🎨", name: "Artist", color: "text-purple-500" },
    athlete: { emoji: "⚽", name: "Athlete", color: "text-orange-500" },
    musician: { emoji: "🎵", name: "Musician", color: "text-pink-500" },
    chef: { emoji: "👨‍🍳", name: "Chef", color: "text-yellow-600" },
    detective: { emoji: "🕵️", name: "Detective", color: "text-indigo-500" },
    astronaut: { emoji: "👨‍🚀", name: "Astronaut", color: "text-purple-600" },
    superhero: { emoji: "🦸", name: "Superhero", color: "text-red-500" }
  };

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
      chatBg: 'bg-white/90',
      inputBg: 'bg-white',
      inputBorder: 'border-gray-300',
      inputText: 'text-black',
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
      chatBg: 'bg-gray-800/90',
      inputBg: 'bg-gray-700',
      inputBorder: 'border-gray-600',
      inputText: 'text-white',
    }
  };

  const currentTheme = darkMode ? theme.dark : theme.light;

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
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" {...props} />
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
      setIsLoading(true);
      dispatch(addMessage({ type: 'question', text: input }));
      
    if(origin === 'homework') {
      // Add empty response message for homework streaming to update
      dispatch(addMessage({ type: 'response', text: '' }));
      try {
        const eventSource = new EventSource(`${addHomeworkUrl}/?prompt=${encodeURIComponent(input)}&userId=${encodeURIComponent(user.id)}&conversationId=${encodeURIComponent(conversationId)}  `);
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data)
          console.log(data)
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
          console.log(data)
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
          <Link to="/dashboard" onClick={() => dispatch(clearMessages())}>
          <ChevronLeft className={`h-6 w-6 ${currentTheme.textPrimary} cursor-pointer hover:scale-110 transition-transform`} />
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-4xl">{currentChar.emoji}</span>
            <div>
              <h1 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary}`}>Ask Tyson</h1>
              <p className={`${currentTheme.textSecondary} text-sm`}>Your Learning Buddy</p>
            </div>
          </div>
        </div>
        
        {/* Settings Menu */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-full ${currentTheme.panelBg} hover:scale-105 transition-all shadow-lg`}
        >
          <Menu className={`h-5 w-5 ${currentTheme.textPrimary}`} />
        </button>
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

          {/* Character Selection */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Choose Tyson</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(characters).map(([key, char]) => (
                <button
                  key={key}
                  onClick={() => setTysonCharacter(key)}
                  className={`p-3 rounded-xl ${currentTheme.settingsPanel} text-center ${
                    tysonCharacter === key ? 'ring-4 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="text-2xl mb-1">{char.emoji}</div>
                  <div className={`text-xs font-medium ${currentTheme.textPrimary}`}>{char.name}</div>
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

      {/* Desktop Layout */}
      <div className="hidden lg:flex relative z-10 h-[calc(100vh-80px)] gap-4 p-4">
       
        {/* Left Panel - Transcripts & Notes */}
        <div className={`w-1/4 ${currentTheme.panelBg} backdrop-blur-md ${styles.borderRadius} ${styles.panelPadding} shadow-xl border ${currentTheme.panelBorder} overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
          <h2 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary} mb-4 flex items-center gap-2`}>
            <FileText className={styles.iconSize} />
            Resources
          </h2>
          
          <div className={styles.spacing}>
            <div className="space-y-3">
              <h3 className={`font-semibold ${currentTheme.textSecondary} flex items-center gap-2`}>
                <BookOpen className="h-5 w-5" />
                References
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  { emoji: "🧮", title: "Math: Fractions Basics", date: "Today" },
                  { emoji: "📖", title: "Reading: Character Analysis", date: "Yesterday" },
                  { emoji: "🌍", title: "Geography: World Capitals", date: "2 days ago" },
                  { emoji: "🔬", title: "Science: Water Cycle", date: "3 days ago" },
                  { emoji: "📚", title: "History: Ancient Egypt", date: "1 week ago" },
                ].map((item, index) => (
                  <button
                    key={index}
                    className={`w-full text-left ${styles.borderRadius} bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 p-3 hover:scale-105 transition-all shadow-sm`}
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

            <div className="space-y-3">
              <h3 className={`font-semibold ${currentTheme.textSecondary} flex items-center gap-2`}>
                <BookOpen className="h-5 w-5" />
                Notes
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  { emoji: "📝", title: "Math Practice Notes", date: "Today" },
                  { emoji: "🎨", title: "Art Project Ideas", date: "Yesterday" },
                  { emoji: "⭐", title: "Spelling Words List", date: "2 days ago" },
                  { emoji: "🏃", title: "PE: Fitness Goals", date: "3 days ago" },
                  { emoji: "🎵", title: "Music: Song Lyrics", date: "1 week ago" },
                ].map((item, index) => (
                  <button
                    key={index}
                    className={`w-full text-left ${styles.borderRadius} bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 p-3 hover:scale-105 transition-all shadow-sm`}
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
                <div className={`max-w-xs ${styles.borderRadius} ${styles.panelPadding} ${
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
          <div ref={chatEndRef} />
          
          <div className={`${styles.panelPadding} border-t ${currentTheme.panelBorder}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                                    placeholder={ageGroup === '1-5' ? "Ask me anything! 😊" : "What would you like to learn?"}
                className={`flex-1 ${styles.borderRadius} ${currentTheme.inputText} ${currentTheme.inputBg} px-4 py-3 border-2 ${currentTheme.inputBorder} focus:border-blue-500 focus:outline-none ${styles.fontSize}`}
              />
              <button
                onClick={handleSubmit}
                className={`${styles.buttonSize} ${styles.borderRadius} bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition-transform shadow-lg`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Progress & Rewards */}
        <div className={`w-1/4 ${currentTheme.panelBg} backdrop-blur-md ${styles.borderRadius} ${styles.panelPadding} shadow-xl border ${currentTheme.panelBorder}`}>
          <h2 className={`${styles.titleSize} font-bold ${currentTheme.textPrimary} mb-4 flex items-center gap-2`}>
            <Star className={styles.iconSize} />
            {ageGroup === '1-5' ? 'My Progress' : 'Achievement Center'}
          </h2>
          
          <div className={styles.spacing}>
            <div className="text-center space-y-4">
              <div className={`${styles.borderRadius} bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4`}>
                <Award className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold">Learning Streak</p>
                <p className="text-2xl font-bold">7 Days! 🔥</p>
              </div>
              
              <div className={`${styles.borderRadius} bg-gradient-to-r from-green-400 to-blue-500 text-white p-4`}>
                <Heart className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold">Questions Answered</p>
                <p className="text-2xl font-bold">42 ⭐</p>
              </div>
              
              <div className={`${styles.borderRadius} bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4`}>
                <Smile className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold">Fun Level</p>
                <p className="text-2xl font-bold">Amazing! 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden relative z-10 h-[calc(100vh-80px)]">
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
        <div className="h-full overflow-hidden">
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
              
                <div ref={mobileChatContainerRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs ${styles.borderRadius} ${styles.panelPadding} ${
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
          <div ref={chatEndRef} />
              
              <div className={`${styles.panelPadding} border-t ${currentTheme.panelBorder}`}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={ageGroup === '1-5' ? "Ask me anything! 😊" : "What would you like to learn?"}
                    className={`flex-1 ${styles.borderRadius} ${currentTheme.inputText} ${currentTheme.inputBg} px-4 py-3 border-2 ${currentTheme.inputBorder} focus:border-blue-500 focus:outline-none ${styles.fontSize}`}
                  />
                  <button
                    onClick={handleSubmit}
                    className={`${styles.buttonSize} ${styles.borderRadius} bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 transition-transform shadow-lg`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resources Panel */}
          {activePanel === 'resources' && (
            <div className={`h-full ${currentTheme.panelBg} backdrop-blur-md ${styles.panelPadding} overflow-y-auto`}>
              <div className={styles.spacing}>
                <div className="space-y-4">
                  <h3 className={`font-bold ${currentTheme.textPrimary} flex items-center gap-2`}>
                    <BookOpen className="h-6 w-6" />
                    Transcripts
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
                        className={`w-full text-left ${styles.borderRadius} bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 p-3 hover:scale-105 transition-all shadow-sm`}
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

                <div className="space-y-4">
                  <h3 className={`font-bold ${currentTheme.textPrimary} flex items-center gap-2`}>
                    <BookOpen className="h-6 w-6" />
                    Notes
                  </h3>
                  <div className="space-y-2">
                    {[
                      { emoji: "📝", title: "Math Practice Notes", date: "Today" },
                      { emoji: "🎨", title: "Art Project Ideas", date: "Yesterday" },
                      { emoji: "⭐", title: "Spelling Words List", date: "2 days ago" },
                      { emoji: "🏃", title: "PE: Fitness Goals", date: "3 days ago" },
                      { emoji: "🎵", title: "Music: Song Lyrics", date: "1 week ago" },
                    ].map((item, index) => (
                      <button
                        key={index}
                        className={`w-full text-left ${styles.borderRadius} bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 p-3 hover:scale-105 transition-all shadow-sm`}
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
            <div className={`h-full ${currentTheme.panelBg} backdrop-blur-md ${styles.panelPadding} overflow-y-auto`}>
              <div className={styles.spacing}>
                <div className={`${styles.borderRadius} bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 text-center`}>
                  <Award className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold">Learning Streak</p>
                  <p className="text-2xl font-bold">7 Days! 🔥</p>
                </div>
                
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
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto h-full pb-16">
              <HomeworkUploader id={_id} userId={userId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Study;
