import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import Footer from '@/components/Footer';
import PortfolioPageClient from './PortfolioPageClient';

export const metadata: Metadata = {
  title: 'Student Portfolio — Alfarabi University AI Engineering',
  description: 'Explore AI Engineering student projects from Al-Farabi University — from NLP models to robotics systems.',
};

interface Project {
  id: string;
  title: string;
  description: string;
  student_name: string;
  cohort: string;
  tags: string[];
  github_url: string;
  demo_url: string;
  status: string;
  submitted_at: string;
}

async function getProjects(): Promise<Project[]> {
  const file = path.join(process.cwd(), 'src', 'data', 'projects.json');
  const raw = await readFile(file, 'utf-8');
  const all: Project[] = JSON.parse(raw);
  return all.filter((p) => p.status === 'approved');
}

export default async function PortfolioPage() {
  const projects = await getProjects();
  return (
    <>
      <PortfolioPageClient projects={projects} />
      <Footer />
    </>
  );
}
