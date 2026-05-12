import type { Metadata } from 'next';
import { Instrument_Sans } from 'next/font/google';
import { PointerProvider } from '@/app/context/PointerContext';
import { LenisScroll } from '@/app/components/LenisScroll';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
});

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
    <html lang="en" className={`${instrumentSans.className} scroll-smooth`}>
      <body className="bg-white text-[#191919] antialiased">
        <PointerProvider>
          <LenisScroll>{children}</LenisScroll>
        </PointerProvider>
      </body>
    </html>
  );
}
