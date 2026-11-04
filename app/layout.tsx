import type {Metadata} from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Lumina CineClub - Rede Social para Cinéfilos',
  description: 'Rede social cinematográfica: cadastre seus filmes favoritos, visite perfis de outros cinéfilos, avalie e troque opiniões e recados com a comunidade.',
  openGraph: {
    title: 'Lumina CineClub - Rede Social para Cinéfilos',
    description: 'Rede social cinematográfica: cadastre seus filmes favoritos, visite perfis de outros cinéfilos, avalie e troque opiniões e recados com a comunidade.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumina CineClub - Rede Social para Cinéfilos',
    description: 'Rede social cinematográfica: cadastre seus filmes favoritos, visite perfis de outros cinéfilos, avalie e troque opiniões e recados com a comunidade.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${plusJakartaSans.variable} dark`}>
      <body className="bg-[#060D0B] text-[#F0FDF8] antialiased selection:bg-[#00D2FF]/30 selection:text-[#00D2FF]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
