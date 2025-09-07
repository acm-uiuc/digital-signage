"use client";

import { useState, useEffect, useMemo, ReactNode } from 'react';
import FeaturedList from '@/components/FeaturedList';
import AllEventsList from '@/components/AllEventsList';
import { Event } from '@/lib/types';
import { processNextOccurrences } from '@/lib/eventProcessor';
import usePeriodicRefresh from '@/lib/hooks/usePeriodicRefresh';
import { getConfig } from '@/lib/config';
import Image from 'next/image';

const REFRESH_EVERY_SECONDS = 60 * 2;

export function EventsView({
    environment,
    paperComponent
}: {
    environment: string | null | undefined;
    paperComponent: ReactNode;
}) {
    const [allEvents, setAllEvents] = useState<Event[] | null | undefined>(undefined);
    const config = useMemo(() => getConfig(environment || 'default'), [environment]);

    usePeriodicRefresh();

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
                <div className={`w-2/3 flex flex-col ${config.hideRightBar ? "" : "border-r"}`}>
                    <div className="flex-1 overflow-y-auto">
                        <FeaturedList events={featuredEvents} key={JSON.stringify(config)} />
                    </div>

                    {!config.hideContentOfTheDay && (
                        <div className="mt-auto">
                            {paperComponent}
                        </div>
                    )}
                </div>

                {
                    !config.hideRightBar && (
                        <div className="w-1/3 overflow-hidden">
                            <AllEventsList events={nonFeaturedEvents} key={JSON.stringify(config)} />
                        </div>
                    )
                }
            </main >

            {
                !config.hideAcmLogo && (
                    <div className="flex flex-col w-full items-center justify-center bg-acmblue-900 border-t h-1/4">
                        <div className="flex items-center space-x-4">
                            <Image
                                src="https://static.acm.illinois.edu/banner-white.png"
                                alt="ACM @ UIUC Logo"
                                unoptimized
                                width={60}
                                height={30}
                                className="rounded-lg"
                            />
                            <p className="text-sm text-white font-semibold">The largest computer science organization at UIUC</p>
                        </div>
                        <div className="flex items-center space-x-2 font-mono text-white text-xs">
                            <a href="https://www.acm.illinois.edu/" target="_blank" rel="noopener noreferrer" className="hover:underline ">
                                acm.illinois.edu
                            </a>
                            <span>|</span>
                            <a href="https://go.acm.illinois.edu/discord" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                go.acm.illinois.edu/discord
                            </a>
                            <span>|</span>
                            <a href="https://www.instagram.com/acm.uiuc/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                instagram.com/acm.uiuc
                            </a>
                        </div>
                    </div>
                )
            }

            {
                config.bottomGutterHeight && (
                    <div
                        className="flex w-full"
                        style={{ height: config.bottomGutterHeight }}
                    />
                )
            }
        </div >
    );
}