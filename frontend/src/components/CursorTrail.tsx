'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
    glow: number;
}

export function CursorTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const lastMouseRef = useRef({ x: 0, y: 0, time: 0 });
    const animationFrameRef = useRef<number>();
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Check for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return () => window.removeEventListener('resize', resizeCanvas);
        }

        // Particle colors (cosmic palette)
        const colors = [
            { rgb: '109, 94, 246', name: 'violet' },      // Violet
            { rgb: '139, 92, 246', name: 'purple' },      // Purple
            { rgb: '167, 139, 250', name: 'light-purple' }, // Light purple
            { rgb: '196, 181, 253', name: 'lavender' },   // Pale lavender
            { rgb: '255, 255, 255', name: 'white' },      // White sparkle
        ];

        const createParticle = (x: number, y: number, speed: number) => {
            const colorData = colors[Math.floor(Math.random() * colors.length)];
            const angle = Math.random() * Math.PI * 2;
            const velocity = (Math.random() * 1 + 0.5) * speed;

            return {
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1,
                color: colorData.rgb,
                size: Math.random() * 4 + 3, // Larger particles (3-7px)
                glow: Math.random() * 15 + 10, // Glow size (10-25px)
            };
        };

        const handleMouseMove = (e: MouseEvent) => {
            const now = Date.now();
            const lastMouse = lastMouseRef.current;

            // Calculate movement speed
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const timeDiff = now - lastMouse.time;
            const speed = distance / (timeDiff || 1);

            // Create particles on deliberate movement
            if (speed > 0.3 && distance > 3) {
                // More particles (5-8 per movement)
                const particleCount = Math.min(Math.floor(speed * 0.8), 8);

                for (let i = 0; i < particleCount; i++) {
                    particlesRef.current.push(createParticle(e.clientX, e.clientY, speed));
                }

                setIsActive(true);
            }

            lastMouseRef.current = { x: e.clientX, y: e.clientY, time: now };
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= 0.015; // Slower fade
                particle.vy += 0.03; // Slight gravity
                particle.vx *= 0.99; // Air resistance

                if (particle.life <= 0) return false;

                // Draw particle with enhanced glow
                const alpha = particle.life;

                // Outer glow
                ctx.shadowBlur = particle.glow;
                ctx.shadowColor = `rgba(${particle.color}, ${alpha * 0.6})`;

                // Main particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

                // Gradient fill for shimmer effect
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(${particle.color}, ${alpha})`);
                gradient.addColorStop(1, `rgba(${particle.color}, ${alpha * 0.5})`);

                ctx.fillStyle = gradient;
                ctx.fill();

                // Inner bright core
                ctx.shadowBlur = particle.glow * 0.5;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
                ctx.fill();

                ctx.shadowBlur = 0;

                return true;
            });

            if (particlesRef.current.length === 0) {
                setIsActive(false);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50 dark:opacity-100 opacity-0 transition-opacity duration-500"
            aria-hidden="true"
        />
    );
}
