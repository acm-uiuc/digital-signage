// components/FeaturedList.tsx

"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '@/lib/types';

const ITEMS_PER_PAGE = 4;
export const PAGE_SWITCH_INTERVAL_MS = 10000;

function EventCard({ event }: { event: Event }) {
    return (
        <div className="relative w-full p-6 space-y-3 bg-yale_blue-400/50 border border-yale_blue-300 rounded-xl shadow-lg">
            {event.host !== "ACM" && (
                <div className="absolute top-4 right-4 bg-atomic_tangerine text-yale_blue-100 text-xs font-bold px-2.5 py-1 rounded-full">
                    <p className="text-cambridge_blue text-lg font-semibold tracking-wide flex items-center gap-2">
                        <Users size={20} /> {event.host}
                    </p>
                </div>
            )}
            <h2 className="text-3xl font-semibold text-white">{event.title}</h2>
            <p className="text-base font-light text-white">{event.description}</p>
            <div className="text-vista_blue-700 text-lg pt-1 space-y-2">
                <p className="flex items-center gap-3"><Calendar size={18} /> <span>{new Date(event.start).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })}</span></p>
                <p className="flex items-center gap-3"><MapPin size={18} /> <span>{event.location}</span></p>
            </div>
        </div>
    );
}

function PageContent({ events, pageCount }: { events: Event[], pageCount: number }) {
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

    return (
        <div className="space-y-6 absolute w-full">
            {pageCount > 1 && (
                <div className="w-full bg-yale_blue-300/50 rounded-full h-1.5">
                    <motion.div
                        className="bg-acmorange h-1.5 rounded-full"
                        animate={controls}
                    />
                </div>
            )}
            {events.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
}

export default function FeaturedList({ events }: { events: Event[] }) {
    const [currentPage, setCurrentPage] = useState(0);

    const pageCount = Math.ceil(events.length / ITEMS_PER_PAGE);
    const currentEvents = events.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    useEffect(() => {
        if (pageCount <= 1) return;
        const timer = setInterval(() => {
            setCurrentPage((prevPage) => (prevPage + 1) % pageCount);
        }, PAGE_SWITCH_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [pageCount]);

    const slideVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <div className="w-full h-full p-8 flex flex-col">
            <div className="pb-8">
                <div className="flex items-center gap-6">
                    <h1 className="text-5xl font-extrabold text-white">Featured Events</h1>
                </div>
            </div>
            <div className="flex-grow relative">
                <Image
                    src="https://static.acm.illinois.edu/banner-white.png"
                    alt="ACM Illinois Logo"
                    width={160}
                    height={80}
                    className="rounded-lg absolute bottom-0 left-0 z-10"
                />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                        <PageContent events={currentEvents} pageCount={pageCount} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}