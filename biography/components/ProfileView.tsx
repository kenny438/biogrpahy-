import React, { useState, useEffect } from 'react';
import { MapPin, Image as ImageIcon, Link as LinkIcon, Aperture, Share2, Plus, Layout, Check, Copy, PartyPopper, ChevronLeft, Layers, Settings, Camera, QrCode, X, Linkedin, Twitter, MessageCircle, Volume2, VolumeX, Users, UserPlus, UserCheck, ExternalLink, User, Search, ArrowRight, Key, Lock, Globe, Trash2, Loader2, Globe2, Fingerprint } from 'lucide-react';
import { BlockItem, ProfileData, BlockType, ProfileTheme, SavedProfile } from '../types';
import { BlockCard } from './BlockCard';

interface ProfileViewProps {
  data: ProfileData;
  onEditBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
  isOwner?: boolean;
  userId?: string;
  activeStackId: string | null;
  onNavigate: (stackId: string | null) => void;
  onQuickAdd?: (type: BlockType) => void;
  onOpenSettings?: () => void;
  shareUrl: string;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  savedProfiles?: SavedProfile[];
  onAddFriend?: (query: string) => Promise<{ success: boolean; message: string }>;
  onRemoveFriend?: (id: string) => void;
  isLoggedIn?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
    data, onEditBlock, onDeleteBlock, isOwner, userId, activeStackId, 
    onNavigate, onQuickAdd, onOpenSettings, shareUrl, 
    isFollowing, onToggleFollow, savedProfiles = [], onAddFriend, onRemoveFriend, isLoggedIn = false
}) => {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(0);
  const [partyMode, setPartyMode] = useState(false);
  const [transitionState, setTransitionState] = useState<'entering' | 'stable' | 'exiting'>('stable');
  const [barrelRoll, setBarrelRoll] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const [friendModalMode, setFriendModalMode] = useState<'list' | 'add'>('list');
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [addFriendResult, setAddFriendResult] = useState<{success: boolean, message: string} | null>(null);

  // --- SOUND ENGINE ---
  const playSfx = (type: 'hover' | 'click' | 'toggle' | 'pop') => {
    if (!soundEnabled) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;
    if (type === 'hover') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, t); osc.frequency.exponentialRampToValueAtTime(1200, t + 0.03); gain.gain.setValueAtTime(0.015, t); gain.gain.linearRampToValueAtTime(0, t + 0.03); osc.start(t); osc.stop(t + 0.03);
    } else if (type === 'click') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(300, t); osc.frequency.exponentialRampToValueAtTime(50, t + 0.1); gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); osc.start(t); osc.stop(t + 0.1);
    } else if (type === 'toggle') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, t); osc.frequency.linearRampToValueAtTime(600, t + 0.1); gain.gain.setValueAtTime(0.05, t); gain.gain.linearRampToValueAtTime(0, t + 0.1); osc.start(t); osc.stop(t + 0.1);
    } else if (type === 'pop') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(500, t); osc.frequency.linearRampToValueAtTime(1000, t + 0.15); gain.gain.setValueAtTime(0.05, t); gain.gain.linearRampToValueAtTime(0, t + 0.15); osc.start(t); osc.stop(t + 0.15);
    }
  };

  const toggleSound = () => {
      setSoundEnabled(!soundEnabled);
      if (!soundEnabled) setTimeout(() => playSfx('toggle'), 100);
  };

  useEffect(() => {
    setTransitionState('entering');
    const timer = setTimeout(() => setTransitionState('stable'), 500);
    return () => clearTimeout(timer);
  }, [activeStackId]);

  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    const handler = (e: KeyboardEvent) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                setBarrelRoll(true);
                playSfx('pop');
                setTimeout(() => setBarrelRoll(false), 2000);
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [soundEnabled]);

  const currentBlocks = data.blocks.filter(b => {
      if (b.archived) return false;
      if (activeStackId === null) return !b.parentId;
      return b.parentId === activeStackId;
  });

  const currentStackBlock = activeStackId ? data.blocks.find(b => b.id === activeStackId) : null;
  const parentStackId = currentStackBlock?.parentId || null;

  const getBackground = () => {
    switch (data.theme) {
      case 'monochrome': return 'bg-[#0a0a0a] text-white';
      case 'swiss': return 'bg-[#F4F4F4] text-black';
      case 'brutalist': return 'bg-[#FFE4E1] text-black'; 
      case 'glass': return 'bg-gradient-to-br from-[#E0C3FC] via-[#8EC5FC] to-[#D9AFD9] text-white';
      case 'cyberpunk': return 'bg-[#050510] text-[#00f3ff]';
      case 'terminal': return 'bg-black text-[#33ff00]'; 
      case 'win95': return 'bg-[#008080] text-black';
      case 'gameboy': return 'bg-[#9bbc0f] text-[#0f380f]';
      case 'vaporwave': return 'bg-gradient-to-b from-[#ff71ce] to-[#01cdfe] text-white';
      case 'y2k': return 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff9a9e] to-[#fecfef] text-black';
      case 'neumorphism': return 'bg-[#e0e5ec] text-[#4a4a4a]';
      case 'paper': return 'bg-[#fdfbf7] text-[#2c2c2c]';
      case 'bubblegum': return 'bg-[#ff9ff3] text-white';
      case 'sunset': return 'bg-gradient-to-tr from-[#f6d365] to-[#fda085] text-white';
      case 'midnight': return 'bg-[#0f172a] text-slate-300';
      case 'nature': return 'bg-[#dad7cd] text-[#344e41]';
      case 'space': return 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black text-white';
      case 'blueprint': return 'bg-[#0052cc] text-white';
      case 'comic': return 'bg-yellow-400 text-black';
      case 'luxury': return 'bg-[#050505] text-[#d4af37]';
      case 'minecraft': return 'bg-[#3b2a1e] text-white font-mono';
      case 'roblox': return 'bg-[#b3e5fc] text-slate-800';
      case 'fortnite': return 'bg-indigo-900 text-white';
      case 'mariokart': return 'bg-neutral-800 text-white';
      default: return 'bg-[#0a0a0a] text-white';
    }
  };

  const getFontClass = () => {
      switch (data.font) {
          case 'serif': return 'font-serif';
          case 'mono': return 'font-mono';
          default: return 'font-sans';
      }
  };

  const handleShare = () => { playSfx('click'); setShowShareModal(true); };
  const handleFriends = () => { playSfx('click'); setShowFriendsModal(true); setFriendModalMode('list'); };
  
  const handleCopyLink = () => {
       playSfx('click');
       navigator.clipboard.writeText(shareUrl);
       setCopied(true);
       setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
      playSfx('click');
      const codeToCopy = data.friendCode || userId || "";
      if (codeToCopy) {
          navigator.clipboard.writeText(codeToCopy);
          setCodeCopied(true);
          setTimeout(() => setCodeCopied(false), 2000);
      }
  };

  const handleAddFriendSubmit = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!friendCodeInput.trim() || !onAddFriend) return;
      setIsAddingFriend(true);
      setAddFriendResult(null);
      const result = await onAddFriend(friendCodeInput.trim());
      setIsAddingFriend(false);
      setAddFriendResult(result);
      if (result.success) {
          playSfx('pop');
          setTimeout(() => {
              setFriendCodeInput('');
              setFriendModalMode('list');
              setAddFriendResult(null);
          }, 1500);
      }
  };

  const handleAvatarClick = () => { playSfx('pop'); setSpinSpeed(prev => prev + 1); };
  const handleLogoClick = () => { playSfx('toggle'); setPartyMode(!partyMode); };
  const handleBack = () => { playSfx('click'); onNavigate(parentStackId); };
  const handleStackClick = (stackId: string) => { onNavigate(stackId); };
  const handleToggleFollowClick = () => { playSfx('toggle'); if (onToggleFollow) onToggleFollow(); };
  
  const isPrivate = data.privacy === 'private';

  return (
    <div className={`w-full min-h-screen ${getBackground()} ${getFontClass()} transition-colors duration-500 relative flex flex-col items-center overflow-hidden`}>
      <CustomCursor theme={data.theme} />
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay fixed" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E` }}></div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-40 pointer-events-none">
          <div className="pointer-events-auto cursor-pointer" onClick={handleLogoClick} onMouseEnter={() => playSfx('hover')}>
              <div className={`flex items-center gap-2 backdrop-blur-xl p-1.5 pr-4 rounded-full border shadow-lg transition-all hover:scale-105 ${partyMode ? 'animate-bounce bg-pink-500 border-yellow-400' : 'bg-white/10 border-white/10'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner bg-black text-white`}>
                    <Fingerprint className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight mix-blend-difference text-white hidden sm:inline-block">BIOGRAPHY</span>
              </div>
          </div>
          
          <div className="flex gap-2">
             <button onClick={toggleSound} onMouseEnter={() => playSfx('hover')} className={`pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-black shadow-lg hover:scale-105 active:scale-95 transition-all ${soundEnabled ? 'text-black' : 'text-gray-400 opacity-70'}`} title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
             </button>
             <button onClick={handleShare} onMouseEnter={() => playSfx('hover')} className={`pointer-events-auto px-4 md:px-6 py-2.5 rounded-full font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 bg-white text-black`}>
                <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share</span>
            </button>
          </div>
      </nav>

      <div className={`w-full flex flex-col items-center ${barrelRoll ? 'animate-[spin_2s_ease-in-out]' : ''}`}>
          
          {/* --- HERO --- */}
          {activeStackId === null && (
              <>
                 {data.bannerUrl && (
                     <div className="w-full h-48 md:h-80 relative z-0 animate-in fade-in duration-700">
                         <img src={data.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-50"></div>
                     </div>
                 )}
                 <header className={`w-full flex flex-col items-center justify-center relative z-10 px-4 text-center transition-all duration-500 ${data.bannerUrl ? '-mt-20 md:-mt-24 pb-8 md:pb-12' : 'min-h-[40vh] md:min-h-[50vh] pt-24 pb-8 md:pt-32 md:pb-12'}`}>
                    <div className="animate-in fade-in zoom-in-50 duration-1000 slide-in-from-bottom-10 flex flex-col items-center">
                        <div className="relative group mb-6 md:mb-8 cursor-pointer select-none" onClick={handleAvatarClick} onMouseEnter={() => playSfx('hover')}>
                            <div className={`w-28 h-28 md:w-48 md:h-48 overflow-hidden mx-auto transition-all duration-300 shadow-2xl bg-gray-200 ${data.theme === 'gameboy' || data.theme === 'pixel' ? 'rounded-none' : 'rounded-full'}`} style={{ transform: `rotate(${spinSpeed * 45}deg)`, transition: spinSpeed > 0 ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none', border: data.bannerUrl ? '4px solid white' : 'none' }}>
                              {data.avatarUrl ? (
                                <img src={data.avatarUrl} alt={data.name} className={`w-full h-full object-cover ${data.theme === 'gameboy' ? 'grayscale contrast-125' : ''}`} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-400" /></div>
                              )}
                            </div>
                            <div className={`absolute bottom-1 right-1 md:bottom-2 md:right-2 p-2 md:p-2.5 rounded-full border-4 border-transparent shadow-lg bg-blue-500 text-white`}>
                              <Aperture className={`w-4 h-4 md:w-5 md:h-5 ${spinSpeed > 10 ? 'animate-spin' : 'animate-spin-slow'}`} />
                            </div>
                        </div>
                        <h1 className={`text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-2 md:mb-4 leading-[0.9] drop-shadow-sm px-2`}>{data.name}</h1>
                        <p className={`text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed opacity-80 px-4`}>{data.role}</p>
                        <div className="flex gap-2 items-center justify-center mt-4 md:mt-6">
                            {data.location && (
                              <div className={`inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md`}>
                                  <MapPin className="w-3 h-3" /> {data.location}
                              </div>
                            )}
                            {isPrivate && (
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/20 bg-black/80 backdrop-blur-md text-white">
                                  <Lock className="w-3 h-3" /> Private Profile
                                </div>
                            )}
                        </div>
                    </div>
                  </header>
              </>
          )}

          {/* --- STACK HEADER --- */}
          {activeStackId !== null && (
              <header className="w-full pt-28 pb-8 px-4 text-center relative z-20">
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <h2 className="text-3xl md:text-6xl font-black tracking-tighter mb-2">{currentStackBlock?.title || 'Collection'}</h2>
                    <p className="opacity-60 font-medium text-lg">{currentStackBlock?.subtitle || 'Explore this stack'}</p>
                </div>
              </header>
          )}

          {/* --- GRID --- */}
          <main className="w-full max-w-[2000px] px-4 md:px-8 pb-32 md:pb-40 relative z-10">
            {activeStackId !== null && (
                <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <button onClick={handleBack} onMouseEnter={() => playSfx('hover')} className="bg-black/80 backdrop-blur-xl text-white pl-4 pr-6 py-3 rounded-full flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform border border-white/20">
                      <ChevronLeft className="w-5 h-5" />
                      <span className="font-bold text-sm">Back</span>
                    </button>
                </div>
            )}

            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-6 auto-rows-[160px] md:auto-rows-[240px] grid-flow-dense transition-all duration-500 transform ${transitionState === 'entering' ? 'scale-90 opacity-0 blur-sm' : 'scale-100 opacity-100 blur-0'}`}>
              {currentBlocks.length > 0 ? (
                currentBlocks.map((block) => {
                    const isLocked = block.visibility === 'member' && !isLoggedIn && !isOwner;
                    return (
                        <BlockCard 
                            key={block.id} 
                            block={block}
                            avatarUrl={data.avatarUrl}
                            userName={data.name}
                            theme={data.theme}
                            onEdit={isOwner && onEditBlock ? () => onEditBlock(block.id) : undefined}
                            onDelete={isOwner && onDeleteBlock ? () => onDeleteBlock(block.id) : undefined}
                            onStackClick={handleStackClick}
                            onInteraction={playSfx}
                            isLocked={isLocked}
                        />
                    );
                })
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-60 border-2 border-dashed border-current rounded-[3rem] animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 rounded-full border-2 border-current flex items-center justify-center mb-6">
                      <Layers className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold uppercase tracking-widest mb-2">Stack Empty</h3>
                    <p className="text-sm font-medium opacity-60 max-w-xs leading-relaxed">
                      {isOwner ? "This stack is empty. Open the editor to add blocks here." : "No items in this collection yet."}
                    </p>
                    {isOwner && onEditBlock && (
                      <div className="mt-8 px-6 py-3 bg-white text-black rounded-full text-sm font-bold flex items-center gap-2 shadow-lg animate-bounce">
                          <Plus className="w-4 h-4" /> Tap Settings to Edit
                      </div>
                    )}
                </div>
              )}
            </div>
          </main>
      </div>
      
      {/* --- SHARE MODAL --- */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowShareModal(false)}></div>
           <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className={`p-8 text-center relative overflow-hidden ${getBackground()} border-b border-black/5`}>
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4 bg-gray-200">
                        {data.avatarUrl ? <img src={data.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Layout className="w-8 h-8 opacity-50"/></div>}
                    </div>
                    <h3 className="font-black text-2xl tracking-tight leading-none mb-1">{data.name}</h3>
                    <div className="flex items-center gap-2 opacity-70 mt-1">
                        {isPrivate ? <Lock className="w-3 h-3" /> : <Globe2 className="w-3 h-3" />}
                        <p className="text-sm font-bold uppercase tracking-widest">{isPrivate ? 'Private' : 'Public'}</p>
                    </div>
                 </div>
                 <div className="bg-white p-3 rounded-xl shadow-lg mt-6 inline-block mx-auto transform transition-transform hover:scale-105">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}&color=000000`} alt="QR Code" className="w-32 h-32" />
                 </div>
              </div>
              <div className="p-6 bg-white space-y-4">
                 <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                     <div className="flex justify-between items-center mb-2">
                         <div className="flex items-center gap-1.5"><Key className="w-3 h-3 text-gray-500" /><span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Friend Code</span></div>
                         <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold border border-gray-200">Share to add friends</span>
                     </div>
                     <button onClick={handleCopyCode} className="w-full flex items-center justify-between text-left font-mono text-xl font-bold tracking-wider bg-white border-2 border-gray-100 p-3 rounded-lg hover:border-black transition-all group shadow-sm hover:shadow-md">
                         <span className="truncate group-hover:opacity-100">{data.friendCode || "Generating..."}</span>
                         <div className="p-1">{codeCopied ? <Check className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5 text-gray-400 group-hover:text-black"/>}</div>
                     </button>
                     {isPrivate && (
                         <p className="text-[10px] text-red-500 font-medium mt-2 text-center">
                            Note: Profile is Private. Users must add this code to view.
                         </p>
                     )}
                 </div>

                 <button onClick={handleCopyLink} onMouseEnter={() => playSfx('hover')} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4" />}
                    {copied ? 'Link Copied!' : 'Copy Link'}
                 </button>
              </div>
              <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-20"><X className="w-4 h-4 text-black/50" /></button>
           </div>
        </div>
      )}

      {/* --- FRIENDS MODAL --- */}
      {showFriendsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowFriendsModal(false)}></div>
            <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-xl flex items-center gap-2"><Users className="w-5 h-5" /> {friendModalMode === 'add' ? 'Find Friends' : 'Saved Friends'}</h3>
                    <div className="flex items-center gap-2">
                        {friendModalMode === 'list' && <button onClick={() => setFriendModalMode('add')} className="p-2 bg-black text-white hover:bg-gray-800 rounded-full transition-colors shadow-lg"><Plus className="w-4 h-4" /></button>}
                        {friendModalMode === 'add' && <button onClick={() => setFriendModalMode('list')} className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full transition-colors"><ChevronLeft className="w-4 h-4" /></button>}
                        <button onClick={() => setShowFriendsModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><X className="w-4 h-4 text-black" /></button>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto custom-scrollbar bg-gray-50 flex-1">
                    {friendModalMode === 'list' && (
                        savedProfiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Users className="w-8 h-8 text-gray-400" /></div><p className="font-bold text-gray-900 text-lg">No friends yet</p><p className="text-sm mt-1 max-w-[220px] mx-auto text-gray-500">Tap the + button to find people.</p></div>
                        ) : (
                            <div className="space-y-3">
                                {savedProfiles.map((profile) => (
                                    <div key={profile.id} className="flex items-center gap-2">
                                        <a href={`?uid=${profile.id}`} className="flex-1 flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 hover:border-black hover:shadow-lg transition-all group" onClick={() => playSfx('click')}>
                                            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-100 group-hover:scale-105 transition-transform">
                                                {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-5 h-5 text-gray-400"/></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{profile.name}</h4>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide truncate">{profile.role}</p>
                                            </div>
                                            <div className="p-2 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></div>
                                        </a>
                                        {/* UNFRIEND BUTTON */}
                                        {onRemoveFriend && (
                                            <button 
                                                onClick={() => onRemoveFriend(profile.id)}
                                                className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-colors border border-red-100"
                                                title="Remove Friend"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                    {friendModalMode === 'add' && (
                        <form onSubmit={handleAddFriendSubmit} className="flex flex-col gap-4 py-4">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-100 flex gap-3"><Search className="w-5 h-5 shrink-0" /><p>Search for friends by <strong>Name</strong> or <strong>Code</strong>.</p></div>
                            <div className="space-y-2"><input type="text" className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-4 text-xl font-medium focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder:text-gray-300" placeholder="Search users..." value={friendCodeInput} onChange={(e) => setFriendCodeInput(e.target.value)} autoFocus /></div>
                            {addFriendResult && <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${addFriendResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{addFriendResult.success ? <Check className="w-4 h-4"/> : <X className="w-4 h-4"/>}{addFriendResult.message}</div>}
                            <button type="submit" disabled={isAddingFriend || !friendCodeInput} className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">{isAddingFriend ? <><Loader2 className="w-4 h-4 animate-spin"/>Searching...</> : <>Find & Add<ArrowRight className="w-4 h-4" /></>}</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- ADMIN DOCK --- */}
      {isOwner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-full z-50 bg-[#111]/90 backdrop-blur-xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-700 hover:scale-105 transition-transform">
            <DockButton onClick={handleFriends} icon={Users} label="Saved Friends" onInteraction={playSfx} />
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            <DockButton onClick={() => onQuickAdd?.('image')} icon={ImageIcon} label="Add Media" onInteraction={playSfx} />
            <DockButton onClick={() => onQuickAdd?.('link')} icon={LinkIcon} label="Add Link" onInteraction={playSfx} />
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            <button onClick={onOpenSettings} onMouseEnter={() => playSfx('hover')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-white/50 transition-all relative group">
                {data.avatarUrl ? <img src={data.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-600 flex items-center justify-center"><Layout className="w-4 h-4 text-white"/></div>}
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-4 h-4 text-white" /></div>
            </button>
        </div>
      )}

      {/* --- VISITOR CTA --- */}
      {!isOwner && (
         <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end animate-in slide-in-from-bottom-10 fade-in duration-1000">
             {onToggleFollow && !isPrivate && (
                 <button onClick={handleToggleFollowClick} onMouseEnter={() => playSfx('hover')} className={`px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${isFollowing ? 'bg-white text-black border-2 border-black' : 'bg-black text-white border-2 border-black'}`}>{isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}{isFollowing ? 'Friends' : 'Add to Friends'}</button>
             )}
             <a href="/" className="bg-white text-black border-2 border-black px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2" onMouseEnter={() => playSfx('hover')}><Layout className="w-4 h-4" /> Create your own</a>
         </div>
      )}
    </div>
  );
};

const DockButton = ({ icon: Icon, onClick, label, onInteraction }: any) => (
    <button onClick={onClick} onMouseEnter={() => onInteraction?.('hover')} className="w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all relative group">
       <Icon className="w-5 h-5" />
       <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{label}</span>
    </button>
);

const CustomCursor = ({ theme }: { theme: string }) => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return null;
    let cursorColor = 'bg-black mix-blend-difference';
    if (theme === 'monochrome') cursorColor = 'bg-white mix-blend-exclusion';
    if (theme === 'cyberpunk') cursorColor = 'bg-[#0ff] mix-blend-screen';
    return <div className={`fixed w-8 h-8 rounded-full pointer-events-none z-[100] transition-transform duration-75 ease-out ${cursorColor}`} style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)', opacity: 0.5 }} />
}