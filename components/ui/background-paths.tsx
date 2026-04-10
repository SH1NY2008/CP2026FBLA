'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

function FloatingPath({ path }: { path: any }) {
    const [duration, setDuration] = useState(10);

    useEffect(() => {
        setDuration(5 + Math.random() * 5);
    }, []);

    return (
        <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.4}
            pathLength={0.3}
            initial={{ pathOffset: 0 }}
            animate={{ pathOffset: 1 }}
            transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "linear",
            }}
        />
    );
}

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-purple-500/80 dark:text-purple-400/80"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <FloatingPath key={path.id} path={path} />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths() {
    return (
        <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden px-4">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="z-10 text-center max-w-5xl mx-auto">
                <h1
                    className="text-[12vw] leading-[0.9] font-bold tracking-tighter uppercase mb-6 mix-blend-difference"
                >
                    Business
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-600">Boost</span>
                </h1>
                
                <p
                    className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 font-light"
                >
                    Discover local gems, unlock exclusive deals, and support the heartbeat of your community.
                </p>

                <div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <div className="relative group w-full sm:w-auto">
                        <Input
                            placeholder="Search businesses..."
                            className="h-12 w-full sm:w-80 bg-neutral-900/50 border-neutral-800 text-white rounded-full px-6 focus:ring-1 focus:ring-white transition-all duration-300"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    </div>
                    <Button size="lg" className="rounded-full bg-white text-black hover:bg-neutral-200 h-12 px-8 font-medium">
                        Explore Map
                    </Button>
                </div>
            </div>
            
            <div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500"
            >
                <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-neutral-500 to-transparent" />
            </div>
        </section>
    );
}
