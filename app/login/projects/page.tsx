import { ProjectDashboard } from '@/app/login/projects/ProjectDashboard';

export const metadata = {
  title: 'Project Dashboard | Vasavi Sridhar',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminProjectsPage() {
  return (
    <main className="admin-page">
      <ProjectDashboard />
    </main>
  );
}
