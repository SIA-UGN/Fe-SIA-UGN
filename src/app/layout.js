import { Urbanist } from 'next/font/google';
import './globals.css';
import Providers from './providers';


const urbanist = Urbanist({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-urbanist',
});

export const metadata = {
  title: 'SIAKAD - Universitas Global Nusantara',
  description: 'Sistem Informasi Akademik UGN',
  icons: {
    icon: [
      { rel: 'icon', url: '/icon/favicon.ico' },
      { rel: 'shortcut icon', url: '/icon/favicon.ico' },
    ],
    apple: [
      { rel: 'apple-touch-icon', url: '/icon/apple-touch-icon.png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${urbanist.variable} font-urbanist`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}