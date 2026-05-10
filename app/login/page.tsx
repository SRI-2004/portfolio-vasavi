import { LoginForm } from '@/app/login/LoginForm';

export const metadata = {
  title: 'Login | Vasavi Sridhar',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="login-page">
      <LoginForm />
    </main>
  );
}
