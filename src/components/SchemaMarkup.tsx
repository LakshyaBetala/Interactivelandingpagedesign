// JSON-LD Structured Data for SEO

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Almmatix',
    url: 'https://www.almmatix.in',
    logo: 'https://www.almmatix.in/images/almmatix_logo.png',
    email: 'almmatix@gmail.com',
    telephone: '+919344110272',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    sameAs: [],
    description:
      'Almmatix builds AI voice agents, WhatsApp automation bots, RAG systems, and custom web platforms for enterprises.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Almmatix',
    url: 'https://www.almmatix.in',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServicesSchema() {
  const services = [
    {
      name: 'AI Voice Agents',
      description:
        '24/7 human-like voice agents for inbound routing, outbound sales, and customer support.',
    },
    {
      name: 'WhatsApp Automation',
      description:
        'Automated lead qualification and omnichannel support across WhatsApp with smart conversation flows.',
    },
    {
      name: 'Internal Workflow Automation',
      description:
        'Connect CRMs and ERPs with intelligent automation. Eliminate manual data entry.',
    },
    {
      name: 'RAG Systems',
      description:
        'Secure, hallucination-free AI assistants trained exclusively on your enterprise data.',
    },
    {
      name: 'Web Platform Development',
      description:
        'High-converting digital platforms with AI built in — custom-engineered storefronts and dashboards.',
    },
  ];

  const schema = services.map((service) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: {
      '@type': 'Organization',
      name: 'Almmatix',
    },
    name: service.name,
    description: service.description,
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
