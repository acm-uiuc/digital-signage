"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Event } from '@/lib/types';
import { getInformalRepeatString } from '@/lib/eventProcessor';
import { Calendar, MapPin, Repeat, Star } from 'lucide-react';

const MAX_DESC_LENGTH = 100;
const CLOSE_ENOUGH_THRESHOLD = 0.75;

function getReasonableSlice(s: string): string {
    let finishedSentence = false;
    const words = s.split(" ");
    let output = "";
    for (const word of words) {
        if (output.length + word.length + 1 > MAX_DESC_LENGTH) {
            break;
        }
        output += `${word} `;
        const endsSentence = /[.?!]$/.test(word);
        if (endsSentence && output.length > MAX_DESC_LENGTH * CLOSE_ENOUGH_THRESHOLD) {
            finishedSentence = true;
            break;
        }
    }
    output = output.trim();
    if (output.length < s.length && !finishedSentence) {
        output += "..."
    }
    return output;
}

function EventItem({ event }: { event: Event }) {
    const isOneTime = !event.repeats;
    return (
        <div className={`mb-4 p-4 rounded-lg ${isOneTime
            ? 'bg-gradient-to-r from-acmorange/20 to-acmorange/10 border-l-4 border-acmorange shadow-lg'
            : 'border-l-3'
            }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {isOneTime && <Star className="text-acmorange" size={14} fill="currentColor" />}
                        <h3 className="text-base font-bold text-white">{event.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-base mb-2">
                        <span className={`font-semibold text-secondary-700`}>
                            {event.host}
                        </span>
                        {event.repeats && (
                            <div className="flex items-center gap-1 text-acmblue-200 font-medium">
                                <Repeat size={10} />
                                <span>{getInformalRepeatString(event.repeats)}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-base text-gray-300 mb-2 line-clamp-2">
                        {getReasonableSlice(event.description)}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-vista_blue-600">
                        <span className="flex items-center gap-1"><Calendar size={10} />
                            {new Date(event.start).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })}
                        </span>
                        <span className="flex items-center gap-1"><MapPin size={10} />{event.location}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AllEventsList({ events }: { events: Event[] }) {
    const oneTimeControls = useAnimation();
    const repeatingControls = useAnimation();
    const oneTimeRef = useRef<HTMLDivElement>(null);
    const repeatingRef = useRef<HTMLDivElement>(null);
    const [oneTimeHeight, setOneTimeHeight] = useState(0);
    const [repeatingHeight, setRepeatingHeight] = useState(0);

    const oneTimeEvents = events.filter(e => !e.repeats).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const repeatingEvents = events.filter(e => e.repeats).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const duplicatedOneTimeEvents = oneTimeEvents.length > 0 ? [...oneTimeEvents, ...oneTimeEvents] : [];
    const duplicatedRepeatingEvents = repeatingEvents.length > 0 ? [...repeatingEvents, ...repeatingEvents] : [];

    useEffect(() => {
        if (oneTimeRef.current && oneTimeEvents.length > 0) {
            const height = oneTimeRef.current.scrollHeight / 2;
            const parentHeight = oneTimeRef.current.parentElement?.clientHeight ?? 0;
            if (height > parentHeight) setOneTimeHeight(height);
            else setOneTimeHeight(0);
        }
    }, [oneTimeEvents]);

    useEffect(() => {
        if (oneTimeHeight === 0) {
            oneTimeControls.stop();
            oneTimeControls.set({ y: 0 });
            return;
        };
        const animate = async () => {
            await oneTimeControls.set({ y: 0 });
            await oneTimeControls.start({ y: -oneTimeHeight, transition: { duration: oneTimeHeight / 30, ease: "linear", repeat: Infinity } });
        };
        animate();
        return () => oneTimeControls.stop();
    }, [oneTimeControls, oneTimeHeight]);

    useEffect(() => {
        if (repeatingRef.current && repeatingEvents.length > 0) {
            const height = repeatingRef.current.scrollHeight / 2;
            const parentHeight = repeatingRef.current.parentElement?.clientHeight ?? 0;
            if (height > parentHeight) setRepeatingHeight(height);
            else setRepeatingHeight(0);
        }
    }, [repeatingEvents]);

    useEffect(() => {
        if (repeatingHeight === 0) {
            repeatingControls.stop();
            repeatingControls.set({ y: 0 });
            return;
        }
        const animate = async () => {
            await repeatingControls.set({ y: 0 });
            await repeatingControls.start({ y: -repeatingHeight, transition: { duration: repeatingHeight / 30, ease: "linear", repeat: Infinity } });
        };
        animate();
        return () => repeatingControls.stop();
    }, [repeatingControls, repeatingHeight]);

    if (events.length === 0) {
        return (
            <div className="w-full h-full p-6 bg-primary-300/80 flex flex-col">
                <h2 className="text-3xl font-bold text-white mb-4">All Events</h2>
                <div className="flex-1 flex items-center justify-center text-gray-400">No upcoming events</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-6 bg-primary-300/80 flex flex-col">
            <div className="mb-4">
                <h2 className="text-3xl font-bold text-white mb-2">All Events</h2>
                <div className="flex gap-4 text-sm">
                    {oneTimeEvents.length > 0 && (
                        <div className="flex items-center gap-1.5"><Star className="text-acmorange" size={14} fill="currentColor" /><span className="text-atomic_tangerine font-medium">{oneTimeEvents.length} One-time</span></div>
                    )}
                    {repeatingEvents.length > 0 && (
                        <div className="flex items-center gap-1.5"><Repeat className="text-acmblue-200" size={14} /><span className="text-acmblue-200 font-medium">{repeatingEvents.length} Repeating</span></div>
                    )}
                </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                {oneTimeEvents.length > 0 && (
                    <div className="flex-shrink-0 max-h-[33.33%] relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-primary-300/80 to-transparent z-10" />
                        <motion.div ref={oneTimeRef} animate={oneTimeControls}>
                            {/* MODIFICATION: Conditionally render single or duplicated list */}
                            {(oneTimeHeight > 0 ? duplicatedOneTimeEvents : oneTimeEvents).map((event, index) => (
                                <EventItem key={`${event.id}-ot-${index}`} event={event} />
                            ))}
                        </motion.div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-primary-300/80 to-transparent z-10" />
                    </div>
                )}
                {oneTimeEvents.length > 0 && repeatingEvents.length > 0 && <hr className="border-t border-white/10 my-4" />}
                {repeatingEvents.length > 0 && (
                    <div className="flex-1 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-primary-300/80 to-transparent z-10" />
                        <motion.div ref={repeatingRef} animate={repeatingControls}>
                            {/* MODIFICATION: Conditionally render single or duplicated list */}
                            {(repeatingHeight > 0 ? duplicatedRepeatingEvents : repeatingEvents).map((event, index) => (
                                <EventItem key={`${event.id}-rp-${index}`} event={event} />
                            ))}
                        </motion.div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-primary-300/80 to-transparent z-10" />
                    </div>
                )}
            </div>
        </div>
    );
}