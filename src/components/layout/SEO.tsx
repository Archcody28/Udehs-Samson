import { Helmet } from 'react-helmet-async';
import { siteConfig } from '@/lib/data';
import { useContentStore } from '@/hooks/useContentStore';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  pathname?: string;
  type?: string;
  noindex?: boolean;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}

export function SEO({
  title,
  description,
  image,
  pathname = '',
  type = 'website',
  noindex,
  datePublished,
  dateModified,
  author,
}: SEOProps) {
  const { data } = useContentStore();
  const profile = data?.profile;

  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} - ${siteConfig.title}`;
  const fullUrl = `${siteConfig.url}${pathname}`;
  const metaDescription = description || siteConfig.description;

  // Build sameAs from actual profile social URLs (only non-empty)
  const sameAs = [
    profile?.github,
    profile?.linkedin,
    profile?.x,
    profile?.facebook,
  ].filter(Boolean);

  const personData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile?.name || siteConfig.name,
    url: siteConfig.url,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    jobTitle: profile?.title || 'Full Stack Engineer',
    description: metaDescription,
    ...(profile?.avatar ? { image: profile.avatar } : {}),
  };

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: metaDescription,
  };

  const structuredData = type === 'article' && datePublished
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: metaDescription,
        ...(image ? { image } : {}),
        datePublished,
        ...(dateModified ? { dateModified } : {}),
        ...(author ? { author: { '@type': 'Person', name: author } } : {}),
        mainEntityOfPage: fullUrl,
        publisher: {
          '@type': 'Person',
          name: profile?.name || siteConfig.name,
        },
      }
    : personData;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={siteConfig.name} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteConfig.twitter} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {noindex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow" />}

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      {!pathname && <script type="application/ld+json">{JSON.stringify(websiteData)}</script>}
    </Helmet>
  );
}
