import type { Metadata } from 'next';
import { PointerProvider } from '@/app/context/PointerContext';
import { LenisScroll } from '@/app/components/LenisScroll';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'A minimalist portfolio with interactive cursor and scroll animations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-black antialiased">
        <PointerProvider>
          <LenisScroll>{children}</LenisScroll>
        </PointerProvider>
      </body>
    </html>
  );
}
