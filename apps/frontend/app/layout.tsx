import type { Metadata } from 'next';
import LayoutShell from '@ui/LayoutShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Credit Chronos - แพลตฟอร์มนิยายทางเลือก with credit',
  description:
    'แพลตฟอร์มการผจญภัยผ่านวิดีโอแบบอินเทอร์แอคทีฟ ที่ทุกทางเลือกของคุณคือกุญแจกำหนดชะตากรรม สัมผัสประสบการณ์การเล่าเรื่องที่สมจริง และระบบติดตามความสำเร็จ with limit credit to play',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased bg-white text-neutral-900" suppressHydrationWarning>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
