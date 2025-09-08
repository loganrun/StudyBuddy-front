import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { loginSuccess, loginError } from '../reducers/authReducer';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, BookOpen, Menu, X } from 'lucide-react';
import axios from 'axios'
const apiAuth = import.meta.env.VITE_AUTH_URL;

function loginPage() {
    const nav = useNavigate()
    const dispatch = useDispatch();

    // Form state (preserve existing)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    // New state variables for Ask Tyson design system
    const [isSignUp, setIsSignUp] = useState(false);
    const [background, setBackground] = useState('ocean');
    const [selectedCharacter, setSelectedCharacter] = useState('robot');
    const [darkMode, setDarkMode] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Background themes (matching Ask Tyson design system)
    const backgrounds = {
        forest: {
            name: "Magical Forest",
            gradient: "from-green-400 via-blue-500 to-purple-600",
            pattern: "🌲🌟🦋"
        },
        ocean: {
            name: "Ocean Adventure", 
            gradient: "from-blue-400 via-cyan-500 to-teal-600",
            pattern: "🌊🐠🏝️"
        },
        space: {
            name: "Space Explorer",
            gradient: "from-purple-600 via-pink-500 to-red-500",
            pattern: "🚀⭐🪐"
        },
        garden: {
            name: "Secret Garden",
            gradient: "from-pink-400 via-purple-500 to-indigo-600", 
            pattern: "🌸🦋🌈"
        }
    };

    // Character options
    const characters = {
        robot: { emoji: "🤖", name: "Robot Buddy" },
        owl: { emoji: "🦉", name: "Wise Owl" },
        dragon: { emoji: "🐲", name: "Friendly Dragon" },
        bear: { emoji: "🐻", name: "Study Bear" },
        unicorn: { emoji: "🦄", name: "Magic Unicorn" },
        rocket: { emoji: "🚀", name: "Space Explorer" }
    };

    // Theme configuration
    const theme = {
        light: {
            formBg: 'bg-white/95',
            formBorder: 'border-white/50',
            headerBg: 'bg-slate-100/95',
            textPrimary: 'text-gray-800',
            textSecondary: 'text-gray-600',
            textTertiary: 'text-gray-500',
            inputBg: 'bg-white',
            inputBorder: 'border-gray-300',
            settingsBg: 'bg-white/95',
            settingsPanel: 'bg-gray-100',
            settingsSelected: 'bg-blue-500 text-white'
        },
        dark: {
            formBg: 'bg-gray-800/95',
            formBorder: 'border-gray-700/50',
            headerBg: 'bg-slate-800/95',
            textPrimary: 'text-white',
            textSecondary: 'text-gray-300',
            textTertiary: 'text-gray-400',
            inputBg: 'bg-gray-700',
            inputBorder: 'border-gray-600',
            settingsBg: 'bg-gray-800/95',
            settingsPanel: 'bg-gray-700',
            settingsSelected: 'bg-blue-600 text-white'
        }
    };

    const currentBg = backgrounds[background];
    const currentTheme = darkMode ? theme.dark : theme.light;
    const currentCharacter = characters[selectedCharacter];

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePassword = (password) => {
        return password.length >= 6
    }

    const onChange = (e) => {
        const { name, value } = e.target
        const processedValue = name === 'email' ? value.toLowerCase().trim() : value
        
        setFormData({
           ...formData,
            [name]: processedValue
        })

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            })
        }
    }

    const onSubmit = async(e) => {
        e.preventDefault()
        
        // Reset errors
        setErrors({})
        
        // Validate form
        const newErrors = {}
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 6 characters long'
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsLoading(true)
        
        try {
            const response = await axios.post(apiAuth, formData);
            const user = response.data; 
        
            dispatch(loginSuccess(user));
            nav('/dashboard')
            
        } catch (error) {
            setIsLoading(false)
            
            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const status = error.response.status
                const message = error.response.data?.message || error.response.data?.error || 'Login failed'
                
                if (status === 401 || status === 400) {
                    setErrors({ general: 'Invalid email or password' })
                } else if (status === 404) {
                    setErrors({ general: 'Account not found' })
                } else {
                    setErrors({ general: message })
                }
            } else if (error.request) {
                // Network error
                setErrors({ general: 'Network error. Please check your connection and try again.' })
            } else {
                // Other error
                setErrors({ general: 'An unexpected error occurred. Please try again.' })
            }
            
            dispatch(loginError(error.message));
        }
    }
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
      <div className={`relative z-10 flex items-center justify-between p-4 ${currentTheme.headerBg} backdrop-blur-md border-b ${currentTheme.formBorder}`}>
        <div className="flex items-center space-x-2">
          <BookOpen className={`h-8 w-8 ${currentTheme.textPrimary}`} />
          <h1 className={`text-2xl font-bold ${currentTheme.textPrimary}`}>Study Buddy</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className={`px-4 py-2 rounded-xl transition-all ${
              isSignUp ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : `${currentTheme.settingsPanel} ${currentTheme.textPrimary}`
            }`}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
          {/* <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full ${currentTheme.formBg} hover:scale-105 transition-all shadow-lg`}
          >
            <Menu className={`h-5 w-5 ${currentTheme.textPrimary}`} />
          </button> */}
        </div>
      </div>

      {/* Settings Panel */}
      {/* {isMenuOpen && (
        <div className={`absolute top-0 right-0 w-80 h-full ${currentTheme.settingsBg} backdrop-blur-md z-50 p-6 overflow-y-auto`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${currentTheme.textPrimary}`}>Settings</h2>
            <button onClick={() => setIsMenuOpen(false)}>
              <X className={`h-6 w-6 ${currentTheme.textPrimary}`} />
            </button>
          </div>
          
          {/* Dark Mode Toggle */}
          {/* <div className="mb-6">
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
          </div> */}
          
          {/* Background Selection */}
          {/* <div className="mb-6">
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
          </div> */}

          {/* Character Selection */}
          {/* <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Character</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(characters).map(([key, char]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCharacter(key)}
                  className={`p-3 rounded-xl text-center ${
                    selectedCharacter === key ? currentTheme.settingsSelected : currentTheme.settingsPanel
                  } ${selectedCharacter === key ? '' : currentTheme.textPrimary}`}
                >
                  <div className="text-2xl mb-1">{char.emoji}</div>
                  <div className="text-xs">{char.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )} */} 

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          
          {/* Character Display */}
          <div className="text-center mb-8">
            <div className="text-8xl animate-bounce mb-4">
              {currentCharacter.emoji}
            </div>
            <h2 className={`text-3xl font-bold ${currentTheme.textPrimary} mb-2`}>
              {isSignUp ? `Welcome to Study Buddy!` : `Welcome Back!`}
            </h2>
            <p className={`${currentTheme.textSecondary}`}>
              {isSignUp ? 'Join the learning adventure' : 'Ready to continue learning?'}
            </p>
          </div>

          {/* Form Card */}
          <div className={`${currentTheme.formBg} backdrop-blur-md rounded-3xl shadow-2xl p-8 border ${currentTheme.formBorder}`}>
            <form onSubmit={(e)=> onSubmit(e)} className="space-y-6">
              {/* General Error Message */}
              {errors.general && (
                <div className="rounded-xl bg-red-50 p-4">
                  <div className="text-sm text-red-800">
                    ⚠️ {errors.general}
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${currentTheme.textPrimary}`}>
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    autoComplete="email"
                    onChange={(e) =>{onChange(e)}}
                    className={`block w-full rounded-xl border-0 py-3 px-4 ${currentTheme.inputBg} ${currentTheme.textPrimary} shadow-sm ring-1 ring-inset ${
                        errors.email ? 'ring-red-500 focus:ring-red-500' : `${currentTheme.inputBorder} focus:ring-blue-500`
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">⚠️ {errors.email}</p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${currentTheme.textPrimary}`}>
                  <Lock className="inline h-4 w-4 mr-1" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    autoComplete="current-password"
                    onChange={(e) =>{onChange(e)}}
                    className={`block w-full rounded-xl border-0 py-3 px-4 pr-12 ${currentTheme.inputBg} ${currentTheme.textPrimary} shadow-sm ring-1 ring-inset ${
                        errors.password ? 'ring-red-500 focus:ring-red-500' : `${currentTheme.inputBorder} focus:ring-blue-500`
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 flex items-center pr-3 ${currentTheme.textSecondary} hover:${currentTheme.textPrimary}`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">⚠️ {errors.password}</p>
                  )}
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className={`ml-2 text-sm ${currentTheme.textSecondary}`}>Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center items-center rounded-xl px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 ${
                    isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isSignUp ? 'Creating Account...' : 'Logging in...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="h-5 w-5 mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                    {isSignUp ? 'Create Account' : 'Login'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-6">
            <p className={`${currentTheme.textSecondary}`}>
              Ready to teach? 
              <Link to='/tutorlogin' className="font-semibold text-blue-600 hover:text-blue-500 ml-1">
                Tutors Login Here
              </Link>
            </p>
          </div>
          
          {/* Fun Footer Message */}
          <div className="text-center mt-4">
            <p className={`text-sm ${currentTheme.textTertiary}`}>
              {isSignUp ? "Let's start your learning journey! 🎓" : "Welcome back, scholar! 📚"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default loginPage