"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCRM, ProjectFlag, ChangelogRelease, FlagSeverity, FlagStatus } from "./CRMContext";

// ═══════════════════════════════════════════════════════════════
//  DATA & UTILS
// ═══════════════════════════════════════════════════════════════

interface Milestone {
  id: number;
  title: string;
  status: "completed" | "current" | "upcoming";
  date: string;
}

interface Invoice {
  id: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  date: string;
  description: string;
}

// Generate client-specific milestones
const getMilestonesForClient = (clientId: number): Milestone[] => {
  switch (clientId) {
    case 1:
      return [
        { id: 1, title: "Tally Integration Core Architecture", status: "completed", date: "Apr 12" },
        { id: 2, title: "Analytics dashboard & Chart Polish", status: "completed", date: "Apr 28" },
        { id: 3, title: "Phase 1 Review — Real-time stream", status: "current", date: "May 15" },
        { id: 4, title: "Phase 2 — Excel Invoicing module", status: "upcoming", date: "Jun 01" },
        { id: 5, title: "Final Handover & UAT Support", status: "upcoming", date: "Jun 15" },
      ];
    case 3:
      return [
        { id: 1, title: "UI Mockups & Gold Pricing wireframes", status: "completed", date: "May 01" },
        { id: 2, title: "Live Rates Fetching API service link", status: "current", date: "May 18" },
        { id: 3, title: "Admin Portal Accents & Alerts Integration", status: "upcoming", date: "May 30" },
        { id: 4, title: "UAT Handover Beta Release", status: "upcoming", date: "Jun 10" },
      ];
    default:
      return [
        { id: 1, title: "Kickoff & Resource Provisioning", status: "completed", date: "May 05" },
        { id: 2, title: "Core Platform DB Schema design", status: "current", date: "May 20" },
        { id: 3, title: "B2B Admin Dashboard UI & API Integration", status: "upcoming", date: "Jun 15" },
      ];
  }
};

function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="flex flex-col gap-0">
      {milestones.map((m, i) => (
        <div key={m.id} className="flex gap-4 animate-fade-in">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full shrink-0 border-2 ${
              m.status === "completed" ? "bg-ember border-ember" :
              m.status === "current" ? "bg-sand border-ember animate-live-pulse" :
              "bg-sand-light border-taupe/30"
            }`} />
            {i < milestones.length - 1 && (
              <div className={`w-px flex-1 min-h-[40px] ${
                m.status === "completed" ? "bg-ember/40" : "bg-taupe/15"
              }`} />
            )}
          </div>
          <div className="pb-6 -mt-0.5">
            <div className={`text-sm font-semibold ${m.status === "current" ? "text-ember" : m.status === "completed" ? "text-charcoal" : "text-taupe"}`}>{m.title}</div>
            <div className="text-xs text-taupe mt-0.5">{m.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const styles: Record<Invoice["status"], string> = {
    paid: "bg-green-500/10 text-green-700",
    pending: "bg-amber-500/10 text-amber-700",
    overdue: "bg-red-500/10 text-red-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[0.625rem] uppercase tracking-[0.1em] font-mono font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

// --- Custom Confetti Particle Physics Effect ---
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  dX: number;
  dY: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

function ConfettiEffect({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const colors = ["#FF5A1F", "#0D9488", "#65A30D", "#9333EA", "#FFC700", "#FF0055"];
    const newParticles: ConfettiParticle[] = Array.from({ length: 90 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      return {
        id: i,
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 500,
        y: typeof window !== "undefined" ? window.innerHeight * 0.75 : 500,
        dX: Math.cos(angle) * speed,
        dY: Math.sin(angle) * speed - 10, // Fire upwards
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: -12 + Math.random() * 24,
      };
    });

    setParticles(newParticles);

    let animationFrameId: number;
    let elapsed = 0;

    const updatePhysics = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.dX,
            y: p.y + p.dY,
            dY: p.dY + 0.32, // Gravity weight
            dX: p.dX * 0.975, // Air resistance drag
            rotation: p.rotation + p.rotationSpeed,
          }))
          .filter((p) => p.y < (typeof window !== "undefined" ? window.innerHeight : 1000) + 50 && p.x > -50 && p.x < (typeof window !== "undefined" ? window.innerWidth : 2000) + 50)
      );

      elapsed += 16;
      if (elapsed < 3200) {
        animationFrameId = requestAnimationFrame(updatePhysics);
      } else {
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: p.id % 2 === 0 ? "50%" : "0%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════

export default function ClientPortalView() {
  const { 
    clients, 
    team, 
    comments, 
    flags, 
    releases, 
    selectedClientId, 
    setSelectedClientId,
    addComment, 
    deleteComment,
    addFlag,
    approveRelease 
  } = useCRM();

  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  
  // Custom states for Releases & Confetti
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<number, boolean>>>({});

  const toggleCheckItem = useCallback((releaseId: string, itemIdx: number) => {
    setCheckedItems(prev => {
      const releaseChecked = prev[releaseId] || {};
      return {
        ...prev,
        [releaseId]: {
          ...releaseChecked,
          [itemIdx]: !releaseChecked[itemIdx]
        }
      };
    });
  }, []);

  const isReleaseFullyChecked = useCallback((release: ChangelogRelease) => {
    const releaseChecked = checkedItems[release.id] || {};
    return release.whatWasImproved.every((_, idx) => releaseChecked[idx]);
  }, [checkedItems]);

  // Local support flag form states
  const [flagTitle, setFlagTitle] = useState("");
  const [flagDesc, setFlagDesc] = useState("");
  const [flagSeverity, setFlagSeverity] = useState<FlagSeverity>("High");

  // Load Active Client context dynamically
  const activeClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || clients.find(c => c.category === "Ongoing") || clients[0];
  }, [clients, selectedClientId]);

  // Client-specific list items
  const clientMilestones = useMemo(() => getMilestonesForClient(activeClient.id), [activeClient]);
  const clientComments = useMemo(() => comments.filter(c => c.clientId === activeClient.id), [comments, activeClient]);
  const clientFlags = useMemo(() => flags.filter(f => f.clientId === activeClient.id), [flags, activeClient]);
  const clientReleases = useMemo(() => releases.filter(r => r.clientId === activeClient.id), [releases, activeClient]);

  // Generate dynamic invoices based on contract revenue
  const clientInvoices = useMemo((): Invoice[] => {
    const rev = activeClient.revenue;
    const formatINR = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
    
    return [
      { id: `INV-0${activeClient.id}1`, amount: formatINR(rev * 0.33), status: "paid", date: "Apr 15, 2026", description: "Phase 1 - Advance Contract Commitment" },
      { id: `INV-0${activeClient.id}2`, amount: formatINR(rev * 0.33), status: "paid", date: "May 01, 2026", description: "Phase 2 - Development Kickoff Milestone" },
      { id: `INV-0${activeClient.id}3`, amount: formatINR(rev * 0.34), status: "pending", date: "May 25, 2026", description: "Phase 3 - Production Handover & UAT" },
    ];
  }, [activeClient]);

  const handleTabChange = useCallback((tab: string) => setActiveTab(tab), []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  // Prevent unload if typing feedback
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (newComment.trim().length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [newComment]);

  const handlePostComment = useCallback(() => {
    if (!newComment.trim()) return;
    addComment({
      clientId: activeClient.id,
      author: activeClient.name,
      role: "client",
      text: newComment,
      timestamp: "Live Portal",
      timeElapsed: "Just now",
    });
    setNewComment("");
  }, [newComment, addComment, activeClient]);

  const handlePostFlag = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!flagTitle.trim() || !flagDesc.trim()) return;

    addFlag({
      clientId: activeClient.id,
      title: flagTitle.trim(),
      description: flagDesc.trim(),
      severity: flagSeverity,
      assignedAdminId: activeClient.assignedAdminId || "a1"
    });

    setFlagTitle("");
    setFlagDesc("");
    setFlagSeverity("High");
    alert("🚨 Support flag logged! Our engineering sprint lead has been assigned.");
  }, [flagTitle, flagDesc, flagSeverity, activeClient, addFlag]);

  const fadeUp = { hidden: { opacity: 0, y: 14, filter: "blur(3px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } } };
  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

  return (
    <div className="flex flex-col min-h-screen bg-sand relative noise-overlay">
      {/* ──── HEADER ──── */}
      <header className="sticky top-0 z-40 bg-sand/80 backdrop-blur-xl border-b border-taupe/15">
        <div className="flex justify-between items-center py-4 px-8 lg:px-12">
          
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-[-0.04em] font-display">ALMMATIX</h1>
            <div className="h-5 w-px bg-taupe/25" />
            
            {/* Dynamic Client Selector Dropdown for simulation */}
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(Number(e.target.value));
                setActiveTab("overview");
              }}
              className="bg-sand-light border border-taupe/20 rounded px-2.5 py-1 text-xs font-semibold text-charcoal font-mono uppercase focus:outline-none focus:border-ember"
            >
              {clients.filter(c => c.category === "Ongoing").map(cl => (
                <option key={cl.id} value={cl.id}>{cl.name}</option>
              ))}
            </select>
          </div>

          <nav className="hidden md:flex gap-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "releases", label: `What's New (${clientReleases.filter(r => r.status === "Awaiting Review").length} pending)` },
              { id: "support", label: `Support Queue (${clientFlags.length})` },
              { id: "invoices", label: "Invoices" }
            ].map((tab) => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-1.5 rounded-md text-xs uppercase tracking-[0.14em] font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember ${
                  activeTab === tab.id ? "bg-charcoal text-sand shadow-sm" : "text-taupe hover:text-charcoal hover:bg-sand-warm/50"
                }`}>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="w-8 h-8 bg-charcoal text-sand rounded-full flex items-center justify-center text-[0.625rem] font-bold tracking-wider">
            {activeClient.avatar}
          </div>
        </div>
      </header>

      {/* ──── CONTENT ──── */}
      <main className="flex-1 px-8 lg:px-12 py-8 relative z-10">
        <AnimatePresence mode="wait">

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial="hidden" animate="show" exit="hidden" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-8">
                <h2 className="text-2xl font-bold font-display text-charcoal mb-1">{activeClient.project}</h2>
                <p className="text-sm text-taupe">Interactive customer node view. Monitor sprint activities and flag resolutions.</p>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                  { label: "Contract Value", value: formatCurrency(activeClient.revenue) },
                  { label: "Paid Invoices", value: formatCurrency(activeClient.revenue * 0.66) },
                  { label: "Milestones", value: `${clientMilestones.filter(m => m.status === "completed").length}/${clientMilestones.length}` },
                  { label: "Production Health", value: `${activeClient.health}%`, accent: true },
                ].map((s, idx) => (
                  <div key={idx} className="bg-sand-light/60 border border-taupe/10 rounded-xl p-5 hover:border-taupe/25 transition-colors">
                    <div className="portal-label mb-2">{s.label}</div>
                    <div className={`stat-card animate-count-up ${"accent" in s ? "text-ember" : "text-charcoal"}`}>{s.value}</div>
                  </div>
                ))}
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={fadeUp} className="lg:col-span-2">
                  <h3 className="text-sm font-bold uppercase tracking-[0.1em] mb-4">Project Delivery Timeline</h3>
                  <div className="bg-sand-light/40 border border-taupe/10 rounded-xl p-6">
                    <MilestoneTracker milestones={clientMilestones} />
                  </div>
                </motion.div>
                
                <motion.div variants={fadeUp} className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.1em] mb-4">Sprint Specialists</h3>
                    <div className="bg-sand-light/40 border border-taupe/10 rounded-xl p-5 flex flex-col gap-4">
                      {team.filter(t => t.id === activeClient.assignedAdminId || t.id === "a2" || t.id === "a4").map((p) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.55rem] font-bold tracking-wider text-white shadow-xs" style={{ backgroundColor: p.colorVar }}>{p.avatar}</div>
                          <div>
                            <div className="text-sm font-semibold">{p.name}</div>
                            <div className="text-xs text-taupe">{p.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══ WHAT'S NEW TAB (CLIENT RELEASE REVIEW CYCLE) ═══ */}
          {activeTab === "releases" && (
            <motion.div key="releases" initial="hidden" animate="show" exit="hidden" variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left & Center: Releases Timeline */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold font-display text-charcoal">📢 What's New & Release Approvals</h2>
                  <p className="text-sm text-taupe mt-1">Review the specific items that were improved by our internal development sprints. Confirm and approve updates to push to production.</p>
                </div>

                {/* Include our live confetti canvas particle physics simulator */}
                <ConfettiEffect active={triggerConfetti} onComplete={() => setTriggerConfetti(false)} />

                <div className="space-y-6">
                  {clientReleases.map((rel) => (
                    <motion.div 
                      key={rel.id}
                      variants={fadeUp}
                      className="bg-white border border-taupe/15 rounded-2xl p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:border-ember/30 hover:shadow-[0_12px_40px_rgba(255,90,31,0.06)]"
                    >
                      {/* Status Accent Badge */}
                      <span className={`absolute top-6 right-6 inline-flex px-2 py-0.5 rounded font-mono text-[0.625rem] font-bold uppercase tracking-wider ${
                        rel.status === "Approved" ? "bg-green-100 text-green-700 border border-green-200" : "bg-ember/10 text-ember border border-ember/20"
                      }`}>
                        {rel.status}
                      </span>

                      {/* Glowing background light for awaiting review */}
                      {rel.status === "Awaiting Review" && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-ember/5 rounded-full filter blur-xl -mr-6 -mt-6 pointer-events-none animate-pulse" />
                      )}

                      <div className="text-xs font-mono font-bold text-ember uppercase">{rel.version}</div>
                      <h3 className="text-lg font-bold font-display text-charcoal mt-1 mb-1.5">{rel.title}</h3>
                      <div className="text-xs text-taupe-light mb-4">Published: {rel.publishedAt}</div>

                      {/* What was improved checklist */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-[0.625rem] font-mono uppercase text-taupe-light tracking-widest mb-1">
                          <span>Sprint Verification Checklist</span>
                          {rel.status === "Awaiting Review" && (
                            <span className="text-ember font-bold font-mono">Sign-off required</span>
                          )}
                        </div>

                        <div className="space-y-2.5">
                          {rel.whatWasImproved.map((imp, idx) => {
                            const isChecked = !!(checkedItems[rel.id]?.[idx]);
                            const isAwaiting = rel.status === "Awaiting Review";

                            return (
                              <button
                                key={idx}
                                disabled={!isAwaiting}
                                onClick={() => toggleCheckItem(rel.id, idx)}
                                className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-200 group ${
                                  !isAwaiting 
                                    ? "bg-sand-light/20 border-transparent text-charcoal/80 cursor-default" 
                                    : isChecked
                                      ? "bg-emerald-500/5 border-emerald-500/20 text-charcoal/70 shadow-2xs cursor-pointer"
                                      : "bg-white border-taupe/15 hover:border-taupe/30 text-charcoal hover:bg-sand-light/10 cursor-pointer"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border transition-all duration-200 ${
                                  !isAwaiting
                                    ? "bg-green-500/10 border-green-500/20 text-green-600"
                                    : isChecked
                                      ? "bg-green-500 border-green-500 text-white scale-105 shadow-[0_0_8px_rgba(34,197,94,0.35)]"
                                      : "bg-sand-light border-taupe/20 group-hover:border-taupe/40"
                                }`}>
                                  {(!isAwaiting || isChecked) ? (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <span className="text-[0.55rem] font-mono text-taupe font-bold">{idx + 1}</span>
                                  )}
                                </div>
                                <div className="flex flex-col flex-1 leading-snug">
                                  <span className={`text-xs font-semibold transition-all duration-200 ${
                                    isChecked && isAwaiting ? "line-through text-taupe-light font-normal" : "text-charcoal/90"
                                  }`}>
                                    {imp}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Confirm release action */}
                      {rel.status === "Awaiting Review" ? (
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-taupe/10 pt-4 gap-4 mt-4">
                          <div className="text-[0.68rem] text-taupe leading-relaxed max-w-sm">
                            👉 Please click and verify each checklist item above. Once all items are checked, you can deploy the release live to production.
                          </div>
                          
                          {(() => {
                            const fullyChecked = isReleaseFullyChecked(rel);
                            return (
                              <button
                                disabled={!fullyChecked}
                                onClick={() => {
                                  approveRelease(rel.id);
                                  setTriggerConfetti(true);
                                }}
                                className={`font-mono uppercase font-bold text-[0.68rem] tracking-wider px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap overflow-hidden shrink-0 ${
                                  fullyChecked
                                    ? "bg-ember hover:bg-ember-dark text-white cursor-pointer shadow-[0_4px_14px_rgba(255,90,31,0.3)] scale-[1.02] hover:scale-[1.04] active:scale-[0.98]"
                                    : "bg-taupe/10 text-taupe/40 cursor-not-allowed border border-taupe/10"
                                }`}
                              >
                                {fullyChecked ? "🚀 Approve & Deploy Release" : "🔒 Verify Items to Unlock"}
                              </button>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-medium border-t border-taupe/5 pt-4 mt-4">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Verified & Released live in production at: {rel.approvedAt || "Recently"}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {clientReleases.length === 0 && (
                    <div className="bg-sand-light/30 border border-dashed border-taupe/20 p-8 rounded-xl text-center text-taupe italic">
                      No changelogs uploaded for review yet. Sprints ongoing!
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar: Quick Feedback Comment Thread */}
              <motion.div variants={fadeUp} className="flex flex-col bg-sand-light/40 border border-taupe/10 rounded-xl overflow-hidden h-[fit-content]">
                <div className="p-5 border-b border-taupe/10 bg-white/40">
                  <h3 className="text-sm font-bold uppercase tracking-[0.1em]">Project Activity & Feedback</h3>
                  <div className="text-xs text-taupe mt-1">Direct communication with your delivery leads.</div>
                </div>

                {/* Comments feed */}
                <div className="p-5 flex flex-col gap-4 max-h-[350px] overflow-y-auto dark-scrollbar bg-white/10">
                  <AnimatePresence>
                    {clientComments.map((c) => (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-lg border relative group ${c.role === "admin" ? "bg-sand-warm/30 border-ember/15" : "bg-white/40 border-taupe/10"}`}>
                        <div className="flex justify-between items-start mb-1.5 pr-6">
                          <span className="text-xs font-bold">{c.author}</span>
                          <span className="font-mono text-[0.6rem] text-ember bg-ember/8 px-1.5 py-0.5 rounded">@ {c.timestamp}</span>
                        </div>
                        <p className="text-xs text-charcoal/85 leading-relaxed">{c.text}</p>
                        <div className="text-[0.6rem] text-taupe mt-1.5">{c.timeElapsed}</div>
                        
                        {/* Delete Comment Button for Client */}
                        {c.role === "client" && (
                          <button 
                            onClick={() => deleteComment(c.id)}
                            className="absolute top-2 right-2 p-1.5 text-taupe hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all focus:outline-none focus:opacity-100" 
                            aria-label="Delete comment"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-taupe/10 bg-sand-light/60">
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Log feedback for Live Releases..."
                    className="w-full bg-sand border border-taupe/20 rounded-lg p-3 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-ember/50 resize-none mb-2 placeholder:text-taupe/50 text-charcoal"
                    rows={2} />
                  <button onClick={handlePostComment} className="w-full bg-charcoal hover:bg-black text-sand transition-colors py-2 rounded-lg text-xs font-semibold uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-ember">
                    Post Comment Feedback
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ SUPPORT QUEUE (CLIENT ISSUE ESCALATION FLAGS) ═══ */}
          {activeTab === "support" && (
            <motion.div key="support" initial="hidden" animate="show" exit="hidden" variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Form to Flag Issue */}
              <div className="lg:col-span-1 bg-white border border-taupe/10 rounded-xl p-5 shadow-xs">
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-charcoal font-mono mb-4">🚨 Flag a Post-Service Issue</h3>
                <p className="text-xs text-taupe mb-6 leading-relaxed">Encountered an anomaly or require structural enhancements? File an escalation flag. Our sprint director will review it immediately.</p>

                <form onSubmit={handlePostFlag} className="space-y-4">
                  <div>
                    <label className="portal-label block mb-1.5 font-mono uppercase text-[0.6rem]">Severity Urgency</label>
                    <select
                      value={flagSeverity}
                      onChange={(e) => setFlagSeverity(e.target.value as FlagSeverity)}
                      className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal focus:outline-none focus:border-ember"
                    >
                      <option value="Critical">Critical (Blocker Outage)</option>
                      <option value="High">High (Core Feature Glitch)</option>
                      <option value="Medium">Medium (General Enhancement)</option>
                      <option value="Low">Low (Visual / QA Polish)</option>
                    </select>
                  </div>

                  <div>
                    <label className="portal-label block mb-1.5 font-mono uppercase text-[0.6rem]">Issue Title Summary</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rate card wrapping jitter"
                      required
                      value={flagTitle}
                      onChange={(e) => setFlagTitle(e.target.value)}
                      className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal focus:outline-none focus:border-ember"
                    />
                  </div>

                  <div>
                    <label className="portal-label block mb-1.5 font-mono uppercase text-[0.6rem]">Description Escalation Details</label>
                    <textarea 
                      placeholder="Explain the anomaly exactly, adding steps to replicate or browser context details..."
                      required
                      rows={4}
                      value={flagDesc}
                      onChange={(e) => setFlagDesc(e.target.value)}
                      className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal focus:outline-none focus:border-ember resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-mono uppercase font-bold text-[0.68rem] tracking-wider py-2.5 rounded transition-all shadow-xs cursor-pointer"
                  >
                    🚀 Submit Escalation Flag
                  </button>
                </form>
              </div>

              {/* Right Column (2 spans): Support Ticket Status Queue */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-charcoal font-mono">My Support Escalation queue</h3>
                  <p className="text-xs text-taupe mt-1">Real-time resolution updates. Watch when assignments are Investigating, In Dev, or Resolved.</p>
                </div>

                <div className="space-y-6">
                  {clientFlags.map((flag) => {
                    const severityColors: Record<FlagSeverity, string> = {
                      Critical: "bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-live-pulse",
                      High: "bg-orange-500 text-white",
                      Medium: "bg-amber-500 text-white",
                      Low: "bg-taupe text-sand"
                    };

                    const statusStages: { label: string; key: FlagStatus; desc: string }[] = [
                      { label: "Logged", key: "Open", desc: "Flag submitted" },
                      { label: "Investigating", key: "Investigating", desc: "Technical analysis" },
                      { label: "Sprint Dev", key: "In Dev", desc: "Hotfix in progress" },
                      { label: "Resolved", key: "Resolved", desc: "Deployed live" }
                    ];

                    const getStatusProgress = (status: FlagStatus) => {
                      switch (status) {
                        case "Open": return 12.5;
                        case "Investigating": return 37.5;
                        case "In Dev": return 67.5;
                        case "Resolved": return 100;
                      }
                    };

                    const currentStageIdx = statusStages.findIndex(s => s.key === flag.status);
                    const assignee = team.find(t => t.id === flag.assignedAdminId);

                    return (
                      <motion.div 
                        key={flag.id} 
                        variants={fadeUp}
                        className="bg-white border border-taupe/15 rounded-2xl p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden"
                      >
                        {/* Ticket Header */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[0.55rem] uppercase tracking-wider font-mono font-bold shrink-0 ${severityColors[flag.severity]}`}>
                              {flag.severity} Severity
                            </span>
                            <span className="text-[0.625rem] text-taupe-light font-mono">Logged: {flag.createdAt}</span>
                          </div>
                          <div className="text-[0.65rem] font-mono text-taupe uppercase bg-sand-light/50 px-2 py-0.5 rounded border border-taupe/5">
                            Ticket: #{flag.id.substring(0, 7)}
                          </div>
                        </div>

                        {/* Ticket Details */}
                        <div>
                          <h4 className="text-base font-bold text-charcoal leading-tight">{flag.title}</h4>
                          <p className="text-xs text-charcoal/70 leading-relaxed mt-2">{flag.description}</p>
                        </div>

                        {/* Interactive Timeline Tracker */}
                        <div className="py-2">
                          <div className="relative flex justify-between items-center w-full">
                            {/* Background track line */}
                            <div className="absolute top-[14px] left-[12.5%] right-[12.5%] h-[3px] bg-taupe/15 -z-10 rounded-full" />
                            
                            {/* Filled track line based on status */}
                            <div 
                              className="absolute top-[14px] left-[12.5%] h-[3px] bg-ember -z-10 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(255,90,31,0.4)]"
                              style={{ width: `${Math.max(0, (getStatusProgress(flag.status) - 12.5) * (100 / 75))}%` }}
                            />

                            {statusStages.map((stage, idx) => {
                              const isCompleted = idx <= currentStageIdx;
                              const isActive = idx === currentStageIdx;

                              return (
                                <div key={stage.key} className="flex flex-col items-center flex-1 relative select-none">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 font-mono text-[0.625rem] font-bold ${
                                    isCompleted 
                                      ? "bg-ember border-ember text-white shadow-[0_0_10px_rgba(255,90,31,0.25)] scale-105"
                                      : "bg-white border-taupe/20 text-taupe hover:border-taupe/40"
                                  } ${isActive ? "ring-4 ring-ember/15 animate-live-pulse" : ""}`}>
                                    {isCompleted && !isActive ? (
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <span>{idx + 1}</span>
                                    )}
                                  </div>
                                  <span className={`text-[0.6rem] font-mono font-bold mt-2 tracking-wider uppercase ${
                                    isActive ? "text-ember" : isCompleted ? "text-charcoal" : "text-taupe-light"
                                  }`}>
                                    {stage.label}
                                  </span>
                                  <span className="text-[0.5rem] text-taupe/65 font-sans mt-0.5 text-center hidden md:inline px-1">
                                    {stage.desc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sprint Owner Info & Logs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-taupe/10 pt-4 items-stretch">
                          
                          {/* Sprint Lead Profile */}
                          <div className="md:col-span-1">
                            {assignee ? (
                              <div className="bg-sand-light/30 border border-taupe/10 rounded-xl p-3.5 flex items-center gap-3 relative overflow-hidden h-full">
                                <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: assignee.colorVar }} />
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.58rem] font-bold tracking-wider text-white shadow-xs shrink-0" style={{ backgroundColor: assignee.colorVar }}>
                                  {assignee.avatar}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[0.55rem] font-mono uppercase text-taupe-light tracking-widest leading-none mb-1">Sprint Lead</div>
                                  <div className="text-xs font-bold text-charcoal leading-none truncate">{assignee.name}</div>
                                  <div className="text-[0.55rem] text-taupe mt-1 truncate">{assignee.role}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-sand-light/10 border border-dashed border-taupe/15 rounded-xl p-3.5 flex items-center justify-center text-center h-full">
                                <span className="text-[0.65rem] text-taupe italic">Awaiting Lead Assignment</span>
                              </div>
                            )}
                          </div>

                          {/* Sprint Logs Container */}
                          <div className="md:col-span-2 bg-sand-light/25 border border-taupe/5 p-4 rounded-xl font-mono text-[0.65rem] flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2 pb-1 border-b border-taupe/5">
                              <span className="text-[0.58rem] uppercase font-bold text-taupe tracking-widest">🛠️ Developer Sprint Logs</span>
                              <span className={`inline-flex w-1.5 h-1.5 rounded-full ${flag.status === "Resolved" ? "bg-green-500" : "bg-ember animate-live-pulse"}`} />
                            </div>
                            
                            <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1 dark-scrollbar">
                              {flag.sprintLogs && flag.sprintLogs.length > 0 ? (
                                flag.sprintLogs.map((log) => {
                                  const logMember = team.find(t => t.name.toLowerCase() === log.author.toLowerCase());
                                  const authorColor = logMember?.colorVar || "var(--color-taupe)";
                                  
                                  return (
                                    <div key={log.id} className="leading-normal flex items-start gap-1.5">
                                      <span className="text-taupe-light shrink-0">[{log.timestamp}]</span>
                                      <span className="font-bold shrink-0" style={{ color: authorColor }}>{log.author}:</span>
                                      <span className="text-charcoal/85 break-words">{log.text}</span>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-[0.6rem] text-taupe/70 italic py-1">
                                  Awaiting technical triage. Developer updates will sync live.
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                      </motion.div>
                    );
                  })}

                  {clientFlags.length === 0 && (
                    <div className="bg-sand-light/35 border border-dashed border-taupe/15 p-8 rounded-xl text-center text-taupe italic">
                      No support tickets logged. Dashboard health outstanding!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ INVOICES TAB ═══ */}
          {activeTab === "invoices" && (
            <motion.div key="invoices" initial="hidden" animate="show" exit="hidden" variants={stagger}>
              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold font-display mb-6">Escrow & Project Invoices</h2>
                <div className="bg-sand-light/40 border border-taupe/10 rounded-xl overflow-hidden shadow-xs">
                  <div className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_0.8fr] gap-4 px-5 py-3.5 bg-sand-light/50 border-b border-taupe/10 font-mono text-[0.6rem] uppercase tracking-widest text-taupe-light font-bold">
                    {["Invoice", "Description", "Due Date", "Amount", "Status"].map((h) => (
                      <div key={h} className="portal-label">{h}</div>
                    ))}
                  </div>
                  {clientInvoices.map((inv, i) => (
                    <motion.div key={inv.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_0.8fr] gap-4 px-5 py-4 border-b border-taupe/8 hover:bg-sand-warm/15 transition-colors items-center">
                      <div className="text-sm font-mono font-bold text-charcoal">{inv.id}</div>
                      <div className="text-xs text-charcoal/80">{inv.description}</div>
                      <div className="text-xs text-taupe font-mono">{inv.date}</div>
                      <div className="text-sm font-bold text-charcoal">{inv.amount}</div>
                      <div className="flex items-center gap-3">
                        <InvoiceStatusBadge status={inv.status} />
                        {inv.status === "pending" && (
                          <button 
                            onClick={() => alert("Escrow processing is simulated. Payment received! Thank you.")} 
                            className="bg-ember text-white text-[0.58rem] font-bold font-mono uppercase tracking-wider px-2 py-1 rounded hover:bg-ember-dark transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-charcoal"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
