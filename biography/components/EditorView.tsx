import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Image as ImageIcon, Type, Link as LinkIcon, Loader2, Filter, Phone, Smile, MessageSquare, Maximize2, Upload, Plus, X, Globe, User, LayoutGrid, LogOut, Shuffle, MapPin, Video, Music, Layers, ChevronRight, Gamepad2, CloudSun, Lock, Globe2, Archive, RefreshCw, Download, CheckCircle2, Save, Shield } from 'lucide-react';
import { ProfileData, BlockItem, BlockType, ProfileTheme } from '../types';
import { Input } from './Input';
import { Button } from './Button';

interface EditorViewProps {
  data: ProfileData;
  onUpdate: (newData: ProfileData) => Promise<boolean>; // Updated signature to return promise
  onClose: () => void;
  onLogout?: () => void;
  focusBlockId?: string | null;
  activeStackId: string | null;
  onNavigate: (stackId: string | null) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ data, onUpdate, onClose, onLogout, focusBlockId, activeStackId, onNavigate }) => {
  const [formData, setFormData] = useState<ProfileData>(data);
  const [activeTab, setActiveTab] = useState<'content' | 'profile' | 'archive'>(focusBlockId ? 'content' : 'profile');
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date>(new Date());
  
  const blockRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  
  // Debounce Timer Ref
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter blocks for editor list (excluding archived)
  const currentEditorBlocks = formData.blocks.filter(b => {
    if (b.archived) return false; // Don't show archived blocks in main list
    if (activeStackId === null) return !b.parentId;
    return b.parentId === activeStackId;
  });

  const archivedBlocks = formData.blocks.filter(b => b.archived);

  const currentStackName = activeStackId ? formData.blocks.find(b => b.id === activeStackId)?.title : 'Root';

  // --- AUTO SAVE LOGIC ---
  useEffect(() => {
    // Skip initial render or if data hasn't actually changed deep comparison
    if (JSON.stringify(formData) === JSON.stringify(data)) return;

    setSyncStatus('saving');
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
        const success = await onUpdate(formData);
        if (success) {
            setSyncStatus('saved');
            setLastSavedTime(new Date());
        } else {
            setSyncStatus('error');
        }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formData, onUpdate]); // Intentionally omitting 'data' to avoid circular dependency loops if parent updates prop

  useEffect(() => {
    if (focusBlockId) {
      setActiveTab('content');
      setTimeout(() => {
        const el = blockRefs.current[focusBlockId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-black', 'ring-offset-4');
          setTimeout(() => el.classList.remove('ring-2', 'ring-black', 'ring-offset-4'), 2500);
        }
      }, 100);
    }
  }, [focusBlockId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlockChange = (id: string, field: keyof BlockItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => 
        block.id === id ? { ...block, [field]: value } : block
      ),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingBlockId) {
      const reader = new FileReader();
      reader.onloadend = () => {
         if (uploadingBlockId === 'avatar') {
            setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
         } else if (uploadingBlockId === 'banner') {
            setFormData(prev => ({ ...prev, bannerUrl: reader.result as string }));
         } else {
            handleBlockChange(uploadingBlockId, 'imageUrl', reader.result as string);
         }
         setUploadingBlockId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = (blockId: string) => {
    setUploadingBlockId(blockId);
    fileInputRef.current?.click();
  };

  const setTheme = (theme: ProfileTheme) => {
    setFormData(prev => ({ ...prev, theme }));
  };
  
  const togglePrivacy = () => {
      setFormData(prev => ({ ...prev, privacy: prev.privacy === 'private' ? 'public' : 'private' }));
  };

  const setFont = (font: 'sans' | 'serif' | 'mono') => {
    setFormData(prev => ({ ...prev, font }));
  };

  const handleRandomTheme = () => {
    const themes: ProfileTheme[] = [
      'monochrome', 'swiss', 'brutalist', 'glass', 'cyberpunk', 'vaporwave', 'y2k', 'terminal',
      'win95', 'gameboy', 'paper', 'neumorphism', 'sunset', 'midnight', 'nature', 'bubblegum',
      'blueprint', 'comic', 'space', 'luxury', 'minecraft', 'roblox', 'fortnite', 'mariokart'
    ];
    const random = themes[Math.floor(Math.random() * themes.length)];
    setTheme(random);
  };

  const addBlock = (type: BlockType) => {
    let title = '';
    let subtitle = '';
    let url = undefined;
    let content = undefined;

    if (type === 'text') { title = 'New Interest'; subtitle = 'Subtitle'; }
    if (type === 'contact') { title = '+1 234 567 8900'; subtitle = 'Call Me'; url = 'tel:'; }
    if (type === 'link') { title = 'New Link'; url = 'https://'; }
    if (type === 'status') { title = 'Status Update'; content = "What's on your mind?"; }
    if (type === 'social') { title = 'Social'; url = 'https://'; }
    if (type === 'video') { title = 'My Video'; url = 'https://youtube.com/...'; }
    if (type === 'map') { title = 'My Spot'; content = "New York, NY"; }
    if (type === 'music') { title = 'Song Title'; subtitle = "Artist"; }
    if (type === 'stack') { title = 'New Collection'; subtitle = 'Tap to open'; }
    if (type === 'tictactoe') { title = 'Play Me'; }
    if (type === 'weather') { title = 'Vibe Forecast'; }

    const newBlock: BlockItem = {
      id: Date.now().toString(),
      type: type,
      parentId: activeStackId, // Add to current stack
      title,
      subtitle,
      content,
      url,
      active: true,
      archived: false,
      colSpan: type === 'video' || type === 'map' ? 2 : 1,
      rowSpan: type === 'map' ? 2 : 1,
      style: 'light',
      filter: 'none',
      visibility: 'public'
    };
    
    setFormData((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    
    // Auto scroll to new block
    setTimeout(() => {
        const el = blockRefs.current[newBlock.id];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Archive Block (Soft Delete)
  const archiveBlock = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, archived: true } : b),
    }));
  };

  // Restore Block
  const restoreBlock = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, archived: false } : b),
    }));
  };

  // Hard Delete (Only available in Archive tab)
  const permanentDeleteBlock = (id: string) => {
      // Logic for hard delete if user insists, or we can just keep "Restoring" as the main option.
      // For now, removing from array.
      setFormData((prev) => ({
          ...prev,
          blocks: prev.blocks.filter(b => b.id !== id)
      }));
  }

  const handleManualSave = async () => {
    setSyncStatus('saving');
    const success = await onUpdate(formData);
    if (success) {
        setSyncStatus('saved');
        setLastSavedTime(new Date());
    } else {
        setSyncStatus('error');
    }
  };

  const downloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `biography_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const themeList: {id: ProfileTheme, label: string, color: string}[] = [
    { id: 'monochrome', label: 'Mono', color: 'bg-gray-900' },
    { id: 'swiss', label: 'Swiss', color: 'bg-white border border-black' },
    { id: 'brutalist', label: 'Brutal', color: 'bg-[#FFE4E1] border-2 border-black' },
    { id: 'glass', label: 'Glass', color: 'bg-blue-300' },
    { id: 'cyberpunk', label: 'Cyber', color: 'bg-[#050510] border border-[#00f3ff]' },
    { id: 'vaporwave', label: 'Vapor', color: 'bg-pink-400' },
    { id: 'y2k', label: 'Y2K', color: 'bg-pink-200' },
    { id: 'terminal', label: 'Hacker', color: 'bg-black border border-green-500' },
    { id: 'win95', label: 'Win95', color: 'bg-gray-300' },
    { id: 'gameboy', label: '8-Bit', color: 'bg-[#8bac0f]' },
    { id: 'paper', label: 'Paper', color: 'bg-[#fdfbf7]' },
    { id: 'neumorphism', label: 'Soft', color: 'bg-[#e0e5ec]' },
    { id: 'bubblegum', label: 'Pop', color: 'bg-pink-300' },
    { id: 'sunset', label: 'Sunset', color: 'bg-orange-400' },
    { id: 'midnight', label: 'Night', color: 'bg-slate-800' },
    { id: 'nature', label: 'Eco', color: 'bg-[#e9edc9]' },
    { id: 'space', label: 'Space', color: 'bg-black' },
    { id: 'blueprint', label: 'Print', color: 'bg-blue-700' },
    { id: 'comic', label: 'Comic', color: 'bg-yellow-400 border-2 border-black' },
    { id: 'luxury', label: 'Luxe', color: 'bg-black border border-yellow-600' },
    { id: 'minecraft', label: 'Craft', color: 'bg-[#5c4033] border border-[#3b2a1e]' },
    { id: 'roblox', label: 'Blox', color: 'bg-sky-400 border border-blue-600' },
    { id: 'fortnite', label: 'Royale', color: 'bg-indigo-600 border border-purple-400' },
    { id: 'mariokart', label: 'Kart', color: 'bg-black border-2 border-white' },
  ];

  return (
    <div className="w-full md:max-w-4xl md:mx-auto bg-white border border-gray-200 shadow-2xl rounded-none md:rounded-[2rem] p-0 my-0 md:my-8 animate-in fade-in zoom-in-95 duration-300 relative z-50 overflow-hidden flex flex-col h-full md:h-auto md:max-h-[90vh]">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      {/* Header */}
      <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-black">Page Editor</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
               {/* SYNC STATUS INDICATOR */}
               <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${syncStatus === 'saved' ? 'bg-green-100 text-green-700' : syncStatus === 'saving' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {syncStatus === 'saving' ? <Loader2 className="w-3 h-3 animate-spin"/> : syncStatus === 'saved' ? <CheckCircle2 className="w-3 h-3"/> : <X className="w-3 h-3"/>}
                  {syncStatus === 'saving' ? 'Syncing...' : syncStatus === 'saved' ? 'Saved' : 'Error saving'}
               </span>
               <span className="hidden sm:inline opacity-50">Last synced: {lastSavedTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           {onLogout && (
             <Button variant="ghost" onClick={onLogout} className="rounded-full h-10 w-10 !p-0 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50" title="Sign Out">
               <LogOut className="w-5 h-5"/>
             </Button>
           )}
           <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 !p-0 flex items-center justify-center"><X className="w-5 h-5"/></Button>
           <Button onClick={handleManualSave} className="rounded-full bg-black text-white hover:bg-gray-800 px-6 min-w-[100px]">
               {syncStatus === 'saving' ? 'Saving...' : 'Done'}
           </Button>
        </div>
      </div>

      <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile" />
        <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={LayoutGrid} label="Blocks" />
        <TabButton active={activeTab === 'archive'} onClick={() => setActiveTab('archive')} icon={Archive} label={`Bin (${archivedBlocks.length})`} />
      </div>

      <div className="overflow-y-auto p-4 md:p-8 space-y-8 flex-1 custom-scrollbar bg-gray-50/30">
        {activeTab === 'profile' && (
          <section className="space-y-8 max-w-2xl mx-auto animate-in slide-in-from-left-4 duration-300">
             
             {/* DATA EXPORT SECTION */}
             <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Your Data, Your Control</h4>
                    <p className="text-xs text-blue-700 mt-1">Download a backup of your profile. It's your info, not ours.</p>
                </div>
                <button onClick={downloadData} className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all">
                    <Download className="w-4 h-4" /> Export JSON
                </button>
             </div>
             
             {/* PRIVACY TOGGLE */}
             <div className={`p-6 rounded-3xl border transition-all duration-300 ${formData.privacy === 'private' ? 'bg-black text-white border-black shadow-xl' : 'bg-white text-black border-gray-200'}`}>
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.privacy === 'private' ? 'bg-white text-black' : 'bg-gray-100 text-black'}`}>
                             {formData.privacy === 'private' ? <Lock className="w-6 h-6" /> : <Globe2 className="w-6 h-6" />}
                         </div>
                         <div>
                             <h3 className="font-bold text-lg">Profile Privacy</h3>
                             <p className={`text-xs font-medium ${formData.privacy === 'private' ? 'text-gray-400' : 'text-gray-500'}`}>
                                 {formData.privacy === 'private' ? 'Only Added Friends can view your page.' : 'Anyone with the link can view.'}
                             </p>
                         </div>
                     </div>
                     
                     <button 
                        onClick={togglePrivacy} 
                        className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${formData.privacy === 'private' ? 'bg-white' : 'bg-gray-200'}`}
                     >
                         <div className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.privacy === 'private' ? 'translate-x-8 bg-black' : 'translate-x-0 bg-white'}`}></div>
                     </button>
                 </div>
             </div>

             <div className="flex gap-6 items-start flex-col sm:flex-row">
                <div className="group relative w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-xl shrink-0 cursor-pointer" onClick={() => triggerFileUpload('avatar')}>
                   {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-xs uppercase">No Avatar</div>
                   )}
                   <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                   </div>
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <Input 
                    label="Avatar URL (or click image to upload)" 
                    name="avatarUrl" 
                    value={formData.avatarUrl} 
                    onChange={handleChange} 
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Display Name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                    />
                    <Input 
                      label="Location" 
                      name="location" 
                      value={formData.location || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
             </div>

             <div className="space-y-3">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Profile Banner</label>
                 <div className="relative group w-full h-32 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 cursor-pointer" onClick={() => triggerFileUpload('banner')}>
                    {formData.bannerUrl ? (
                         <img src={formData.bannerUrl} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">Tap to upload banner image</div>
                    )}
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                    </div>
                 </div>
                 <Input 
                    placeholder="Or paste Banner URL..."
                    name="bannerUrl"
                    value={formData.bannerUrl || ''}
                    onChange={handleChange}
                    className="!bg-white"
                  />
             </div>

             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Bio / Role</label>
                </div>
                <textarea
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none shadow-sm"
                />
             </div>
             
             {/* FONT SELECTOR */}
             <div className="pt-6 border-t border-gray-200">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 block mb-3">Typography Style</label>
                 <div className="flex gap-3">
                     <button 
                       onClick={() => setFont('sans')} 
                       className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-sans transition-all ${!formData.font || formData.font === 'sans' ? 'bg-black text-white border-black ring-2 ring-offset-2 ring-black' : 'bg-white text-black border-gray-200 hover:border-gray-400'}`}
                     >
                        <span className="font-bold text-lg">Aa</span> <span className="text-xs font-bold uppercase">Modern Sans</span>
                     </button>
                     <button 
                       onClick={() => setFont('serif')} 
                       className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-serif transition-all ${formData.font === 'serif' ? 'bg-black text-white border-black ring-2 ring-offset-2 ring-black' : 'bg-white text-black border-gray-200 hover:border-gray-400'}`}
                     >
                        <span className="font-bold text-lg">Aa</span> <span className="text-xs font-bold uppercase">Elegant Serif</span>
                     </button>
                     <button 
                       onClick={() => setFont('mono')} 
                       className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-mono transition-all ${formData.font === 'mono' ? 'bg-black text-white border-black ring-2 ring-offset-2 ring-black' : 'bg-white text-black border-gray-200 hover:border-gray-400'}`}
                     >
                        <span className="font-bold text-lg">Aa</span> <span className="text-xs font-bold uppercase">Coder Mono</span>
                     </button>
                 </div>
             </div>

             {/* THEME SELECTOR */}
             <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 block">Visual Theme ({themeList.length})</label>
                    <button onClick={handleRandomTheme} className="text-xs font-bold flex items-center gap-1 text-black hover:bg-gray-100 px-3 py-1 rounded-full"><Shuffle className="w-3 h-3" /> Random Vibe</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                   {themeList.map((t) => (
                       <ThemeOption 
                          key={t.id}
                          active={formData.theme === t.id} 
                          onClick={() => setTheme(t.id)}
                          name={t.label}
                          previewClass={t.color}
                       />
                   ))}
                </div>
             </div>
          </section>
        )}

        {activeTab === 'content' && (
          <section className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            
            {/* Add Block Grid */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                       <Plus className="w-4 h-4 bg-black text-white rounded-full p-0.5" />
                       Add New Block
                   </h3>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adding to: {currentStackName || 'Root'}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                   <AddBlockButton onClick={() => addBlock('text')} icon={Type} label="Text" color="bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300" />
                   <AddBlockButton onClick={() => addBlock('image')} icon={ImageIcon} label="Media" color="bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300" />
                   <AddBlockButton onClick={() => addBlock('video')} icon={Video} label="Video" color="bg-red-50 text-red-600 border-red-100 hover:border-red-300" />
                   <AddBlockButton onClick={() => addBlock('music')} icon={Music} label="Music" color="bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300" />
                   <AddBlockButton onClick={() => addBlock('map')} icon={MapPin} label="Map" color="bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300" />
                   <AddBlockButton onClick={() => addBlock('link')} icon={Globe} label="Link" color="bg-green-50 text-green-600 border-green-100 hover:border-green-300" />
                   <AddBlockButton onClick={() => addBlock('stack')} icon={Layers} label="Stack" color="bg-gray-100 text-black border-gray-300 hover:border-black" />
                   <AddBlockButton onClick={() => addBlock('tictactoe')} icon={Gamepad2} label="Game" color="bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400" />
                   <AddBlockButton onClick={() => addBlock('weather')} icon={CloudSun} label="Vibe" color="bg-sky-50 text-sky-600 border-sky-200 hover:border-sky-400" />
                </div>
            </div>
            
            <div className="space-y-6">
              {currentEditorBlocks.length === 0 && (
                  <div className="text-center py-10 opacity-50 border-2 border-dashed border-gray-200 rounded-3xl">
                      <p>No blocks in this stack yet.</p>
                  </div>
              )}
              {currentEditorBlocks.map((block) => (
                <div 
                  key={block.id} 
                  ref={el => { blockRefs.current[block.id] = el }}
                  className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative group transition-all duration-300 hover:shadow-md"
                >
                  {/* ARCHIVE BUTTON INSTEAD OF DELETE */}
                  <button 
                    onClick={() => archiveBlock(block.id)} 
                    className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors p-2 z-10 hover:bg-red-50 rounded-full"
                    title="Move to Bin (Archive)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex gap-2 mb-6 items-center">
                     <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${block.active ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400'}`}>
                        {block.type}
                     </span>
                     {focusBlockId === block.id && <span className="text-purple-600 text-[10px] font-bold uppercase animate-pulse flex items-center gap-1"><Plus className="w-3 h-3"/> Just Added</span>}
                     {block.type === 'stack' && (
                         <button onClick={() => onNavigate(block.id)} className="text-[10px] font-bold uppercase px-3 py-1 rounded-full border bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 flex items-center gap-1">
                             Enter Stack <ChevronRight className="w-3 h-3" />
                         </button>
                     )}
                     
                     {/* Visibility Badge */}
                     {block.visibility === 'member' && (
                         <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full border bg-yellow-50 text-yellow-600 border-yellow-200 flex items-center gap-1">
                             <Lock className="w-3 h-3" /> Members Only
                         </span>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="md:col-span-7 space-y-5">
                      
                      {/* --- VIDEO INPUT --- */}
                      {block.type === 'video' && (
                        <>
                          <Input 
                            label="Video URL (YouTube / Vimeo)"
                            value={block.url || ''}
                            onChange={(e) => handleBlockChange(block.id, 'url', e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                           <Input 
                            label="Caption / Title"
                            value={block.title || ''}
                            onChange={(e) => handleBlockChange(block.id, 'title', e.target.value)}
                          />
                        </>
                      )}

                      {/* --- MAP INPUT --- */}
                      {block.type === 'map' && (
                        <>
                          <Input 
                            label="Location Address"
                            value={block.content || ''}
                            onChange={(e) => handleBlockChange(block.id, 'content', e.target.value)}
                            placeholder="Times Square, New York"
                          />
                           <Input 
                            label="Label"
                            value={block.title || ''}
                            onChange={(e) => handleBlockChange(block.id, 'title', e.target.value)}
                            placeholder="My Office"
                          />
                        </>
                      )}

                      {/* --- MUSIC INPUT --- */}
                      {block.type === 'music' && (
                        <>
                           <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Cover Art</label>
                              <button onClick={() => triggerFileUpload(block.id)} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><Upload className="w-3 h-3"/> Upload</button>
                           </div>
                           <div className="flex gap-2 mb-2">
                             <Input 
                                value={block.imageUrl || ''} 
                                onChange={(e) => handleBlockChange(block.id, 'imageUrl', e.target.value)}
                                placeholder="Image URL..."
                              />
                              {block.imageUrl && <img src={block.imageUrl} className="w-10 h-10 rounded-md object-cover border" />}
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                             <Input 
                              label="Song Title"
                              value={block.title || ''}
                              onChange={(e) => handleBlockChange(block.id, 'title', e.target.value)}
                            />
                            <Input 
                              label="Artist"
                              value={block.subtitle || ''}
                              onChange={(e) => handleBlockChange(block.id, 'subtitle', e.target.value)}
                            />
                           </div>
                        </>
                      )}

                      {/* Status Content */}
                      {block.type === 'status' && (
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Status Update</label>
                           <textarea 
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-lg font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5"
                              rows={3}
                              value={block.content || ''}
                              onChange={(e) => handleBlockChange(block.id, 'content', e.target.value)}
                           />
                           <Input 
                                label="Timestamp (Optional)"
                                value={block.timestamp || ''}
                                onChange={(e) => handleBlockChange(block.id, 'timestamp', e.target.value)}
                                placeholder="e.g. 2h ago"
                                className="!bg-white"
                              />
                        </div>
                      )}

                      {/* Common Inputs for Generic Blocks */}
                      {['text', 'link', 'contact', 'social', 'stack', 'tictactoe', 'weather'].includes(block.type) && (
                        <Input 
                          label={block.type === 'contact' ? 'Number / Email' : block.type === 'text' ? 'Heading / Title' : block.type === 'stack' ? 'Collection Name' : 'Label'}
                          value={block.title || ''} 
                          onChange={(e) => handleBlockChange(block.id, 'title', e.target.value)}
                          autoFocus={focusBlockId === block.id}
                        />
                      )}
                      
                      {['link', 'social', 'contact'].includes(block.type) && (
                        <Input 
                          label="Target URL"
                          value={block.url || ''} 
                          onChange={(e) => handleBlockChange(block.id, 'url', e.target.value)}
                          placeholder="https://..."
                        />
                      )}

                      {['text', 'contact', 'stack', 'weather'].includes(block.type) && (
                         <Input 
                          label="Subtitle / Category"
                          value={block.subtitle || ''} 
                          onChange={(e) => handleBlockChange(block.id, 'subtitle', e.target.value)}
                        />
                      )}

                      {/* Image Specific Controls */}
                      {['image', 'link', 'social'].includes(block.type) && (
                         <div className="space-y-4 pt-2">
                           <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Image Source</label>
                              <button onClick={() => triggerFileUpload(block.id)} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><Upload className="w-3 h-3"/> Upload File</button>
                           </div>
                           
                           <div className="flex gap-2">
                             <div className="flex-1">
                                <Input 
                                  value={block.imageUrl || ''} 
                                  onChange={(e) => handleBlockChange(block.id, 'imageUrl', e.target.value)}
                                  placeholder="https://..."
                                />
                             </div>
                             {block.imageUrl && (
                               <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-50">
                                  <img src={block.imageUrl} className="w-full h-full object-cover" />
                                </div>
                             )}
                           </div>
                         </div>
                      )}
                    </div>

                    {/* Styling Controls */}
                    <div className="md:col-span-5 bg-gray-50/80 rounded-2xl p-6 space-y-6 h-fit">
                       <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center gap-2 pb-2 border-b border-gray-200"><Maximize2 className="w-3 h-3"/> Layout Configuration</h4>
                       
                       <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase">Width units</label>
                            <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
                                {[1,2,3,4].map(n => (
                                    <button 
                                        key={n}
                                        onClick={() => handleBlockChange(block.id, 'colSpan', n)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${block.colSpan === n ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                                    >{n}x</button>
                                ))}
                            </div>
                          </div>
                          
                          <div>
                             <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase">Height units</label>
                             <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
                                {[1,2,3,4].map(n => (
                                    <button 
                                        key={n}
                                        onClick={() => handleBlockChange(block.id, 'rowSpan', n)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${block.rowSpan === n ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                                    >{n}x</button>
                                ))}
                            </div>
                          </div>
                       </div>

                       <div>
                          <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase">Appearance</label>
                          <div className="flex flex-col gap-2">
                             <div className="flex gap-2">
                                <button onClick={() => handleBlockChange(block.id, 'style', 'light')} className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${block.style === 'light' ? 'bg-white border-black text-black ring-1 ring-black' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>Light</button>
                                <button onClick={() => handleBlockChange(block.id, 'style', 'dark')} className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${block.style === 'dark' ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>Dark</button>
                             </div>
                             <button onClick={() => handleBlockChange(block.id, 'style', 'accent')} className={`w-full py-2 rounded-xl border text-xs font-bold transition-all ${block.style === 'accent' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>Accent Color</button>
                          </div>
                       </div>

                       <div>
                           <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase flex items-center gap-1"><Lock className="w-3 h-3"/> Privacy</label>
                           <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
                              <button 
                                onClick={() => handleBlockChange(block.id, 'visibility', 'public')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${!block.visibility || block.visibility === 'public' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                              >
                                 <Globe2 className="w-3 h-3" /> Public
                              </button>
                              <button 
                                onClick={() => handleBlockChange(block.id, 'visibility', 'member')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${block.visibility === 'member' ? 'bg-yellow-100 text-yellow-700 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
                              >
                                 <Lock className="w-3 h-3" /> Member
                              </button>
                           </div>
                       </div>

                       {(block.type === 'image' || block.imageUrl) && (
                         <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase flex items-center gap-1"><Filter className="w-3 h-3"/> Filter</label>
                            <select 
                              className="w-full bg-white border border-gray-200 text-xs font-medium rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-black/5 outline-none"
                              value={block.filter || 'none'}
                              onChange={(e) => handleBlockChange(block.id, 'filter', e.target.value)}
                            >
                              <option value="none">Normal</option>
                              <option value="grayscale">B&W (Grayscale)</option>
                              <option value="contrast">High Contrast</option>
                              <option value="sepia">Sepia Warmth</option>
                              <option value="blur">Soft Blur</option>
                              <option value="vignette">Dark Vignette</option>
                            </select>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ARCHIVE / TRASH TAB */}
        {activeTab === 'archive' && (
          <section className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-gray-900 flex items-center gap-2"><Archive className="w-4 h-4"/> Bin / Archive</h3>
                   <p className="text-xs text-gray-500 mt-1">Blocks are kept here safely. They are not shown on your profile.</p>
                </div>
                <div className="text-xs font-bold text-gray-400 bg-gray-200 px-3 py-1 rounded-full">{archivedBlocks.length} Items</div>
             </div>

             {archivedBlocks.length === 0 ? (
                 <div className="text-center py-12 opacity-40">
                    <Trash2 className="w-12 h-12 mx-auto mb-3" />
                    <p>Bin is empty.</p>
                 </div>
             ) : (
                 <div className="space-y-4">
                    {archivedBlocks.map(block => (
                        <div key={block.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-1 rounded">{block.type}</span>
                                <span className="font-bold text-sm truncate max-w-[200px]">{block.title || 'Untitled'}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => restoreBlock(block.id)} className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100">
                                    <RefreshCw className="w-3 h-3" /> Restore
                                </button>
                                <button onClick={() => permanentDeleteBlock(block.id)} className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100">
                                    <X className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
             )}
          </section>
        )}
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 transition-all ${active ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
  </button>
);

interface ThemeOptionProps {
  active: boolean;
  onClick: () => void;
  name: string;
  previewClass: string;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ active, onClick, name, previewClass }) => (
  <button 
    onClick={onClick}
    className={`group relative p-3 rounded-xl border transition-all text-left ${active ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
  >
     <div className={`h-12 w-full rounded-md mb-2 shadow-sm ${previewClass}`}></div>
     <span className={`text-xs font-bold ${active ? 'text-black' : 'text-gray-500'}`}>{name}</span>
     {active && <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>}
  </button>
);

interface AddBlockButtonProps {
  onClick: () => void;
  icon: any;
  label: string;
  color: string;
}

const AddBlockButton: React.FC<AddBlockButtonProps> = ({ onClick, icon: Icon, label, color }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${color} h-24`}
  >
    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center backdrop-blur-sm">
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
  </button>
);