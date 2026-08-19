import { Helmet } from 'react-helmet-async';
import { siteConfig } from '@/lib/data';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  pathname?: string;
  type?: string;
  noindex?: boolean;
}

export function SEO({
  title,
  description,
  image = `${siteConfig.url}/og-image.jpg`,
  pathname = '',
  type = 'website',
  noindex,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} - ${siteConfig.title}`;
  const fullUrl = `${siteConfig.url}${pathname}`;
  const metaDescription = description || siteConfig.description;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    url: siteConfig.url,
    sameAs: [
      'https://github.com/udehsamson',
      'https://linkedin.com/in/udehsamson',
      'https://x.com/udehsamson',
    ],
    jobTitle: 'Full Stack Engineer',
    description: metaDescription,
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteConfig.name} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteConfig.twitter} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />

      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {!noindex && <meta name="robots" content="index,follow" />}

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}
