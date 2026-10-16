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
      'DoItForMe.in is the escrow and delivery layer that Almmatix built and operates, and that every Almmatix project is delivered through. Client money is held in escrow before work starts, workers are ID-verified, every delivery carries a 24-hour review window before payout, and copyright is assigned to the client in writing. It also runs an open marketplace where companies post paid work and college-verified Indian students deliver it.',
    ],
    [
      "How does Almmatix protect a client's payment?",
      'Almmatix delivers through DoItForMe.in, an escrow and delivery layer it built and operates. Client money is held in escrow before work starts, the people doing the work are ID-verified, every delivery gets a 24-hour review window before any payout, and copyright in the work is assigned to the client in writing before it is built.',
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
      name: 'App & Web Platform Development',
      description:
        'Mobile apps, web platforms, e-commerce storefronts and marketing sites, engineered from scratch with the copyright assigned to the client in writing.',
    },
    {
      name: 'Custom AI Solutions',
      description:
        'AI assistants and document-processing pipelines trained only on client data, with citation-backed answers and access-level permissions.',
    },
    {
      name: 'Business AI Automation',
      description:
        'Plugin-free Tally, CRM and ERP integration with WhatsApp reminders, UPI payment links and overnight reconciliation and reporting.',
    },
    {
      name: 'AI Voice Agents',
      description:
        'Voice agents for inbound routing, outbound qualification and support, in Hindi, Tamil, Gujarati and Marathi.',
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
