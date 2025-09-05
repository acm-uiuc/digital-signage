"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Event } from '@/lib/types';
import { getInformalRepeatString } from '@/lib/eventProcessor';
import { Calendar, MapPin, Repeat } from 'lucide-react';
import { PAGE_SWITCH_INTERVAL_MS as featuredSwitchMs } from './FeaturedList';

const ITEMS_PER_PAGE = 4;
const PAGE_SWITCH_INTERVAL_MS = 10000;
const MAX_DESC_LENGTH = 85;
const CLOSE_ENOUGH_THRESHOLD = 0.75; // Stop if length is > 85% of the max

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
    return (
        <div className="py-3 border-b border-primary-200">
            <h3 className="text-lg font-bold text-secondary-600">{event.title}</h3>
            <div className="flex justify-between items-center text-base text-secondary-800">
                <span>{new Date(event.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - {event.host}</span>
                {event.repeats && (
                    <div className="flex items-center gap-1 text-base font-semibold">
                        <Repeat size={12} />
                        <span>{getInformalRepeatString(event.repeats)}</span>
                    </div>
                )}
            </div>
            <p className="text-base font-light text-white">{getReasonableSlice(event.description)}</p>
            <div className="text-vista_blue-700 text-base pt-1 space-y-2">
                <p className="flex items-center gap-3"><Calendar size={12} /> <span>{new Date(event.start).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })}</span></p>
                <p className="flex items-center gap-3"><MapPin size={12} /> <span>{event.location}</span></p>
            </div>
        </div>
    );
}

function EventPage({ events, pageCount }: { events: Event[], pageCount: number }) {
    const controls = useAnimation();

    useEffect(() => {
        if (pageCount <= 1) return;
        controls.set({ width: "0%" });
        controls.start({
            width: "100%",
            transition: { duration: 0.5, ease: "linear" }
        });
        return () => controls.stop();
    }, [controls, pageCount]);

    const listVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };
    const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };

    return (
        <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute w-full"
        >
            {(pageCount > 1 && featuredSwitchMs !== PAGE_SWITCH_INTERVAL_MS) && (
                <div className="w-full bg-acmblue-300/50 rounded-full h-1 mb-2">
                    <motion.div
                        className="bg-acmorange h-1 rounded-full"
                        animate={controls}
                    />
                </div>
            )}
            {events.map((event) => (
                <motion.div variants={itemVariants} key={event.id}>
                    <EventItem event={event} />
                </motion.div>
            ))}
        </motion.div>
    );
}

function EventSection({ title, events }: { title: string; events: Event[] }) {
    const [currentPage, setCurrentPage] = useState(0);
    const pageCount = Math.ceil(events.length / ITEMS_PER_PAGE);

    // This effect now only handles the page switching timer.
    useEffect(() => {
        if (pageCount <= 1) return;
        const timer = setInterval(() => {
            setCurrentPage((prev) => (prev + 1) % pageCount);
        }, PAGE_SWITCH_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [pageCount]);

    if (events.length === 0) {
        return null;
    }

    const currentEvents = events.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    return (
        <div className="w-full flex flex-col">
            <div className="flex items-center gap-6 pb-4"> {/* Adjusted padding */}
                <h1 className="text-4xl font-extrabold text-white">{title}</h1>
            </div>
            <div className="relative min-h-[450px]">
                <AnimatePresence mode="wait">
                    <motion.div key={currentPage} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <EventPage events={currentEvents} pageCount={pageCount} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function AllEventsList({ repeatingEvents, oneTimeEvents }: { repeatingEvents: Event[]; oneTimeEvents: Event[] }) {
    return (
        <div className="w-full h-full p-8 bg-primary-300/80 flex flex-col gap-y-4 overflow-y-auto">
            <EventSection title="One-Time Events" events={oneTimeEvents} />
            <EventSection title="Repeating Events" events={repeatingEvents} />
        </div>
    );
}