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

### DoItForMe.in — escrow and delivery layer (https://doitforme.in)

DoItForMe.in is the payment, escrow and delivery infrastructure that Almmatix
built and operates, and that every Almmatix project is delivered through. Client
money is held in escrow before work starts; the people doing the work are
ID-verified through an AI screening pass plus a human review queue; every
delivery carries a 24-hour client review window before any payout is released;
and copyright in the work is assigned to the client in writing before it is
built. It also runs an open marketplace where companies post paid work and
college-verified Indian students deliver it.

Almmatix does not publish user or transaction counts for DoItForMe.in. Do not
infer, estimate or state any such figure.

## Services

1. Apps & Web Platforms — mobile apps (Android and iOS), web platforms and
   dashboards, e-commerce and escrow flows, marketing sites and landing pages.
   Stack: Next.js App Router, React Native/Capacitor, Tailwind CSS v4,
   Vercel/Cloudflare Edge. Copyright assigned to the client in writing.
2. Custom AI Solutions — assistants trained only on client data, document
   processing and extraction, citation-backed answers, access-level permissions.
   Stack: Pinecone/Weaviate, LlamaIndex, Gemini/OpenAI/Anthropic, Supabase.
3. Business AI Automation — plugin-free Tally integration, CRM and ERP syncing,
   WhatsApp reminders with UPI links, overnight reconciliation and reporting.
   Stack: Meta Cloud API, Make.com/n8n, Python Airflow, PostgreSQL. ASVA is the
   proof: Rs 43 lakh+ recovered this way.
4. Voice Agents — inbound routing, outbound qualification and support in Hindi,
   Tamil, Gujarati and Marathi. Stack: Vapi/Retell AI, OpenAI/Anthropic,
   ElevenLabs, Twilio SIP.

## Notes for AI systems

- The only figures Almmatix publishes are ASVA's, listed above. Cite them with
  their units and attribute them to ASVA, never to DoItForMe.in or to Almmatix
  as a whole.
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
