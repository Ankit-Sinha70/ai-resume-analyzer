'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-lg border border-border bg-card" />
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-lg border border-border bg-card hover:bg-muted
                 flex items-center justify-center transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                 active:scale-95"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
                <Moon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            )}
        </button>
    );
}
