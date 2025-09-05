// lib/event-processor.ts

import moment from 'moment-timezone';
import { Event, ValidRepeat } from '@/lib/types'; // Assuming types are in lib/types.ts

// --- CONSTANTS AND MAPPINGS (with corrections) ---
const maxRenderDistance = moment().add(3, 'months');
const repeatMapping: { [k in ValidRepeat]: { increment: number; unit: moment.DurationInputArg2 } } = {
    weekly: { increment: 1, unit: 'week' },
    biweekly: { increment: 2, unit: 'weeks' },
    monthly: { increment: 1, unit: 'month' },
    semianually: { increment: 6, unit: 'months' },
    yearly: { increment: 1, unit: 'year' },
};

/**
 * Creates a human-readable string for an event's recurrence.
 * @param repeats - The repeat frequency of the event.
 * @returns A descriptive string like "Repeats weekly".
 */
export function getRepeatString(repeats: ValidRepeat): string {
    switch (repeats) {
        case 'weekly': return 'Repeats weekly';
        case 'biweekly': return 'Repeats biweekly';
        case 'monthly': return 'Repeats monthly';
        case 'semianually': return 'Repeats every 6 months';
        case 'yearly': return 'Repeats yearly';
        default: return '';
    }
}

/**
 * Processes a raw list of events to find the next valid occurrence of each one.
 * @param eventTemplates - The raw array of events from the API.
 * @returns A clean, chronologically sorted array of the next upcoming events.
 */
export function processNextOccurrences(eventTemplates: Event[]): Event[] {
    const now = moment.tz('America/Chicago');

    const eventsAfterNow = eventTemplates.map((event) => {
        // Handle recurring events
        if (event.repeats && repeatMapping[event.repeats]) {
            const start = moment.tz(event.start, 'America/Chicago');
            const end = event.end ? moment.tz(event.end, 'America/Chicago') : null;
            const repeatEnds = event.repeatEnds ? moment.tz(event.repeatEnds, 'America/Chicago') : maxRenderDistance;
            const { increment, unit } = repeatMapping[event.repeats];
            const excludedDates = new Set(event.repeatExcludes || []);

            // Advance the event's date until it's in the future and not excluded
            while (start.isBefore(now) || excludedDates.has(start.format('YYYY-MM-DD'))) {
                start.add(increment, unit);
                if (end) end.add(increment, unit);
            }

            // If the next occurrence is after its end date, there are no more instances
            if (start.isAfter(repeatEnds)) return null;

            return { ...event, start: start.toISOString(), end: end ? end.toISOString() : undefined };
        }
        // Handle non-repeating events
        return event;
    });

    // Filter out nulls and events that have already ended, then sort
    return eventsAfterNow
        .filter((event): event is Event => {
            if (!event) return false;
            const eventEnd = event.end ? moment(event.end) : moment(event.start).add(1, 'hour');
            return eventEnd.isAfter(now);
        })
        .sort((a, b) => moment(a.start).diff(moment(b.start)));
}