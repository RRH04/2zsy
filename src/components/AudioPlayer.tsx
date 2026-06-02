/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Music, Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [synthInitialized, setSynthInitialized] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  // Soft piano / lounge instrumental looping track
  const audioUrl = `${import.meta.env.BASE_URL}music/bgm.mp3`;

  // Procedural Synth Fallback using Web Audio API:
  // Plays gentle romantic major 7th and add9 chords (Cmaj7 - Fmaj7 - Am9 - Gsus4) to ensure high-fidelity ambient audioscapes independent of network connectivity
  const initProceduralSynth = () => {
    if (synthInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      audioContextRef.current = new AudioCtx();
      setSynthInitialized(true);
    } catch (e) {
      console.warn('Web Audio Synth failed to initialize: ', e);
    }
  };

  const playSynthChord = () => {
    const ctx = audioContextRef.current;
    if (!ctx || isMuted || !isPlaying) return;

    // Resume context if suspended (browser security policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Choose a chord template
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [349.23, 440.00, 523.25, 659.25], // Fmaj7 (F4, A4, C5, E5)
      [220.00, 277.18, 329.63, 440.00], // A minor 9/7 derivatives
      [293.66, 349.23, 440.00, 587.33]  // Dm7 (D4, F4, A4, D5)
    ];

    const chosenChord = chords[Math.floor(Math.random() * chords.length)];

    chosenChord.forEach((freq, idx) => {
      // Create oscillator
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Soft sine waves with slight triangle warmth
      osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
      osc.frequency.value = freq + (Math.random() * 2 - 1); // Subtle detune for chorusing warmth

      // Humanized slow attack and long dreamy release
      gainNode.gain.setValueAtTime(0, now);
      // Gentle attack
      const attackTime = 0.5 + Math.random() * 0.5;
      gainNode.gain.linearRampToValueAtTime(0.04 - idx * 0.005, now + attackTime);
      
      // Decaying sustain
      const duration = 4.0 + Math.random() * 2.5;
      gainNode.gain.setValueAtTime(0.04 - idx * 0.005, now + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    });
  };

  useEffect(() => {
    // Standard audio player setup
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    return () => {
      audio.pause();
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }
    };
  }, []);

  // Autoplay gesture handler for browsers with strict autoplay policies
  useEffect(() => {
    const handleGesture = () => {
      const audio = audioRef.current;
      if (audio && isPlaying && audio.paused) {
        audio.play().catch((err) => {
          console.warn('Interactive autoplay playback failed: ', err);
        });
        initProceduralSynth();
      }
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };

    if (isPlaying) {
      window.addEventListener('click', handleGesture);
      window.addEventListener('pointerdown', handleGesture);
      window.addEventListener('keydown', handleGesture);
    }

    return () => removeListeners();
  }, [isPlaying, synthInitialized]);

  // Sync state transitions
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      if (isMuted) {
        audio.volume = 0;
      } else {
        audio.volume = 0.35;
      }
      
      // Attempt standard MP3 playback
      audio.play().catch((err) => {
        // Fallback to Web Audio Synth if MP3 is blocked or offline
        console.warn('Audio URL playback blocked/failed, engaging Web Audio Synth fallback.');
        initProceduralSynth();
      });

      // Start Synthesizer scheduling loop (every 5 seconds)
      if (!synthIntervalRef.current) {
        synthIntervalRef.current = window.setInterval(() => {
          playSynthChord();
        }, 5500);
        // Play first chord immediately
        setTimeout(() => playSynthChord(), 500);
      }
    } else {
      audio.pause();
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = null;
      }
    }
  }, [isPlaying, isMuted, synthInitialized]);

  const togglePlay = () => {
    initProceduralSynth();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  return (
    <div
      id="neon_audio_player"
      className="flex items-center gap-3 bg-neutral-900/40 border border-white/5 backdrop-blur-xl px-4 py-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-pink-500/20"
    >
      {/* Dynamic bouncing spectrum visualizer */}
      <div className="flex items-end gap-[2px] h-4 w-5 mr-1 overflow-hidden">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className="w-[2px] bg-pink-400 rounded-t-sm transition-all duration-300 pointer-events-none"
            style={{
              height: isPlaying ? '100%' : '15%',
              animationName: isPlaying ? 'bounce-bars' : 'none',
              animationDuration: isPlaying ? `${0.6 + bar * 0.15}s` : '0s',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationDelay: `${bar * 50}ms`
            }}
          />
        ))}
      </div>

      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase hidden sm:inline select-none">
        {isPlaying ? 'SOUND ON' : 'MUTED'}
      </span>

      <div className="flex items-center gap-1.5 ml-1">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`p-1.5 rounded-full border transition-all duration-300 text-neutral-300 hover:text-white cursor-pointer active:scale-90 ${
            isPlaying
              ? 'bg-pink-500/20 border-pink-500/30 text-pink-400'
              : 'bg-white/5 border-white/5 hover:bg-white/10'
          }`}
          title={isPlaying ? 'Pause Ambient' : 'Play Ambient'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          disabled={!isPlaying}
          className={`p-1.5 rounded-full border transition-all duration-300 cursor-pointer text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none ${
            isMuted ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-transparent border-transparent'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Embedded CSS for custom audio bouncing visualizer animation */}
      <style>{`
        @keyframes bounce-bars {
          0% { height: 15%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
