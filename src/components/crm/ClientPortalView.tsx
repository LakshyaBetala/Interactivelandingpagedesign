"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCRM, FlagSeverity } from "./CRMContext";

const formatINR = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "—";
const PROJECT_STAGES = ["Requirement", "Model", "Demo 1", "Converted", "Dev 1", "Demo 2", "Dev Final", "Final Demo", "Delivery", "Maintenance"];

type ClientTab = "progress" | "demos" | "feedback" | "support";

export default function ClientPortalView() {
  const crm = useCRM();
  const { clients, team, comments, flags, releases, selectedClientId, setSelectedClientId, userProfile } = crm;
  const [activeTab, setActiveTab] = useState<ClientTab>("progress");

  const isAdmin = userProfile?.category === "admin" || !userProfile;
  const client = clients.find(c => c.id === selectedClientId) || clients[0];
  if (!client) return <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)] text-sm bg-[var(--color-bg)]">No project data available.</div>;

  const ongoingClients = clients.filter(c => ["Converted", "Dev 1", "Demo 2", "Dev Final", "Final Demo", "Delivery", "Maintenance"].includes(c.stage));
  const clientComments = comments.filter(c => c.clientId === client.id);
  const clientFlags = flags.filter(f => f.clientId === client.id);
  const clientReleases = releases.filter(r => r.clientId === client.id);
  const si = PROJECT_STAGES.indexOf(client.stage);

  const tabs: { id: ClientTab; label: string }[] = [
    { id: "progress", label: "Progress" },
    { id: "demos", label: "Demos" },
    { id: "feedback", label: "Feedback" },
    { id: "support", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold tracking-tight text-[var(--color-text-muted)]">almmatix</span>
            <span className="text-[var(--color-border)]">·</span>
            {isAdmin ? (
              <select value={client.id} onChange={e => setSelectedClientId(Number(e.target.value))} className="bg-transparent text-[13px] font-semibold outline-none cursor-pointer text-[var(--color-text-primary)]">
                {(ongoingClients.length > 0 ? ongoingClients : clients).map(c => <option key={c.id} value={c.id} className="bg-[var(--color-bg-soft)]">{c.name}</option>)}
              </select>
            ) : (
              <span className="text-[13px] font-semibold">{client.name}</span>
            )}
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">{client.project}</span>
        </div>
      </header>

      {/* Tab pills */}
      <div className="border-b border-[var(--color-border)] px-6">
        <div className="flex gap-1 max-w-2xl mx-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-[12px] font-medium transition-colors relative ${activeTab === tab.id ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="clientTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-ember)]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            {activeTab === "progress" && (
              <div className="space-y-5">
                {/* 10-step pipeline */}
                <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[13px] font-semibold">Project Progress</h3>
                    <span className="text-[11px] text-[var(--color-text-muted)]">Step {si + 1} of {PROJECT_STAGES.length}</span>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {PROJECT_STAGES.map((s, i) => (
                      <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className={`h-1.5 w-full rounded-full ${i <= si ? "bg-[var(--color-ember)]" : "bg-[var(--color-border)]"}`} />
                        <span className={`text-[8px] leading-tight text-center ${i === si ? "text-[var(--color-ember)] font-semibold" : "text-[var(--color-text-faint)]"}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key info */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4">
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Contract</p>
                    <p className="text-lg font-bold">{formatINR(client.revenue)}</p>
                  </div>
                  <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4">
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Health</p>
                    <p className="text-lg font-bold">{client.health}%</p>
                  </div>
                  <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4">
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Stage</p>
                    <p className="text-lg font-bold">{client.stage}</p>
                  </div>
                </div>

                {/* Activity */}
                <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-5">
                  <h3 className="text-[12px] font-semibold mb-2">Last Update</h3>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">{client.lastActivity}</p>
                </div>
              </div>
            )}

            {activeTab === "demos" && (
              <div className="space-y-3">
                {clientReleases.length === 0 && <p className="text-[var(--color-text-muted)] text-[12px] py-8 text-center">No demos shared yet.</p>}
                {clientReleases.map((r: any) => (
                  <div key={r.id} className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-[13px] font-semibold">{r.title}</h4>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{r.version} · {r.publishedAt}</p>
                      </div>
                      {r.status === "Approved" ? (
                        <span className="text-[10px] px-2 py-1 bg-[var(--color-ok-soft)] text-[var(--color-ok)] rounded-full font-medium">✓ Reviewed</span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 bg-[var(--color-warn-soft)] text-[var(--color-warn)] rounded-full font-medium">Awaiting Review</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {r.whatWasImproved.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-bg)]">
                          <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center text-[8px] ${r.status === "Approved" ? "border-[var(--color-ok)] text-[var(--color-ok)]" : "border-[var(--color-border)]"}`}>
                            {r.status === "Approved" && "✓"}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-secondary)]">{item}</span>
                        </div>
                      ))}
                    </div>
                    {r.status === "Awaiting Review" && (
                      <button onClick={() => crm.approveRelease(r.id)} className="w-full mt-3 bg-[var(--color-ok)] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-emerald-600 transition-colors">Approve Demo</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="space-y-3">
                <FeedbackInput crm={crm} client={client} />
                {clientComments.map((c: any) => (
                  <div key={c.id} className={`p-3.5 rounded-xl ${c.role === "admin" ? "bg-[var(--color-ember-soft)] border border-[var(--color-ember)]/10" : "bg-[var(--color-bg-soft)] border border-[var(--color-border)]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold">{c.author}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${c.role === "admin" ? "bg-[var(--color-ember)]/20 text-[var(--color-ember)]" : "bg-[var(--color-border)] text-[var(--color-text-muted)]"}`}>{c.role}</span>
                      <span className="text-[9px] text-[var(--color-text-muted)] ml-auto">{c.timeElapsed}</span>
                    </div>
                    <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{c.text}</p>
                  </div>
                ))}
                {clientComments.length === 0 && <p className="text-[var(--color-text-muted)] text-[12px] py-8 text-center">No feedback yet. Start the conversation.</p>}
              </div>
            )}

            {activeTab === "support" && (
              <div className="space-y-5">
                <SupportForm crm={crm} client={client} />
                {clientFlags.map((f: any) => {
                  const steps = ["Open", "Investigating", "In Dev", "Resolved"];
                  const fi = steps.indexOf(f.status);
                  return (
                    <div key={f.id} className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${f.severity === "Critical" ? "bg-[var(--color-bad)]" : f.severity === "High" ? "bg-[var(--color-warn)]" : "bg-[var(--color-text-muted)]"}`} />
                        <h4 className="text-[12px] font-semibold flex-1">{f.title}</h4>
                      </div>
                      {f.description && <p className="text-[11px] text-[var(--color-text-muted)] mb-3 ml-4">{f.description}</p>}
                      <div className="flex items-center gap-1 ml-4">
                        {steps.map((s, i) => (
                          <React.Fragment key={s}>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full ${i <= fi ? "bg-[var(--color-ember-soft)] text-[var(--color-ember)]" : "bg-[var(--color-border)] text-[var(--color-text-faint)]"}`}>{s}</span>
                            {i < steps.length - 1 && <span className={`w-2 h-px ${i < fi ? "bg-[var(--color-ember)]" : "bg-[var(--color-border)]"}`} />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {clientFlags.length === 0 && <p className="text-[var(--color-text-muted)] text-[12px] py-8 text-center">No issues reported.</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FeedbackInput({ crm, client }: any) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    const isAdmin = crm.userProfile?.category === "admin" || !crm.userProfile;
    crm.addComment({ author: crm.userProfile?.name || "Client", role: isAdmin ? "admin" as const : "client" as const, text: text.trim(), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), timeElapsed: "Just now", clientId: client.id });
    setText("");
  };
  return (
    <div className="flex gap-2">
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Type your feedback..." className="flex-1 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-[12px] outline-none focus:border-[var(--color-ember)] transition-colors placeholder:text-[var(--color-text-faint)]" onKeyDown={e => e.key === "Enter" && send()} />
      <button onClick={send} className="px-4 py-2.5 bg-[var(--color-ember)] text-white text-[11px] font-semibold rounded-xl hover:bg-[var(--color-ember-hover)] transition-colors">Send</button>
    </div>
  );
}

function SupportForm({ crm, client }: any) {
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [severity, setSeverity] = useState<FlagSeverity>("Medium");
  const submit = () => { if (!title) return; crm.addFlag({ clientId: client.id, title, description: desc, severity, assignedAdminId: client.assignedAdminId }); setTitle(""); setDesc(""); };
  return (
    <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4 space-y-2">
      <h3 className="text-[12px] font-semibold">Report an Issue</h3>
      <input placeholder="Issue title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
      <textarea placeholder="Describe the issue" value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] outline-none resize-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
      <div className="flex gap-2">
        <select value={severity} onChange={e => setSeverity(e.target.value as FlagSeverity)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] outline-none">
          {(["Low", "Medium", "High", "Critical"] as FlagSeverity[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={submit} className="flex-1 bg-[var(--color-ember)] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-[var(--color-ember-hover)] transition-colors">Submit</button>
      </div>
    </div>
  );
}
