import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetailView } from '@/app/components/ProjectDetailView';
import { getProjectBySlug } from '@/app/data/projectQueries';

type ResearchPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: ResearchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, 'research');

  if (!project) {
    return {
      title: 'Research not found | Vasavi Sridhar',
    };
  }

  return {
    title: `${project.title} | Vasavi Sridhar`,
    description: project.detail.headline,
  };
}

export default async function ResearchDetailPage({ params }: ResearchPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, 'research');

  if (!project) notFound();

  return <ProjectDetailView project={project} activeItem="research" />;
}
