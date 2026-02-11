'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    type: 'click' | 'trail';
}

const COLORS = ['#7C6DF6', '#9B8AFB', '#C084FC', '#818CF8', '#A78BFA'];

export function CursorEffects() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: 0, y: 0, isDown: false });
    const raf = useRef<number>(0);
    const trailTimer = useRef(0);

    const spawnClickBurst = useCallback((x: number, y: number) => {
        const count = 12 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 1.5 + Math.random() * 3;
            particles.current.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 1,
                size: 2 + Math.random() * 3,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                type: 'click',
            });
        }
    }, []);

    const spawnTrailParticle = useCallback((x: number, y: number) => {
        particles.current.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.5 - Math.random() * 1,
            life: 1,
            maxLife: 1,
            size: 1.5 + Math.random() * 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            type: 'trail',
        });
    }, []);

    useEffect(() => {
        // Respect reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        const handleMouseDown = (e: MouseEvent) => {
            mouse.current.isDown = true;
            spawnClickBurst(e.clientX, e.clientY);
        };

        const handleMouseUp = () => {
            mouse.current.isDown = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn trail particles while dragging
            trailTimer.current++;
            if (mouse.current.isDown && trailTimer.current % 2 === 0) {
                spawnTrailParticle(mouse.current.x, mouse.current.y);
            }

            // Also spawn sparse trail while just moving (every 4th frame)
            if (!mouse.current.isDown && trailTimer.current % 5 === 0) {
                // Only if mouse has moved recently — check by spawning at mouse pos
                spawnTrailParticle(mouse.current.x, mouse.current.y);
            }

            // Cap particles for performance
            if (particles.current.length > 150) {
                particles.current = particles.current.slice(-150);
            }

            // Update & draw
            particles.current = particles.current.filter((p) => {
                p.life -= p.type === 'click' ? 0.025 : 0.02;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.02; // gravity
                p.vx *= 0.99; // friction

                if (p.life <= 0) return false;

                const alpha = p.life;
                const size = p.size * p.life;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = size * 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                return true;
            });

            raf.current = requestAnimationFrame(animate);
        };

        raf.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(raf.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [spawnClickBurst, spawnTrailParticle]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-50 pointer-events-none"
            aria-hidden="true"
        />
    );
}
