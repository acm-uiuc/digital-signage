"use client";

import { useState, useEffect, useMemo } from 'react';
import FeaturedList from '@/components/FeaturedList';
import AllEventsList from '@/components/AllEventsList';
import { Event } from '@/lib/types';
import { processNextOccurrences } from '@/lib/eventProcessor';
import useHourlyRefresh from '@/lib/hooks/useHourlyRefresh';
import { getConfig } from '@/lib/config';
import Image from 'next/image';

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

    const featuredEvents = allEvents.filter(e => e.featured);
    const nonFeaturedEvents = allEvents.filter(e => !e.featured);

    return (
        <div className="flex flex-col h-screen overflow-hidden" key={environment}>
            <main className="flex flex-grow min-h-0">
                <div className={`w-2/3 overflow-hidden ${config.hideRightBar ? "" : "border-r"}`}>
                    <FeaturedList events={featuredEvents} />
                </div>

                {!config.hideRightBar && (
                    <div className="w-1/3 overflow-hidden">
                        <AllEventsList events={nonFeaturedEvents} />
                    </div>
                )}
            </main>

            {!config.hideAcmLogo && (
                <div className="flex w-full items-center bg-acmblue-900 pt-4 pl-8 pb-4 border-t">
                    <Image
                        src="https://static.acm.illinois.edu/banner-white.png"
                        alt="ACM @ UIUC Logo"
                        unoptimized
                        width={100}
                        height={50}
                        className="rounded-lg"
                    />
                </div>
            )}

            {config.bottomGutterHeight && (
                <div
                    className="flex w-full"
                    style={{ height: config.bottomGutterHeight }}
                />
            )}
        </div>
    );
}