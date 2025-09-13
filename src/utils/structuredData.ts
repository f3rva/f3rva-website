/**
 * Structured Data (JSON-LD) generators for F3RVA website
 * Provides schema.org markup for better search engine understanding
 */

export interface OrganizationData {
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone?: string;
    contactType: string;
    email?: string;
  };
}

export interface LocalBusinessData extends OrganizationData {
  '@type': string;
  geo: {
    latitude: number;
    longitude: number;
  };
  areaServed: string;
  priceRange: string;
}

export interface WebsiteData {
  url: string;
  name: string;
  description: string;
  publisher: string;
  potentialAction?: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export interface BreadcrumbData {
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Generate Organization structured data
 */
export const generateOrganizationSchema = (data: OrganizationData) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: {
      '@type': 'ImageObject',
      url: data.logo
    },
    description: data.description,
    sameAs: data.sameAs,
    ...(data.address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: data.address.addressLocality,
        addressRegion: data.address.addressRegion,
        addressCountry: data.address.addressCountry,
        ...(data.address.streetAddress && { streetAddress: data.address.streetAddress })
      }
    }),
    ...(data.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: data.contactPoint.contactType,
        ...(data.contactPoint.telephone && { telephone: data.contactPoint.telephone }),
        ...(data.contactPoint.email && { email: data.contactPoint.email })
      }
    })
  };
};

/**
 * Generate Local Business structured data
 */
export const generateLocalBusinessSchema = (data: LocalBusinessData) => {
  return {
    '@context': 'https://schema.org',
    '@type': data['@type'],
    name: data.name,
    url: data.url,
    logo: {
      '@type': 'ImageObject',
      url: data.logo
    },
    description: data.description,
    sameAs: data.sameAs,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: data.geo.latitude,
      longitude: data.geo.longitude
    },
    areaServed: data.areaServed,
    priceRange: data.priceRange,
    ...(data.address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: data.address.addressLocality,
        addressRegion: data.address.addressRegion,
        addressCountry: data.address.addressCountry,
        ...(data.address.streetAddress && { streetAddress: data.address.streetAddress })
      }
    }),
    ...(data.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: data.contactPoint.contactType,
        ...(data.contactPoint.telephone && { telephone: data.contactPoint.telephone }),
        ...(data.contactPoint.email && { email: data.contactPoint.email })
      }
    })
  };
};

/**
 * Generate Website structured data
 */
export const generateWebsiteSchema = (data: WebsiteData) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    description: data.description,
    publisher: {
      '@type': 'Organization',
      name: data.publisher
    },
    ...(data.potentialAction && {
      potentialAction: {
        '@type': data.potentialAction['@type'],
        target: data.potentialAction.target,
        'query-input': data.potentialAction['query-input']
      }
    })
  };
};

/**
 * Generate Breadcrumb structured data
 */
export const generateBreadcrumbSchema = (data: BreadcrumbData) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.itemListElement.map(item => ({
      '@type': item['@type'],
      position: item.position,
      name: item.name,
      item: item.item
    }))
  };
};

/**
 * Default F3RVA organization data
 */
export const F3RVA_ORGANIZATION_DATA: OrganizationData = {
  name: 'F3RVA',
  url: 'https://f3rva.org',
  logo: 'https://f3rva.org/images/f3-logo.webp',
  description: 'F3RVA - Fitness, Fellowship, Faith in Richmond, Virginia. Building stronger men through community workouts and leadership development.',
  sameAs: [
    'https://facebook.com/F3Richmond',
    'https://instagram.com/F3Richmond',
    'https://x.com/F3Richmond'
  ],
  address: {
    addressLocality: 'Richmond',
    addressRegion: 'Virginia',
    addressCountry: 'US'
  },
  contactPoint: {
    contactType: 'Information',
    email: 'admin@f3rva.org'
  }
};

/**
 * Default F3RVA local business data
 */
export const F3RVA_LOCAL_BUSINESS_DATA: LocalBusinessData = {
  ...F3RVA_ORGANIZATION_DATA,
  '@type': 'SportsActivityLocation',
  geo: {
    latitude: 37.541102,
    longitude: -77.482440
  },
  areaServed: 'Richmond Metropolitan Area, Virginia',
  priceRange: 'Free'
};

/**
 * Default F3RVA website data
 */
export const F3RVA_WEBSITE_DATA: WebsiteData = {
  url: 'https://f3rva.org',
  name: 'F3RVA',
  description: 'F3RVA - Fitness, Fellowship, Faith in Richmond, Virginia. Building stronger men through community workouts and leadership development.',
  publisher: 'F3RVA'
  // removing for now as we do not have search functionality yet
  // potentialAction: {
  //   '@type': 'SearchAction',
  //   target: 'https://f3rva.org/?s={search_term_string}',
  //   'query-input': 'required name=search_term_string'
  // }
};