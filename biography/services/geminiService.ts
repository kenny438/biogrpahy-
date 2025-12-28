import { ProfileData } from "../types";

export const generateInitialProfile = (
  name: string,
  role: string,
  location: string,
  bio: string,
  theme: string
): ProfileData => {
  const validThemes = [
    'monochrome', 'swiss', 'brutalist', 'glass', 'cyberpunk', 'vaporwave', 
    'y2k', 'terminal', 'win95', 'gameboy', 'paper', 'neumorphism', 
    'sunset', 'midnight', 'nature', 'bubblegum', 'blueprint', 'comic', 
    'space', 'luxury', 'minecraft', 'roblox', 'fortnite', 'mariokart'
  ];

  const selectedTheme = validThemes.includes(theme) ? theme : 'monochrome';
  
  return {
    name: name || "New User",
    role: role || "Creator",
    location: location || "",
    avatarUrl: "",
    theme: selectedTheme as any,
    privacy: 'public',
    savedProfiles: [],
    blocks: [
      {
        id: 'init-text-1',
        type: 'text',
        title: 'Hello World',
        subtitle: bio || 'Welcome to my space',
        active: true,
        colSpan: 2,
        rowSpan: 1,
        style: 'light',
        filter: 'none',
        visibility: 'public'
      }
    ]
  };
};