/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { PhotoItem } from '../types';
import { Pin, MapPin, Calendar } from 'lucide-react';

interface MemoryCardProps {
  photo: PhotoItem;
  isActive: boolean;
  onSelect: (photo: PhotoItem) => void;
  onDragStart: (e: React.PointerEvent<HTMLDivElement>, id: number) => void;
}

export default function MemoryCard({ photo, isActive, onSelect, onDragStart }: MemoryCardProps) {
  const cardElementRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Save starting cursor position to distinguish between click vs drag
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    onDragStart(e, photo.id);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    // If pointer didn't move much, click is triggered
    if (dx < 6 && dy < 6) {
      onSelect(photo);
    }
  };

  return (
    <div
      ref={cardElementRef}
      id={`memory-card-${photo.id}`}
      data-card-id={photo.id}
      className={`absolute w-36 sm:w-44 bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 shadow-2xl select-none cursor-grab active:cursor-grabbing transition-shadow duration-300 will-change-transform ${
        isHovered ? 'shadow-[0_20px_35px_rgba(240,98,146,0.25)] ring-1 ring-pink-500/30' : ''
      }`}
      style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tape Mockup at the top - very cute physical detail */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-pink-500/10 backdrop-blur-[2px] border border-pink-500/10 rotate-2 pointer-events-none rounded-[1px] shadow-sm z-10" />

      {/* Polaroid Image Cassette */}
      <div className="relative aspect-[4/3.8] w-full overflow-hidden rounded bg-neutral-950 pointer-events-none group">
        <img
          src={photo.url.startsWith('http') ? photo.url : (import.meta.env.PROD ? `https://cdn.jsdelivr.net/gh/RRH04/2zsy@main/public/${photo.url.replace(/^\//, '')}` : `${import.meta.env.BASE_URL}${photo.url.replace(/^\//, '')}`)}
          alt={photo.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
          loading="lazy"
        />
        {/* Fine gloss overlay */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 mix-blend-overlay" />
      </div>

      {/* Polaroid Bottom Label */}
      <div className="mt-2.5 pt-0.5 pb-1 flex flex-col pointer-events-none">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-medium font-sans tracking-wide text-neutral-200 truncate pr-1">
            {photo.title.split('/')[0].trim()}
          </span>
          <span className="text-[8px] font-mono tracking-tight text-pink-400/80">
            {photo.date?.slice(-5) || '12.25'}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-0.5 text-[7px] sm:text-[8px] text-neutral-500 font-mono">
          <MapPin className="w-2 h-2 text-neutral-600 shrink-0" />
          <span className="truncate">{photo.location?.split('/')[0].trim() || 'MEMORY'}</span>
        </div>
      </div>
    </div>
  );
}
