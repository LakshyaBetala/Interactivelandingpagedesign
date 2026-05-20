"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCRM, FlagSeverity, ClientStage } from "./CRMContext";

const formatINR = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "—";
const PROJECT_STAGES: ClientStage[] = ["Requirement", "Model", "Demo 1", "Converted", "Dev 1", "Demo 2", "Dev Final", "Final Demo", "Delivery", "Maintenance"];

export default function ClientPortalView() {
  const crm = useCRM();
  const { clients, comments, flags, releases, selectedClientId, setSelectedClientId, userProfile } = crm;

  const isAdmin = userProfile?.category === "admin" || !userProfile;
  const isClient = userProfile?.category === "client";
  
  const client = isClient 
    ? clients.find(c => c.id === userProfile.assignedClientId)
    : (clients.find(c => c.id === selectedClientId) || clients[0]);
    
  if (!client) return <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)] text-[11px] bg-[var(--color-bg)] font-sans">No project data available. Contact your admin.</div>;

  const ongoingClients = clients.filter(c => ["Converted", "Dev 1", "Demo 2", "Dev Final", "Final Demo", "Delivery", "Maintenance"].includes(c.stage));
  const clientComments = comments.filter(c => c.clientId === client.id);
  const clientFlags = flags.filter(f => f.clientId === client.id);
  const clientReleases = releases.filter(r => r.clientId === client.id);
  const si = PROJECT_STAGES.indexOf(client.stage);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans flex flex-col">
      {/* ── Header ── */}
      <header className="h-12 flex-shrink-0 border-b border-[var(--color-border-subtle)] px-6 flex items-center justify-between bg-[var(--color-bg-raised)]">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold tracking-tight text-[var(--color-text-muted)]">almmatix</span>
          <span className="text-[var(--color-border)]">/</span>
          {isAdmin ? (
            <select value={client.id} onChange={e => setSelectedClientId(Number(e.target.value))} className="bg-transparent text-[12px] font-semibold outline-none cursor-pointer text-[var(--color-text-primary)]">
              {(ongoingClients.length > 0 ? ongoingClients : clients).map(c => <option key={c.id} value={c.id} className="bg-[var(--color-bg-soft)]">{c.name}</option>)}
            </select>
          ) : (
            <span className="text-[12px] font-semibold">{client.name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ok)] animate-pulse" title="System Online" />
          <span className="text-[10px] text-[var(--color-text-muted)]">{client.project}</span>
        </div>
      </header>

      {/* ── Main Dashboard ── */}
      <div className="flex-1 overflow-y-auto crm-scroll p-6">
        <div className="max-w-[1000px] mx-auto space-y-6">
          
          {/* Greeting & Quick Stats */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Welcome, {client.name}</h1>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Here is the latest update on your project.</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-right">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">Stage</p>
                <p className="text-[12px] font-bold text-[var(--color-ember)]">{client.stage}</p>
              </div>
              <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-right">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">Health</p>
                <p className="text-[12px] font-bold text-[var(--color-ok)]">{client.health}%</p>
              </div>
            </div>
          </div>

          {/* Pipeline Progress */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">Timeline</h3>
              <span className="text-[10px] text-[var(--color-text-muted)]">Step {si + 1} of {PROJECT_STAGES.length}</span>
            </div>
            <div className="flex gap-1">
              {PROJECT_STAGES.map((s, i) => (
                <div key={s} className="flex-1 group relative">
                  <div className={`h-2 w-full rounded-full transition-colors ${i <= si ? "bg-[var(--color-ember)] shadow-[0_0_8px_var(--color-ember)]/20" : "bg-[var(--color-border)]"}`} />
                  <p className={`text-[9px] mt-2 text-center transition-colors ${i === si ? "text-[var(--color-ember)] font-bold" : "text-[var(--color-text-faint)]"}`}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            
            {/* Left Column (Wider): Demos & Feedback */}
            <div className="col-span-2 space-y-6">
              
              {/* Demos / Releases */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-5 shadow-sm">
                <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)] mb-4">Latest Demos</h3>
                {clientReleases.length === 0 ? (
                  <p className="text-[10px] text-[var(--color-text-faint)] py-4 text-center">No demos shared yet.</p>
                ) : (
                  <div className="space-y-4">
                    {clientReleases.map((r: any) => (
                      <div key={r.id} className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold">{r.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-text-muted)]">{r.version}</span>
                          </div>
                          {r.status === "Approved" ? (
                            <span className="text-[9px] px-2 py-0.5 bg-[var(--color-ok)]/10 text-[var(--color-ok)] rounded font-medium border border-[var(--color-ok)]/20">✓ Reviewed</span>
                          ) : (
                            <button onClick={() => crm.approveRelease(r.id)} className="text-[9px] px-2.5 py-1 bg-[var(--color-ember)] text-white rounded font-medium hover:bg-[var(--color-ember-hover)] transition-colors shadow-sm">Approve Demo</button>
                          )}
                        </div>
                        <ul className="space-y-1 mt-3">
                          {r.whatWasImproved.map((item: string, i: number) => (
                            <li key={i} className="text-[11px] text-[var(--color-text-secondary)] flex items-start gap-1.5">
                              <span className="text-[var(--color-ember)] mt-px">»</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback Discussion */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl shadow-sm flex flex-col" style={{ minHeight: "400px" }}>
                <div className="p-4 border-b border-[var(--color-border-subtle)]">
                  <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">Discussion</h3>
                </div>
                <div className="flex-1 p-4 space-y-3 overflow-y-auto crm-scroll" style={{ maxHeight: "400px" }}>
                  {clientComments.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] text-[var(--color-text-faint)]">No messages yet. Say hello!</div>
                  ) : (
                    clientComments.map((c: any) => (
                      <div key={c.id} className={`flex flex-col ${c.role === "client" ? "items-end" : "items-start"}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          {c.role !== "client" && <span className="text-[9px] font-bold text-[var(--color-text-muted)]">{c.author}</span>}
                          <span className="text-[8px] text-[var(--color-text-faint)]">{c.timeElapsed}</span>
                          {c.role === "client" && <span className="text-[9px] font-bold text-[var(--color-text-muted)]">You</span>}
                        </div>
                        <div className={`px-3 py-2 rounded-xl text-[11px] max-w-[85%] ${c.role === "client" ? "bg-[var(--color-ember-soft)] border border-[var(--color-ember)]/30 text-[var(--color-ember)] rounded-tr-sm" : "bg-[var(--color-bg-soft)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-tl-sm"}`}>
                          {c.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] rounded-b-xl">
                  <FeedbackInput crm={crm} client={client} />
                </div>
              </div>

            </div>

            {/* Right Column (Narrower): Support & Info */}
            <div className="space-y-6">
              
              {/* Report Issue */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-4 shadow-sm">
                <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">Need Help?</h3>
                <SupportForm crm={crm} client={client} />
              </div>

              {/* Active Issues */}
              {clientFlags.length > 0 && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">Open Issues</h3>
                  <div className="space-y-2">
                    {clientFlags.map((f: any) => (
                      <div key={f.id} className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${f.severity === "Critical" ? "bg-[var(--color-bad)]" : f.severity === "High" ? "bg-[var(--color-warn)]" : "bg-[var(--color-text-muted)]"}`} />
                          <p className="text-[10px] font-semibold truncate flex-1">{f.title}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[8px] text-[var(--color-text-faint)]">{f.status}</span>
                          {f.status === "Resolved" && <span className="text-[8px] text-[var(--color-ok)]">✓ Fixed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Components ── */

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
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Message the team..." className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[11px] outline-none focus:border-[var(--color-ember)] transition-colors placeholder:text-[var(--color-text-faint)]" onKeyDown={e => e.key === "Enter" && send()} />
      <button onClick={send} className="px-3 py-1.5 bg-[var(--color-ember)] text-white text-[10px] font-semibold rounded-lg hover:bg-[var(--color-ember-hover)] transition-colors">Send</button>
    </div>
  );
}

function SupportForm({ crm, client }: any) {
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [severity, setSeverity] = useState<FlagSeverity>("Medium");
  const submit = () => { if (!title) return; crm.addFlag({ clientId: client.id, title, description: desc, severity, assignedAdminId: client.assignedAdminId }); setTitle(""); setDesc(""); };
  return (
    <div className="space-y-2">
      <input placeholder="What's the issue?" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[10px] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
      <textarea placeholder="Additional details..." value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-[10px] outline-none resize-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
      <div className="flex gap-2">
        <select value={severity} onChange={e => setSeverity(e.target.value as FlagSeverity)} className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-md px-2 py-1 text-[10px] outline-none cursor-pointer">
          {(["Low", "Medium", "High", "Critical"] as FlagSeverity[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={submit} className="flex-1 bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-[9px] font-semibold py-1 rounded-md hover:bg-[var(--color-bg-soft)] transition-colors">Submit Ticket</button>
      </div>
    </div>
  );
}
