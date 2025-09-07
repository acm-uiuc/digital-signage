"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Event } from '@/lib/types';
import { getInformalRepeatString } from '@/lib/eventProcessor';
import { Calendar, MapPin, Repeat, Star } from 'lucide-react';

const MAX_DESC_LENGTH = 80; // Reduced from 100
const CLOSE_ENOUGH_THRESHOLD = 0.75;

const UP_NEXT_REPEAT_MS = 60 * 60 * 1000; // 1 hour
const UP_NEXT_NONREPEAT_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

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

function EventItem({ event, isFeatured }: { event: Event, isFeatured?: boolean }) {
    const isOneTime = !event.repeats;
    const hasGradient = isFeatured || isOneTime;

    return (
        <div className={`mb-3 p-3 rounded-lg ${hasGradient // Reduced mb and p
            ? 'bg-gradient-to-r from-acmorange/20 to-acmorange/10 border-l-2 border-acmorange shadow-lg' // Reduced border
            : 'border-l-2' // Reduced border
            }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5"> {/* Reduced gap and mb */}
                        {isOneTime && <Star className="text-acmorange" size={12} fill="currentColor" />} {/* Reduced size */}
                        <h3 className="text-sm font-bold text-white">{event.title}</h3> {/* Reduced text size */}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm mb-1.5"> {/* Reduced gap, text size, mb */}
                        <span className={`font-semibold text-secondary-700`}>
                            {event.host}
                        </span>
                        {event.repeats && (
                            <div className="flex items-center gap-1 text-acmblue-200 font-medium">
                                <Repeat size={8} /> {/* Reduced size */}
                                <span>{getInformalRepeatString(event.repeats)}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-300 mb-1.5 line-clamp-2"> {/* Reduced text size, mb */}
                        {getReasonableSlice(event.description)}
                    </p>
                    <div className="flex flex-wrap gap-2.5 text-xs text-vista_blue-600"> {/* Reduced gap */}
                        <span className="flex items-center gap-1"><Calendar size={8} /> {/* Reduced size */}
                            {new Date(event.start).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })}
                        </span>
                        <span className="flex items-center gap-1"><MapPin size={8} />{event.location}</span> {/* Reduced size */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AllEventsList({ events }: { events: Event[] }) {
    const featuredControls = useAnimation();
    const otherControls = useAnimation();
    const featuredRef = useRef<HTMLDivElement>(null);
    const otherRef = useRef<HTMLDivElement>(null);
    const [featuredHeight, setFeaturedHeight] = useState(0);
    const [otherHeight, setOtherHeight] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log('refreshing')
            setCurrentTime(new Date());
        }, 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    const REPEAT_THRESHOLD = new Date(currentTime.getTime() + UP_NEXT_REPEAT_MS);
    const NONREPEAT_THRESHOLD = new Date(currentTime.getTime() + UP_NEXT_NONREPEAT_MS);

    const featuredEvents = events.filter(event => {
        const eventTime = new Date(event.end || event.start);
        if (eventTime < currentTime) return false;

        const isRepeatingSoon = event.repeats && eventTime <= REPEAT_THRESHOLD;
        const isOneTimeSoon = !event.repeats && eventTime <= NONREPEAT_THRESHOLD;

        return isRepeatingSoon || isOneTimeSoon;
    }).sort((a, b) => {
        if (!a.repeats && b.repeats) return -1;
        if (a.repeats && !b.repeats) return 1;
        return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    const featuredEventIds = new Set(featuredEvents.map(e => e.id));

    const otherEvents = events
        .filter(event => !featuredEventIds.has(event.id) && new Date(event.end || event.start) > currentTime)
        .sort((a, b) => {
            if (!a.repeats && b.repeats) return -1;
            if (a.repeats && !b.repeats) return 1;
            return new Date(a.start).getTime() - new Date(b.start).getTime();
        });

    const duplicatedFeaturedEvents = featuredEvents.length > 0 ? [...featuredEvents, ...featuredEvents] : [];
    const duplicatedOtherEvents = otherEvents.length > 0 ? [...otherEvents, ...otherEvents] : [];

    useEffect(() => {
        if (featuredRef.current && featuredEvents.length > 0) {
            const height = featuredRef.current.scrollHeight / 2;
            const parentHeight = featuredRef.current.parentElement?.clientHeight ?? 0;
            if (height > parentHeight) setFeaturedHeight(height);
            else setFeaturedHeight(0);
        }
    }, [featuredEvents]);

    useEffect(() => {
        if (featuredHeight === 0) {
            featuredControls.stop();
            featuredControls.set({ y: 0 });
            return;
        };
        const animate = async () => {
            await featuredControls.set({ y: 0 });
            await featuredControls.start({ y: -featuredHeight, transition: { duration: featuredHeight / 30, ease: "linear", repeat: Infinity } });
        };
        animate();
        return () => featuredControls.stop();
    }, [featuredControls, featuredHeight]);

    useEffect(() => {
        if (otherRef.current && otherEvents.length > 0) {
            const height = otherRef.current.scrollHeight / 2;
            const parentHeight = otherRef.current.parentElement?.clientHeight ?? 0;
            if (height > parentHeight) setOtherHeight(height);
            else setOtherHeight(0);
        }
    }, [otherEvents]);

    useEffect(() => {
        if (otherHeight === 0) {
            otherControls.stop();
            otherControls.set({ y: 0 });
            return;
        }
        const animate = async () => {
            await otherControls.set({ y: 0 });
            await otherControls.start({ y: -otherHeight, transition: { duration: otherHeight / 30, ease: "linear", repeat: Infinity } });
        };
        animate();
        return () => otherControls.stop();
    }, [otherControls, otherHeight]);

    if (events.length === 0) {
        return (
            <div className="w-full h-full p-5 bg-primary-300/80 flex flex-col"> {/* Reduced p */}
                <h2 className="text-4xl font-extrabold text-white">All Events</h2> {/* Reduced text size */}
                <div className="flex-1 flex items-center justify-center text-gray-400">No upcoming events</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-5 bg-primary-300/80 flex flex-col"> {/* Reduced p */}
            <h2 className="text-3xl font-extrabold text-white mb-1.5">All Events</h2> {/* Reduced text size, mb */}

            <div className="flex-1 flex flex-col min-h-0">
                {featuredEvents.length > 0 && (
                    <>
                        <h3 className="text-lg font-semibold mb-1.5 flex-shrink-0">Up Next</h3> {/* Reduced text size, mb */}
                        <div className="flex-shrink-0 max-h-[40%] relative overflow-hidden mb-3"> {/* Reduced mb */}
                            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-primary-300/80 to-transparent z-10" /> {/* Reduced h */}
                            <motion.div ref={featuredRef} animate={featuredControls}>
                                {(featuredHeight > 0 ? duplicatedFeaturedEvents : featuredEvents).map((event, index) => (
                                    <EventItem key={`${event.id}-featured-${index}`} event={event} isFeatured={true} />
                                ))}
                            </motion.div>
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-primary-300/80 to-transparent z-10" /> {/* Reduced h */}
                        </div>
                    </>
                )}

                {otherEvents.length > 0 && (
                    <>
                        {featuredEvents.length > 0 && <h3 className="text-lg font-semibold text-acmblue-200 mb-1.5 flex-shrink-0">Other Events</h3>}
                        <div className="flex-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-primary-300/80 to-transparent z-10" />
                            <motion.div ref={otherRef} animate={otherControls}>
                                {(otherHeight > 0 ? duplicatedOtherEvents : otherEvents).map((event, index) => (
                                    <EventItem key={`${event.id}-other-${index}`} event={event} />
                                ))}
                            </motion.div>
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-primary-300/80 to-transparent z-10" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}