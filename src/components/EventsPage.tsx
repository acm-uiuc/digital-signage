"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import FeaturedList from '@/components/FeaturedList';
import AllEventsList from '@/components/AllEventsList';
import { Event } from '@/lib/types';
import { processNextOccurrences } from '@/lib/eventProcessor';
import useHourlyRefresh from '@/lib/hooks/useHourlyRefresh';
import { getConfig } from '@/lib/config';

const MAX_FEATURED_ITEMS = 5;
const REFRESH_EVERY_SECONDS = 60 * 2; // every 2 minutes

export function EventsPage({ environment }: { environment: string | null | undefined }) {
    const [allEvents, setAllEvents] = useState<Event[] | null | undefined>(undefined);
    const config = useMemo(() => getConfig(environment || 'default'), [environment]);
    useHourlyRefresh();

    useEffect(() => {
        const fetchAndProcessEvents = async () => {
            const API_URL = 'https://core.acm.illinois.edu/api/v1/events?upcomingOnly=true';
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('API fetch failed');
                const rawEvents: Event[] = await response.json();
                const processed = processNextOccurrences(rawEvents);
                setAllEvents(processed);
            } catch (error) {
                console.error("API fetch failed, using fallback:", error);
                setAllEvents(null);
            }
        };

        fetchAndProcessEvents();

        const interval = setInterval(fetchAndProcessEvents, REFRESH_EVERY_SECONDS * 1000);
        return () => clearInterval(interval);
    }, [config]);

    if (allEvents === undefined) {
        return null;
    }

    if (allEvents === null) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-primary text-secondary-700">
                <h1 className="text-4xl font-bold">An error occurred</h1>
            </main>
        );
    }

    const repeatingEvents = allEvents.filter(e => e.repeats && !e.featured);
    const oneTimeEvents = allEvents.filter(e => !e.repeats && !e.featured);
    const featuredListEvents = allEvents.filter(e => e.featured).slice(0, MAX_FEATURED_ITEMS);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-acmblue" key={environment}>
            <main className="flex flex-grow min-h-0">
                <div className="w-7/12 overflow-y-auto">
                    <FeaturedList events={featuredListEvents} />
                </div>
                <div className="w-5/12 overflow-y-auto">
                    <AllEventsList
                        repeatingEvents={repeatingEvents}
                        oneTimeEvents={oneTimeEvents}
                    />
                </div>
            </main>
            {config.bottomGutterHeight && (
                <div
                    className="flex w-full bg-acmblue"
                    style={{ height: config.bottomGutterHeight }}
                />
            )}
        </div>
    );
}