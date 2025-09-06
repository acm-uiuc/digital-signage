"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
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
    const [memeUrl, setMemeUrl] = useState<null | string | undefined>(undefined)
    const config = useMemo(() => getConfig(environment || 'default'), [environment]);
    const recentlyShown = useRef(new Map<string, number>());


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

    useEffect(() => {
        let timerId: any;
        const API_URL = 'https://meme-api.com/gimme';

        const getMemeAndScheduleNext = async () => {
            const LOOKBACK_MS = 3 * 60 * 60 * 1000;
            const loockBackAgo = Date.now() - LOOKBACK_MS;
            for (const [url, timestamp] of recentlyShown.current.entries()) {
                if (timestamp < loockBackAgo) {
                    recentlyShown.current.delete(url);
                }
            }

            const MAX_FETCH_ATTEMPTS = 3;
            const MAX_DUPLICATE_ATTEMPTS = 15;
            let attempt = 0;
            let success = false;

            while (attempt < MAX_FETCH_ATTEMPTS && !success) {
                try {
                    let duplicateAttempt = 0;
                    while (duplicateAttempt < MAX_DUPLICATE_ATTEMPTS) {
                        const response = await fetch(API_URL);
                        if (!response.ok) {
                            throw new Error(`API request failed with status: ${response.status}`);
                        }
                        const data = await response.json();
                        const isNew = !recentlyShown.current.has(data.url);

                        if (data && !data.nsfw && !data.spoiler && isNew) {
                            recentlyShown.current.set(data.url, Date.now());
                            setMemeUrl(data.url);
                            success = true;
                            break;
                        }
                        duplicateAttempt++;
                    }
                    if (!success) {
                        throw new Error(`Failed to find a new, suitable meme after ${MAX_DUPLICATE_ATTEMPTS} tries.`);
                    }
                } catch (error) {
                    attempt++;
                    console.error(`Attempt ${attempt} to fetch meme failed:`, error);
                    if (attempt < MAX_FETCH_ATTEMPTS) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            if (success) {
                const now = new Date();
                const msUntilNextHour = (59 - now.getMinutes()) * 60 * 1000 + (60 - now.getSeconds()) * 1000;
                console.log("Meme updated. Next refresh is at the top of the hour.");
                timerId = setTimeout(getMemeAndScheduleNext, msUntilNextHour);
            } else {
                console.error("All fetch attempts failed. Retrying in 5 minutes.");
                setMemeUrl(null);
                timerId = setTimeout(getMemeAndScheduleNext, 5 * 60 * 1000);
            }
        };

        getMemeAndScheduleNext();

        return () => clearTimeout(timerId);
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
                    <div>
                        <FeaturedList events={featuredEvents} key={JSON.stringify(config)} />
                    </div>
                    {!config.hideMemeOfTheDay && memeUrl !== null && (
                        <div className="h-1/3 flex flex-col">
                            <h1 className="text-3xl font-extrabold text-white text-center mb-2">Meme of the Hour</h1>
                            <div className="relative flex-1">
                                {memeUrl ?
                                    <Image
                                        src={memeUrl}
                                        alt="ACM @ UIUC Logo"
                                        fill
                                        unoptimized
                                        className="rounded-lg object-contain"
                                    /> : <div className='text-center'>Loading...</div>}
                            </div>
                        </div>
                    )}

                </div>

                {!config.hideRightBar && (
                    <div className="w-1/3 overflow-hidden">
                        <AllEventsList events={nonFeaturedEvents} key={JSON.stringify(config)} />
                    </div>
                )}
            </main>

            {!config.hideAcmLogo && (
                <div className="flex flex-col w-full items-center justify-center bg-acmblue-900 pt-2 pb-4 border-t space-y-4">
                    <div className="flex items-center space-x-4">
                        <Image
                            src="https://static.acm.illinois.edu/banner-white.png"
                            alt="ACM @ UIUC Logo"
                            unoptimized
                            width={100}
                            height={50}
                            className="rounded-lg"
                        />
                        <p className="text-white text-lg font-semibold">The largest computer science organization at UIUC</p>
                    </div>
                    <div className="flex items-center space-x-2 font-mono text-white">
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