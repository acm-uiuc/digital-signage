import { Suspense } from 'react';
import { EventsPage } from '@/components/EventsPage';
import { configs } from '@/lib/config';

export async function generateStaticParams() {
  return [...Object.keys(configs).map(x => ({ "environment": x })), { "environment": "" }]
}

export default function HomePage({ params }: { params: { environment: string } }) {
  return (
    <Suspense>
      <EventsPage environment={params.environment} key={params.environment} />
    </Suspense>
  );
}