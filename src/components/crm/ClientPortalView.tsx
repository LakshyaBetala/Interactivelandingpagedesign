"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCRM, FlagSeverity } from "./CRMContext";

const formatINR = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "—";
const severityDot = (s: FlagSeverity) => {
  if (s === "Critical") return "bg-red-500";
  if (s === "High") return "bg-amber-500";
  if (s === "Medium") return "bg-yellow-400";
  return "bg-slate-300";
};

type ClientTab = "overview" | "updates" | "feedback" | "support";

export default function ClientPortalView() {
  const crm = useCRM();
  const { clients, team, comments, flags, releases, selectedClientId, setSelectedClientId, userProfile } = crm;
  const [activeTab, setActiveTab] = useState<ClientTab>("overview");

  const isAdmin = userProfile?.category === "admin" || !userProfile;
  const client = clients.find(c => c.id === selectedClientId) || clients[0];
  if (!client) return <div className="min-h-screen flex items-center justify-center text-zinc-500 text-sm">No project data available.</div>;

  const ongoingClients = clients.filter(c => c.category === "Ongoing" || c.stage === "Confirmed" || c.stage === "Maintenance");
  const clientComments = comments.filter(c => c.clientId === client.id);
  const clientFlags = flags.filter(f => f.clientId === client.id);
  const clientReleases = releases.filter(r => r.clientId === client.id);
  const assignedTeam = team.filter(t => t.id === client.assignedAdminId);

  const tabs: { id: ClientTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "updates", label: "Updates" },
    { id: "feedback", label: "Feedback" },
    { id: "support", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold tracking-tight text-zinc-400">almmatix</span>
            <span className="text-zinc-700">·</span>
            {isAdmin ? (
              <select
                value={client.id}
                onChange={e => setSelectedClientId(Number(e.target.value))}
                className="bg-transparent text-[14px] font-semibold text-zinc-100 outline-none cursor-pointer"
              >
                {ongoingClients.map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>)}
              </select>
            ) : (
              <span className="text-[14px] font-semibold">{client.name}</span>
            )}
          </div>
          <span className="text-[11px] text-zinc-500">{client.project}</span>
        </div>
      </header>

      {/* Tab pills */}
      <div className="border-b border-zinc-800 px-6">
        <div className="flex gap-1 max-w-3xl mx-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="clientTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {activeTab === "overview" && <OverviewTab client={client} assignedTeam={assignedTeam} />}
            {activeTab === "updates" && <UpdatesTab releases={clientReleases} crm={crm} />}
            {activeTab === "feedback" && <FeedbackTab comments={clientComments} crm={crm} client={client} />}
            {activeTab === "support" && <SupportTab flags={clientFlags} crm={crm} client={client} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ===== OVERVIEW =====
function OverviewTab({ client, assignedTeam }: any) {
  const stages = ["Lead", "Requirements", "Demo", "Quoted", "Confirmed", "Maintenance"];
  const currentIdx = stages.indexOf(client.stage);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold">Project Progress</h3>
          <span className="text-[12px] text-zinc-500">Stage {currentIdx + 1} of {stages.length}</span>
        </div>
        <div className="flex items-center gap-1 mb-3">
          {stages.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`h-1.5 w-full rounded-full ${i <= currentIdx ? "bg-blue-500" : "bg-zinc-800"}`} />
              <span className={`text-[10px] ${i === currentIdx ? "text-blue-400 font-medium" : "text-zinc-600"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Contract</p>
          <p className="text-xl font-bold">{formatINR(client.revenue)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Health</p>
          <p className="text-xl font-bold">{client.health}%</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Status</p>
          <p className="text-xl font-bold">{client.stage}</p>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-[13px] font-semibold mb-2">Last Activity</h3>
        <p className="text-[13px] text-zinc-400">{client.lastActivity}</p>
      </div>

      {/* Team */}
      {assignedTeam.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-[13px] font-semibold mb-3">Your Team</h3>
          <div className="space-y-2">
            {assignedTeam.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-zinc-400">{m.avatar}</span>
                <div>
                  <p className="text-[13px] font-medium">{m.name}</p>
                  <p className="text-[11px] text-zinc-500">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== UPDATES =====
function UpdatesTab({ releases, crm }: any) {
  const [checkedItems, setCheckedItems] = useState<Record<string, Set<number>>>({});

  const toggleCheck = (releaseId: string, idx: number) => {
    setCheckedItems(prev => {
      const set = new Set(prev[releaseId] || []);
      set.has(idx) ? set.delete(idx) : set.add(idx);
      return { ...prev, [releaseId]: set };
    });
  };

  return (
    <div className="space-y-4">
      {releases.length === 0 && <p className="text-zinc-500 text-[13px] py-8 text-center">No updates yet.</p>}
      {releases.map((r: any) => {
        const checked = checkedItems[r.id] || new Set();
        const allChecked = r.whatWasImproved.length > 0 && checked.size === r.whatWasImproved.length;
        return (
          <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-[14px] font-semibold">{r.title}</h4>
                <p className="text-[11px] text-zinc-500">{r.version} · {r.publishedAt}</p>
              </div>
              {r.status === "Approved" ? (
                <span className="text-[11px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-medium">✓ Approved</span>
              ) : (
                <span className="text-[11px] px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full font-medium">Awaiting Review</span>
              )}
            </div>

            <div className="space-y-1.5 mb-3">
              {r.whatWasImproved.map((item: string, i: number) => (
                <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={r.status === "Approved" || checked.has(i)}
                    disabled={r.status === "Approved"}
                    onChange={() => toggleCheck(r.id, i)}
                    className="w-3.5 h-3.5 rounded accent-blue-500"
                  />
                  <span className="text-[12px] text-zinc-300">{item}</span>
                </label>
              ))}
            </div>

            {r.status === "Awaiting Review" && allChecked && (
              <button onClick={() => crm.approveRelease(r.id)} className="w-full bg-emerald-600 text-white text-[12px] font-medium py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                Approve Release
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== FEEDBACK =====
function FeedbackTab({ comments, crm, client }: any) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    const isAdmin = crm.userProfile?.category === "admin" || !crm.userProfile;
    crm.addComment({
      author: crm.userProfile?.name || "Client",
      role: isAdmin ? "admin" as const : "client" as const,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timeElapsed: "Just now",
      clientId: client.id,
    });
    setText("");
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your feedback..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-[13px] text-zinc-100 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button onClick={send} className="px-4 py-2.5 bg-blue-600 text-white text-[12px] font-medium rounded-xl hover:bg-blue-700 transition-colors">Send</button>
      </div>

      {/* Thread */}
      <div className="space-y-2">
        {comments.map((c: any) => (
          <div key={c.id} className={`p-3.5 rounded-xl ${c.role === "admin" ? "bg-blue-500/5 border border-blue-500/10" : "bg-zinc-900 border border-zinc-800"}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[12px] font-semibold">{c.author}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.role === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-zinc-700 text-zinc-400"}`}>{c.role}</span>
              <span className="text-[10px] text-zinc-600 ml-auto">{c.timeElapsed}</span>
            </div>
            <p className="text-[13px] text-zinc-300 leading-relaxed">{c.text}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-zinc-500 text-[13px] py-8 text-center">No feedback yet. Start the conversation.</p>}
      </div>
    </div>
  );
}

// ===== SUPPORT =====
function SupportTab({ flags, crm, client }: any) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState<FlagSeverity>("Medium");
  const statusSteps = ["Open", "Investigating", "In Dev", "Resolved"];

  const submit = () => {
    if (!title) return;
    crm.addFlag({ clientId: client.id, title, description: desc, severity, assignedAdminId: client.assignedAdminId });
    setTitle(""); setDesc(""); setSeverity("Medium");
  };

  return (
    <div className="space-y-6">
      {/* Report form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h3 className="text-[13px] font-semibold">Report an Issue</h3>
        <input placeholder="Issue title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-blue-500 placeholder:text-zinc-600" />
        <textarea placeholder="Describe the issue" value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-blue-500 resize-none placeholder:text-zinc-600" />
        <div className="flex gap-3">
          <select value={severity} onChange={e => setSeverity(e.target.value as FlagSeverity)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 outline-none">
            {(["Low", "Medium", "High", "Critical"] as FlagSeverity[]).map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={submit} className="flex-1 bg-blue-600 text-white text-[12px] font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">Submit</button>
        </div>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        {flags.map((f: any) => {
          const currentStep = statusSteps.indexOf(f.status);
          return (
            <div key={f.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${severityDot(f.severity)}`} />
                <h4 className="text-[13px] font-semibold flex-1">{f.title}</h4>
                <span className="text-[11px] text-zinc-500">{f.createdAt}</span>
              </div>
              {f.description && <p className="text-[12px] text-zinc-400 mb-3 ml-4">{f.description}</p>}

              {/* Status pipeline */}
              <div className="flex items-center gap-1 ml-4">
                {statusSteps.map((s, i) => (
                  <React.Fragment key={s}>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${i <= currentStep ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-600"}`}>{s}</span>
                    {i < statusSteps.length - 1 && <span className={`w-3 h-px ${i < currentStep ? "bg-blue-500" : "bg-zinc-800"}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Dev logs */}
              {f.sprintLogs.length > 0 && (
                <div className="mt-3 ml-4 space-y-1">
                  {f.sprintLogs.slice(-3).map((l: any) => (
                    <div key={l.id} className="text-[11px] text-zinc-500">
                      <span className="font-medium text-zinc-400">{l.author}</span> · {l.text} · <span className="text-zinc-600">{l.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {flags.length === 0 && <p className="text-zinc-500 text-[13px] py-8 text-center">No issues reported. Everything&apos;s running smoothly.</p>}
      </div>
    </div>
  );
}
