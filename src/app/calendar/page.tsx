import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import CalendarPageClient from './CalendarPageClient';

export const metadata: Metadata = {
  title: 'University Calendar — Alfarabi University AI Engineering',
  description: 'All upcoming events, deadlines, and seminars across all cohorts at Al-Farabi University.',
};

interface CalendarEvent {
  id: string;
  type: string;
  title: string;
  summary: string;
  author: string;
  published_at: string;
  event_date?: string;
  status: string;
  category?: string;
  location?: string;
  time?: string;
  cohort?: string;
}

async function getEvents(): Promise<CalendarEvent[]> {
  const file = path.join(process.cwd(), 'src', 'data', 'articles.json');
  const raw = await readFile(file, 'utf-8');
  const all: CalendarEvent[] = JSON.parse(raw);
  return all
    .filter((a) => a.type === 'event' && a.status === 'published')
    .sort((a, b) =>
      new Date(a.event_date ?? a.published_at).getTime() -
      new Date(b.event_date ?? b.published_at).getTime()
    );
}

export default async function CalendarPage() {
  const events = await getEvents();
  return <CalendarPageClient events={events} />;
}
