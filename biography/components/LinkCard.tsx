import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { BlockItem } from '../types';

interface LinkCardProps {
  link: BlockItem;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  if (!link.active) return null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between w-full p-4 bg-white border-2 border-black shadow-neo mb-4 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white"
    >
      <span className="font-bold text-lg">{link.title}</span>
      <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
    </a>
  );
};