"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
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
    const scrollRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const scrollY = useRef(0);
    const lastTime = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        const scrollContent = scrollRef.current;
        if (!scrollContent || !container) return;

        const measureContent = () => {
            if (scrollContent.children.length === 0) {
                setShowScrollIndicator(false);
                return;
            }

            const firstSet = scrollContent.children[0] as HTMLElement;
            const parentHeight = container.clientHeight;
            const contentIsScrollable = firstSet.offsetHeight > parentHeight;

            setShowScrollIndicator(contentIsScrollable);

            // FIX: If scrolling, measure the offset of the second block to get the
            // true loop height, which includes the gap between the two sets.
            if (contentIsScrollable && scrollContent.children.length > 1) {
                const secondSet = scrollContent.children[1] as HTMLElement;
                setContentHeight(secondSet.offsetTop);
            } else {
                setContentHeight(firstSet.offsetHeight);
            }
        };

        // Use ResizeObserver for robust measurement on container or content resize
        const observer = new ResizeObserver(measureContent);
        observer.observe(container);
        observer.observe(scrollContent);

        // Initial measurement
        measureContent();

        return () => observer.disconnect();
    }, [events]);

    useAnimationFrame((time) => {
        if (!scrollRef.current || contentHeight === 0 || !showScrollIndicator) return;

        if (lastTime.current === 0) {
            lastTime.current = time;
            return;
        }

        const deltaTime = (time - lastTime.current) / 1000;
        lastTime.current = time;

        scrollY.current += SCROLL_SPEED_PX_PER_SEC * deltaTime;

        // The modulo operator handles the reset smoothly
        if (scrollY.current >= contentHeight) {
            scrollY.current %= contentHeight;
        }

        if (scrollRef.current) {
            scrollRef.current.style.transform = `translateY(-${scrollY.current}px)`;
        }
    });

    // Reset animation state when events change
    useEffect(() => {
        scrollY.current = 0;
        lastTime.current = 0;
        if (scrollRef.current) {
            scrollRef.current.style.transform = 'translateY(0)';
        }
    }, [events]);

    const renderContent = () => {
        if (!showScrollIndicator) {
            return (
                <div className="grid grid-cols-2 gap-4">
                    {events.map((event, index) => (
                        <EventCard key={`${event.id}-${index}`} event={event} />
                    ))}
                </div>
            );
        }

        return (
            <>
                <div className="grid grid-cols-2 gap-4">
                    {events.map((event, index) => (
                        <EventCard key={`${event.id}-0-${index}`} event={event} />
                    ))}
                    <LoopDivider />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {events.map((event, index) => (
                        <EventCard key={`${event.id}-1-${index}`} event={event} />
                    ))}
                    <LoopDivider />
                </div>
            </>
        );
    };

    return (
        <div className="w-full h-full p-6 flex flex-col">
            <div className="pb-4 border-b border-primary-400/30">
                <div className="flex items-center justify-between">
                    <h1 className="text-5xl font-bold text-white">Featured Events</h1>
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

            <div ref={containerRef} className="flex-grow relative overflow-hidden mt-4">
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary-300 via-primary-300/60 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-300 via-primary-300/60 to-transparent z-10 pointer-events-none" />

                <div
                    ref={scrollRef}
                    className="relative"
                    style={{
                        willChange: showScrollIndicator ? 'transform' : 'auto',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}