import { Suspense } from 'react';
import { EventsView } from '@/components/EventsView';
import PaperOfTheDay from '@/components/PaperOfTheDay';

type EnvironmentPageProps = {
  params: Promise<{
    environment: string;
  }>;
};

export default async function EnvironmentPage({ params }: EnvironmentPageProps) {

  const { environment } = await params;

  return (
    <EventsView
      environment={environment}
      paperComponent={
        <Suspense fallback={
          <div className="p-4 bg-gray-800 rounded-lg h-full flex items-center justify-center text-white">
            Loading Paper...
          </div>
        }>
          <PaperOfTheDay />
        </Suspense>
      }
    />
  );
}