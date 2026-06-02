/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PhotoItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ArrowRight } from 'lucide-react';

interface MemoryModalProps {
  photo: PhotoItem | null;
  onClose: () => void;
}

export default function MemoryModal({ photo, onClose }: MemoryModalProps) {
  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-4xl bg-neutral-950/60 border border-white/10 rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(244,143,177,0.3)] backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle neon mood light on top */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-pink-500/20 via-pink-400 to-pink-500/20" />

          {/* Close button in top corner for fast navigation */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors duration-200 z-10 border border-white/5 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main Grid container */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[450px]">
            
            {/* Left Column (The Large Polaroid View) */}
            <div className="md:col-span-6 p-6 sm:p-8 flex items-center justify-center bg-zinc-950/40 border-b md:border-b-0 md:border-r border-white/5">
              <motion.div
                initial={{ rotate: -3 }}
                animate={{ rotate: 1 }}
                className="w-full max-w-[290px] sm:max-w-[320px] bg-neutral-900 border border-neutral-800 p-4 rounded-xl shadow-2xl relative"
              >
                {/* Paper Pin visual accent */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-pink-500/80 drop-shadow-md z-10 scale-125">
                  <Heart className="w-6 h-6 fill-pink-500" />
                </div>

                <div className="aspect-[4/3.8] overflow-hidden rounded bg-black relative">
                  <img
                    src={photo.url.startsWith('http') ? photo.url : `${import.meta.env.BASE_URL}${photo.url.replace(/^\//, '')}`}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 opacity-70 pointer-events-none" />
                </div>
                
                <div className="mt-4 flex items-center justify-center font-mono">
                  <span className="text-xs text-neutral-400 tracking-wider">
                    NO. {photo.id.toString().padStart(2, '0')} / ETERNAL
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Right Column (Editorial Glassmorphism Stories) */}
            <div className="md:col-span-6 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
              <div>
                {/* Heading details */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-mono tracking-widest text-pink-500/80 uppercase bg-pink-500/10 px-2.5 py-1 rounded-sm border border-pink-500/20">
                    [ MY DEAREST MOMENT ]
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6">
                  {photo.title}
                </h2>

                {/* Love narrative script */}
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans font-light bg-white/[0.02] border border-white/5 p-4 rounded-lg shadow-inner">
                  {photo.desc}
                </p>
              </div>

              {/* Action and design embellishments */}
              <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-500">
                  <span>LATENCY STATE: SUCCESS</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse ml-1" />
                </div>

                <button
                  onClick={onClose}
                  className="group relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-pink-500/10 hover:bg-pink-500 hover:text-white border border-pink-500/30 text-pink-300 font-mono text-xs tracking-wider transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(240,98,146,0.1)] active:scale-[0.98]"
                >
                  <span>RETURN TO FLOWER SEA / 返回花海</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
