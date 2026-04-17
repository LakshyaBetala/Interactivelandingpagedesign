export default function DebugHTMLPage() {
  const services = [
    {
      number: "01",
      title: "Voice Agents",
      subtitle: "Conversational AI",
      description:
        "24/7 human-like voice agents for inbound routing, outbound sales, and customer support. No hold music. No scripts. Just conversations that convert.",
    },
    {
      number: "02",
      title: "WhatsApp Automation",
      subtitle: "Omnichannel Messaging",
      description:
        "Automated lead qualification and omnichannel support across India, LatAm, and Europe. Every conversation tracked, every lead scored.",
    },
    {
      number: "03",
      title: "Internal Workflows",
      subtitle: "Process Intelligence",
      description:
        "Connect CRMs and ERPs with intelligent logic. Eliminate manual data entry. Your team focuses on decisions, not spreadsheets.",
    },
    {
      number: "04",
      title: "RAG Systems",
      subtitle: "Knowledge Intelligence",
      description:
        "Secure, hallucination-free AI assistants trained exclusively on your data. Your knowledge base, instantly searchable by anyone on your team.",
    },
    {
      number: "05",
      title: "Web Platforms",
      subtitle: "Digital Engineering",
      description:
        "High-converting digital platforms with AI built in. Not templates — custom-engineered storefronts and dashboards that actually work.",
    },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1>Almmatix</h1>
        <p>Deep-Tech Infrastructure Studio</p>
        <p>We build the infrastructure. You scale.</p>
        <p>Voice agents. WhatsApp automation. AI systems. Web platforms. Engineered for enterprises that refuse to stay manual.</p>
      </header>
      
      <main>
        <h2>Our Services</h2>
        {services.map((svc) => (
          <article key={svc.number} style={{ marginBottom: '24px' }}>
            <h3>{svc.title}</h3>
            <h4>{svc.subtitle}</h4>
            <p>{svc.description}</p>
          </article>
        ))}
      </main>
      
      <footer>
        <p>Contact: almmatix@gmail.com | Phone: +91 9344110272</p>
      </footer>
    </div>
  );
}
