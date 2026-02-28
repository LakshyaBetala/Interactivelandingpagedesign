The Hybrid UI/UX Strategy
The Hero Scroll (0 - 250vh): A condensed version of the CRED animation. It introduces Almmatix, flashes Vasooli Bhai, and lands on DoItForMe.

The "Unpin" (Normal Scrolling Begins): The animation ends, and the screen naturally scrolls up to reveal a sleek, professional "Bento Box" grid layout detailing the actual tech, features, and database robustnes.

The Deep Dives: Standard, highly readable sections for Vasooli Bhai and DoItForMe.

Here is the exact, refined prompt to generate this hybrid experience. Feed this to your designer or AI developer:

📋 Copy/Paste Prompt: The Hybrid "Hook & Release" Landing Page
System/Project Context:
Act as a world-class Frontend Creative Developer. We are building the landing page for "Almmatix", a professional, tech-savvy parent brand that houses two products: "Vasooli Bhai" (payment recovery) and "DoItForMe" (gig marketplace).
The aesthetic is "Dark Gen-Z Professional"—minimalist, high-end, utilizing OLED blacks (#000000), crisp typography (Geist/Inter), and subtle glassmorphism. It must look like a top-tier fintech/SaaS company, not just an art project.

Architectural Requirement: The "Hook & Release" Model
Do NOT make the entire page a 600vh scroll trap. The page must be divided into two distinct technical behaviors:

The Interactive Hook (Top of page): A fixed, scroll-driven sequence (CRED-style) that introduces the brands.

The Content Payload (Rest of page): Standard, smooth vertical scrolling with beautifully crafted Bento Grids and feature sections.

Part 1: The CRED-Style Scroll Hook (Top 250vh)
Mechanic: A sticky container (h-screen) that stays pinned while the user scrolls through 250vh of the document.

Phase 1 (Almmatix): A sleek, professional abstract logo. Text: "The Student OS."

Phase 2 (Vasooli Bhai): Screen flashes subtle neon green. The "Bat Guy" character slides in. Text: "Stop chasing payments." A glassmorphic card shows an overdue invoice being cleared.

Phase 3 (DoItForMe): Screen transitions to deep purple/blue. A Sloth mascot appears floating. Text: "Start building." A glowing "Enter Marketplace" CTA appears.

The Release: As the user scrolls past 250vh, the sticky container gracefully unpins and scrolls up with the rest of the document.

Part 2: The Professional Content Payload (Normal Scroll)
Section 1: The Almmatix Engine (Bento Grid)

Vibe: Highly technical, building trust. Show that we aren't just a pretty UI, but a robust financial engine.

Layout: A CSS Grid "Bento Box" layout.

Cards:

Card 1 (Large): "Secure Escrow Engine" - Show a visual of money locked safely between two users (Powered by our custom Wallet API).

Card 2 (Medium): "Real-Time Resolution" - Mention the dispute and automated flagged-chat moderation.

Card 3 (Medium): "Instant Payouts" - UPI integration visuals.

Section 2: Deep Dive - Vasooli Bhai

Layout: Left/Right split (Z-pattern).

Visual: A sleek mockup of the Vasooli dashboard showing a 1-click "Trigger Reminder" button.

Copy: "Aggressive on payments. Effortless for you. Generate payment links, track deadbeats, and automate recovery so you can focus on the work."

Section 3: Deep Dive - DoItForMe (www.doitforme.in)

Layout: Carousel or Masonry grid of Gig Categories.

Visual: Tastefully integrate the sloth mascots (tasksloth.png, moneysloth.png) resting on UI elements (like a search bar or a price tag).

Features to Highlight: Student-to-student verification, zero BS negotiation, peer reviews.

Section 4: The Unified Footer & CTA

Visual: A massive, full-width gradient text block: "One Identity. Infinite Hustle."

Action: Split buttons: [Trigger a Vasooli] (Primary, Green glow) and [Browse Gigs] (Secondary, Purple glow).

Footer: Standard professional links (Privacy, Terms, Contact).

Code Constraints:

Use framer-motion for the sticky hook sequence, utilizing useScroll and useTransform.

Use standard Tailwind flex/grid for the Content Payload.

Keep animations in the payload subtle (e.g., standard fade-in-up when scrolling into view via whileInView), ensuring the text remains instantly readable.