"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// --- Types ---

export type ClientStage = "Lead" | "Proposal" | "In Dev" | "Active" | "Completed";
export type ClientCategory = "Potential" | "Ongoing";

export interface CRMClient {
  id: number;
  name: string;
  project: string;
  location: string;
  category: ClientCategory;
  stage: ClientStage;
  health: number;
  revenue: number;
  lastActivity: string;
  avatar: string;
  assignedAdminId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  colorVar: string; // CSS variable name
  responsibilities: string[];
  activeTasks: string[];
  primaryFocus: "Outreach & Marketing" | "Client Delivery" | "Management";
}

export interface InternalProduct {
  id: string;
  name: string;
  stage: string;
  progress: number;
  description: string;
  leadId: string;
  repoLink?: string;
  sandboxLink?: string;
  metrics?: { label: string; value: string };
}

export interface Comment {
  id: string;
  author: string;
  role: "admin" | "client";
  text: string;
  timestamp: string;
  timeElapsed: string;
  clientId: number; // Linked to client portal view
}

export interface Activity {
  id: number;
  action: string;
  client: string;
  time: string;
  type: "milestone" | "comment" | "invoice" | "alert";
}

// --- Outreach Deal & Pipelines ---
export type OutreachStatus = "Lead" | "Cold Contact" | "Discussion" | "Proposal" | "Converted" | "Lost";
export type LeadSource = "Cold Call" | "LinkedIn" | "Twitter" | "Email" | "Referral" | "Instagram" | "Social Media";

export interface OutreachLead {
  id: string;
  companyName: string;
  projectDescription: string;
  source: LeadSource;
  status: OutreachStatus;
  estimatedValue: number;
  assignedAdminId: string;
  callsMade: number;
  notes: string[];
  lastContacted: string;
  sourcedById: string; // Muskan, Ankit, etc.
  engagementScore: number; // 0-100
}

// --- Client Project Flags (Issues) ---
export type FlagSeverity = "Critical" | "High" | "Medium" | "Low";
export type FlagStatus = "Open" | "Investigating" | "In Dev" | "Resolved";

export interface FlagSprintLog {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface ProjectFlag {
  id: string;
  clientId: number;
  title: string;
  description: string;
  severity: FlagSeverity;
  status: FlagStatus;
  createdAt: string;
  assignedAdminId?: string;
  resolutionNotes?: string;
  sprintLogs: FlagSprintLog[];
}

// --- Internal Workload Tasks (Collaboration Gate) ---
export type TaskStatus = "Todo" | "In Progress" | "In Review" | "Resolved";

export interface InternalTask {
  id: string;
  clientId?: number; // Optional link to client feedback comment
  productId?: string; // Optional link to internal product sprint
  title: string;
  assignedAdminId: string;
  status: TaskStatus;
  originCommentId?: string; // Link to feedback comment that triggered this task
  internalNotes: string[];
  createdAt: string;
}

// --- Review & Changelog Releases ---
export interface ChangelogRelease {
  id: string;
  clientId: number;
  version: string;
  title: string;
  whatWasImproved: string[];
  publishedAt: string;
  status: "Draft" | "Awaiting Review" | "Approved";
  approvedAt?: string;
  releaseNotes?: string; // High-level admin signoff summary
}

// --- Initial Mock Data ---

const INITIAL_TEAM: TeamMember[] = [
  { id: "a1", name: "Lakshya", role: "PM & Client Delivery Lead", avatar: "LB", colorVar: "var(--color-admin-lakshya)", responsibilities: ["Client Communication", "Product Strategy", "QA / Delivery Gate"], activeTasks: ["Review Supreme Petro Release", "Rafter.so Onboarding"], primaryFocus: "Client Delivery" },
  { id: "a2", name: "Mouriyan", role: "Backend & Tech Delivery Lead", avatar: "MR", colorVar: "var(--color-admin-mouriyan)", responsibilities: ["API Architecture", "Database Schema", "Production Builds"], activeTasks: ["Supabase Auth Setup", "BI Database Performance Optimization"], primaryFocus: "Client Delivery" },
  { id: "a3", name: "Ankit", role: "Outreach & Marketing Lead", avatar: "AK", colorVar: "var(--color-admin-ankit)", responsibilities: ["Lead Sourcing", "Cold Calling Funnel", "Client Accounts"], activeTasks: ["Karthik Exports Pitch Deck", "Social Media Leads Sourcing"], primaryFocus: "Outreach & Marketing" },
  { id: "a4", name: "Muskan", role: "Brand & Marketing Director", avatar: "MK", colorVar: "var(--color-admin-muskan)", responsibilities: ["UI/UX Design Sprints", "Brand Assets", "Social Media Branding"], activeTasks: ["NJ Jewellers Price Board UI", "Almmatix Marketing Banners"], primaryFocus: "Outreach & Marketing" },
];

const INITIAL_CLIENTS: CRMClient[] = [
  { id: 1, name: "Supreme Petro Chemicals", project: "Tally BI Dashboard", location: "Chennai", category: "Ongoing", stage: "Active", health: 92, revenue: 450000, lastActivity: "Training session completed", avatar: "SP", assignedAdminId: "a1" },
  { id: 2, name: "Karthik Exports Pvt Ltd", project: "Website + CRM", location: "Coimbatore", category: "Potential", stage: "Proposal", health: 60, revenue: 280000, lastActivity: "Proposal sent, awaiting reply", avatar: "KE", assignedAdminId: "a3" },
  { id: 3, name: "NJ Jewellers", project: "Gold Price Tracker", location: "Chennai", category: "Ongoing", stage: "In Dev", health: 85, revenue: 120000, lastActivity: "Phase 2 mockups approved", avatar: "NJ", assignedAdminId: "a4" },
  { id: 4, name: "UPKEM Labs", project: "Pharma B2B Platform", location: "Mumbai", category: "Ongoing", stage: "Active", health: 78, revenue: 600000, lastActivity: "Admin panel deployed", avatar: "UP", assignedAdminId: "a2" },
  { id: 5, name: "Rafter.so", project: "AI Code Platform", location: "Bangalore", category: "Potential", stage: "Lead", health: 45, revenue: 0, lastActivity: "CEO demo scheduled", avatar: "RF", assignedAdminId: "a1" },
];

const INITIAL_PRODUCTS: InternalProduct[] = [
  { id: "p1", name: "Almmatix CRM Core", stage: "Beta", progress: 85, description: "Our proprietary internal management tool and Agency OS.", leadId: "a1", repoLink: "github.com/almmatix/crm-core", sandboxLink: "almmatix.com/sandbox/crm", metrics: { label: "Sprint Velocity", value: "9.2 pts/wk" } },
  { id: "p2", name: "Design System V2", stage: "Planning", progress: 20, description: "Unified component library for fast shipping.", leadId: "a4", repoLink: "github.com/almmatix/design-v2", metrics: { label: "Total Components", value: "48 assets" } },
  { id: "p3", name: "Supabase Boilerplate", stage: "In Dev", progress: 40, description: "Quickstart backend template for SaaS projects.", leadId: "a2", repoLink: "github.com/almmatix/supabase-starter", sandboxLink: "supabase-starter.almmatix.com", metrics: { label: "Active Integrations", value: "6 engines" } },
];

const INITIAL_COMMENTS: Comment[] = [
  { id: "1", author: "Rajesh", role: "client", text: "Can we make the Total Revenue number larger? It is our most important metric.", timestamp: "01:23", timeElapsed: "2 hours ago", clientId: 1 },
  { id: "2", author: "Lakshya", role: "admin", text: "Done — updated in the latest build. Refresh to see it live.", timestamp: "01:23", timeElapsed: "1 hour ago", clientId: 1 },
  { id: "3", author: "Nikhil", role: "client", text: "Is the real-time API rate configured yet? The tracker shows static data.", timestamp: "11:00", timeElapsed: "4 hours ago", clientId: 3 },
  { id: "4", author: "Muskan", role: "admin", text: "Working on it. Visual design is ready, Mouriyan is linking backend today.", timestamp: "11:15", timeElapsed: "3 hours ago", clientId: 3 },
];

const INITIAL_ACTIVITY: Activity[] = [
  { id: 1, action: "Milestone approved", client: "NJ Jewellers", time: "12 min ago", type: "milestone" },
  { id: 2, action: "New feedback on demo", client: "Supreme Petro", time: "1 hr ago", type: "comment" },
  { id: 3, action: "Invoice #INV-042 paid", client: "UPKEM Labs", time: "3 hrs ago", type: "invoice" },
  { id: 4, action: "Follow-up overdue", client: "Karthik Exports", time: "5 hrs ago", type: "alert" },
];

const INITIAL_LEADS: OutreachLead[] = [
  { id: "l1", companyName: "Karthik Exports Pvt Ltd", projectDescription: "Automating lead capturing and exporting dashboard UI", source: "LinkedIn", status: "Proposal", estimatedValue: 280000, assignedAdminId: "a3", callsMade: 14, notes: ["Initial call positive", "Sent pitch deck", "Negotiating SLA terms"], lastContacted: "2 days ago", sourcedById: "a3", engagementScore: 82 },
  { id: "l2", companyName: "Rafter.so", projectDescription: "AI Copilot code review infrastructure and landing client integration", source: "Cold Call", status: "Discussion", estimatedValue: 350000, assignedAdminId: "a1", callsMade: 6, notes: ["CEO demo scheduled for tomorrow", "Interested in active support scaling"], lastContacted: "Yesterday", sourcedById: "a3", engagementScore: 90 },
  { id: "l3", companyName: "Alpha Labs Inc", projectDescription: "Web3 NFT collection landing page and smart contracts", source: "Email", status: "Cold Contact", estimatedValue: 180000, assignedAdminId: "a3", callsMade: 2, notes: ["Opened email pitch, need to follow up"], lastContacted: "3 days ago", sourcedById: "a4", engagementScore: 45 },
  { id: "l4", companyName: "Zeta Health Group", projectDescription: "SaaS health records management UI Polish", source: "Twitter", status: "Lead", estimatedValue: 120000, assignedAdminId: "a4", callsMade: 1, notes: ["Replied to DM regarding UX audit services"], lastContacted: "4 days ago", sourcedById: "a4", engagementScore: 68 },
];

const INITIAL_FLAGS: ProjectFlag[] = [
  { 
    id: "f1", 
    clientId: 1, 
    title: "BI Dashboard Loading Delay", 
    description: "The Tally dashboard averages 4.5s load times on high-volume transactions.", 
    severity: "High", 
    status: "Investigating", 
    createdAt: "1 day ago", 
    assignedAdminId: "a2",
    sprintLogs: [
      { id: "sl1", author: "Mouriyan", text: "Investigating database indexing parameters.", timestamp: "18 hours ago" }
    ]
  },
  { 
    id: "f2", 
    clientId: 3, 
    title: "Gold API Outage", 
    description: "Live tracking drops connection exactly at 23:00 GMT+5.30 daily.", 
    severity: "Critical", 
    status: "In Dev", 
    createdAt: "6 hours ago", 
    assignedAdminId: "a2",
    sprintLogs: [
      { id: "sl2", author: "Mouriyan", text: "Analyzing live API cron configurations.", timestamp: "5 hours ago" },
      { id: "sl3", author: "Lakshya", text: "Assigned tech sprint to Mouriyan. SLA target is 2 hours.", timestamp: "4 hours ago" }
    ]
  },
  { 
    id: "f3", 
    clientId: 1, 
    title: "Mobile Layout Jitter", 
    description: "Columns on Safari mobile wrap incorrectly inside the details page.", 
    severity: "Low", 
    status: "Open", 
    createdAt: "2 days ago", 
    assignedAdminId: "a4",
    sprintLogs: []
  },
];

const INITIAL_RELEASES: ChangelogRelease[] = [
  { id: "r1", clientId: 1, version: "v1.0.4", title: "BI Dashboard Performance polish", whatWasImproved: ["Optimized index parameters in transactions backend", "Decreased layout shift on mobile screens", "Added direct Excel summary download button"], publishedAt: "2 days ago", status: "Approved", approvedAt: "2 days ago", releaseNotes: "All checklist items successfully built and verified by lead developer Mouriyan. Ready for public production release." },
  { id: "r2", clientId: 1, version: "v1.1.0", title: "Financial Summary Module", whatWasImproved: ["Live Zoho invoicing connection API integrated", "Implemented admin theme switcher framework", "Optimized image components to load under 100ms"], publishedAt: "Just now", status: "Awaiting Review", releaseNotes: "Compiled based on client request for financial tracking. Sprints overseen by Lakshya." },
  { id: "r3", clientId: 3, version: "v1.0.1", title: "API Refresh polish", whatWasImproved: ["Redesigned main gold rates board", "Added decimal precision rounding framework"], publishedAt: "1 day ago", status: "Approved", approvedAt: "1 day ago", releaseNotes: "Polished by Muskan and integrated by Mouriyan." },
];

const INITIAL_INTERNAL_TASKS: InternalTask[] = [
  { id: "t1", clientId: 1, title: "Optimize transaction indexes", assignedAdminId: "a2", status: "In Progress", originCommentId: "1", internalNotes: ["Index should target revenue columns.", "Verify memory overhead on high volume loads."], createdAt: "1 day ago" },
  { id: "t2", clientId: 3, title: "Redesign rate details modal", assignedAdminId: "a4", status: "Resolved", originCommentId: "3", internalNotes: ["Client wanted decimal roundups.", "UI layout signed off by Lakshya."], createdAt: "2 days ago" },
  { id: "t3", productId: "p1", title: "Automate outbound lead email sync", assignedAdminId: "a3", status: "Todo", internalNotes: ["Integrate Resend API key config.", "Draft cold sequences for Muskan to review."], createdAt: "Just now" }
];

// --- Context Definition ---

interface CRMContextProps {
  clients: CRMClient[];
  team: TeamMember[];
  products: InternalProduct[];
  comments: Comment[];
  activities: Activity[];
  leads: OutreachLead[];
  flags: ProjectFlag[];
  releases: ChangelogRelease[];
  internalTasks: InternalTask[];
  currentAdminId: string;
  selectedClientId: number; // Track simulated client view
  setSelectedClientId: (id: number) => void;
  addComment: (comment: Omit<Comment, "id">) => void;
  deleteComment: (id: string) => void;
  updateClientStage: (clientId: number, newStage: ClientStage) => void;
  updateClientAdmin: (clientId: number, adminId: string) => void;
  
  // Outreach Pipeline Callbacks
  updateLeadStatus: (leadId: string, status: OutreachStatus) => void;
  incrementLeadCalls: (leadId: string) => void;
  addLeadNote: (leadId: string, note: string) => void;
  convertLeadToClient: (leadId: string) => void;
  addNewLead: (lead: Omit<OutreachLead, "id" | "callsMade" | "notes" | "lastContacted">) => void;

  // Support Flag Callbacks
  addFlag: (flag: Omit<ProjectFlag, "id" | "createdAt" | "status" | "sprintLogs">) => void;
  updateFlagStatus: (flagId: string, status: FlagStatus) => void;
  assignFlagAdmin: (flagId: string, adminId: string) => void;
  addFlagSprintLog: (flagId: string, author: string, text: string) => void;

  // Changelog Composer Callbacks
  createRelease: (release: Omit<ChangelogRelease, "id" | "publishedAt" | "status">) => void;
  approveRelease: (releaseId: string) => void;

  // Internal Collaboration Gate Tasks
  addInternalTask: (task: Omit<InternalTask, "id" | "createdAt" | "status" | "internalNotes">) => void;
  updateInternalTaskStatus: (taskId: string, status: TaskStatus) => void;
  addInternalTaskNote: (taskId: string, note: string) => void;
}

const CRMContext = createContext<CRMContextProps | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<CRMClient[]>(INITIAL_CLIENTS);
  const [team] = useState<TeamMember[]>(INITIAL_TEAM);
  const [products] = useState<InternalProduct[]>(INITIAL_PRODUCTS);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITY);

  // Expanded State
  const [leads, setLeads] = useState<OutreachLead[]>(INITIAL_LEADS);
  const [flags, setFlags] = useState<ProjectFlag[]>(INITIAL_FLAGS);
  const [releases, setReleases] = useState<ChangelogRelease[]>(INITIAL_RELEASES);
  const [internalTasks, setInternalTasks] = useState<InternalTask[]>(INITIAL_INTERNAL_TASKS);
  const [selectedClientId, setSelectedClientId] = useState<number>(1); // Default to Supreme Petro

  // Mock logged-in admin (Lakshya by default)
  const currentAdminId = "a1";

  const addComment = useCallback((newComment: Omit<Comment, "id">) => {
    setComments((prev) => [...prev, { ...newComment, id: Date.now().toString() }]);
  }, []);

  const deleteComment = useCallback((id: string) => {
    setComments((prev) => prev.filter(c => c.id !== id));
  }, []);

  const updateClientStage = useCallback((clientId: number, newStage: ClientStage) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const category = newStage === "Lead" || newStage === "Proposal" ? "Potential" : "Ongoing";
          return { ...c, stage: newStage, category };
        }
        return c;
      })
    );
  }, []);

  const updateClientAdmin = useCallback((clientId: number, adminId: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, assignedAdminId: adminId } : c))
    );
  }, []);

  // --- Outreach mutator callbacks ---
  const updateLeadStatus = useCallback((leadId: string, status: OutreachStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  }, []);

  const incrementLeadCalls = useCallback((leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, callsMade: l.callsMade + 1 } : l));
  }, []);

  const addLeadNote = useCallback((leadId: string, note: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: [...l.notes, note], lastContacted: "Just now" } : l));
  }, []);

  const addNewLead = useCallback((lead: Omit<OutreachLead, "id" | "callsMade" | "notes" | "lastContacted">) => {
    setLeads(prev => [
      ...prev,
      {
        ...lead,
        id: `l_${Date.now()}`,
        callsMade: 0,
        notes: ["Lead sourced, initial status logged."],
        lastContacted: "Just now"
      }
    ]);
  }, []);

  const convertLeadToClient = useCallback((leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Create new Ongoing client dynamically
    const newId = clients.length + 1;
    const newClient: CRMClient = {
      id: newId,
      name: lead.companyName,
      project: lead.projectDescription,
      location: "India",
      category: "Ongoing",
      stage: "In Dev",
      health: 80,
      revenue: lead.estimatedValue,
      lastActivity: "Lead converted into project workspace",
      avatar: lead.companyName.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2),
      assignedAdminId: lead.assignedAdminId || "a1"
    };

    // Add automatic onboarding internal tasks for the team
    const defaultTasks: InternalTask[] = [
      { id: `t_conv_${Date.now()}_1`, clientId: newId, title: "Draft custom branding mockups", assignedAdminId: "a4", status: "Todo", internalNotes: ["Muskan to align with lead branding parameters."], createdAt: "Just now" },
      { id: `t_conv_${Date.now()}_2`, clientId: newId, title: "Initialize database schema & env", assignedAdminId: "a2", status: "Todo", internalNotes: ["Mouriyan to construct Supabase instance."], createdAt: "Just now" },
      { id: `t_conv_${Date.now()}_3`, clientId: newId, title: "Draft delivery roadmap agreement", assignedAdminId: "a1", status: "Todo", internalNotes: ["Lakshya to review contract SLA milestones."], createdAt: "Just now" }
    ];

    setClients(prev => [...prev, newClient]);
    setInternalTasks(prev => [...prev, ...defaultTasks]);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setActivities(prev => [
      { id: Date.now(), action: `🤝 Converted lead to client`, client: lead.companyName, time: "Just now", type: "milestone" },
      ...prev
    ]);
  }, [leads, clients]);

  // --- Support Flag mutator callbacks ---
  const addFlag = useCallback((newFlag: Omit<ProjectFlag, "id" | "createdAt" | "status" | "sprintLogs">) => {
    setFlags(prev => [
      ...prev,
      {
        ...newFlag,
        id: `f_${Date.now()}`,
        status: "Open",
        createdAt: "Just now",
        sprintLogs: [
          { id: `sl_flag_${Date.now()}`, author: "System", text: "Flag logged by client portal. Assigned sprint owner notified.", timestamp: "Just now" }
        ]
      }
    ]);
    setActivities(prev => [
      { id: Date.now(), action: `🚨 New Flag: ${newFlag.title}`, client: `Client ID ${newFlag.clientId}`, time: "Just now", type: "alert" },
      ...prev
    ]);
  }, []);

  const updateFlagStatus = useCallback((flagId: string, status: FlagStatus) => {
    setFlags(prev => prev.map(f => {
      if (f.id === flagId) {
        return { 
          ...f, 
          status,
          sprintLogs: [
            ...f.sprintLogs,
            { id: `sl_status_${Date.now()}`, author: "System", text: `Ticket transitioned to status: ${status}`, timestamp: "Just now" }
          ]
        };
      }
      return f;
    }));
  }, []);

  const assignFlagAdmin = useCallback((flagId: string, adminId: string) => {
    const admin = team.find(t => t.id === adminId);
    setFlags(prev => prev.map(f => {
      if (f.id === flagId) {
        return { 
          ...f, 
          assignedAdminId: adminId,
          sprintLogs: [
            ...f.sprintLogs,
            { id: `sl_assign_${Date.now()}`, author: "System", text: `Sprint owner assigned: ${admin?.name || "Unassigned"}`, timestamp: "Just now" }
          ]
        };
      }
      return f;
    }));
  }, [team]);

  const addFlagSprintLog = useCallback((flagId: string, author: string, text: string) => {
    setFlags(prev => prev.map(f => {
      if (f.id === flagId) {
        return {
          ...f,
          sprintLogs: [
            ...f.sprintLogs,
            { id: `sl_note_${Date.now()}`, author, text, timestamp: "Just now" }
          ]
        };
      }
      return f;
    }));
  }, []);

  // --- Changelog Composer mutator callbacks ---
  const createRelease = useCallback((newRelease: Omit<ChangelogRelease, "id" | "publishedAt" | "status">) => {
    setReleases(prev => [
      ...prev,
      {
        ...newRelease,
        id: `r_${Date.now()}`,
        publishedAt: "Just now",
        status: "Awaiting Review"
      }
    ]);
    setActivities(prev => [
      { id: Date.now(), action: `📢 Changelog Drafted: ${newRelease.title}`, client: `Client ID ${newRelease.clientId}`, time: "Just now", type: "comment" },
      ...prev
    ]);
  }, []);

  const approveRelease = useCallback((releaseId: string) => {
    setReleases(prev => prev.map(r => r.id === releaseId ? { ...r, status: "Approved", approvedAt: "Just now" } : r));
    setActivities(prev => {
      const rel = releases.find(r => r.id === releaseId);
      return [
        { id: Date.now(), action: `✅ Changelog Approved: ${rel?.title || "Release"}`, client: `Client ID ${rel?.clientId}`, time: "Just now", type: "milestone" },
        ...prev
      ];
    });
  }, [releases]);

  // --- Internal Collaboration Gate callbacks ---
  const addInternalTask = useCallback((task: Omit<InternalTask, "id" | "createdAt" | "status" | "internalNotes">) => {
    setInternalTasks(prev => [
      ...prev,
      {
        ...task,
        id: `t_int_${Date.now()}`,
        status: "Todo",
        internalNotes: ["Internal task initialized by collaboration review gate."],
        createdAt: "Just now"
      }
    ]);
  }, []);

  const updateInternalTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setInternalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  }, []);

  const addInternalTaskNote = useCallback((taskId: string, note: string) => {
    setInternalTasks(prev => prev.map(t => t.id === taskId ? { ...t, internalNotes: [...t.internalNotes, note] } : t));
  }, []);

  return (
    <CRMContext.Provider value={{ 
      clients, team, products, comments, activities, leads, flags, releases, internalTasks, currentAdminId, selectedClientId, setSelectedClientId,
      addComment, deleteComment, updateClientStage, updateClientAdmin,
      updateLeadStatus, incrementLeadCalls, addLeadNote, convertLeadToClient, addNewLead,
      addFlag, updateFlagStatus, assignFlagAdmin, addFlagSprintLog,
      createRelease, approveRelease,
      addInternalTask, updateInternalTaskStatus, addInternalTaskNote
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
