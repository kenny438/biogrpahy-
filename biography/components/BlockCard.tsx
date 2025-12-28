import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Github, Twitter, Instagram, Linkedin, Mail, Music, Video, Edit3, Phone, MessageCircle, Heart, Repeat, Share, Terminal, Gamepad2, Sparkles, MapPin, Play, Pause, SkipForward, Disc, Layers, Sun, CloudRain, Wind, X, Circle, RotateCcw, CloudLightning, Hammer, Trash2, Lock } from 'lucide-react';
import { BlockItem, ProfileTheme } from '../types';

interface BlockCardProps {
  block: BlockItem;
  theme: ProfileTheme;
  avatarUrl?: string; // Needed for status blocks
  userName?: string; // Needed for status blocks
  onEdit?: () => void;
  onDelete?: () => void; // New: For breaking animations
  onStackClick?: (stackId: string) => void;
  onInteraction?: (type: 'hover' | 'click') => void;
  isLocked?: boolean; // New: Controlled by parent based on auth status
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, theme, avatarUrl, userName, onEdit, onDelete, onStackClick, onInteraction, isLocked = false }) => {
  const [isCrafting, setIsCrafting] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  
  // Crafting Animation (Entrance)
  useEffect(() => {
      // Only trigger if Minecraft theme and likely a new mount
      if (theme === 'minecraft') {
          setIsCrafting(true);
          const timer = setTimeout(() => setIsCrafting(false), 1200);
          return () => clearTimeout(timer);
      }
  }, [theme]);

  if (!block.active) return null;

  // Sizing Classes
  const getSpanClasses = () => {
    const colSpan = block.colSpan || 1;
    const rowSpan = block.rowSpan || 1;
    
    const colClasses = 
        colSpan === 4 ? 'col-span-2 md:col-span-4' :
        colSpan === 3 ? 'col-span-2 md:col-span-3' :
        colSpan === 2 ? 'col-span-2' : 
        'col-span-1';
        
    const rowClasses = 
        rowSpan === 4 ? 'row-span-4' :
        rowSpan === 3 ? 'row-span-3' :
        rowSpan === 2 ? 'row-span-2' : 
        'row-span-1';

    return `${colClasses} ${rowClasses}`;
  };

  // --- PREMIUM VISUALS ---
  const getThemeClasses = () => {
    const isDark = block.style === 'dark';
    const isAccent = block.style === 'accent';
    const base = `relative overflow-hidden transition-all duration-300 ease-out group cursor-pointer ${getSpanClasses()}`;

    switch (theme) {
      // --- CLASSIC ---
      case 'swiss':
        return `${base} ${isDark ? 'bg-[#1a1a1a] text-white' : isAccent ? 'bg-[#ff3b30] text-white' : 'bg-white text-black'} border-[1px] border-black/10 hover:border-black hover:-translate-y-1 hover:shadow-xl rounded-none font-sans p-1`;
      case 'brutalist':
        return `${base} ${isDark ? 'bg-black text-white' : isAccent ? 'bg-[#0000ff] text-white' : 'bg-white text-black'} border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 rounded-sm font-mono tracking-tighter`;
      case 'glass':
        return `${base} ${isDark ? 'bg-black/40 text-white' : 'bg-white/30 text-white'} backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl hover:bg-white/40 hover:scale-[1.01] rounded-[2rem] ring-1 ring-white/20`;
      case 'monochrome':
        return `${base} ${isDark ? 'bg-[#080808] text-gray-100' : isAccent ? 'bg-gray-200 text-black' : 'bg-white text-black'} border border-black/5 hover:border-black/10 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/5 rounded-[2rem]`;

      // --- GAMING / TECH ---
      case 'minecraft':
        return `${base} bg-[#8b8b8b] text-white border-t-4 border-l-4 border-[#c6c6c6] border-r-4 border-b-4 border-[#373737] font-mono shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:brightness-110 active:border-t-[#373737] active:border-l-[#373737] active:border-r-[#c6c6c6] active:border-b-[#c6c6c6] rounded-none p-1 image-pixelated`;
      
      case 'roblox':
        return `${base} bg-[#00a2ff] text-white rounded-xl shadow-[0_6px_0_#006eb3] border-2 border-[#0085d1] hover:translate-y-1 hover:shadow-[0_2px_0_#006eb3] transition-all font-sans`;
      
      case 'fortnite':
        return `${base} bg-gradient-to-tr from-[#7a00ff] to-[#3b82f6] text-white border-4 border-[#facc15] shadow-lg transform -skew-x-2 hover:skew-x-0 transition-transform font-sans uppercase tracking-widest`;
      
      case 'mariokart':
        return `${base} ${isDark ? 'bg-[#222] text-white' : 'bg-white text-black'} border-4 border-black shadow-[8px_8px_0_#e60012] rounded-xl hover:-translate-y-1 hover:shadow-[12px_12px_0_#0057b8] transition-all overflow-hidden`;

      case 'cyberpunk':
        return `${base} ${isDark ? 'bg-black text-[#0ff]' : isAccent ? 'bg-[#f0f] text-black' : 'bg-[#050510] text-[#0ff]'} border border-[#0ff]/50 shadow-[0_0_15px_-5px_#0ff] hover:shadow-[0_0_25px_#f0f] hover:border-[#f0f] rounded-none clip-path-polygon`;
      case 'terminal':
        return `${base} bg-black text-[#0f0] border border-[#0f0] font-mono hover:bg-[#0f0]/10 hover:text-[#0f0] rounded-sm shadow-[0_0_5px_#0f0]`;
      case 'win95':
        return `${base} bg-[#c0c0c0] text-black border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 hover:bg-[#d0d0d0] p-1`;
      case 'gameboy':
        return `${base} bg-[#8bac0f] text-[#0f380f] border-4 border-[#306230] font-mono rounded-lg hover:brightness-105 shadow-[4px_4px_0px_#0f380f]`;

      // --- MODERN ---
      case 'luxury':
        return `${base} bg-[#0a0a0a] text-[#d4af37] border border-[#d4af37]/20 shadow-2xl hover:border-[#d4af37]/60 transition-colors rounded-none tracking-widest uppercase`;
      case 'neumorphism':
        return `${base} bg-[#e0e5ec] text-[#4a4a4a] rounded-[2.5rem] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] hover:shadow-[inset_20px_20px_60px_#bebebe,inset_-20px_-20px_60px_#ffffff] border border-white/20`;

      // --- COLORFUL ---
      case 'sunset':
        return `${base} bg-gradient-to-br from-[#ff512f] to-[#dd2476] text-white border-none shadow-xl hover:shadow-rose-500/40 rounded-3xl hover:-translate-y-1`;
      case 'bubblegum':
        return `${base} ${isDark ? 'bg-[#ff6b6b] text-white' : 'bg-[#ffeaa7] text-[#ff7675]'} border-4 border-white rounded-[3rem] shadow-[0_10px_30px_-10px_rgba(255,107,107,0.5)] hover:scale-105 hover:rotate-1`;
      
      default:
        return `${base} bg-white text-black rounded-3xl shadow-sm border border-gray-100 hover:shadow-md`;
    }
  };

  const containerClass = getThemeClasses();

  // --- LOCKED STATE ---
  if (isLocked) {
      return (
          <div className={`${containerClass} flex flex-col items-center justify-center p-6 bg-gray-100/50 grayscale opacity-90 cursor-not-allowed`} title="Sign in to view this content">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 text-center">
                  <div className="bg-black/10 p-3 rounded-full mb-3">
                      <Lock className="w-6 h-6 text-black opacity-60" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50">Members Only</p>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium">Log in to view</p>
              </div>
              {/* Blurred Preview content behind */}
              <div className="blur-sm opacity-30 w-full h-full flex items-center justify-center">
                   <div className="w-1/2 h-4 bg-black/10 rounded"></div>
              </div>
          </div>
      )
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    onInteraction?.('click');
    if (onEdit) {
      e.preventDefault(); 
      onEdit();
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (theme === 'minecraft') {
          // Play breaking animation
          setIsBreaking(true);
          setTimeout(() => {
              onDelete?.();
          }, 600); // Wait for crack animation
      } else {
          onDelete?.();
      }
  };

  const handleMouseEnter = () => {
    onInteraction?.('hover');
  };

  const handleClick = (e: React.MouseEvent) => {
      onInteraction?.('click');
      // If it's a stack, intercept the click
      if (block.type === 'stack' && onStackClick) {
          e.preventDefault();
          onStackClick(block.id);
      }
  };

  const EditOverlay = () => (
    <>
        {/* Hover Controls */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none transform scale-90 group-hover:scale-100 duration-200 flex gap-2">
           {onEdit && (
               <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-full text-white border border-white/20 shadow-lg">
                 <Edit3 className="w-4 h-4" />
               </div>
           )}
        </div>
        
        {/* Delete Button (Only active if onDelete passed and user interacts) */}
        {onDelete && (
             <button 
                onClick={handleDeleteClick}
                className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all z-50 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 hover:scale-110 pointer-events-auto"
                title="Remove Block"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        )}

        {/* --- MINECRAFT CRAFTING OVERLAY (Entrance) --- */}
        {isCrafting && theme === 'minecraft' && (
            <div className="absolute inset-0 z-50 bg-[#1e1e1e] flex items-center justify-center animate-out fade-out duration-300 delay-1000 fill-mode-forwards">
                <div className="flex flex-col items-center animate-bounce">
                    <div className="w-16 h-16 bg-[#3b2a1e] border-4 border-[#5c4033] relative flex items-center justify-center shadow-xl image-pixelated">
                         <div className="absolute inset-x-0 top-0 h-4 bg-[#704d3b]"></div>
                         <Hammer className="w-8 h-8 text-white relative z-10 animate-pulse" />
                    </div>
                    <span className="text-white font-mono text-xs mt-2 animate-pulse">Crafting...</span>
                </div>
                {/* Particles */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white absolute animate-ping" style={{top:'30%', left: '40%'}}></div>
                    <div className="w-2 h-2 bg-white absolute animate-ping delay-100" style={{top:'60%', left: '60%'}}></div>
                </div>
            </div>
        )}

        {/* --- MINECRAFT BREAKING OVERLAY (Exit) --- */}
        {isBreaking && theme === 'minecraft' && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                 <div className="absolute inset-0 bg-black/50"></div>
                 {/* Crack Animation using SVG clip or simple overlay */}
                 <div className="w-full h-full absolute inset-0 bg-[url('https://www.svgrepo.com/show/396075/cracked-screen.svg')] bg-cover opacity-80 animate-pulse"></div>
            </div>
        )}
        
        {/* --- ROBLOX STUDS OVERLAY --- */}
        {theme === 'roblox' && (
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 2px, transparent 2.5px)', backgroundSize: '8px 8px' }}></div>
        )}

        {/* --- MARIO KART CHECKERS OVERLAY --- */}
        {theme === 'mariokart' && (
             <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px' }}></div>
        )}
    </>
  );

  // --- NEW: TICTACTOE BLOCK ---
  if (block.type === 'tictactoe') {
     return (
       <TicTacToeBlock 
         block={block} 
         containerClass={containerClass} 
         onDoubleClick={handleDoubleClick} 
         onMouseEnter={handleMouseEnter}
         onClick={handleClick}
         EditOverlay={EditOverlay} 
         onInteraction={onInteraction}
       />
     );
  }

  // --- NEW: WEATHER BLOCK ---
  if (block.type === 'weather') {
    const weatherVibes = [
      { label: "Sunny Vibes", icon: Sun, temp: "100°" },
      { label: "Brain Fog", icon: CloudRain, temp: "40°" },
      { label: "Pure Chaos", icon: CloudLightning, temp: "99°" },
      { label: "Main Character", icon: Sparkles, temp: "72°" },
    ];
    // Use title/content if available, else random based on ID length
    const seed = block.id.length % weatherVibes.length;
    const weather = weatherVibes[seed];

    return (
      <div className={`${containerClass} flex flex-col justify-between p-6 ${block.style === 'dark' ? 'bg-[#2c3e50] text-white' : 'bg-blue-50 text-blue-900'}`} onDoubleClick={handleDoubleClick} onMouseEnter={handleMouseEnter} onClick={handleClick}>
          <div className="flex justify-between items-start">
              <weather.icon className={`w-8 h-8 ${block.style === 'dark' ? 'text-yellow-300' : 'text-blue-500'} animate-pulse`} />
              <span className="text-4xl font-black tracking-tighter">{weather.temp}</span>
          </div>
          <div className="mt-2">
              <h3 className="font-bold text-xl leading-none">{block.title || weather.label}</h3>
              <p className="opacity-60 text-xs font-bold uppercase tracking-widest mt-1">{block.subtitle || "Current Forecast"}</p>
          </div>
          <EditOverlay />
      </div>
    );
  }

  // --- NEW: STACK BLOCK (Folder) ---
  if (block.type === 'stack') {
    return (
      <div 
        className={`${containerClass} flex flex-col justify-between p-6`} 
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
      >
         <div className="flex justify-between items-start">
             <div className={`p-3 rounded-full ${block.style === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                 <Layers className="w-6 h-6" />
             </div>
             <div className="bg-black/5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider opacity-60 group-hover:bg-black/10 transition-colors">
                Collection
             </div>
         </div>

         <div className="mt-auto relative z-10">
             <h3 className="font-bold text-xl leading-none mb-2">{block.title || 'Untitled Stack'}</h3>
             <p className="opacity-60 text-xs font-bold uppercase tracking-widest">{block.subtitle || 'Tap to Open'}</p>
         </div>
         
         {/* Stack Visual Effect (Cards behind) */}
         <div className="absolute top-2 left-2 right-2 bottom-0 rounded-[inherit] bg-current opacity-5 scale-95 translate-y-2 -z-10 group-hover:translate-y-3 transition-transform"></div>
         <div className="absolute top-4 left-4 right-4 bottom-0 rounded-[inherit] bg-current opacity-5 scale-90 translate-y-4 -z-20 group-hover:translate-y-6 transition-transform"></div>

         <EditOverlay />
      </div>
    );
  }

  // --- NEW: VIDEO BLOCK ---
  if (block.type === 'video') {
    let embedUrl = block.url;
    // Simple YouTube/Vimeo Parser
    if (block.url?.includes('youtube.com') || block.url?.includes('youtu.be')) {
      const videoId = block.url.includes('v=') ? block.url.split('v=')[1]?.split('&')[0] : block.url.split('/').pop();
      embedUrl = `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1`;
    } else if (block.url?.includes('vimeo.com')) {
      const videoId = block.url.split('/').pop();
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    return (
      <div className={`${containerClass} bg-black border-0 p-0`} onDoubleClick={handleDoubleClick} onMouseEnter={handleMouseEnter} onClick={handleClick}>
        {embedUrl ? (
          <iframe 
            src={embedUrl} 
            className="w-full h-full absolute inset-0 pointer-events-auto" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={block.title}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
             <Video className="w-8 h-8 mb-2" />
             <span className="text-xs font-bold uppercase">No Video URL</span>
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
           <p className="text-white font-bold truncate">{block.title}</p>
        </div>
        <EditOverlay />
      </div>
    );
  }

  // --- NEW: MAP BLOCK ---
  if (block.type === 'map') {
    return (
      <div className={`${containerClass} p-0 overflow-hidden relative`} onDoubleClick={handleDoubleClick} onMouseEnter={handleMouseEnter} onClick={handleClick}>
         {/* Decorative Map Background (Simulated) */}
         <div className="absolute inset-0 opacity-60 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center bg-no-repeat bg-blue-50 sepia-[.3]"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
            <div className="flex items-start gap-3">
               <div className="bg-red-500 text-white p-2.5 rounded-full shadow-lg animate-bounce">
                  <MapPin className="w-5 h-5" />
               </div>
               <div className="text-white">
                  <p className="font-bold text-lg leading-tight">{block.title || 'My Location'}</p>
                  <p className="opacity-80 text-sm font-medium">{block.content || 'Somewhere on Earth'}</p>
               </div>
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(block.content || '')}`} target="_blank" rel="noreferrer" className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold py-2 px-4 rounded-full text-center hover:bg-white/20 transition-colors pointer-events-auto">
               Get Directions
            </a>
         </div>
         <EditOverlay />
      </div>
    );
  }

  // --- NEW: MUSIC BLOCK ---
  if (block.type === 'music') {
    return (
      <div className={`${containerClass} flex flex-col justify-between p-6 ${block.style === 'dark' ? 'bg-[#121212] text-white' : 'bg-white text-black'}`} onDoubleClick={handleDoubleClick} onMouseEnter={handleMouseEnter} onClick={handleClick}>
         <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center animate-spin-slow ${block.style === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
               <Disc className="w-6 h-6 opacity-70" />
            </div>
            <div className="flex gap-2">
               <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></div>
               <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse delay-75"></div>
               <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
            </div>
         </div>
         
         <div className="space-y-1 mt-auto">
            {block.imageUrl && (
              <img src={block.imageUrl} className="w-16 h-16 rounded-lg mb-3 object-cover shadow-md" alt="Album Art" />
            )}
            <h3 className="font-bold text-lg leading-none truncate">{block.title || 'Song Title'}</h3>
            <p className="opacity-60 text-xs font-bold uppercase tracking-wider truncate">{block.subtitle || 'Artist Name'}</p>
         </div>

         {/* Fake Player Controls */}
         <div className="flex items-center gap-4 mt-4 pt-4 border-t border-current/10">
            <Play className="w-5 h-5 fill-current" />
            <div className="h-1 flex-1 bg-current/10 rounded-full overflow-hidden">
               <div className="h-full w-1/3 bg-current/80 rounded-full"></div>
            </div>
            <span className="text-[10px] font-mono opacity-60">1:23</span>
         </div>
         <EditOverlay />
      </div>
    );
  }

  // --- STATUS / UPDATE BLOCK ---
  if (block.type === 'status') {
    return (
      <div className={`${containerClass} p-8 flex flex-col`} onDoubleClick={handleDoubleClick} onMouseEnter={handleMouseEnter} onClick={handleClick}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0 shadow-sm">
            <img src={avatarUrl} className="w-full h-full object-cover" alt="User" />
          </div>
          <div className="leading-tight overflow-hidden">
             <p className="font-bold text-base truncate">{userName}</p>
             <p className="text-xs opacity-60 font-medium">@{userName?.toLowerCase().replace(/\s/g, '')} • {block.timestamp || 'Just now'}</p>
          </div>
        </div>
        <p className={`text-xl md:text-2xl font-medium leading-snug grow ${block.style === 'accent' ? 'font-serif italic tracking-wide' : 'tracking-tight'}`}>
           {block.content || block.title}
        </p>
        <div className="flex gap-6 mt-6 opacity-40 text-xs font-bold uppercase tracking-wider">
           <span className="flex items-center gap-2 hover:text-red-500 transition-colors hover:opacity-100 cursor-pointer"><Heart className="w-4 h-4" /> Like</span>
           <span className="flex items-center gap-2 hover:text-green-500 transition-colors hover:opacity-100 cursor-pointer"><Repeat className="w-4 h-4" /> Repost</span>
        </div>
        <EditOverlay />
      </div>
    );
  }

  // --- IMAGE / MEDIA BLOCK ---
  if (block.type === 'image') {
    return (
      <div 
        className={`${containerClass} border-0`} 
        style={theme === 'brutalist' || theme === 'swiss' || theme === 'comic' || theme === 'gameboy' ? { borderWidth: '2px', borderColor: 'currentColor' } : {}}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
      >
        <div className="absolute inset-0 bg-gray-900">
           <img 
            src={block.imageUrl} 
            alt={block.title} 
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110 ${block.filter === 'grayscale' ? 'grayscale' : ''}`}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
        </div>
        
        {/* Text Overlay for Images */}
        {(block.title) && (
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
             <span className="text-white font-bold text-2xl tracking-tighter drop-shadow-lg">{block.title}</span>
          </div>
        )}
        <EditOverlay />
      </div>
    );
  }

  // --- TEXT / INTEREST BLOCK ---
  if (block.type === 'text') {
    return (
      <div 
        className={`${containerClass} p-8 flex flex-col justify-center items-center text-center`}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
      >
        <p className={`font-black tracking-tighter leading-[0.9] break-words w-full ${block.colSpan && block.colSpan > 1 ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'}`}>
          {block.title}
        </p>
        {block.subtitle && (
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] opacity-50 border-t-2 border-current pt-4 w-1/3 mx-auto">
            {block.subtitle}
          </p>
        )}
        <EditOverlay />
      </div>
    );
  }

  // --- CONTACT BLOCK ---
  if (block.type === 'contact') {
    const isEmail = block.title?.includes('@') || block.url?.startsWith('mailto:');
    const Icon = isEmail ? Mail : Phone;
    
    return (
      <a 
        href={block.url}
        className={`${containerClass} p-8 flex flex-col justify-center items-center gap-6`}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl ${block.style === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
           <Icon className="w-8 h-8" />
        </div>
        <div className="text-center">
           <p className="font-bold text-xl tracking-tight">{block.title}</p>
           {block.subtitle && <p className="text-sm opacity-50 font-bold mt-2 uppercase tracking-widest">{block.subtitle}</p>}
        </div>
        <EditOverlay />
      </a>
    );
  }

  // --- SOCIAL / LINK BLOCK ---
  const isSocial = block.type === 'social';
  const Icon = getIconForUrl(block.url || '');

  return (
    <a 
      href={block.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`${containerClass} p-8 flex flex-col justify-between`}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start z-10 relative pointer-events-none">
        {isSocial ? (
           <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12 ${block.style === 'dark' ? 'bg-white/10' : 'bg-black text-white'}`}>
             <Icon className="w-6 h-6" />
           </div>
        ) : (
           <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-inner">
             {block.imageUrl ? (
               <img src={block.imageUrl} className="w-full h-full object-cover" />
             ) : (
               <ArrowUpRight className="w-6 h-6 text-black" />
             )}
           </div>
        )}
        
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0 rotate-45 group-hover:rotate-0">
           <div className={`p-2 rounded-full ${block.style === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
              <ArrowUpRight className="w-4 h-4" />
           </div>
        </div>
      </div>

      <div className="z-10 relative pointer-events-none mt-auto">
        <h3 className="font-bold text-2xl leading-none mb-2 tracking-tight">{block.title}</h3>
        {block.subtitle && <p className="opacity-50 text-xs font-bold uppercase tracking-widest">{block.subtitle}</p>}
      </div>
      <EditOverlay />
    </a>
  );
};

// --- HELPER COMPONENTS FOR COMPLEX BLOCKS ---

const TicTacToeBlock = ({ block, containerClass, onDoubleClick, EditOverlay, onMouseEnter, onClick, onInteraction }: any) => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const winner = calculateWinner(board);

    const handleClick = (i: number) => {
        if (winner || board[i]) return;
        
        // Play sound on move
        onInteraction?.('click');

        const newBoard = [...board];
        newBoard[i] = isXNext ? 'X' : 'O';
        setBoard(newBoard);
        setIsXNext(!isXNext);
    };

    const reset = (e: React.MouseEvent) => {
        e.stopPropagation();
        onInteraction?.('click');
        setBoard(Array(9).fill(null));
        setIsXNext(true);
    };

    return (
        <div 
          className={`${containerClass} p-4 flex flex-col items-center justify-center`} 
          onDoubleClick={onDoubleClick}
          onMouseEnter={onMouseEnter}
          onClick={onClick}
        >
             <div className="flex justify-between w-full items-center mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Tic-Tac-Toe</span>
                <button onClick={reset} className="p-1 hover:bg-black/10 rounded-full transition-colors"><RotateCcw className="w-3 h-3"/></button>
             </div>
             <div className="grid grid-cols-3 gap-1 w-full aspect-square max-w-[160px]">
                 {board.map((cell: any, i: number) => (
                     <button 
                        key={i} 
                        onClick={(e) => { e.stopPropagation(); handleClick(i); }}
                        className={`w-full h-full bg-current/5 rounded-md flex items-center justify-center text-xl font-black hover:bg-current/10 transition-colors ${!cell && !winner ? 'cursor-pointer' : 'cursor-default'}`}
                        disabled={!!cell || !!winner}
                     >
                         {cell === 'X' && <X className="w-6 h-6" />}
                         {cell === 'O' && <Circle className="w-5 h-5" />}
                     </button>
                 ))}
             </div>
             {winner && (
                 <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 animate-in fade-in zoom-in">
                     <div className="text-white font-black text-2xl tracking-tighter flex flex-col items-center gap-2">
                        <span>{winner} WINS!</span>
                        <button onClick={reset} className="text-xs bg-white text-black px-3 py-1 rounded-full">Play Again</button>
                     </div>
                 </div>
             )}
             <EditOverlay />
        </div>
    )
}

function calculateWinner(squares: any[]) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function getIconForUrl(url: string) {
  if (url.includes('twitter') || url.includes('x.com')) return Twitter;
  if (url.includes('github')) return Github;
  if (url.includes('instagram')) return Instagram;
  if (url.includes('linkedin')) return Linkedin;
  if (url.includes('mailto')) return Mail;
  if (url.includes('spotify') || url.includes('music')) return Music;
  if (url.includes('youtube') || url.includes('vimeo')) return Video;
  if (url.includes('wa.me') || url.includes('whatsapp')) return MessageCircle;
  return ArrowUpRight;
}