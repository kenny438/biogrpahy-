import React from 'react';
import { Twitter, Instagram, Github, Linkedin, Mail } from 'lucide-react';
import { SocialLink } from '../types';

interface SocialIconsProps {
  socials: SocialLink[];
}

const iconMap = {
  twitter: Twitter,
  instagram: Instagram,
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

export const SocialIcons: React.FC<SocialIconsProps> = ({ socials }) => {
  return (
    <div className="flex justify-center gap-4 mt-6 mb-8">
      {socials.map((social) => {
        const Icon = iconMap[social.platform];
        if (!Icon || !social.url) return null;

        return (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors"
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
};
