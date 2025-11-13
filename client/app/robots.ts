import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fryzjerpremium.pl';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/cart',
          '/kasa',
          '/konto',
          '/zamowienia',
          '/ustawienia-konta',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

