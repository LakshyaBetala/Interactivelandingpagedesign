"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useCRM, FlagSeverity, ClientStage, ChangelogRelease } from "./CRMContext";

const formatINR = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "—";
const PROJECT_STAGES: ClientStage[] = ["Requirement", "Model", "Demo 1", "Converted", "Dev 1", "Demo 2", "Dev Final", "Final Demo", "Delivery", "Maintenance"];

// Helper to format seconds to MM:SS
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sc = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
};

export default function ClientPortalView() {
  const crm = useCRM();
  const { clients, comments, flags, releases, selectedClientId, userProfile, signOut } = crm;

  const isClient = userProfile?.category === "client";
  
  const client = isClient 
    ? clients.find(c => c.id === userProfile.assignedClientId)
    : (clients.find(c => c.id === selectedClientId) || clients[0]);
    
  // Ref to hold the currently playing video element
  const activeVideoRef = useRef<HTMLVideoElement>(null);

  if (!client) return <div className="min-h-screen flex items-center justify-center text-[var(--color-text-muted)] text-[11px] bg-[var(--color-bg)] font-sans">No project data available. Contact your admin.</div>;

  const clientComments = comments.filter(c => c.clientId === client.id);
  const clientFlags = flags.filter(f => f.clientId === client.id);
  const clientReleases = releases.filter(r => r.clientId === client.id);
  const si = PROJECT_STAGES.indexOf(client.stage);

  const seekVideo = (time: number) => {
    if (activeVideoRef.current) {
      activeVideoRef.current.currentTime = time;
      activeVideoRef.current.play();
      // Scroll to video if needed
      activeVideoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      alert("Please play the demo video first to seek to this timestamp.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans flex flex-col">
      {/* ── Header ── */}
      <header className="h-14 flex-shrink-0 border-b border-[var(--color-border-subtle)] px-4 md:px-6 flex items-center justify-between bg-[var(--color-bg-raised)]">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-bold tracking-tight text-[var(--color-text-muted)]">almmatix</span>
          <span className="text-[var(--color-border)]">/</span>
          <span className="text-[12px] font-semibold">{client.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-ok)] animate-pulse" title="System Online" />
            <span className="text-[10px] text-[var(--color-text-muted)]">{client.project}</span>
          </div>
          <button onClick={signOut} className="text-[10px] bg-[var(--color-surface-muted)] text-[var(--color-card-text)] px-3 py-1.5 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors font-medium">Log out</button>
        </div>
      </header>

      {/* ── Main Dashboard ── */}
      <div className="flex-1 overflow-y-auto crm-scroll p-3 md:p-6">
        <div className="max-w-[1000px] mx-auto space-y-4 md:space-y-6">
          
          {/* Greeting & Quick Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">Welcome, {client.name}</h1>
              <p className="text-[11px] md:text-[12px] text-[var(--color-text-muted)] mt-1">Here is the latest update on your project.</p>
            </div>
            <div className="flex gap-2 md:gap-3">
              <div className="flex-1 md:flex-none bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-center md:text-right">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">Stage</p>
                <p className="text-[12px] md:text-[14px] font-bold text-[var(--color-ember)]">{client.stage}</p>
              </div>
              <div className="flex-1 md:flex-none bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-center md:text-right">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">Health</p>
                <p className="text-[12px] md:text-[14px] font-bold text-[var(--color-ok)]">{client.health}%</p>
              </div>
            </div>
          </div>

          {/* Pipeline Progress */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-4 md:p-5 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-4 min-w-[600px]">
              <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">Timeline</h3>
              <span className="text-[10px] text-[var(--color-text-muted)]">Step {si + 1} of {PROJECT_STAGES.length}</span>
            </div>
            <div className="flex gap-1 min-w-[600px]">
              {PROJECT_STAGES.map((s, i) => (
                <div key={s} className="flex-1 group relative">
                  <div className={`h-2 w-full rounded-full transition-colors ${i <= si ? "bg-[var(--color-ember)] shadow-[0_0_8px_var(--color-ember)]/20" : "bg-[var(--color-border)]"}`} />
                  <p className={`text-[9px] mt-2 text-center transition-colors ${i === si ? "text-[var(--color-ember)] font-bold" : "text-[var(--color-text-faint)]"}`}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            
            {/* Left Column (Wider): Demos & Feedback */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              
              {/* Demos / Releases */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-4 md:p-5 shadow-sm">
                <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)] mb-4">Latest Demos</h3>
                {clientReleases.length === 0 ? (
                  <p className="text-[10px] text-[var(--color-text-faint)] py-4 text-center">No demos shared yet.</p>
                ) : (
                  <div className="space-y-6">
                    {clientReleases.map((r: any) => (
                      <div key={r.id} className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                        
                        {/* Video Player */}
                        {r.videoUrl && (
                          <div className="w-full bg-black aspect-video relative border-b border-[var(--color-border)] group">
                            <video 
                              ref={activeVideoRef}
                              controls 
                              src={r.videoUrl} 
                              className="w-full h-full object-contain"
                              onPlay={(e) => { activeVideoRef.current = e.currentTarget; }}
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="bg-black/60 text-white text-[9px] px-2 py-1 rounded backdrop-blur-sm">Timestamp Feedback Engine Active</span>
                            </div>
                          </div>
                        )}

                        <div className="p-4 md:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] md:text-[16px] font-bold text-white">{r.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">v{r.version}</span>
                            </div>
                            {r.status === "Approved" ? (
                              <span className="text-[10px] px-3 py-1 bg-[var(--color-ok)]/10 text-[var(--color-ok)] rounded-full font-bold border border-[var(--color-ok)]/20">✓ Reviewed</span>
                            ) : (
                              <button onClick={() => crm.approveRelease(r.id)} className="text-[10px] px-4 py-1.5 bg-[var(--color-ember)] text-white rounded-lg font-bold hover:bg-[var(--color-ember-hover)] transition-colors shadow-[0_0_10px_var(--color-ember-soft)]">Approve Demo</button>
                            )}
                          </div>
                          
                          <div className="bg-[var(--color-bg)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
                            <h4 className="text-[9px] font-mono text-[var(--color-text-faint)] uppercase mb-2">Release Notes</h4>
                            <ul className="space-y-1.5">
                              {r.whatWasImproved.map((item: string, i: number) => (
                                <li key={i} className="text-[11px] md:text-[12px] text-[var(--color-text-secondary)] flex items-start gap-2">
                                  <span className="text-[var(--color-ember)] mt-0.5 text-[14px] leading-none">»</span> 
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback Discussion */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl shadow-sm flex flex-col" style={{ minHeight: "450px" }}>
                <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface-hover)] rounded-t-xl">
                  <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">Discussion</h3>
                  <span className="text-[9px] text-[var(--color-text-muted)] bg-[var(--color-bg-soft)] px-2 py-0.5 rounded-full border border-[var(--color-border)] text-white">Live</span>
                </div>
                
                <div className="flex-1 p-4 space-y-4 overflow-y-auto crm-scroll" style={{ maxHeight: "450px" }}>
                  {clientComments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-faint)]">
                      <svg className="w-8 h-8 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <p className="text-[11px]">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    clientComments.map((c: any) => (
                      <div key={c.id} className={`flex flex-col ${c.role === "client" ? "items-end" : "items-start"} animate-[fade-up_0.2s_ease-out]`}>
                        <div className="flex items-baseline gap-2 mb-1 px-1">
                          {c.role !== "client" && <span className="text-[10px] font-bold text-[var(--color-card-text)]">{c.author}</span>}
                          <span className="text-[8px] font-medium text-[var(--color-card-text-muted)]">{c.timeElapsed}</span>
                          {c.role === "client" && <span className="text-[10px] font-bold text-[var(--color-card-text)]">You</span>}
                        </div>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-[12px] max-w-[90%] shadow-sm ${c.role === "client" ? "bg-[var(--color-charcoal)] text-white rounded-tr-sm border border-[var(--color-charcoal-soft)]" : "bg-[var(--color-surface)] border border-[var(--color-border-card)] text-[var(--color-card-text)] rounded-tl-sm"}`}>
                          {c.videoTimestamp !== undefined && (
                            <button onClick={() => seekVideo(c.videoTimestamp!)} className={`block mb-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 transition-colors ${c.role === "client" ? "bg-[var(--color-ember)] text-white hover:bg-[var(--color-ember-hover)]" : "bg-[var(--color-bg-soft)] text-white hover:bg-[var(--color-charcoal-soft)]"}`}>
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                              {fmtTime(c.videoTimestamp)}
                            </button>
                          )}
                          <p className="leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-raised)] rounded-b-xl">
                  <FeedbackInput crm={crm} client={client} videoRef={activeVideoRef} />
                </div>
              </div>

            </div>

            {/* Right Column (Narrower): Support & Info */}
            <div className="space-y-4 md:space-y-6">
              
              {/* Report Issue */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-4 md:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)]">Need Help?</h3>
                  <span className="text-[14px]">🙋‍♂️</span>
                </div>
                <SupportForm crm={crm} client={client} />
              </div>

              {/* Active Issues */}
              {clientFlags.length > 0 && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-4 md:p-5 shadow-sm">
                  <h3 className="text-[11px] font-semibold font-mono uppercase tracking-widest text-[var(--color-text-secondary)] mb-4">Open Issues</h3>
                  <div className="space-y-3">
                    {clientFlags.map((f: any) => (
                      <div key={f.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-lg p-3 shadow-sm hover:shadow transition-shadow">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`w-2 h-2 rounded-full ${f.severity === "Critical" ? "bg-[var(--color-bad)] shadow-[0_0_5px_var(--color-bad)]" : f.severity === "High" ? "bg-[var(--color-warn)]" : "bg-[var(--color-text-muted)]"}`} />
                          <p className="text-[11px] font-bold text-[var(--color-card-text)] truncate flex-1">{f.title}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-[var(--color-border-card)]/50">
                          <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-card-text-muted)]">{f.status}</span>
                          {f.status === "Resolved" && <span className="text-[10px] font-bold text-[var(--color-ok)]">✓ Fixed</span>}
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

function FeedbackInput({ crm, client, videoRef }: any) {
  const [text, setText] = useState("");
  const [pendingTimestamp, setPendingTimestamp] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const captureTimestamp = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setPendingTimestamp(videoRef.current.currentTime);
      inputRef.current?.focus();
    } else {
      alert("Please play a video first to add timestamped feedback.");
    }
  };

  const send = () => {
    if (!text.trim()) return;
    const isAdmin = crm.userProfile?.category === "admin";
    crm.addComment({ 
      author: crm.userProfile?.name || "Client", 
      role: isAdmin ? "admin" as const : "client" as const, 
      text: text.trim(), 
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), 
      timeElapsed: "Just now", 
      clientId: client.id,
      videoTimestamp: pendingTimestamp
    });
    setText("");
    setPendingTimestamp(undefined);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        {pendingTimestamp !== undefined ? (
          <div className="flex items-center gap-1.5 bg-[var(--color-ember-soft)] border border-[var(--color-ember)]/30 px-2 py-1 rounded text-[10px] text-[var(--color-ember)] font-bold">
            <span>⏱ {fmtTime(pendingTimestamp)}</span>
            <button onClick={() => setPendingTimestamp(undefined)} className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-bad)]">×</button>
          </div>
        ) : (
          <button onClick={captureTimestamp} className="text-[9px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-ember)] flex items-center gap-1 transition-colors px-1 py-0.5 rounded hover:bg-[var(--color-bg)]">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Add feedback at current video time
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <input 
          ref={inputRef}
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder={pendingTimestamp !== undefined ? "What needs changing here?" : "Message the team..."} 
          className="flex-1 !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] rounded-xl px-3 py-2 text-[12px] outline-none focus:!border-[var(--color-ember)] shadow-sm transition-colors !placeholder:text-[var(--color-card-text-muted)]" 
          onKeyDown={e => e.key === "Enter" && send()} 
        />
        <button onClick={send} className="px-4 py-2 bg-[var(--color-ember)] text-white text-[12px] font-bold rounded-xl hover:bg-[var(--color-ember-hover)] transition-colors shadow-md">Send</button>
      </div>
    </div>
  );
}

function SupportForm({ crm, client }: any) {
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [severity, setSeverity] = useState<FlagSeverity>("Medium");
  const submit = () => { if (!title) return; crm.addFlag({ clientId: client.id, title, description: desc, severity, assignedAdminId: client.assignedAdminId }); setTitle(""); setDesc(""); };
  
  const inputClass = "w-full !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] rounded-lg px-3 py-2 text-[11px] outline-none focus:!border-[var(--color-ember)] shadow-sm transition-colors !placeholder:text-[var(--color-card-text-muted)] font-medium";

  return (
    <div className="space-y-3">
      <input placeholder="What's the issue?" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
      <textarea placeholder="Additional details..." value={desc} onChange={e => setDesc(e.target.value)} rows={3} className={inputClass + " resize-none"} />
      <div className="flex gap-2">
        <select value={severity} onChange={e => setSeverity(e.target.value as FlagSeverity)} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer shadow-sm">
          {(["Low", "Medium", "High", "Critical"] as FlagSeverity[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={submit} className="flex-1 bg-[var(--color-charcoal)] text-white text-[11px] font-bold py-2 rounded-lg hover:bg-[var(--color-charcoal-mid)] transition-colors shadow-md">Submit Ticket</button>
      </div>
    </div>
  );
}
