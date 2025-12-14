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
    icon: '/favicon.ico',
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