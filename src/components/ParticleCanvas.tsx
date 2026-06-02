/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
  driftFactor: number;
  driftSpeed: number;
  driftPhase: number;
  glowColor: string;
  type: 'heart' | 'star' | 'bokeh';
  scaleSpeed: number;
  scalePhase: number;
  rotation: number;
  rotationSpeed: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const trailParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; age: number; maxAge: number; opacity: number; color: string; rotation: number; rotationSpeed: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Deeply warm, cozy, and romantic color palette for an intimate aesthetic
    const romanticColors = [
      'rgba(244, 143, 177, opacity)', // soft velvet pink
      'rgba(255, 128, 171, opacity)', // vibrant cozy magenta
      'rgba(240, 98, 146, opacity)',  // deep rose red
      'rgba(255, 171, 145, opacity)', // warm peach glow
      'rgba(255, 204, 188, opacity)', // intimate champagne / rose gold
      'rgba(206, 147, 216, opacity)', // romantic amethyst violet
    ];

    const particles: Particle[] = [];
    // Increase density from 65 to 130 to enrich the ambient field
    const maxParticles = 130;

    // Helper to generate a highly aesthetic romantic particle
    const createParticle = (isInitial = false): Particle => {
      const rand = Math.random();
      let type: 'heart' | 'star' | 'bokeh';
      
      // 35% hearts, 35% large soft bokeh bubbles, 30% tiny stardust
      if (rand < 0.35) {
        type = 'heart';
      } else if (rand < 0.70) {
        type = 'bokeh';
      } else {
        type = 'star';
      }

      let size = 0;
      let speedY = 0;
      let opacity = 0;

      if (type === 'heart') {
        size = Math.random() * 11 + 9; // 9px to 20px
        speedY = Math.random() * 0.35 + 0.25; // Slower float up
        opacity = Math.random() * 0.35 + 0.2; // 0.2 to 0.55
      } else if (type === 'bokeh') {
        size = Math.random() * 45 + 25; // Large soft photography bokeh light
        speedY = Math.random() * 0.18 + 0.1; // Extremely slow drifting
        opacity = Math.random() * 0.11 + 0.03; // Semi-transparent overlay
      } else {
        size = Math.random() * 2.2 + 1.2; // Tiny sparkling stardust
        speedY = Math.random() * 0.5 + 0.3;
        opacity = Math.random() * 0.5 + 0.25;
      }

      return {
        x: Math.random() * width,
        y: isInitial ? Math.random() * height : height + 50,
        size,
        speedY,
        opacity,
        driftFactor: Math.random() * 0.6 + 0.2,
        driftSpeed: Math.random() * 0.008 + 0.003,
        driftPhase: Math.random() * Math.PI * 2,
        glowColor: romanticColors[Math.floor(Math.random() * romanticColors.length)],
        type,
        scaleSpeed: Math.random() * 0.012 + 0.004,
        scalePhase: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.6,
        rotationSpeed: (Math.random() - 0.5) * 0.006,
      };
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    // Drawing helper: Heart with local translation and rotation
    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number, rotation = 0) => {
      c.save();
      c.translate(x, y);
      c.rotate(rotation);
      c.beginPath();
      // Draw standard clean heart with bezier paths centered at (0, 0)
      const topCurveHeight = size * 0.35;
      // Start slightly offset to draw symmetrically
      c.moveTo(0, -size * 0.25);
      c.bezierCurveTo(
        -size * 0.5, -size * 0.65,
        -size * 0.75, 0,
        0, size * 0.65
      );
      c.bezierCurveTo(
        size * 0.75, 0,
        size * 0.5, -size * 0.65,
        0, -size * 0.25
      );
      c.closePath();
      c.restore();
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      cursorRef.current.active = true;

      // Spawn romantic heart and stardust trails on movement
      if (Math.random() > 0.2) {
        trailParticlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2.2,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          size: Math.random() * 9 + 6,
          age: 0,
          maxAge: 55 + Math.random() * 20,
          opacity: 0.9,
          color: romanticColors[Math.floor(Math.random() * romanticColors.length)].replace('opacity', '1'),
          rotation: (Math.random() - 0.5) * 1.5,
          rotationSpeed: (Math.random() - 0.5) * 0.04
        });
      }
    };

    const handleMouseLeave = () => {
      cursorRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Update and draw loop
    const tick = () => {
      // Clear with trail fading to create a smooth, glowing animation trace
      ctx.fillStyle = 'rgba(2, 1, 4, 0.22)'; 
      ctx.fillRect(0, 0, width, height);

      // 1. Process standard floating background particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move upwards slowly
        p.y -= p.speedY;
        p.driftPhase += p.driftSpeed;
        p.x += Math.sin(p.driftPhase) * p.driftFactor * 0.5;

        // Apply rotation to hearts
        p.rotation += p.rotationSpeed;

        // Interactive sway: hover vortex draft (gently sways particles towards or around the cursor)
        if (cursorRef.current.active) {
          const dx = p.x - cursorRef.current.x;
          const dy = p.y - cursorRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const force = (220 - dist) / 220;
            // Swirl effect: add perpendicular force
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle + 0.3) * force * 1.5;
            p.y += Math.sin(angle + 0.3) * force * 0.8;
          }
        }

        // Recycle when floating off screen
        if (p.y < -50 || p.x < -50 || p.x > width + 50) {
          particles[i] = createParticle(false);
          continue;
        }

        // Pulsating size animation
        p.scalePhase += p.scaleSpeed;
        const currentSize = p.size * (1 + Math.sin(p.scalePhase) * 0.1);

        ctx.save();

        if (p.type === 'heart') {
          // Romantic neon hearts with deep soft-glow
          ctx.shadowBlur = 14;
          ctx.shadowColor = p.glowColor.replace('opacity', `${p.opacity * 1.6}`);
          ctx.fillStyle = p.glowColor.replace('opacity', `${p.opacity}`);
          drawHeart(ctx, p.x, p.y, currentSize, p.rotation);
          ctx.fill();
        } else if (p.type === 'bokeh') {
          // High-end camera lens out-of-focus soft bubble (radial gradient glow)
          const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
          radGrad.addColorStop(0, p.glowColor.replace('opacity', `${p.opacity}`));
          radGrad.addColorStop(0.5, p.glowColor.replace('opacity', `${p.opacity * 0.45}`));
          radGrad.addColorStop(1, p.glowColor.replace('opacity', '0'));
          
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Twinkling warm sharp stardust
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#fff5f7';
          ctx.fillStyle = 'rgba(255, 245, 247, ' + p.opacity * (0.85 + Math.sin(p.scalePhase) * 0.15) + ')';
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Process interactive pointer sparkling trails
      const trails = trailParticlesRef.current;
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.x += t.vx;
        t.y += t.vy;
        t.rotation += t.rotationSpeed;
        t.age++;
        t.opacity = 1 - t.age / t.maxAge;

        if (t.age >= t.maxAge) {
          trails.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = t.color;
        ctx.fillStyle = t.color.replace('1)', `${t.opacity * 0.8}`);
        drawHeart(ctx, t.x, t.y, t.size, t.rotation);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="neon_heart_canvas"
      className="absolute inset-0 pointer-events-none block z-0"
    />
  );
}

