import '../globals.css';

import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/providers/auth-provider';

import { cn } from '@/lib/utils';
import NavBar from '@/components/nav-bar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Entertainment Web App',
  description: 'Entertainment Web App by Frontend Mentor',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <html lang='en' className='dark' style={{ colorScheme: 'dark' }}>
        <body className={cn(`${inter.className} bg-appBackground dark flex flex-col overflow-x-hidden`)}>
          <main className='flex flex-col overflow-x-hidden'>
            <NavBar />
            <div className='container min-h-[100dvh] flex-1'>{children}</div>
            <footer className='p-10'></footer>
          </main>
        </body>
      </html>
    </AuthProvider>
  );
}
