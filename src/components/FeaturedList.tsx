"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Repeat, Users } from 'lucide-react';
import { Event } from '@/lib/types';
import { getInformalRepeatString } from '@/lib/eventProcessor';

const SCROLL_SPEED_PX_PER_SEC = 32;

function EventCard({ event }: { event: Event }) {
    return (
        // Increased padding and spacing
        <div className="relative w-full p-6 space-y-3.5 bg-acmblue-400/50 border border-acmblue-300 rounded-lg shadow-lg drop-shadow-lg">
            {event.host !== "ACM" && (
                <div className="absolute top-4 right-4 text-sm font-bold px-3 py-1 rounded-full">
                    <p className="text-lg font-semibold tracking-wide flex items-center gap-2">
                        <Users size={20} /> {event.host}
                    </p>
                </div>
            )}
            <h2 className="text-2xl font-semibold text-white">{event.title}</h2>
            <p className="text-base font-normal text-white">{event.description}</p>
            <div className="text-vista_blue-700 text-base pt-1 space-y-2">
                <p className="flex items-center gap-3"><Calendar size={18} /> <span>{new Date(event.start).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })}</span></p>
                {event.repeats && (
                    <div className="flex items-center gap-3">
                        <Repeat size={18} />
                        <span>{getInformalRepeatString(event.repeats)}</span>
                    </div>
                )}
                <p className="flex items-center gap-3"><MapPin size={18} /> <span>{event.location}</span></p>
            </div>
        </div>
    );
}

export default function FeaturedList({ events }: { events: Event[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [animation, setAnimation] = useState({ duration: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current || !containerRef.current.parentElement) return;

        const measureContent = () => {
            const contentHeight = containerRef.current!.scrollHeight / 2;
            const viewportHeight = containerRef.current!.parentElement!.clientHeight;

            if (contentHeight > viewportHeight) {
                const duration = contentHeight / SCROLL_SPEED_PX_PER_SEC;
                setAnimation({ duration, height: contentHeight });
            } else {
                setAnimation({ duration: 0, height: 0 });
            }
        };

        const timeoutId = setTimeout(measureContent, 100);
        return () => clearTimeout(timeoutId);

    }, [events]);

    const isAnimating = animation.duration > 0;
    const eventList = isAnimating ? [...events, ...events] : events;

    return (
        // Increased padding
        <div className="w-full h-full p-8 flex flex-col">
            {/* Increased padding */}
            <div className="pb-8">
                {/* Increased gap */}
                <div className="flex items-center gap-6">
                    {/* Increased text size */}
                    <h1 className="text-5xl font-extrabold text-white">Featured Events</h1>
                </div>
            </div>
            <div className="flex-grow relative overflow-hidden">
                {/* Increased gradient height */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary-300 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary-300 to-transparent z-10 pointer-events-none" />

                <motion.div
                    ref={containerRef}
                    // Increased gap
                    className="relative grid grid-cols-2 gap-6"
                    animate={isAnimating ? { y: [0, -animation.height] } : { y: 0 }}
                    transition={isAnimating ? {
                        duration: animation.duration,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "loop"
                    } : undefined}
                >
                    {eventList.map((event, index) => (
                        <EventCard key={`${event.id}-${index}`} event={event} />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}