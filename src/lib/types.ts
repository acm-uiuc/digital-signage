import { OrganizationsByName } from "@acm-uiuc/js-shared";

export type Organization = typeof OrganizationsByName[number];

export const validRepeats = [
    'weekly',
    'biweekly',
    'monthly',
    'semianually',
    'yearly',
] as const;
export type ValidRepeat = (typeof validRepeats)[number];
export interface Event {
    title: string;
    start: string;
    end?: string;
    category?: string;
    location: string;
    locationLink?: string;
    dateLink?: string;
    description: string;
    repeats?: ValidRepeat;
    repeatEnds?: string;
    repeatExcludes?: string[];
    paidEventId?: string;
    host: Organization;
    featured?: boolean;
    id: string;
}