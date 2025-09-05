// app/page.tsx

"use client";

import { useState, useEffect } from 'react';
import FeaturedList from '@/components/FeaturedList';
import AllEventsList from '@/components/AllEventsList';
import { Event } from '@/lib/types';
import { processNextOccurrences } from '@/lib/eventProcessor';

const MAX_FEATURED_ITEMS = 5;
const REFRESH_EVERY_SECONDS = 60 * 2; // every 2 minutes

export default function HomePage() {
  const [allEvents, setAllEvents] = useState<Event[] | null>(null);

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
        console.error("API fetch failed, processing mock data:", error);
        setAllEvents(null);
      }
    };
    fetchAndProcessEvents();

    const interval = setInterval(fetchAndProcessEvents, REFRESH_EVERY_SECONDS * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!allEvents) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-primary text-secondary-700">
        <h1 className="text-4xl font-bold">Loading Events...</h1>
      </main>
    );
  }

  const repeatingEvents = allEvents.filter(e => e.repeats).filter(e => !e.featured);
  const oneTimeEvents = allEvents.filter(e => !e.repeats).filter(e => !e.featured);

  const featuredListEvents = allEvents.filter(e => e.featured).slice(0, MAX_FEATURED_ITEMS);

  return (
    <main className="flex min-h-screen bg-acmblue">
      <div className="w-7/12">
        <FeaturedList events={featuredListEvents} />
      </div>
      <div className="w-5/12">
        <AllEventsList
          repeatingEvents={repeatingEvents}
          oneTimeEvents={oneTimeEvents}
        />
      </div>
    </main>
  );
}