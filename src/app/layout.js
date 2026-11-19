import { Bricolage_Grotesque, Figtree, Instrument_Serif, Montserrat } from 'next/font/google';
import './globals.css';

// Self-hosted at build time (no request to Google at runtime). Each font exposes a CSS variable that the
// landing-page stylesheets reference through --fd / --fs / --fb and the component styles.
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], axes: ['opsz', 'wdth'], display: 'swap', variable: '--font-bricolage' });
const figtree = Figtree({ subsets: ['latin'], display: 'swap', variable: '--font-figtree' });
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], display: 'swap', variable: '--font-instrument' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '700', '800', '900'], display: 'swap', variable: '--font-montserrat' });

const DESCRIPTION = 'Explore the Dinero Sweeps landing page. Game and platform details are coming soon.';

export const metadata = {
  title: 'Dinero Sweeps | Game Lobby',
  description: DESCRIPTION,
  icons: {
    icon: '/assets/logo-mark.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'Dinero Sweeps',
    title: 'Dinero Sweeps | Game Lobby',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: 'Dinero Sweeps | Game Lobby',
    description: DESCRIPTION,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d0820',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} ${instrumentSerif.variable} ${montserrat.variable}`}>
      <body>
        {/* The loading intro is a JavaScript effect; without scripts it would cover the page for good. */}
        <noscript><style>{'.intro{display:none!important}'}</style></noscript>
        {children}
      </body>
    </html>
  );
}
