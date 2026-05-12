import { PlayPageEditor } from '@/app/login/play/PlayPageEditor';

export const metadata = {
  title: 'Edit Play Page | Vasavi Sridhar',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPlayPage() {
  return (
    <main className="admin-page">
      <PlayPageEditor />
    </main>
  );
}
