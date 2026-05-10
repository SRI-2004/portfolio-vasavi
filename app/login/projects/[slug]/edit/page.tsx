import { EditProjectClient } from '@/app/login/projects/[slug]/edit/EditProjectClient';

export const metadata = {
  title: 'Edit Project | Vasavi Sridhar',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="admin-page">
      <EditProjectClient slug={slug} />
    </main>
  );
}
