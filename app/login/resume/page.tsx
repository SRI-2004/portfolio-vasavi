import { ResumeUploadForm } from '@/app/login/resume/ResumeUploadForm';

export const metadata = {
  title: 'Resume Upload | Vasavi Sridhar',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResumeUploadPage() {
  return (
    <main className="admin-page">
      <ResumeUploadForm />
    </main>
  );
}
