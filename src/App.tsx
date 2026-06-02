/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { LayoutState, PhotoItem } from './types';
import { photoData, romanticQuotes } from './data';
import ParticleCanvas from './components/ParticleCanvas';
import MemoryCard from './components/MemoryCard';
import MemoryModal from './components/MemoryModal';
import AudioPlayer from './components/AudioPlayer';
import { Sparkles, Calendar, Layers, Map, Compass, RotateCcw } from 'lucide-react';

export default function App() {
  const [activeLayout, setActiveLayout] = useState<LayoutState>('CROSS');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoCycleIntervalRef = useRef<number | null>(null);
  const quoteTimeoutRef = useRef<number | null>(null);

  // Layout cycling definition
  const layouts: LayoutState[] = ['CROSS', 'GATHER', 'FAN', 'SPIRAL'];

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update layout timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatic Layout Transition State Machine (every 10 seconds)
  useEffect(() => {
    // If details modal is open, temporarily pause the auto-transition for reading comfort
    if (selectedPhoto) {
      if (autoCycleIntervalRef.current) {
        clearInterval(autoCycleIntervalRef.current);
        autoCycleIntervalRef.current = null;
      }
      return;
    }

    autoCycleIntervalRef.current = window.setInterval(() => {
      setActiveLayout((current) => {
        const nextIndex = (layouts.indexOf(current) + 1) % layouts.length;
        setElapsedTime(0);
        return layouts[nextIndex];
      });
    }, 10000);

    return () => {
      if (autoCycleIntervalRef.current) {
        clearInterval(autoCycleIntervalRef.current);
      }
    };
  }, [selectedPhoto]);

  // Center & Header lyric-quote carousel transition (every 5.5 seconds)
  useEffect(() => {
    const lyricEl = document.getElementById('ambient-lyric');
    const headerLyricEl = document.getElementById('ambient-header-lyric');
    
    const triggerQuoteTransition = () => {
      const targets = [lyricEl, headerLyricEl].filter(Boolean);
      if (targets.length === 0) {
        setQuoteIndex((prev) => (prev + 1) % romanticQuotes.length);
        return;
      }

      // Smooth modern fade-out
      gsap.to(targets, {
        opacity: 0,
        y: -8,
        filter: 'blur(3px)',
        duration: 0.8,
        onComplete: () => {
          setQuoteIndex((prev) => (prev + 1) % romanticQuotes.length);
          // Rise from bottom with blur reset
          gsap.fromTo(targets, 
            { opacity: 0, y: 12, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' }
          );
        }
      });
    };

    const interval = setInterval(triggerQuoteTransition, 5500);
    return () => clearInterval(interval);
  }, []);

  // Recalculate card coordinates and trigger GSAP transition
  useEffect(() => {
    const { width, height } = windowSize;
    const isMobile = width < 640;

    // Dimensions of polaroid cards in pixels (sync with tailwind class)
    const cardWidth = isMobile ? 144 : 176;
    const cardHeight = isMobile ? 180 : 220;

    const centerX = width / 2;
    const centerY = height / 2;

    photoData.forEach((photo, index) => {
      const cardId = `#memory-card-${photo.id}`;
      const el = document.querySelector(cardId);
      if (!el) return;

      let targetX = 0;
      let targetY = 0;
      let targetRotate = 0;
      let targetScale = 1;
      let targetZIndex = index + 10;
      let targetOpacity = 1;

      switch (activeLayout) {
        case 'CROSS': {
          // Distributed evenly in a slightly chaotic but uniform pattern
          // Deterministic noise based on index to keep repositioning predictable
          const numCols = isMobile ? 3 : 5;
          const numRows = Math.ceil(photoData.length / numCols);
          const colIndex = index % numCols;
          const rowIndex = Math.floor(index / numCols);

          const gridWidth = width * (isMobile ? 0.75 : 0.82);
          const gridHeight = height * (isMobile ? 0.58 : 0.65);

          const startX = centerX - gridWidth / 2;
          const startY = centerY - gridHeight / 2 - (isMobile ? 20 : 10);

          const rawX = startX + (colIndex / (numCols - 1)) * gridWidth;
          const rawY = startY + (rowIndex / (numRows - 1)) * gridHeight;

          // Pseudo-random offsets to simulate organic scatter
          const noiseX = Math.sin(index * 7.5) * (isMobile ? 12 : 25);
          const noiseY = Math.cos(index * 4.3) * (isMobile ? 12 : 25);

          targetX = rawX - cardWidth / 2 + noiseX;
          targetY = rawY - cardHeight / 2 + noiseY;
          targetRotate = Math.sin(index * 2.5) * 16;
          targetScale = isMobile ? 0.82 : 0.95;
          break;
        }

        case 'GATHER': {
          // Concentrated center deck with slight rotations
          const circleProgress = (index / photoData.length) * Math.PI * 2;
          // Tiny scatter circle to avoid perfect hiding
          const scatterRadius = isMobile ? 12 : 22;
          
          targetX = centerX - cardWidth / 2 + Math.cos(circleProgress) * scatterRadius;
          targetY = centerY - cardHeight / 2 - (isMobile ? 30 : 20) + Math.sin(circleProgress) * scatterRadius;
          targetRotate = Math.sin(index * 9.8) * 18;
          targetScale = isMobile ? 0.85 : 1.0;
          targetZIndex = index + 50; // High stacking order
          break;
        }

        case 'FAN': {
          // Elegant arc like a series of cards held in a hand
          const maxTheta = isMobile ? 48 : 65; // Spread in degrees
          const theta = -maxTheta + (index / (photoData.length - 1)) * (maxTheta * 2);
          const rad = (theta * Math.PI) / 180;
          
          const radius = isMobile ? width * 0.75 : Math.max(width * 0.42, 550);
          const arcCenterX = centerX;
          const arcCenterY = centerY + (isMobile ? radius * 0.7 : radius * 0.9);

          targetX = arcCenterX + radius * Math.sin(rad) - cardWidth / 2;
          targetY = arcCenterY - radius * Math.cos(rad) - cardHeight / 2 - (isMobile ? 90 : 80);
          targetRotate = theta;
          targetScale = isMobile ? 0.76 : 0.94;
          targetZIndex = index + 10;
          break;
        }

        case 'SPIRAL': {
          // 3D Isometric coiled whirlpool tunnel
          const spiralFactor = 0.58; // Distance between coils
          const windings = isMobile ? 2.2 : 2.8; // Number of revolutions
          const theta = (index / photoData.length) * Math.PI * 2 * windings;
          
          const startRadius = isMobile ? 15 : 25;
          const maxRadius = isMobile ? Math.min(width * 0.42, 280) : Math.min(width * 0.45, 520);
          const radius = startRadius + (index / photoData.length) * (maxRadius - startRadius);

          targetX = centerX + radius * Math.cos(theta) - cardWidth / 2;
          // Compressed height to make it feel 3D perspective
          targetY = centerY + radius * Math.sin(theta) * 0.75 - cardHeight / 2 - (isMobile ? 30 : 20);
          targetRotate = (theta * 180) / Math.PI + 90;
          targetScale = (isMobile ? 0.65 : 0.78) + (index / photoData.length) * 0.22; // Outer cards grow larger
          targetZIndex = index + 30;
          break;
        }
      }

      // Trigger GSAP transition with beautiful wave staggers
      gsap.to(el, {
        x: targetX,
        y: targetY,
        rotation: targetRotate,
        scale: targetScale,
        opacity: targetOpacity,
        zIndex: targetZIndex,
        duration: 1.4,
        ease: 'power3.out',
        overwrite: 'auto',
        delay: index * 0.024, // Wave delay cascades transitions
      });
    });
  }, [activeLayout, windowSize, selectedPhoto]);

  // Inertia drag controller
  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>, cardId: number) => {
    e.preventDefault();
    const el = document.getElementById(`memory-card-${cardId}`);
    if (!el) return;

    // Float item temporarily to absolute peak layer
    gsap.set(el, { zIndex: 999 });

    const startX = e.clientX;
    const startY = e.clientY;

    const currentX = gsap.getProperty(el, 'x') as number;
    const currentY = gsap.getProperty(el, 'y') as number;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      gsap.set(el, {
        x: currentX + dx,
        y: currentY + dy,
        rotation: currentX * 0.05 + dx * 0.1, // Slight tilt when active dragged
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const getLayoutLabel = (layout: LayoutState) => {
    switch (layout) {
      case 'CROSS': return 'VALLEY: CROSS / 穿梭寻缘';
      case 'GATHER': return 'VALLEY: GATHER / 月心重叠';
      case 'FAN': return 'VALLEY: FAN / 扇形舒展';
      case 'SPIRAL': return 'VALLEY: SPIRAL / 螺旋升华';
    }
  };

  const cycleLayout = () => {
    setActiveLayout((current) => {
      const nextIndex = (layouts.indexOf(current) + 1) % layouts.length;
      setElapsedTime(0);
      return layouts[nextIndex];
    });
  };

  return (
    <div
      ref={containerRef}
      id="root_photo_wall_container"
      className="relative w-screen h-screen overflow-hidden bg-[#020104] text-white flex flex-col justify-between"
    >
      {/* High Performance Particles Background Canvas */}
      <ParticleCanvas />

      {/* Decorative Gradient Shading Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_95%)] pointer-events-none z-1" />

      {/* 1. TOP HEADER ORNAMENT */}
      <header className="relative w-full z-10 p-6 flex items-start justify-between pointer-events-none">
        {/* Left Side: Anniversary Initials */}
        <div className="flex flex-col select-none">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.25em] text-pink-400 drop-shadow-[0_2px_10px_rgba(240,98,146,0.3)]">
            Z X Y
          </h1>
          <p className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-400 mt-1 uppercase">
            ETERNAL BLOSSOMS • June 2, 2026
          </p>
        </div>

        {/* Center: Glowing BGM Lyric Display (Centered beautifully in the empty header space) */}
        <div className="hidden sm:flex flex-col items-center justify-center select-none text-center pointer-events-none max-w-[200px] md:max-w-md mx-auto self-center">
          <div className="flex items-center gap-1 text-[8px] font-mono tracking-[0.2em] text-pink-400/50 uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-500/60 animate-pulse" />
            BGM LYRICS / 歌词同步
          </div>
          <p
            id="ambient-header-lyric"
            className="text-xs md:text-sm font-light tracking-[0.1em] text-pink-100/95 drop-shadow-[0_0_8px_rgba(244,143,177,0.5)] mt-1.5 max-w-[180px] md:max-w-sm truncate leading-normal"
          >
            {romanticQuotes[quoteIndex]}
          </p>
        </div>

        {/* Right Side: Layout Status HUD */}
        <div className="flex flex-col items-end select-none text-right">
          <div className="flex items-center gap-2">
            {/* Pulsing state light */}
            <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wider text-pink-300">
              {getLayoutLabel(activeLayout)}
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-neutral-500 mt-1 uppercase">
            ACTIVE HUD STATE / {elapsedTime}s
          </span>
        </div>
      </header>

      {/* 2. CARD ARENA CONTAINER (Centering) */}
      <main className="absolute inset-x-0 top-20 bottom-24 overflow-visible flex items-center justify-center pointer-events-none z-5">
        {/* Memory Quotes: Lyric board centered tightly behind / interspersed near the cards */}
        <div className="absolute inset-x-4 flex items-center justify-center text-center pointer-events-none select-none">
          <p
            id="ambient-lyric"
            className="text-base sm:text-lg md:text-xl font-light tracking-[0.16em] text-pink-100/40 max-w-xl leading-relaxed select-none"
          >
            {romanticQuotes[quoteIndex]}
          </p>
        </div>

        {/* Card Entities Canvas Grid (Cards remain interactive, container itself is click-through) */}
        <div className="relative w-full h-full pointer-events-none select-none">
          {photoData.map((photo) => (
            <div key={photo.id} className="pointer-events-auto">
              <MemoryCard
                photo={photo}
                isActive={selectedPhoto?.id === photo.id}
                onSelect={(p) => setSelectedPhoto(p)}
                onDragStart={handleDragStart}
              />
            </div>
          ))}
        </div>
      </main>

      {/* 3. BOTOM CONTROLS RAIL */}
      <footer className="relative w-full z-10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none">
        
        {/* Manual Layout Selection Pills */}
        <div className="flex items-center gap-1.5 bg-neutral-900/40 border border-white/5 backdrop-blur-xl p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
          {layouts.map((state) => {
            const isSelf = activeLayout === state;
            return (
              <button
                key={state}
                onClick={() => {
                  setActiveLayout(state);
                  setElapsedTime(0);
                }}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider transition-all duration-300 uppercase cursor-pointer active:scale-95 ${
                  isSelf
                    ? 'bg-pink-500/20 text-pink-400 font-semibold shadow-[0_0_12px_rgba(244,143,177,0.2)] ring-1 ring-pink-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {state}
              </button>
            );
          })}
          
          <button
            onClick={cycleLayout}
            className="p-1 px-2.5 rounded-full text-zinc-500 hover:text-pink-400 duration-300 transition-colors pointer-events-auto cursor-pointer"
            title="Cycle Next Layout"
          >
            <RotateCcw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center font-mono text-[9px] uppercase tracking-widest text-neutral-500 select-none leading-relaxed hidden md:block">
          <div>[ Drag card with layout inertia ]</div>
          <div className="mt-0.5 mt-[2px]">Click card to engage deep flower sea stories</div>
        </div>

        {/* Minimal Audio Control Module */}
        <div className="pointer-events-auto">
          <AudioPlayer />
        </div>
      </footer>

      {/* 4. EXPANDABLE GLASSMORPHISM MODAL GRID */}
      <MemoryModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}
