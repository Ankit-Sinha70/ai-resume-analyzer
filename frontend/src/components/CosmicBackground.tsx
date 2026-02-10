'use client';

import { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
    twinkleSpeed: number;
    twinklePhase: number;
    color: string;
}

export function CosmicBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const animationFrameRef = useRef<number>();

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

        // Star colors for variety
        const starColors = [
            'rgba(255, 255, 255,',      // White
            'rgba(196, 181, 253,',      // Lavender
            'rgba(167, 139, 250,',      // Light purple
            'rgba(255, 245, 200,',      // Warm white
        ];

        // Initialize stars (MANY more visible stars)
        const initStars = () => {
            const starCount = Math.floor((canvas.width * canvas.height) / 2000); // Much more stars
            starsRef.current = [];

            for (let i = 0; i < starCount; i++) {
                starsRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 3 + 1, // Much larger stars (1-4px)
                    opacity: Math.random() * 0.6 + 0.4, // Very visible (0.4-1.0)
                    speed: Math.random() * 0.08 + 0.02,
                    twinkleSpeed: Math.random() * 0.04 + 0.02,
                    twinklePhase: Math.random() * Math.PI * 2,
                    color: starColors[Math.floor(Math.random() * starColors.length)],
                });
            }
        };
        initStars();

        // Animation loop
        let offset = 0;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Deep space gradient base
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#050816');
            gradient.addColorStop(0.5, '#0a0f1e');
            gradient.addColorStop(1, '#0B1020');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // MUCH MORE VISIBLE nebula layers
            // Purple nebula (left side)
            const nebula1 = ctx.createRadialGradient(
                canvas.width * 0.2,
                canvas.height * 0.3,
                0,
                canvas.width * 0.2,
                canvas.height * 0.3,
                canvas.width * 0.5
            );
            nebula1.addColorStop(0, 'rgba(109, 94, 246, 0.25)');
            nebula1.addColorStop(0.3, 'rgba(139, 92, 246, 0.18)');
            nebula1.addColorStop(0.6, 'rgba(67, 56, 202, 0.10)');
            nebula1.addColorStop(1, 'rgba(11, 16, 32, 0)');
            ctx.fillStyle = nebula1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Blue nebula (right side)
            const nebula2 = ctx.createRadialGradient(
                canvas.width * 0.7,
                canvas.height * 0.6,
                0,
                canvas.width * 0.7,
                canvas.height * 0.6,
                canvas.width * 0.4
            );
            nebula2.addColorStop(0, 'rgba(99, 102, 241, 0.22)');
            nebula2.addColorStop(0.4, 'rgba(79, 70, 229, 0.14)');
            nebula2.addColorStop(1, 'rgba(11, 16, 32, 0)');
            ctx.fillStyle = nebula2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Central glow (galaxy core) - BRIGHTER
            const coreGlow = ctx.createRadialGradient(
                canvas.width * 0.5,
                canvas.height * 0.5,
                0,
                canvas.width * 0.5,
                canvas.height * 0.5,
                canvas.width * 0.3
            );
            coreGlow.addColorStop(0, 'rgba(167, 139, 250, 0.15)');
            coreGlow.addColorStop(0.5, 'rgba(109, 94, 246, 0.08)');
            coreGlow.addColorStop(1, 'rgba(11, 16, 32, 0)');
            ctx.fillStyle = coreGlow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars with BRIGHT twinkling and glow
            offset += 0.15;
            starsRef.current.forEach((star) => {
                const parallaxY = star.y + Math.sin(offset * star.speed) * 4;

                // Strong twinkling effect
                star.twinklePhase += star.twinkleSpeed;
                const twinkle = Math.sin(star.twinklePhase) * 0.4 + 0.6;
                const currentOpacity = star.opacity * twinkle;

                // Draw star with STRONG glow
                ctx.shadowBlur = star.size * 8;
                ctx.shadowColor = `${star.color} ${currentOpacity})`;

                ctx.beginPath();
                ctx.arc(star.x, parallaxY, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `${star.color} ${currentOpacity})`;
                ctx.fill();

                // Add bright core for ALL stars
                ctx.shadowBlur = star.size * 12;
                ctx.shadowColor = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
                ctx.beginPath();
                ctx.arc(star.x, parallaxY, star.size * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
                ctx.fill();

                // Extra glow for larger stars
                if (star.size > 2.5) {
                    ctx.shadowBlur = star.size * 16;
                    ctx.shadowColor = `rgba(196, 181, 253, ${currentOpacity * 0.6})`;
                    ctx.beginPath();
                    ctx.arc(star.x, parallaxY, star.size * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.9})`;
                    ctx.fill();
                }

                ctx.shadowBlur = 0;
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            animate();
        } else {
            // Static background for reduced motion
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#050816');
            gradient.addColorStop(1, '#0B1020');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none -z-10 dark:opacity-100 opacity-0 transition-opacity duration-500"
            aria-hidden="true"
        />
    );
}
