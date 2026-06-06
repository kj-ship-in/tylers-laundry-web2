import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth';
import { QueryProvider } from '@/providers/query-client-provider';
import { SessionProvider } from '@/providers/session-provider';
import { AuthInitializer } from '@/providers/auth-initializer';
import { Toaster } from 'sonner';
import { authOptions } from './api/auth/[...nextauth]/route';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#2563eb' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://tylerslaundry.com'),
  title: {
    default: "Tyler's Laundry - Premium Laundry & Dry Cleaning Service",
    template: "%s | Tyler's Laundry",
  },
  description:
    'Professional laundry and dry cleaning with convenient pickup & delivery in Banjul. Same-day service, free pickup & delivery. Expert care for all your laundry needs.',
  keywords: [
    'laundry service',
    'dry cleaning',
    'pickup delivery',
    'Banjul laundry',
    'professional cleaning',
    'same-day service',
    'Gambia laundry',
    'laundry Banjul',
    'dry cleaning Gambia',
    'laundry pickup',
    'laundry delivery',
    'professional laundry',
  ],
  authors: [{ name: "Tyler's Laundry", url: 'https://tylerslaundry.com' }],
  creator: "Tyler's Laundry",
  publisher: "Tyler's Laundry",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Business Services',
  classification: 'Laundry and Dry Cleaning Services',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tylerslaundry.com',
    title: "Tyler's Laundry - Premium Laundry Service",
    description:
      'Professional laundry and dry cleaning with free pickup & delivery. Same-day service available in Banjul.',
    siteName: "Tyler's Laundry",
    images: [
      {
        url: '/images/services.jpg',
        width: 1200,
        height: 630,
        alt: "Tyler's Laundry - Professional Laundry Services",
        type: 'image/jpeg',
      },
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: "Tyler's Laundry Logo",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tyler's Laundry - Premium Laundry Service",
    description:
      'Professional laundry and dry cleaning with free pickup & delivery. Same-day service available.',
    creator: '@tylerslaundry',
    images: ['/images/laundry-hero.jpg'],
    site: '@tylerslaundry',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://tylerslaundry.com',
    languages: {
      'en-US': 'https://tylerslaundry.com',
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  other: {
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#2563eb',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: "Tyler's Laundry",
    description:
      'Professional laundry and dry cleaning with convenient pickup & delivery in Banjul. Same-day service, free pickup & delivery.',
    url: 'https://tylerslaundry.com',
    telephone: '+220-7338060', // Replace with actual phone number
    email: 'info@tylerslaundry.com', // Replace with actual email
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kotu',
      addressCountry: 'GM',
      addressRegion: 'West Coast Region',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.4549, // Replace with actual coordinates
      longitude: -16.579,
    },
    openingHours: ['Mo-Sa 08:00-18:00', 'Su 10:00-16:00'],
    priceRange: '$$',
    image: 'https://tylerslaundry.com/images/laundry-hero.jpg',
    sameAs: [
      'https://facebook.com/tylerslaundry',
      'https://instagram.com/tylerslaundry',
      'https://twitter.com/tylerslaundry',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Laundry Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Wash & Fold',
            description: 'Professional washing and folding service',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Dry Cleaning',
            description: 'Professional dry cleaning for delicate garments',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Pickup & Delivery',
            description: 'Free pickup and delivery service',
          },
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <html lang='en'>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <link rel='canonical' href='https://tylerslaundry.com' />
        <link rel='sitemap' type='application/xml' href='/sitemap.xml' />
        <meta name='theme-color' content='#2563eb' />
        <meta name='msapplication-TileColor' content='#2563eb' />
        <meta name='msapplication-config' content='/browserconfig.xml' />
        <link rel='alternate' hrefLang='en' href='https://tylerslaundry.com' />
        <link
          rel='alternate'
          hrefLang='x-default'
          href='https://tylerslaundry.com'
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          <AuthInitializer />
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
        <Toaster position='top-right' richColors />
      </body>
    </html>
  );
}
