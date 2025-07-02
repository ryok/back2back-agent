import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Back2Back DJ - Human x AI Collaboration',
  description: 'Collaborative DJing between humans and AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}