"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Repeat, Users, ChevronDown } from 'lucide-react';
import { Event } from '@/lib/types';
import { getInformalRepeatString } from '@/lib/eventProcessor';

export const SCROLL_SPEED_PX_PER_SEC = 30;

function EventCard({ event }: { event: Event }) {
    return (
        <div className={`
            relative w-full p-4 space-y-2.5
            bg-primary-400/40 border border-primary-300/60
            rounded-lg shadow-md text-lg
            transition-all duration-200 hover:bg-primary-400/50
        `}>
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-white leading-tight">{event.title}</h2>
                {event.host !== "ACM" && (
                    <p className="flex items-center gap-1.5 text-xl font-semibold">
                        <Users size={14} />
                        <span>{event.host}</span>
                    </p>
                )}
            </div>

            <p className="text-white/90 leading-relaxed line-clamp-3">
                {event.description}
            </p>

            <div className="text-secondary-600 space-y-1.5 pt-1">
                <p className="flex items-center gap-1.5">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="truncate">
                        {new Date(event.start).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZone: 'America/Chicago'
                        })}
                    </span>
                </p>
                {event.repeats && (
                    <p className="flex items-center gap-1.5">
                        <Repeat size={14} className="flex-shrink-0" />
                        <span className="truncate">{getInformalRepeatString(event.repeats)}</span>
                    </p>
                )}
                <p className="flex items-center gap-1.5">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                </p>
            </div>
        </div>
    );
}

function LoopDivider() {
    return (
        <div className="col-span-2 my-4 relative">
            <div className="border-t-2 border-dashed border-secondary-500/30"></div>
        </div>
    );
}

export default function FeaturedList({ events }: { events: Event[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [animation, setAnimation] = useState({ duration: 0, height: 0 });
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);

    useEffect(() => {
        if (!containerRef.current || !containerRef.current.parentElement) return;

        const measureContent = () => {
            const container = containerRef.current!;
            const parent = container.parentElement!;

            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.visibility = 'hidden';
            tempDiv.className = container.className;
            tempDiv.innerHTML = container.innerHTML;
            parent.appendChild(tempDiv);

            const singleSetHeight = tempDiv.querySelector('.grid')?.scrollHeight || 0;
            parent.removeChild(tempDiv);

            const viewportHeight = parent.clientHeight;

            if (singleSetHeight > viewportHeight) {
                const duration = singleSetHeight / SCROLL_SPEED_PX_PER_SEC;
                setAnimation({ duration, height: singleSetHeight });
                setShowScrollIndicator(true);
            } else {
                setAnimation({ duration: 0, height: 0 });
                setShowScrollIndicator(false);
            }
        };

        const timeoutId = setTimeout(measureContent, 100);
        return () => clearTimeout(timeoutId);
    }, [events]);

    const isAnimating = animation.duration > 0;

    const renderEventSets = () => {
        if (!isAnimating) {
            return events.map((event, index) => (
                <EventCard key={`${event.id}-${index}`} event={event} />
            ));
        }

        const sets = [];
        for (let setIndex = 0; setIndex < 3; setIndex++) {
            if (setIndex > 0) {
                sets.push(<LoopDivider key={`divider-${setIndex}`} />);
            }


            events.forEach((event, eventIndex) => {
                sets.push(
                    <EventCard
                        key={`${event.id}-${setIndex}-${eventIndex}`}
                        event={event}
                    />
                );
            });
        }
        return sets;
    };

    return (
        <div className="w-full h-full p-6 flex flex-col">
            <div className="pb-4 border-b border-primary-400/30">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">Featured Events</h1>
                    {showScrollIndicator && (
                        <div className="flex items-center gap-2 text-secondary-600 text-sm">
                            <motion.div
                                animate={{ y: [0, 3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ChevronDown size={16} />
                            </motion.div>
                            <span>Auto-scrolling</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-grow relative overflow-hidden mt-4">
                {/* Softer gradients for top and bottom */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary-300 via-primary-300/60 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-300 via-primary-300/60 to-transparent z-10 pointer-events-none" />

                <motion.div
                    ref={containerRef}
                    className="relative"
                    animate={isAnimating ? {
                        y: [0, -animation.height]
                    } : { y: 0 }}
                    transition={isAnimating ? {
                        duration: animation.duration,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "loop"
                    } : undefined}
                    style={{
                        willChange: isAnimating ? 'transform' : 'auto',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        perspective: 1000
                    }}
                >
                    <div className="grid grid-cols-2 gap-4">
                        {renderEventSets()}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}