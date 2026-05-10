import { ProjectEntryForm } from '@/app/login/projects/new/ProjectEntryForm';

export const metadata = {
  title: 'Create Project | Vasavi Sridhar',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewProjectPage() {
  return (
    <main className="admin-page">
      <ProjectEntryForm />
    </main>
  );
}
