import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './_providers/theme-provider';
import { SkipNav } from './_components/root-layout/skip-nav';
import { Toaster } from 'sonner';
import { ThemeToggle } from './_components/root-layout/theme-toggle';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

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
      </body>
    </html>
  );
}
