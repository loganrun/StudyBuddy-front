import React, { useState, useEffect, useRef } from 'react';

const AgentAvatar = ({ 
  isSpeaking = false, 
  size = 'large', 
  color = 'blue', 
  showControls = false,
  showSpeakingIndicator = true,
  onColorChange,
  className = ''
}) => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const avatarRef = useRef(null);

  // Color themes
  const colors = {
    blue: { primary: '#4fc3f7', secondary: '#1976d2', tertiary: '#0d47a1', name: 'Blue' },
    indigo: { primary: '#7986cb', secondary: '#3f51b5', tertiary: '#1a237e', name: 'Indigo' },
    cyan: { primary: '#4dd0e1', secondary: '#00acc1', tertiary: '#006064', name: 'Cyan' },
    green: { primary: '#81c784', secondary: '#4caf50', tertiary: '#1b5e20', name: 'Green' },
    orange: { primary: '#ffb74d', secondary: '#ff9800', tertiary: '#e65100', name: 'Orange' }
  };

  const colorKeys = Object.keys(colors);
  const currentColor = colors[color] || colors.blue;

  // Size variants
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48', 
    large: 'w-72 h-72',
    xl: 'w-96 h-96'
  };

  const containerSizeClasses = {
    small: 'w-40 h-40',
    medium: 'w-56 h-56',
    large: 'w-80 h-80', 
    xl: 'w-[26rem] h-[26rem]'
  };

  // Particle positions and delays
  const particles = [
    { top: '20%', left: '30%', delay: '0s' },
    { top: '40%', left: '70%', delay: '-2s' },
    { top: '60%', left: '20%', delay: '-4s' },
    { top: '80%', left: '60%', delay: '-6s' },
    { top: '30%', left: '80%', delay: '-8s' },
    { top: '70%', left: '40%', delay: '-10s' }
  ];

  const waves = [
    { delay: '0s' },
    { delay: '1s' },
    { delay: '2s' }
  ];

  // Handle color cycling
  const cycleColor = () => {
    const nextIndex = (currentColorIndex + 1) % colorKeys.length;
    setCurrentColorIndex(nextIndex);
    const newColor = colorKeys[nextIndex];
    onColorChange?.(newColor);
  };

  // Auto-demo effect (optional)
  useEffect(() => {
    if (!isSpeaking) {
      const interval = setInterval(() => {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 2000);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [isSpeaking]);

  return (
    <>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes swirl {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); opacity: 0; }
        }

        @keyframes ripple {
          0% {
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            opacity: 1;
          }
          100% {
            width: 150%;
            height: 150%;
            top: -25%;
            left: -25%;
            opacity: 0;
          }
        }

        @keyframes speakingPulse {
          0%, 100% { transform: scale(1) translateY(0px); }
          25% { transform: scale(1.08) translateY(-3px); }
          50% { transform: scale(1.12) translateY(-5px); }
          75% { transform: scale(1.06) translateY(-2px); }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes coreGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        .avatar-breathe {
          animation: breathe 4s ease-in-out infinite, float 6s ease-in-out infinite;
        }

        .avatar-speaking {
          animation: speakingPulse 0.8s ease-in-out infinite !important;
          filter: blur(0.3px) brightness(1.2);
        }

        .avatar-rotate::before {
          animation: rotate 8s linear infinite;
        }

        .particle {
          animation: swirl 12s linear infinite;
        }

        .wave {
          animation: ripple 3s ease-out infinite;
        }

        .core-glow {
          animation: coreGlow 5s ease-in-out infinite;
        }

        .speaking-indicator {
          animation: fadeInOut 2s ease-in-out infinite;
        }
      `}</style>

      <div className={`relative ${containerSizeClasses[size]} flex justify-center items-center ${className}`}>
        {/* Main Avatar */}
        <div 
          ref={avatarRef}
          className={`
            relative ${sizeClasses[size]} rounded-full
            ${isSpeaking ? 'avatar-speaking' : 'avatar-breathe'}
            filter blur-[0.5px]
          `}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${currentColor.primary}, ${currentColor.secondary}, ${currentColor.tertiary})`,
            boxShadow: `
              0 0 60px ${currentColor.primary}99,
              0 0 120px ${currentColor.primary}4d,
              inset 0 0 60px rgba(255, 255, 255, 0.1)
            `
          }}
        >
          {/* Rotating Border */}
          <div 
            className="absolute -inset-2.5 rounded-full opacity-70 avatar-rotate -z-10"
            style={{
              background: `linear-gradient(45deg, ${currentColor.primary}, ${currentColor.secondary}, ${currentColor.tertiary}, ${currentColor.primary})`
            }}
          />

          {/* Core Glow */}
          <div 
            className="absolute w-3/5 h-3/5 rounded-full top-1/5 left-1/5 core-glow"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent 70%)'
            }}
          />

          {/* Particles */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {particles.map((particle, index) => (
              <div
                key={index}
                className="absolute w-1 h-1 bg-white bg-opacity-80 rounded-full particle"
                style={{
                  top: particle.top,
                  left: particle.left,
                  animationDelay: particle.delay,
                  boxShadow: `0 0 10px ${currentColor.primary}cc`
                }}
              />
            ))}
          </div>

          {/* Energy Waves */}
          <div className="absolute inset-0 rounded-full">
            {waves.map((wave, index) => (
              <div
                key={index}
                className="absolute border-2 rounded-full wave"
                style={{
                  borderColor: `${currentColor.primary}4d`,
                  animationDelay: wave.delay
                }}
              />
            ))}
          </div>

          {/* Speaking Indicator */}
          {showSpeakingIndicator && (
            <div 
              className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-sm speaking-indicator ${
                isSpeaking ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ color: currentColor.primary }}
            >
              ● Speaking...
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={cycleColor}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
              style={{
                background: `${currentColor.primary}33`,
                border: `2px solid ${currentColor.primary}`,
                color: currentColor.primary,
                boxShadow: `0 5px 15px ${currentColor.primary}4d`
              }}
            >
              Change Color
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AgentAvatar;