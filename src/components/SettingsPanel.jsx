import React from 'react';
import { X } from 'lucide-react';

// Common theme configuration
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

// Common background themes
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

// Default user avatars
const defaultUserAvatars = {
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

const SettingsPanel = ({
  isOpen,
  onClose,
  darkMode,
  onDarkModeChange,
  background,
  onBackgroundChange,
  ageGroup = '1-5',
  onAgeGroupChange,
  // Optional character selection
  showCharacterSelection = false,
  characters = {},
  currentCharacter = '',
  onCharacterChange,
  // Optional user avatar selection
  showUserAvatar = false,
  userAvatars = defaultUserAvatars,
  currentUserAvatar = '',
  onUserAvatarChange,
  // Optional age group selection
  showAgeGroupSelection = false,
  // Additional customization
  customSections = []
}) => {
  if (!isOpen) return null;

  const currentTheme = darkMode ? theme.dark : theme.light;

  return (
    <div className={`absolute top-0 right-0 w-80 h-full ${currentTheme.settingsBg} backdrop-blur-md z-50 p-6 overflow-y-auto`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-bold ${currentTheme.textPrimary}`}>Settings</h2>
        <button onClick={onClose}>
          <X className={`h-6 w-6 ${currentTheme.textPrimary}`} />
        </button>
      </div>
      
      {/* Dark Mode Toggle */}
      <div className="mb-6">
        <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Theme</h3>
        <div className="flex items-center justify-between">
          <span className={currentTheme.textSecondary}>Dark Mode</span>
          <button
            onClick={() => onDarkModeChange(!darkMode)}
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
      
      {/* Background Selection */}
      <div className="mb-6">
        <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Background Theme</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(backgrounds).map(([key, bg]) => (
            <button
              key={key}
              onClick={() => onBackgroundChange(key)}
              className={`p-3 rounded-xl bg-gradient-to-br ${bg.gradient} text-white text-sm font-medium ${
                background === key ? 'ring-4 ring-blue-500' : ''
              }`}
            >
              {bg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Age Group Selection */}
      {showAgeGroupSelection && onAgeGroupChange && (
        <div className="mb-6">
          <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Age Group</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAgeGroupChange('1-5')}
              className={`p-3 rounded-xl text-sm font-medium ${
                ageGroup === '1-5' 
                  ? 'bg-blue-500 text-white ring-4 ring-blue-500' 
                  : `${currentTheme.settingsPanel} ${currentTheme.textPrimary}`
              }`}
            >
              Ages 1-5
            </button>
            <button
              onClick={() => onAgeGroupChange('6-8')}
              className={`p-3 rounded-xl text-sm font-medium ${
                ageGroup === '6-8' 
                  ? 'bg-blue-500 text-white ring-4 ring-blue-500' 
                  : `${currentTheme.settingsPanel} ${currentTheme.textPrimary}`
              }`}
            >
              Ages 6-8
            </button>
          </div>
        </div>
      )}

      {/* Character Selection */}
      {showCharacterSelection && characters && Object.keys(characters).length > 0 && (
        <div className="mb-6">
          <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Choose Character</h3>
          <div className="grid grid-cols-2 gap-2 p-1">
            {Object.entries(characters).map(([key, char]) => (
              <button
                key={key}
                onClick={() => onCharacterChange && onCharacterChange(key)}
                className={`p-3 rounded-xl ${currentTheme.settingsPanel} text-center ${
                  currentCharacter === key ? 'ring-4 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="text-2xl mb-1">{char.emoji}</div>
                <div className={`text-xs font-medium ${currentTheme.textPrimary}`}>{char.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Avatar Selection */}
      {showUserAvatar && userAvatars && Object.keys(userAvatars).length > 0 && (
        <div className="mb-6">
          <h3 className={`font-semibold mb-3 ${currentTheme.textPrimary}`}>Choose Your Avatar</h3>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-1">
            {Object.entries(userAvatars).map(([key, avatar]) => (
              <button
                key={key}
                onClick={() => onUserAvatarChange && onUserAvatarChange(key)}
                className={`p-3 rounded-xl ${currentTheme.settingsPanel} text-center ${
                  currentUserAvatar === key ? 'ring-4 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="text-2xl mb-1">{avatar.emoji}</div>
                <div className={`text-xs font-medium ${currentTheme.textPrimary}`}>{avatar.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {customSections.map((section, index) => (
        <div key={index} className="mb-6">
          {section}
        </div>
      ))}
    </div>
  );
};

export { theme, backgrounds, defaultUserAvatars };
export default SettingsPanel;