import './globals.css';

export const metadata = {
  title: 'Dinero Sweeps | Free-to-Play Social Casino',
  description: 'Slots, fish games and eleven game platforms in one glowing lobby. Always free to play.',
  icons: {
    icon: [{ url: '/assets/logo-mark.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'Dinero Sweeps | Free-to-Play Social Casino',
  },
  twitter: {
    title: 'Dinero Sweeps | Free-to-Play Social Casino',
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Figtree:wght@400..800&family=Instrument+Serif:ital@0;1&family=Montserrat:wght@600;700;800;900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
