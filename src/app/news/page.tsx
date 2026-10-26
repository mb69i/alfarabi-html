import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import Footer from '@/components/Footer';
import NewsPageClient from './NewsPageClient';

export const metadata: Metadata = {
  title: 'News & Announcements — Alfarabi University AI Engineering',
  description: 'Stay up to date with the latest research breakthroughs, campus events, and department announcements from Al-Farabi University.',
};

interface Article {
  id: string;
  type: string;
  title: string;
  summary: string;
  author: string;
  published_at: string;
  status: string;
}

async function getArticles(): Promise<Article[]> {
  const file = path.join(process.cwd(), 'src', 'data', 'articles.json');
  const raw = await readFile(file, 'utf-8');
  const all: Article[] = JSON.parse(raw);
  return all.filter((a) => a.status === 'published').sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

export default async function NewsPage() {
  const articles = await getArticles();
  return (
    <>
      <NewsPageClient articles={articles} />
      <Footer />
    </>
  );
}
