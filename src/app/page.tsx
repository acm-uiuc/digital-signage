import { Suspense } from 'react';
import { EventsPage } from '@/components/EventsPage';

export default function HomePage() {
    return (
        <Suspense>
            <EventsPage environment="default" key="default" />
        </Suspense>
    );
}