import { useEffect } from 'react';

export function LocalBusinessSchema() {
  useEffect(() => {
    const existing = document.getElementById('schema-localbusiness');
    if (existing) return;
    const script = document.createElement('script');
    script.id = 'schema-localbusiness';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'AIRCONFORTHABITAT',
      url: 'https://airconforthabitat.fr',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      telephone: '+33-6-00-00-00-00',
      email: 'contact@airconforthabitat.fr',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '2 Place Saint-Maurice',
        addressLocality: 'Vienne',
        postalCode: '38200',
        addressCountry: 'FR',
      },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '18:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '12:00' },
      ],
      priceRange: '€€',
      areaServed: 'FR',
    });
    document.head.appendChild(script);
  }, []);
  return null;
}

export function ProductSchema({ product }) {
  useEffect(() => {
    const existing = document.getElementById('schema-product');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'schema-product';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.name,
      sku: product.id,
      image: product.imageUrl || undefined,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      offers: {
        '@type': 'Offer',
        price: product.salePrice || product.price,
        priceCurrency: 'EUR',
        availability: product.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    });
    document.head.appendChild(script);
  }, [product]);
  return null;
}
