import React, { useState, useEffect } from 'react';
import { Settings, Eye, Loader2, Lock, Shield, UserX, Copy, Check } from 'lucide-react';
import { ProfileData, ViewMode, BlockType, BlockItem, SavedProfile } from './types';
import { ProfileView } from './components/ProfileView';
import { EditorView } from './components/EditorView';
import { AuthView } from './components/AuthView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Button } from './components/Button';
import { Toast } from './components/Toast';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

const DEFAULT_DATA: ProfileData = {
  name: "New User",
  role: "Setup your profile",
  avatarUrl: "", 
  location: "",
  theme: 'monochrome',
  font: 'sans',
  privacy: 'public',
  savedProfiles: [],
  blocks: [
    {
      id: 'default-text',
      type: 'text',
      title: 'Start Here',
      subtitle: 'Edit this text block',
      active: true,
      colSpan: 2,
      rowSpan: 1,
      style: 'light'
    }
  ],
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  
  const [data, setData] = useState<ProfileData>(DEFAULT_DATA);
  const [currentUserData, setCurrentUserData] = useState<ProfileData | null>(null);

  const [mode, setMode] = useState<ViewMode>(ViewMode.PREVIEW);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [targetFriendCode, setTargetFriendCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [activeStackId, setActiveStackId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const publicUid = params.get('uid');

    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Fetch MY data first to establish identity
        fetchCurrentUser(session.user.id).then(() => {
             // Then fetch the profile we want to view
             if (!publicUid) {
                fetchProfile(session.user.id);
             } else {
                setViewOnly(true);
                fetchProfile(publicUid, true, session.user.id);
             }
        });
      } else {
        if (!publicUid) {
            setLoading(false);
        } else {
            setViewOnly(true);
            fetchProfile(publicUid, true, null);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchCurrentUser(session.user.id);
        if (!publicUid) fetchProfile(session.user.id);
      } else {
        if (!publicUid) setIsOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
  };

  const generateFriendCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ML-${result}`;
  };

  const fetchCurrentUser = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', userId)
        .single();
      
      if (profile && profile.data) {
          const userData = profile.data as ProfileData;
          let needsUpdate = false;
          
          if (!userData.savedProfiles) {
              userData.savedProfiles = [];
              needsUpdate = true;
          }

          if (!userData.friendCode) {
              userData.friendCode = generateFriendCode();
              needsUpdate = true;
          }
          
          if (!userData.privacy) {
              userData.privacy = 'public';
              needsUpdate = true;
          }

          setCurrentUserData(userData);

          if (needsUpdate) {
             supabase.from('profiles').update({ data: userData }).eq('id', userId).then(({ error }) => {
                 if (error) console.warn("Background profile update failed", error);
             });
          }
      }
  };

  const fetchProfile = async (targetUserId: string, isPublic = false, viewerId: string | null = null) => {
    if (isPublic) setLoading(true);
    setProfileNotFound(false);
    setAccessDenied(false);
    
    let hasLocalData = false;

    // Local Data Check (Only for Owner)
    if (!isPublic) {
        const localData = localStorage.getItem(`biography_data_${targetUserId}`);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                if (!parsed.savedProfiles) parsed.savedProfiles = [];
                if (!parsed.friendCode) parsed.friendCode = generateFriendCode();
                if (!parsed.privacy) parsed.privacy = 'public';
                
                setData(parsed);
                setCurrentUserData(parsed);
                setIsOnboarding(false);
                setLoading(false);
                hasLocalData = true;
            } catch (e) {
                console.error("Invalid local data", e);
            }
        }
    }

    if (!hasLocalData) setLoading(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', targetUserId)
        .single();
      
      if (profile && profile.data) {
        const fetchedData = profile.data as ProfileData;
        
        // Defaults
        if (!fetchedData.savedProfiles) fetchedData.savedProfiles = [];
        if (!fetchedData.friendCode) fetchedData.friendCode = generateFriendCode();
        if (!fetchedData.privacy) fetchedData.privacy = 'public';

        // --- PRIVACY CHECK ---
        // Access is allowed if:
        // 1. It is public
        // 2. I am the owner
        // 3. I am in the owner's friend list (savedProfiles)
        const isOwner = viewerId === targetUserId;
        const isFriend = viewerId ? fetchedData.savedProfiles.some(friend => friend.id === viewerId) : false;
        
        if (fetchedData.privacy === 'private' && !isOwner && !isFriend) {
            setAccessDenied(true);
            setTargetFriendCode(fetchedData.friendCode || null);
            setLoading(false);
            return;
        }
        // ---------------------

        setData(fetchedData);
        if (!isPublic) {
            setIsOnboarding(false);
            setCurrentUserData(fetchedData);
            localStorage.setItem(`biography_data_${targetUserId}`, JSON.stringify(fetchedData));
        }
      } else {
        if (isPublic) {
          setProfileNotFound(true);
        } else {
          if (!hasLocalData) setIsOnboarding(true);
        }
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
      if (isPublic) {
        setProfileNotFound(true);
      } else {
        if (!hasLocalData) setIsOnboarding(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (newData: ProfileData) => {
    if (!session) return false;
    
    if (!newData.friendCode) newData.friendCode = generateFriendCode();

    try {
        localStorage.setItem(`biography_data_${session.user.id}`, JSON.stringify(newData));
    } catch (e) {
        console.warn("Local storage full or disabled");
    }

    setData(newData);
    setCurrentUserData(newData);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id, 
          data: newData,
          updated_at: new Date().toISOString()
        });

      if (error) {
         console.warn("Saved locally. Sync failed.", error);
         return true; 
      }
      return true;
    } catch (e) {
      console.error("Save failed:", e);
      return true;
    }
  };
  
  const handleAddViewedProfile = async () => {
    if (!session || !currentUserData) {
       showToast("Please create a profile first!", 'error');
       return;
    }
    
    const targetUid = new URLSearchParams(window.location.search).get('uid');
    if (!targetUid || targetUid === session.user.id) return;

    const isFriend = currentUserData.savedProfiles?.some(p => p.id === targetUid);
    if (isFriend) {
        showToast("Already in your friends list!", 'error');
        return;
    }

    const newFriend: SavedProfile = {
        id: targetUid,
        name: data.name,
        avatarUrl: data.avatarUrl,
        role: data.role
    };

    const newSavedProfiles = [...(currentUserData.savedProfiles || []), newFriend];
    const updatedMyData = { ...currentUserData, savedProfiles: newSavedProfiles };

    setCurrentUserData(updatedMyData);
    
    const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        data: updatedMyData,
        updated_at: new Date().toISOString()
    });

    if (!error) {
        showToast("Friend added successfully!");
    } else {
        showToast("Failed to save friend.", 'error');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
      if (!session || !currentUserData) return;

      const newSavedProfiles = currentUserData.savedProfiles.filter(p => p.id !== friendId);
      const updatedMyData = { ...currentUserData, savedProfiles: newSavedProfiles };

      setCurrentUserData(updatedMyData);
      
      // Persist to DB
      const { error } = await supabase.from('profiles').upsert({
          id: session.user.id,
          data: updatedMyData,
          updated_at: new Date().toISOString()
      });

      if (!error) {
          showToast("Friend removed.");
      } else {
          showToast("Failed to remove friend.", 'error');
      }
  };

  const handleSearchUsers = async (query: string) => {
      if (!session || !currentUserData) return { success: false, message: "Please sign in." };
      
      const cleanQuery = query.trim();
      if (cleanQuery.length < 3) return { success: false, message: "Search too short." };

      try {
          // Check for direct Code Match first (Exact)
          const { data: codeMatch, error: codeError } = await supabase
              .from('profiles')
              .select('id, data')
              .contains('data', { friendCode: cleanQuery.toUpperCase() })
              .limit(1)
              .maybeSingle();

          if (codeMatch && !codeError) {
              return addFoundUser(codeMatch.id, codeMatch.data);
          }

          const { data: nameMatches, error: nameError } = await supabase
              .from('profiles')
              .select('id, data')
              .ilike('data->>name', `%${cleanQuery}%`)
              .limit(5);

          if (nameMatches && nameMatches.length > 0) {
              const target = nameMatches[0];
              return addFoundUser(target.id, target.data);
          }

          return { success: false, message: "User not found." };

      } catch (e) {
          console.error("Search error", e);
          return { success: false, message: "Connection error." };
      }
  };

  const addFoundUser = async (friendId: string, friendData: any) => {
      if (friendId === session?.user.id) return { success: false, message: "You cannot add yourself." };
      
      if (currentUserData?.savedProfiles?.some(p => p.id === friendId)) {
          return { success: false, message: "Already in friends list." };
      }

      const newFriend: SavedProfile = {
          id: friendId,
          name: friendData.name,
          avatarUrl: friendData.avatarUrl,
          role: friendData.role
      };
      
      const newSavedProfiles = [...(currentUserData?.savedProfiles || []), newFriend];
      const updatedMyData = { ...currentUserData!, savedProfiles: newSavedProfiles };
      
      setCurrentUserData(updatedMyData);
      
      const { error } = await supabase.from('profiles').upsert({
           id: session!.user.id,
           data: updatedMyData,
           updated_at: new Date().toISOString()
      });

      if (error) return { success: false, message: "Failed to save." };
      
      return { success: true, message: `Added ${friendData.name}!` };
  }

  const handleBlockRemove = (blockId: string) => {
    const removeRecursive = (bId: string, blocks: BlockItem[]): BlockItem[] => {
        const children = blocks.filter(b => b.parentId === bId);
        let newBlocks = blocks.filter(b => b.id !== bId);
        children.forEach(child => {
            newBlocks = removeRecursive(child.id, newBlocks);
        });
        return newBlocks;
    };
    const newData = { ...data, blocks: removeRecursive(blockId, data.blocks) };
    saveProfile(newData);
  };

  const handleOnboardingComplete = async (newData: ProfileData) => {
    if (!newData.friendCode) newData.friendCode = generateFriendCode();
    
    setIsSavingOnboarding(true);
    const success = await saveProfile(newData);
    setIsSavingOnboarding(false);
    
    if (success) {
      setIsOnboarding(false);
      setMode(ViewMode.EDIT);
    } else {
      showToast("Setup failed. Please try again.", 'error');
    }
  };

  const toggleMode = () => {
    setMode(prev => {
      const newMode = prev === ViewMode.PREVIEW ? ViewMode.EDIT : ViewMode.PREVIEW;
      if (newMode === ViewMode.PREVIEW) setEditingBlockId(null);
      return newMode;
    });
  };

  const handleBlockEdit = (id: string) => {
    if (viewOnly) return;
    setEditingBlockId(id);
    setMode(ViewMode.EDIT);
  };

  const handleQuickAdd = (type: BlockType) => {
    if (viewOnly) return;
    
    const newBlock: BlockItem = {
      id: Date.now().toString(),
      type,
      parentId: activeStackId,
      title: type === 'link' ? 'New Link' : type === 'image' ? 'New Image' : 'New Block',
      active: true,
      colSpan: 1,
      rowSpan: 1,
      style: 'light',
      url: type === 'link' ? 'https://' : undefined,
    };

    const newData = { ...data, blocks: [...data.blocks, newBlock] };
    
    saveProfile(newData);
    
    setEditingBlockId(newBlock.id);
    setMode(ViewMode.EDIT);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUserData(null);
    setData(DEFAULT_DATA);
    setMode(ViewMode.PREVIEW);
    setIsOnboarding(false);
    setViewOnly(false);
    setEditingBlockId(null);
    setActiveStackId(null);
    try { window.history.replaceState({}, '', window.location.pathname); } catch (e) {}
  };

  const getShareUrl = () => {
     if (typeof window === 'undefined') return '';
     if (viewOnly) return window.location.href;
     if (session?.user?.id) return `${window.location.origin}?uid=${session.user.id}`;
     return window.location.href;
  };
  
  const handleCopyCode = () => {
      if (!targetFriendCode) return;
      navigator.clipboard.writeText(targetFriendCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
      showToast("Friend Code Copied!");
  };

  const viewingUid = new URLSearchParams(window.location.search).get('uid');
  const isFollowing = viewingUid && currentUserData?.savedProfiles?.some(p => p.id === viewingUid);
  
  const isLoggedIn = !!session;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]">
             <Loader2 className="w-6 h-6 animate-spin" />
           </div>
           <div className="text-white font-mono text-sm tracking-widest uppercase">Loading BIOGRAPHY...</div>
        </div>
      </div>
    );
  }
  
  // --- PRIVATE PROFILE SCREEN ---
  if (accessDenied) {
      return (
          <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
             {/* Simple Background Pattern */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
             
             <div className="relative z-10 max-w-sm w-full animate-in slide-in-from-bottom-8 duration-700">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-md">
                   <Lock className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-4xl font-black tracking-tighter mb-4">Private Profile</h1>
                <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                   This account is private. Only friends added by the owner can view this content.
                </p>

                {targetFriendCode && isLoggedIn && (
                     <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Copy Friend Code</p>
                        <p className="text-xs text-gray-400 mb-4">Share this code with the owner so they can add you.</p>
                        <button onClick={handleCopyCode} className="w-full flex items-center justify-between bg-black border border-white/20 p-4 rounded-xl hover:border-white transition-colors group">
                             <span className="font-mono text-xl font-bold tracking-wider">{targetFriendCode}</span>
                             {codeCopied ? <Check className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5 text-gray-500 group-hover:text-white"/>}
                        </button>
                     </div>
                )}
                
                {!isLoggedIn && (
                   <div className="space-y-4">
                      <Button onClick={() => setAccessDenied(false)} className="w-full !bg-white !text-black !py-4 !rounded-xl !font-bold">
                         Sign In to Connect
                      </Button>
                   </div>
                )}
                
                <div className="mt-12">
                   <a href="/" className="text-xs font-bold text-gray-600 hover:text-white transition-colors uppercase tracking-widest">Back to Home</a>
                </div>
             </div>
          </div>
      )
  }

  if (viewOnly && profileNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-8">
         <div className="max-w-md">
            <h1 className="text-6xl font-black mb-6">404</h1>
            <p className="text-gray-500 mb-8 text-lg font-medium">This profile does not exist or is private.</p>
            <a href="/" className="inline-block px-8 py-4 bg-black text-white rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-xl">Create your own</a>
         </div>
      </div>
    );
  }

  if (!session && !viewOnly) {
    return <AuthView />;
  }

  if (isOnboarding && !viewOnly) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} isSaving={isSavingOnboarding} />;
  }

  const isOwner = session && !viewOnly;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-black font-sans relative overflow-x-hidden selection:bg-black selection:text-white">
      {/* NOTIFICATION TOAST */}
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {isOwner && (
        <div className="fixed top-6 right-6 z-50">
            <Button 
              onClick={toggleMode} 
              variant="ghost"
              className="rounded-full w-12 h-12 !p-0 bg-white/80 backdrop-blur shadow-sm hover:shadow-xl border border-gray-100 flex items-center justify-center transition-all hover:scale-110"
              title={mode === ViewMode.PREVIEW ? "Edit Page" : "Preview Page"}
            >
              {mode === ViewMode.PREVIEW ? <Settings className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>
        </div>
      )}

      <main className={`w-full min-h-screen transition-all duration-500 ${mode === ViewMode.EDIT ? 'blur-sm grayscale opacity-50 pointer-events-none scale-95 origin-top' : ''}`}>
        <ProfileView 
          data={data} 
          onEditBlock={isOwner ? handleBlockEdit : undefined}
          onDeleteBlock={isOwner ? handleBlockRemove : undefined}
          isOwner={!!isOwner}
          userId={session?.user?.id}
          activeStackId={activeStackId}
          onNavigate={(stackId) => setActiveStackId(stackId)}
          onQuickAdd={isOwner ? handleQuickAdd : undefined}
          onOpenSettings={isOwner ? toggleMode : undefined}
          shareUrl={getShareUrl()}
          isFollowing={!!isFollowing}
          onToggleFollow={handleAddViewedProfile} 
          savedProfiles={currentUserData?.savedProfiles || []}
          onAddFriend={handleSearchUsers}
          onRemoveFriend={handleRemoveFriend} // PASS REMOVE HANDLER
          isLoggedIn={isLoggedIn}
        />
      </main>
      
      {mode === ViewMode.EDIT && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-0 md:p-4">
           <div className="pointer-events-auto w-full md:max-w-3xl h-full md:h-auto">
              <EditorView 
                data={data} 
                onUpdate={saveProfile} 
                onClose={() => {
                  setMode(ViewMode.PREVIEW);
                  setEditingBlockId(null);
                }} 
                onLogout={handleLogout}
                focusBlockId={editingBlockId}
                activeStackId={activeStackId}
                onNavigate={(stackId) => setActiveStackId(stackId)}
              />
           </div>
        </div>
      )}
    </div>
  );
}

export default App;