import type { Metadata } from 'next';
import { PointerProvider } from '@/app/context/PointerContext';
import { LenisScroll } from '@/app/components/LenisScroll';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vasavi Sridhar',
  description: 'Inter-disciplinary design futurist portfolio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#EFEDEA] text-[#191919] antialiased">
        <PointerProvider>
          <LenisScroll>{children}</LenisScroll>
        </PointerProvider>
      </body>
    </html>
  );
}
