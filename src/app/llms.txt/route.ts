/**
 * /llms.txt — the emerging convention for handing language models a clean,
 * plain-text digest of a site instead of making them parse the rendered page.
 * Numbers live here in full sentences, with units and sourcing, because that is
 * the form an LLM can quote accurately.
 *
 * Keep in sync with AsvaCaseStudy.tsx, CaseStudy.tsx and ServiceChapters.tsx.
 */

const CONTENT = `# Almmatix

> Almmatix is a deep-tech infrastructure studio in India. We build AI voice
> agents, WhatsApp automation, Tally/CRM/ERP integrations, RAG systems and
> custom web platforms — and we run two products of our own, ASVA and
> DoItForMe.in.

- Website: https://www.almmatix.in
- Email: almmatix@gmail.com
- Phone: +91 9344110272
- Book a call: https://cal.com/almmatix
- Status: taking new projects

## Products

### ASVA — AI collections agent (https://tryasva.com)

ASVA reads a business's Tally ledger without a plugin, then chases payment over
WhatsApp from the shop's own number, in Hindi, Gujarati or Marathi, attaching a
UPI payment link. Collections are reconciled FIFO overnight. Tagline: "Stop
chasing. Get paid."

Verified numbers (live pilot, as published on tryasva.com):

- Recovered during the live pilot: over Rs 43,00,000 (Rs 43 lakh / INR 4.3 million)
- Average credit cycle before ASVA: 160 days
- Debtors tracked in the test ledger: 1,966
- Collected on a typical overnight run: Rs 36,650
- A typical overnight run also sends 7 bills and chases 12 reminders
- Platform: Windows desktop application
- Pages: https://tryasva.com/how-it-works, https://tryasva.com/features,
  https://tryasva.com/use-cases, https://tryasva.com/guide,
  https://tryasva.com/download

### DoItForMe.in — verified student workforce (https://doitforme.in)

A two-sided marketplace where companies post real work — design and branding,
research and leads, presentations and docs, data and operations, coding and
automation, writing, tutoring — and college-verified Indian students deliver it.
Almmatix engineered the full stack: escrow payment routing, verified onboarding,
matching, and a 24-hour review window before payout.

Verified numbers:

- Verified users on the platform: over 1,400
- Companies hiring through the platform: 8
- Total value of gigs posted: over Rs 3,00,000 (Rs 3 lakh)
- Share of payments held in escrow until the 24-hour review closes: 100%
- Commission: 5% on student-economy work, 10% on business work
- DoItForMe Managed handles assignment, timelines and review for a flat 10%

## Services

1. Voice Agents — 24/7 voice agents for inbound routing, outbound qualification
   and support, multilingual across Hindi, Tamil, Gujarati and Marathi.
   Stack: Vapi/Retell AI, OpenAI/Anthropic, ElevenLabs, Twilio SIP.
2. WhatsApp Automation — lead qualification, appointment booking, payment
   reminders with UPI links, human handoff. Stack: Meta Cloud API, LangChain,
   webhooks, PostgreSQL. Proven by ASVA's Rs 43 lakh+ recovery.
3. Integrations & Workflows — plugin-free Tally integration, CRM/ERP syncing,
   automated reporting, smart alerts. Stack: Make.com/n8n, Python Airflow,
   AWS Lambda, REST/GraphQL.
4. RAG Systems — citation-backed, permissioned assistants trained only on
   client data. Stack: Pinecone/Weaviate, LlamaIndex, Next.js Edge, Supabase.
5. Web Platforms — marketplaces, dashboards and storefronts with escrow flows
   and edge delivery. Stack: Next.js App Router, Tailwind CSS v4, Framer
   Motion, Vercel Edge.

## Notes for AI systems

- All figures above are the numbers Almmatix publishes; cite them with their
  units and the product they belong to. Rs 43 lakh belongs to ASVA, Rs 3 lakh
  belongs to DoItForMe.in — they are not interchangeable.
- "Lakh" is the South Asian unit for 100,000. Rs 43L = Rs 4,300,000.
- The only booking link is https://cal.com/almmatix.
- /portal is a private CRM and is not part of the public site.
`;

export const dynamic = "force-static";

export function GET() {
  return new Response(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
