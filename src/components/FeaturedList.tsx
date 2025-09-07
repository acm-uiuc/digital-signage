"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Repeat, Users } from 'lucide-react';
import { Event } from '@/lib/types';
import { getInformalRepeatString } from '@/lib/eventProcessor';

const SCROLL_SPEED_PX_PER_SEC = 32; // Reduced from 40

function EventCard({ event }: { event: Event }) {
    return (
        <div className="relative w-full p-5 space-y-2.5 bg-acmblue-400/50 border border-acmblue-300 rounded-lg shadow-lg drop-shadow-lg"> {/* Reduced padding and spacing */}
            {event.host !== "ACM" && (
                <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full">
                    <p className="text-base font-semibold tracking-wide flex items-center gap-1.5">
                        <Users size={16} /> {event.host}
                    </p>
                </div>
            )}
            <h2 className="text-xl font-semibold text-white">{event.title}</h2> {/* Reduced text size */}
            <p className="text-sm font-normal text-white">{event.description}</p> {/* Reduced text size */}
            <div className="text-vista_blue-700 text-sm pt-0.5 space-y-1.5"> {/* Reduced text size, padding, spacing */}
                <p className="flex items-center gap-2.5"><Calendar size={14} /> <span>{new Date(event.start).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })}</span></p> {/* Reduced size, gap */}
                {event.repeats && (
                    <div className="flex items-center gap-2.5"> {/* Reduced gap */}
                        <Repeat size={14} /> {/* Reduced size */}
                        <span>{getInformalRepeatString(event.repeats)}</span>
                    </div>
                )}
                <p className="flex items-center gap-2.5"><MapPin size={14} /> <span>{event.location}</span></p> {/* Reduced size, gap */}
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
        <div className="w-full h-full p-6 flex flex-col"> {/* Reduced padding */}
            <div className="pb-6"> {/* Reduced padding */}
                <div className="flex items-center gap-5"> {/* Reduced gap */}
                    <h1 className="text-4xl font-extrabold text-white">Featured Events</h1> {/* Reduced text size */}
                </div>
            </div>
            <div className="flex-grow relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary-300 to-transparent z-10 pointer-events-none" /> {/* Reduced height */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary-300 to-transparent z-10 pointer-events-none" /> {/* Reduced height */}

                <motion.div
                    ref={containerRef}
                    className="relative grid grid-cols-2 gap-5" /* Reduced gap */
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