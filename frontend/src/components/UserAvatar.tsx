import React from 'react';

interface UserAvatarProps {
  name?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name = 'User', className = 'w-8 h-8' }) => {
  const theme = React.useMemo(() => {
    // Generate a unique numeric hash from the name to assign a consistent neon color theme
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const themes = [
      { glow: '#ef4444', from: 'from-rose-500', to: 'to-red-600' }, // Red
      { glow: '#eab308', from: 'from-amber-400', to: 'to-yellow-500' }, // Gold
      { glow: '#3b82f6', from: 'from-blue-500', to: 'to-indigo-600' }, // Blue
      { glow: '#10b981', from: 'from-emerald-400', to: 'to-teal-600' }, // Green
      { glow: '#a855f7', from: 'from-purple-500', to: 'to-violet-600' }, // Purple
      { glow: '#ec4899', from: 'from-pink-500', to: 'to-rose-600' }, // Pink
      { glow: '#06b6d4', from: 'from-cyan-400', to: 'to-blue-500' }, // Cyan
    ];
    return themes[hash % themes.length];
  }, [name]);

  return (
    <div 
      className={`relative group rounded-full cursor-pointer select-none transition-all duration-300 active:scale-95 flex-shrink-0 ${className}`}
      style={{
        boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.1)`
      }}
    >
      {/* Slow-spinning Conic Neon Border (Active on Hover) */}
      <div 
        className="absolute inset-0 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100 animate-slow-spin z-10 pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent 30%, ${theme.glow} 70%, transparent 100%)`,
        }}
      />

      {/* Outer Glow Ring on Hover */}
      <div 
        className="absolute inset-0 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-40 blur-[4px] z-0 pointer-events-none"
        style={{
          background: theme.glow,
        }}
      />

      {/* Inner Avatar Image Container */}
      <div className="absolute inset-[1.5px] rounded-full overflow-hidden bg-slate-100 z-20 transition-transform duration-300 group-hover:scale-95">
        {/* Dynamic Gradient Background for the Caricature */}
        <div className={`w-full h-full bg-gradient-to-tr ${theme.from} ${theme.to} flex items-center justify-center p-0.5`}>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-500 ease-out transform scale-100 group-hover:scale-110 group-hover:rotate-3"
            loading="lazy"
          />
        </div>
      </div>

      {/* Subtle Bottom Shade Overlay inside the circle */}
      <div className="absolute inset-[1.5px] rounded-full bg-gradient-to-t from-black/15 to-transparent pointer-events-none z-30 opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
    </div>
  );
};

export default UserAvatar;
