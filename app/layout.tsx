import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';

import { generateMetadata as meta } from '@/config/meta.config';
import { ErrorHandler } from '@/lib/auth/error/error-handler';

import { SkipNav } from './_components/root-layout/skip-nav';
import { ThemeToggle } from './_components/root-layout/theme-toggle';
import { ThemeProvider } from './_providers/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  return meta({
    title: 'Boiler15 002',
    description: 'Build anything, fast.',
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh scroll-smooth font-sans antialiased`}
      >
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SkipNav />
            <div id="main-root">{children}</div>
            <div className="fixed bottom-4 right-4">
              <ThemeToggle />
            </div>
            <Toaster richColors />
          </ThemeProvider>
        </NuqsAdapter>
        <ErrorHandler />
      </body>
    </html>
  );
}
