// JSON-LD Structured Data for SEO

const SITE = 'https://www.almmatix.in';

/** Reusable node so every schema points at the same organization entity. */
const ORG_REF = { '@type': 'Organization', name: 'Almmatix', '@id': `${SITE}/#organization` };

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: 'Almmatix',
    url: SITE,
    logo: `${SITE}/images/almmatix_logo.png`,
    email: 'almmatix@gmail.com',
    telephone: '+919344110272',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    sameAs: ['https://tryasva.com', 'https://doitforme.in'],
    description:
      'Almmatix builds AI voice agents, WhatsApp automation bots, Tally and ERP integrations, RAG systems, and custom web platforms for enterprises.',
    owns: [{ '@id': `${SITE}/#asva` }, { '@id': `${SITE}/#doitforme` }],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'almmatix@gmail.com',
      telephone: '+919344110272',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi', 'ta', 'gu', 'mr'],
      url: 'https://cal.com/almmatix',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * The two products, with every published metric attached as a typed
 * PropertyValue. This is what lets an AI system answer "how much has ASVA
 * recovered?" without having to scrape the rendered page.
 */
export function ProductsSchema() {
  const asva = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE}/#asva`,
    name: 'ASVA',
    alternateName: 'ASVA by Almmatix',
    url: 'https://tryasva.com',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Accounts Receivable / Payment Collections',
    operatingSystem: 'Windows',
    inLanguage: ['en', 'hi', 'gu', 'mr'],
    slogan: 'Stop chasing. Get paid.',
    description:
      "ASVA is an AI collections agent that reads a business's Tally ledger without a plugin and chases payment over WhatsApp from the business's own number, attaching a UPI payment link in Hindi, Gujarati or Marathi, then reconciles collections FIFO overnight.",
    publisher: ORG_REF,
    author: ORG_REF,
    featureList: [
      'Plugin-free Tally ledger integration',
      "Sends from the business's own WhatsApp number",
      'UPI payment links attached to every reminder',
      'Hindi, Gujarati and Marathi messaging',
      'FIFO reconciliation of incoming payments',
      'Nightly automated collection runs',
    ],
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Amount recovered during live pilot',
        value: 4300000,
        unitText: 'INR',
        description: 'Over Rs 43 lakh (Rs 43,00,000) recovered for pilot customers.',
      },
      {
        '@type': 'PropertyValue',
        name: 'Average credit cycle before ASVA',
        value: 160,
        unitText: 'DAY',
        description: 'Customers waited an average of 160 days to be paid before deploying ASVA.',
      },
      {
        '@type': 'PropertyValue',
        name: 'Debtors tracked in test ledger',
        value: 1966,
        description: 'Individual debtor accounts read directly from Tally.',
      },
      {
        '@type': 'PropertyValue',
        name: 'Amount collected on a typical overnight run',
        value: 36650,
        unitText: 'INR',
        description: 'A representative nightly run also sends 7 bills and chases 12 reminders.',
      },
    ],
  };

  const doitforme = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${SITE}/#doitforme`,
    name: 'DoItForMe.in',
    url: 'https://doitforme.in',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Freelance Marketplace',
    browserRequirements: 'Requires JavaScript',
    inLanguage: 'en',
    slogan: "India's verified student workforce",
    description:
      'DoItForMe.in is a two-sided marketplace where companies post paid work — design, research, presentations, data, coding, writing and tutoring — and college-verified Indian students deliver it, with escrow payment routing and a 24-hour review window before payout. Engineered end to end by Almmatix.',
    publisher: ORG_REF,
    author: ORG_REF,
    featureList: [
      'College-verified student profiles',
      'Escrow-protected payment routing',
      '24-hour client review window before payout',
      'Manual or automated student matching',
      'UPI payouts to students',
      'DoItForMe Managed: assignment, timelines and review for a flat 10%',
    ],
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/RegisterAction',
      userInteractionCount: 1400,
      description: 'Over 1,400 verified users registered on the platform.',
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Verified users',
        value: 1400,
        description: 'Over 1,400 students onboarded and ID-checked.',
      },
      {
        '@type': 'PropertyValue',
        name: 'Companies hiring',
        value: 8,
        description: 'Companies posting paid work on the platform.',
      },
      {
        '@type': 'PropertyValue',
        name: 'Total value of gigs posted',
        value: 300000,
        unitText: 'INR',
        description: 'Over Rs 3 lakh (Rs 3,00,000) in work posted through the platform.',
      },
      {
        '@type': 'PropertyValue',
        name: 'Payments held in escrow',
        value: 100,
        unitText: 'P1',
        description: '100% of payments are held in escrow until the 24-hour review window closes.',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([asva, doitforme]) }}
    />
  );
}

/**
 * The same figures restated as natural-language question/answer pairs. Retrieval
 * systems quote prose far more reliably than they read a PropertyValue, so the
 * numbers are deliberately stated twice in two different shapes.
 */
export function FAQSchema() {
  const qa: [string, string][] = [
    [
      'What is ASVA?',
      "ASVA is an AI collections agent built by Almmatix. It reads a business's Tally ledger without needing a plugin, then chases outstanding payments over WhatsApp from the business's own number in Hindi, Gujarati or Marathi, attaching a UPI payment link. Collections are reconciled FIFO overnight. It runs as a Windows application and is available at tryasva.com.",
    ],
    [
      'How much money has ASVA recovered?',
      'ASVA has recovered over Rs 43 lakh (Rs 43,00,000, roughly INR 4.3 million) during its live pilot.',
    ],
    [
      'What problem does ASVA solve?',
      'Indian distributors and wholesalers wait an average of 160 days to get paid, and collections normally require someone to phone every debtor. ASVA automates that chase. In one pilot ledger it tracks 1,966 debtors, and a typical overnight run sends 7 bills, chases 12 reminders and collects Rs 36,650.',
    ],
    [
      'What is DoItForMe.in?',
      "DoItForMe.in is India's verified student workforce marketplace, engineered end to end by Almmatix. Companies post paid work — design and branding, research and leads, presentations, data and operations, coding and automation, writing and tutoring — and college-verified students deliver it. Payments are escrow-protected with a 24-hour review window before payout.",
    ],
    [
      'How many users does DoItForMe.in have?',
      'DoItForMe.in has over 1,400 verified users and 8 companies hiring through the platform, with over Rs 3 lakh (Rs 3,00,000) in gigs posted. 100% of payments are held in escrow until the 24-hour review window closes.',
    ],
    [
      'What does Almmatix build?',
      'Almmatix is a deep-tech infrastructure studio. It builds AI voice agents, WhatsApp automation, plugin-free Tally and CRM/ERP integrations, RAG systems, and custom web platforms including marketplaces and dashboards. It also runs two products of its own: ASVA and DoItForMe.in.',
    ],
    [
      'How do I contact Almmatix or book a call?',
      'Book a 15-minute call at https://cal.com/almmatix, email almmatix@gmail.com, or call +91 9344110272.',
    ],
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
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
    '@id': `${SITE}/#website`,
    name: 'Almmatix',
    url: SITE,
    inLanguage: 'en-IN',
    publisher: ORG_REF,
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
      name: 'Integrations & Workflow Automation',
      description:
        'Connect Tally, CRMs and ERPs with intelligent automation. Eliminate manual data entry.',
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
    provider: ORG_REF,
    areaServed: 'IN',
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
