export type BlockType = 'link' | 'image' | 'text' | 'social' | 'contact' | 'status' | 'video' | 'map' | 'music' | 'stack' | 'tictactoe' | 'weather';
export type ProfileTheme = 
  | 'monochrome' | 'swiss' | 'brutalist' | 'glass' 
  | 'cyberpunk' | 'vaporwave' | 'y2k' | 'terminal' 
  | 'win95' | 'gameboy' | 'paper' | 'neumorphism' 
  | 'sunset' | 'midnight' | 'nature' | 'bubblegum' 
  | 'blueprint' | 'comic' | 'space' | 'luxury'
  | 'minecraft' | 'roblox' | 'fortnite' | 'mariokart';

export interface BlockItem {
  id: string;
  type: BlockType;
  parentId?: string | null; // ID of the stack this block belongs to. Null = Root.
  title?: string;     // Used for text content, link label, alt text, or Song Title
  subtitle?: string;  // Optional secondary text, Artist Name
  content?: string;   // For status updates, Map Address, or longer text
  timestamp?: string; // For status updates
  url?: string;       // For links, social, video URL, or music URL
  imageUrl?: string;  // For image blocks or Album Art
  active: boolean;
  archived?: boolean; // New: If true, block is in the "Bin" but not deleted.
  colSpan?: 1 | 2 | 3 | 4;    // Grid width (More granular)
  rowSpan?: 1 | 2 | 3 | 4;    // Grid height
  style?: 'light' | 'dark' | 'accent'; // Background style
  filter?: 'none' | 'grayscale' | 'contrast' | 'sepia' | 'blur' | 'vignette'; // Image filters
  visibility?: 'public' | 'member'; // New: Limit content visibility
}

export interface SocialLink {
  platform: 'twitter' | 'instagram' | 'github' | 'linkedin' | 'email';
  url: string;
}

export interface SavedProfile {
  id: string; // The UUID is still used for internal linking
  name: string;
  avatarUrl: string;
  role: string;
}

export interface ProfileData {
  name: string;
  role: string;
  location: string;
  avatarUrl: string;
  bannerUrl?: string; // New: Profile Banner
  font?: 'sans' | 'serif' | 'mono'; // New: Custom Font
  theme: ProfileTheme;
  privacy: 'public' | 'private'; // New: Public or Private visibility
  blocks: BlockItem[];
  savedProfiles: SavedProfile[]; // New: List of friends/saved profiles
  friendCode?: string; // New: Short, shareable code (e.g. "ML-A1B2C3")
}

export enum ViewMode {
  PREVIEW = 'PREVIEW',
  EDIT = 'EDIT',
}