"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

// --- Types ---

export type ClientStage = "Requirement" | "Model" | "Demo 1" | "Converted" | "Dev 1" | "Demo 2" | "Dev Final" | "Final Demo" | "Delivery" | "Maintenance";
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
  cost?: number;
  amountPaid?: number;
  margin?: number;
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
  isUnreadAdmin?: boolean;
  videoTimestamp?: number; // Optional timestamp in seconds for video feedback
}

export interface Activity {
  id: number;
  action: string;
  client: string;
  time: string;
  type: "milestone" | "comment" | "invoice" | "alert";
}

// --- Outreach Deal & Pipelines ---
export type OutreachStatus = "Lead" | "Contacted" | "Responded" | "Requirements" | "Demo" | "Quoted" | "Converted" | "Lost";
export type LeadSource = "Cold Call" | "LinkedIn" | "Twitter" | "Email" | "Referral" | "Instagram" | "Social Media";

export interface OutreachLead {
  id: string;
  companyName: string;
  companyInfo?: string;
  projectDescription: string;
  source: LeadSource;
  personContacted?: string;
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
  videoUrl?: string; // Optional URL for video demos
}

// --- Social Media Pipeline ---
export type SocialPlatform = "Instagram" | "Twitter" | "LinkedIn" | "Reddit" | "YouTube";
export type SocialContentType = "Reel" | "Post" | "Story" | "Tweet" | "Blog" | "Thread";
export type SocialStatus = "Idea and Create" | "Schedule" | "Done";

export interface SocialMediaItem {
  id: string;
  platform: SocialPlatform;
  contentType: SocialContentType;
  description: string;
  status: SocialStatus;
  assignedAdminId: string;
  clientTag?: string;
  scheduledDate: string;
  createdAt: string;
}

// --- Supabase DB Types ---
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  category: "admin" | "intern" | "client";
  assignedClientId?: number; // Only for clients
  assignedProjects?: number[]; // Only for interns
  allowedTabs?: string[]; // For interns: which tabs they can see
  avatar: string;
  colorVar: string;
  primaryFocus: string;
  responsibilities: string[];
  activeTasks: string[];
}

export interface AuthorizedEmail {
  email: string;
  name: string;
  role: string;
  category: "admin" | "client";
  avatar: string;
  colorVar: string;
  primaryFocus: string;
  responsibilities: string[];
  activeTasks: string[];
  clientId?: number;
  createdAt?: string;
}

// --- Initial Mock Datasets (Fallback-Safe) ---

const INITIAL_TEAM: TeamMember[] = [
  { id: "a1", name: "Lakshya", role: "PM & Client Delivery Lead", avatar: "LB", colorVar: "var(--color-admin-lakshya)", responsibilities: ["Client Communication", "Product Strategy", "QA / Delivery Gate"], activeTasks: ["Review Supreme Petro Release", "Rafter.so Onboarding"], primaryFocus: "Client Delivery" },
  { id: "a2", name: "Mouriyan", role: "Backend & Tech Delivery Lead", avatar: "MR", colorVar: "var(--color-admin-mouriyan)", responsibilities: ["API Architecture", "Database Schema", "Production Builds"], activeTasks: ["Supabase Auth Setup", "BI Database Performance Optimization"], primaryFocus: "Client Delivery" },
  { id: "a3", name: "Ankit", role: "Outreach & Marketing Lead", avatar: "AK", colorVar: "var(--color-admin-ankit)", responsibilities: ["Lead Sourcing", "Cold Calling Funnel", "Client Accounts"], activeTasks: ["Karthik Exports Pitch Deck", "Social Media Leads Sourcing"], primaryFocus: "Outreach & Marketing" },
  { id: "a4", name: "Muskan", role: "Brand & Marketing Director", avatar: "MK", colorVar: "var(--color-admin-muskan)", responsibilities: ["UI/UX Design Sprints", "Brand Assets", "Social Media Branding"], activeTasks: ["NJ Jewellers Price Board UI", "Almmatix Marketing Banners"], primaryFocus: "Outreach & Marketing" },
];

const INITIAL_CLIENTS: CRMClient[] = [
  { id: 1, name: "UPKEM", project: "Mobile App", location: "India", category: "Ongoing", stage: "Dev 1", health: 90, revenue: 80000, cost: 35000, amountPaid: 40000, lastActivity: "Building app screens — dashboard + profile", avatar: "UP", assignedAdminId: "a1" },
  { id: 2, name: "SPC (Supreme Petro)", project: "Tally BI Dashboard + AI Agents", location: "Chennai", category: "Potential", stage: "Model", health: 70, revenue: 40000, cost: 15000, amountPaid: 0, lastActivity: "Dashboard quoted ₹40k, AI Agents ₹1.75L to quote", avatar: "SP", assignedAdminId: "a1" },
  { id: 3, name: "NJ Jewellers", project: "Gold Price Board", location: "Chennai", category: "Potential", stage: "Demo 1", health: 75, revenue: 25000, cost: 8000, amountPaid: 10000, lastActivity: "Confirm expected next week", avatar: "NJ", assignedAdminId: "a1" },
  { id: 4, name: "DOITFORME", project: "Website", location: "India", category: "Ongoing", stage: "Maintenance", health: 95, revenue: 15000, cost: 2000, amountPaid: 15000, lastActivity: "Already built, maintenance mode", avatar: "DI", assignedAdminId: "a1" },
  { id: 5, name: "Sumati", project: "Small project", location: "India", category: "Potential", stage: "Requirement", health: 50, revenue: 0, cost: 0, amountPaid: 0, lastActivity: "Exploring scope", avatar: "SU", assignedAdminId: "a2" },
  { id: 6, name: "Varsiddhi", project: "TBD", location: "India", category: "Potential", stage: "Requirement", health: 30, revenue: 0, cost: 0, amountPaid: 0, lastActivity: "Not confirmed, exploring", avatar: "VA", assignedAdminId: "a2" },
  { id: 7, name: "MMXport", project: "TBD", location: "India", category: "Potential", stage: "Requirement", health: 40, revenue: 0, cost: 0, amountPaid: 0, lastActivity: "Early stage discussions", avatar: "MM", assignedAdminId: "a2" },
  { id: 8, name: "Techie", project: "Personalized LinkedIn", location: "India", category: "Potential", stage: "Model", health: 45, revenue: 0, cost: 0, amountPaid: 0, lastActivity: "LinkedIn automation for tech", avatar: "TE", assignedAdminId: "a2" },
  { id: 9, name: "Greenlit", project: "New Product", location: "India", category: "Ongoing", stage: "Model", health: 60, revenue: 0, cost: 0, amountPaid: 0, lastActivity: "In product pipeline", avatar: "GL", assignedAdminId: "a1" },
];

const INITIAL_PRODUCTS: InternalProduct[] = [
  { id: "p1", name: "Almmatix CRM", stage: "Demo", progress: 85, description: "Internal CRM and agency management platform — this tool.", leadId: "a1", repoLink: "github.com/LakshyaBetala/Interactivelandingpagedesign", sandboxLink: "almmatix.com/portal", metrics: { label: "Modules", value: "7 sections" } },
  { id: "p2", name: "Greenlit", stage: "Ideation", progress: 10, description: "New SaaS product — early-stage concept and validation.", leadId: "a1", metrics: { label: "Phase", value: "Concept" } },
  { id: "p3", name: "Techie", stage: "Dev", progress: 35, description: "Personalized LinkedIn automation tool for tech professionals.", leadId: "a2", repoLink: "github.com/almmatix/techie", metrics: { label: "Phase", value: "Prototype" } },
  { id: "p4", name: "Almmatix Website", stage: "Distribution", progress: 100, description: "Company landing page and brand presence.", leadId: "a1", repoLink: "github.com/LakshyaBetala/Interactivelandingpagedesign", sandboxLink: "almmatix.com", metrics: { label: "Status", value: "Shipped" } },
];

const INITIAL_COMMENTS: Comment[] = [
  { id: "1", author: "UPKEM Team", role: "client", text: "Can we get a progress update on the app screens?", timestamp: "10:30", timeElapsed: "2 hours ago", clientId: 1, isUnreadAdmin: true },
  { id: "2", author: "Lakshya", role: "admin", text: "App screens for dashboard and profile are ready. Sharing build link today.", timestamp: "10:45", timeElapsed: "1 hour ago", clientId: 1, isUnreadAdmin: false },
  { id: "3", author: "SPC Team", role: "client", text: "When can we see the Tally dashboard demo?", timestamp: "11:00", timeElapsed: "4 hours ago", clientId: 2, isUnreadAdmin: true },
  { id: "4", author: "Lakshya", role: "admin", text: "Demo will be ready by end of this week. AI agents quote to follow.", timestamp: "11:15", timeElapsed: "3 hours ago", clientId: 2, isUnreadAdmin: false },
];

const INITIAL_ACTIVITY: Activity[] = [
  { id: 1, action: "UPKEM app development in progress", client: "UPKEM", time: "30 min ago", type: "milestone" },
  { id: 2, action: "SPC dashboard demo being prepared", client: "SPC", time: "1 hr ago", type: "comment" },
  { id: 3, action: "NJ Jewellers confirmation pending", client: "NJ Jewellers", time: "3 hrs ago", type: "alert" },
  { id: 4, action: "DOITFORME maintenance check done", client: "DOITFORME", time: "5 hrs ago", type: "milestone" },
];

const INITIAL_SOCIAL_MEDIA: SocialMediaItem[] = [
  { id: "sm1", platform: "Instagram", contentType: "Reel", description: "UPKEM app development behind-the-scenes", status: "Done", assignedAdminId: "a4", clientTag: "UPKEM", scheduledDate: "2026-05-19", createdAt: "2026-05-18" },
  { id: "sm2", platform: "LinkedIn", contentType: "Post", description: "Almmatix case study — SPC dashboard project", status: "Idea and Create", assignedAdminId: "a4", clientTag: "SPC", scheduledDate: "2026-05-20", createdAt: "2026-05-19" },
  { id: "sm3", platform: "Twitter", contentType: "Tweet", description: "Thread on AI agents for business automation", status: "Idea and Create", assignedAdminId: "a4", scheduledDate: "2026-05-21", createdAt: "2026-05-20" },
  { id: "sm4", platform: "Instagram", contentType: "Story", description: "Team work culture at Almmatix", status: "Schedule", assignedAdminId: "a4", scheduledDate: "2026-05-20", createdAt: "2026-05-19" },
  { id: "sm5", platform: "Reddit", contentType: "Post", description: "How we built a CRM for our agency in 2 weeks", status: "Idea and Create", assignedAdminId: "a3", scheduledDate: "2026-05-23", createdAt: "2026-05-20" },
  { id: "sm6", platform: "LinkedIn", contentType: "Post", description: "NJ Jewellers gold price board showcase", status: "Idea and Create", assignedAdminId: "a4", clientTag: "NJ Jewellers", scheduledDate: "2026-05-22", createdAt: "2026-05-20" },
];

const INITIAL_LEADS: OutreachLead[] = [
  { id: "l1", companyName: "New Prospect A", companyInfo: "Tech startup in Bangalore", projectDescription: "Website redesign and digital presence", source: "LinkedIn", personContacted: "John Doe", status: "Lead", estimatedValue: 50000, assignedAdminId: "a3", callsMade: 2, notes: ["Found via LinkedIn outreach"], lastContacted: "2 days ago", sourcedById: "a3", engagementScore: 40 },
  { id: "l2", companyName: "New Prospect B", companyInfo: "Retail chain in Mumbai", projectDescription: "E-commerce platform development", source: "Cold Call", personContacted: "Jane Smith", status: "Contacted", estimatedValue: 150000, assignedAdminId: "a3", callsMade: 5, notes: ["Cold called, showed interest", "Follow up scheduled"], lastContacted: "Yesterday", sourcedById: "a3", engagementScore: 55 },
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
  { id: "t1", clientId: 1, title: "Build UPKEM app screens", assignedAdminId: "a1", status: "In Progress", internalNotes: ["Dashboard and profile screens in progress."], createdAt: "Today" },
  { id: "t2", clientId: 2, title: "Prepare SPC Tally dashboard demo", assignedAdminId: "a1", status: "In Progress", internalNotes: ["Demo needs to be ready by end of week."], createdAt: "Today" },
  { id: "t3", clientId: 2, title: "Draft AI Agents quote for SPC", assignedAdminId: "a1", status: "Todo", internalNotes: ["₹1.75L estimated for AI agent integration."], createdAt: "Today" },
  { id: "t4", clientId: 3, title: "Finalize NJ Jewellers price board", assignedAdminId: "a1", status: "Todo", internalNotes: ["Waiting on confirmation next week."], createdAt: "Today" },
  { id: "t5", clientId: 5, title: "Gather Sumati requirements", assignedAdminId: "a2", status: "In Progress", internalNotes: ["Small project, scoping in progress."], createdAt: "Today" },
  { id: "t6", clientId: 8, title: "Build Techie LinkedIn automation prototype", assignedAdminId: "a2", status: "Todo", internalNotes: ["Personalized LinkedIn for tech professionals."], createdAt: "Today" },
  { id: "t7", title: "Run outreach campaign batch", assignedAdminId: "a3", status: "In Progress", internalNotes: ["Ankit managing intern for cold outreach."], createdAt: "Today" },
  { id: "t8", title: "Social media content calendar", assignedAdminId: "a4", status: "In Progress", internalNotes: ["Muskan handling all client social media."], createdAt: "Today" },
];

const INITIAL_AUTH_EMAILS: AuthorizedEmail[] = [
  {
    email: "lakshbetala15@gmail.com",
    name: "Lakshya",
    role: "PM & Client Delivery Lead",
    category: "admin",
    avatar: "LB",
    colorVar: "var(--color-admin-lakshya)",
    primaryFocus: "Client Delivery",
    responsibilities: ["Client Communication", "Product Strategy", "QA / Delivery Gate"],
    activeTasks: ["Review Supreme Petro Release", "Rafter.so Onboarding"],
  },
  {
    email: "gandhimouriyan1234@gmail.com",
    name: "Mouriyan",
    role: "Backend & Tech Delivery Lead",
    category: "admin",
    avatar: "MR",
    colorVar: "var(--color-admin-mouriyan)",
    primaryFocus: "Client Delivery",
    responsibilities: ["API Architecture", "Database Schema", "Production Builds"],
    activeTasks: ["Supabase Auth Setup", "BI Database Performance Optimization"],
  },
  {
    email: "monarchankit25@gmail.com",
    name: "Ankit",
    role: "Outreach & Marketing Lead",
    category: "admin",
    avatar: "AK",
    colorVar: "var(--color-admin-ankit)",
    primaryFocus: "Outreach & Marketing",
    responsibilities: ["Lead Sourcing", "Cold Calling Funnel", "Client Accounts"],
    activeTasks: ["Karthik Exports Pitch Deck", "Social Media Leads Sourcing"],
  },
  {
    email: "muskanabani01@gmail.com",
    name: "Muskan",
    role: "Brand & Marketing Director",
    category: "admin",
    avatar: "MK",
    colorVar: "var(--color-admin-muskan)",
    primaryFocus: "Outreach & Marketing",
    responsibilities: ["UI/UX Design Sprints", "Brand Assets", "Social Media Branding"],
    activeTasks: ["NJ Jewellers Price Board UI", "Almmatix Marketing Banners"],
  },
  {
    email: "intern.outreach@almmatix.com",
    name: "Outreach Intern",
    role: "Outreach Intern",
    category: "admin",
    avatar: "OI",
    colorVar: "var(--color-admin-ankit)",
    primaryFocus: "Outreach & Marketing",
    responsibilities: ["Lead Sourcing", "Data Entry"],
    activeTasks: ["Call 10 Sourced Leads"],
  },
  {
    email: "intern.dev@almmatix.com",
    name: "Delivery Intern",
    role: "Dev Intern",
    category: "admin",
    avatar: "DI",
    colorVar: "var(--color-admin-mouriyan)",
    primaryFocus: "Client Delivery",
    responsibilities: ["Bug Fixes", "CSS Polishing"],
    activeTasks: ["Fix Columns Safaris Layout jitter"],
  }
];

const mapAuthEmailToTS = (db: any): AuthorizedEmail => ({
  email: db.email,
  name: db.name,
  role: db.role || "",
  category: db.category,
  avatar: db.avatar || "",
  colorVar: db.color_var || "var(--color-neutral)",
  primaryFocus: db.primary_focus || "Client Delivery",
  responsibilities: db.responsibilities || [],
  activeTasks: db.active_tasks || [],
  clientId: db.client_id || undefined,
  createdAt: db.created_at || "",
});

// --- Mappers: DB format to/from Application UI camelCase types ---

const mapClientToTS = (db: any): CRMClient => ({
  id: db.id,
  name: db.name,
  project: db.project,
  location: db.location || "",
  category: db.category,
  stage: db.stage,
  health: db.health ?? 100,
  revenue: Number(db.revenue || 0),
  amountPaid: Number(db.amount_paid || 0),
  margin: Number(db.margin || 0),
  lastActivity: db.last_activity || "",
  avatar: db.avatar || "",
  assignedAdminId: db.assigned_admin_id || undefined,
});

const mapTeamMemberToTS = (db: any): TeamMember => ({
  id: db.id,
  name: db.name,
  role: db.role || "",
  avatar: db.avatar || "",
  colorVar: db.color_var || "var(--color-neutral)",
  responsibilities: db.responsibilities || [],
  activeTasks: db.active_tasks || [],
  primaryFocus: (db.primary_focus as any) || "Client Delivery",
});

const mapProductToTS = (db: any): InternalProduct => ({
  id: db.id,
  name: db.name,
  stage: db.stage,
  progress: db.progress ?? 0,
  description: db.description || "",
  leadId: db.lead_id || "",
  repoLink: db.repo_link || undefined,
  sandboxLink: db.sandbox_link || undefined,
  metrics: db.metrics || undefined,
});

const mapCommentToTS = (db: any): Comment => ({
  id: db.id.toString(),
  author: db.author,
  role: db.role,
  text: db.text,
  timestamp: db.timestamp || "",
  timeElapsed: db.time_elapsed || "",
  clientId: db.client_id,
});

const mapLeadToTS = (db: any): OutreachLead => ({
  id: db.id,
  companyName: db.company_name,
  companyInfo: db.company_info || "",
  projectDescription: db.project_description || "",
  source: db.source,
  personContacted: db.person_contacted || "",
  status: db.status,
  estimatedValue: Number(db.estimated_value || 0),
  assignedAdminId: db.assigned_admin_id || "",
  callsMade: db.calls_made ?? 0,
  notes: db.notes || [],
  lastContacted: db.last_contacted || "",
  sourcedById: db.sourced_by_id || "",
  engagementScore: db.engagement_score ?? 0,
});

const mapFlagToTS = (db: any): ProjectFlag => ({
  id: db.id,
  clientId: db.client_id,
  title: db.title,
  description: db.description || "",
  severity: db.severity,
  status: db.status,
  createdAt: db.created_at || "",
  assignedAdminId: db.assigned_admin_id || undefined,
  sprintLogs: db.sprint_logs || [],
});

const mapTaskToTS = (db: any): InternalTask => ({
  id: db.id,
  clientId: db.client_id || undefined,
  productId: db.product_id || undefined,
  title: db.title,
  assignedAdminId: db.assigned_admin_id,
  status: db.status,
  originCommentId: db.origin_comment_id || undefined,
  internalNotes: db.internal_notes || [],
  createdAt: db.created_at || "",
});

const mapReleaseToTS = (db: any): ChangelogRelease => ({
  id: db.id,
  clientId: db.client_id,
  version: db.version,
  title: db.title,
  whatWasImproved: db.what_was_improved || [],
  publishedAt: db.published_at || new Date().toISOString(),
  status: db.status,
  approvedAt: db.approved_at,
  releaseNotes: db.release_notes,
});

const mapSocialToTS = (db: any): SocialMediaItem => ({
  id: db.id,
  platform: db.platform,
  contentType: db.content_type,
  description: db.description,
  status: db.status,
  assignedAdminId: db.assigned_admin_id,
  scheduledDate: db.scheduled_date,
  clientTag: db.client_tag,
  createdAt: db.created_at
});

// --- Context Definition ---

interface CRMContextProps {
  clients: CRMClient[];
  team: TeamMember[];
  products: InternalProduct[];
  comments: Comment[];
  activities: Activity[];
  socialMedia: SocialMediaItem[];
  setSocialMedia: React.Dispatch<React.SetStateAction<SocialMediaItem[]>>;
  leads: OutreachLead[];
  flags: ProjectFlag[];
  releases: ChangelogRelease[];
  internalTasks: InternalTask[];
  currentAdminId: string;
  selectedClientId: number;
  setSelectedClientId: (id: number) => void;
  addComment: (comment: Omit<Comment, "id">) => void;
  deleteComment: (id: string) => void;
  markCommentAsRead: (id: string) => void;
  updateClientStage: (clientId: number, newStage: ClientStage) => void;
  updateClientAdmin: (clientId: number, adminId: string) => void;
  updateClient: (clientId: number, updates: Partial<CRMClient>) => void;
  addCrmUser: (user: any) => void;
  deleteCrmUser: (email: string) => void;
  crmUsers: any[];
  updateLead: (leadId: string, updates: Partial<OutreachLead>) => void;
  updateInternalTask: (taskId: string, updates: Partial<InternalTask>) => void;
  updateFlag: (flagId: string, updates: Partial<ProjectFlag>) => void;
  updateProduct: (id: string, updates: Partial<InternalProduct>) => void;
  addProduct: (product: Partial<InternalProduct>) => void;
  deleteProduct: (id: string) => void;
  updateCrmUser: (email: string, updates: any) => void;
  addRelease: (release: Partial<ChangelogRelease>) => void;
  
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

  // Direct CRUD operations
  addNewClient: (client: Omit<CRMClient, "id" | "health" | "lastActivity" | "avatar">) => void;
  deleteClient: (clientId: number) => void;
  deleteLead: (leadId: string) => void;
  deleteInternalTask: (taskId: string) => void;
  deleteFlag: (flagId: string) => void;
  deleteRelease: (releaseId: string) => void;

  // Real auth properties
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  isSupabaseConfigured: boolean;
  isSupabaseOnline: boolean;
  signOut: () => Promise<void>;
  authorizedEmails: AuthorizedEmail[];
  provisionUser: (emailData: Omit<AuthorizedEmail, "createdAt">) => Promise<boolean>;
  deprovisionUser: (email: string) => Promise<boolean>;
  purgeAllMockData: () => Promise<void>;
  addSocialMedia: (item: SocialMediaItem) => Promise<void>;
  updateSocialMedia: (id: string, updates: Partial<SocialMediaItem>) => Promise<void>;
  deleteSocialMedia: (id: string) => Promise<void>;
}

const CRMContext = createContext<CRMContextProps | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [crmUsers, setCrmUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(false);

  // Database application states — start empty; populated by fetchOperationalData or offline fallback
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [authorizedEmails, setAuthorizedEmails] = useState<AuthorizedEmail[]>(INITIAL_AUTH_EMAILS);
  const [products, setProducts] = useState<InternalProduct[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMediaItem[]>([]);
  const [leads, setLeads] = useState<OutreachLead[]>([]);
  const [flags, setFlags] = useState<ProjectFlag[]>([]);
  const [releases, setReleases] = useState<ChangelogRelease[]>([]);
  const [internalTasks, setInternalTasks] = useState<InternalTask[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number>(1);

  const team = useMemo(() => {
    return crmUsers
      .filter((u: any) => u.category === "admin" || u.category === "intern")
      .map((u: any) => ({
        id: u.id || u.email,
        name: u.name,
        role: u.role || "Team Member",
        avatar: (u.name || "?").substring(0, 2).toUpperCase(),
        colorVar: u.colorVar || "var(--color-admin-lakshya)",
        primaryFocus: (u.primary_focus || u.primaryFocus || "Management") as any,
        responsibilities: [],
        activeTasks: []
      }));
  }, [crmUsers]);

  // If Supabase is unconfigured, fall back to "a1" (Lakshya) for admin operations.
  const currentAdminId = userProfile?.id || "a1";

  // Check if Supabase keys are fully defined
  const checkSupabaseStatus = useCallback(() => {
    const isConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key-for-build";
    setIsSupabaseConfigured(isConfigured);
    return isConfigured;
  }, []);

  // Async connection checker
  useEffect(() => {
    const pingSupabase = async () => {
      if (checkSupabaseStatus()) {
        try {
          const { error } = await supabase.from("clients").select("count", { count: "exact", head: true });
          if (!error) {
            setIsSupabaseOnline(true);
            return;
          }
        } catch (e) {
          console.warn("Real-time database network connection ping failed:", e);
        }
      }
      setIsSupabaseOnline(false);
    };
    pingSupabase();
  }, [checkSupabaseStatus]);

  // Fetch complete operational schema or client isolated records
  const fetchOperationalData = useCallback(async (profile: UserProfile) => {
    // If Supabase is not configured (e.g., missing Vercel env vars), stay in Mock Data / Offline Mode
    if (!checkSupabaseStatus()) {
      setIsSupabaseOnline(false);
      return;
    }

    try {
      if (profile.category === "admin" || profile.category === "intern") {
        // Partners fetch all telemetry metrics individually so one missing table doesn't abort the rest
        const safeFetch = async (promise: PromiseLike<any>) => {
          const res = await promise;
          if (res.error) console.warn("Supabase fetch error:", res.error.message);
          return res.data || null;
        };

        const dbProfiles = await safeFetch(supabase.from("profiles").select("*"));
        const dbClients = await safeFetch(supabase.from("clients").select("*"));
        const dbProducts = await safeFetch(supabase.from("internal_products").select("*"));
        const dbComments = await safeFetch(supabase.from("comments").select("*").order("created_at", { ascending: false }));
        const dbLeads = await safeFetch(supabase.from("outreach_leads").select("*"));
        const dbFlags = await safeFetch(supabase.from("project_flags").select("*"));
        const dbReleases = await safeFetch(supabase.from("releases").select("*"));
        const dbTasks = await safeFetch(supabase.from("internal_tasks").select("*"));
        const dbAuthEmails = await safeFetch(supabase.from("authorized_emails").select("*"));
        const dbSocial = await safeFetch(supabase.from("social_media").select("*"));

        // Merge Supabase profiles with local edits/passwords
        if (dbProfiles) {
          try {
            const localUsers = JSON.parse(localStorage.getItem("almmatix_users") || "[]");
            const mergedProfiles = dbProfiles.map((dbUser:any) => {
              const localMatch = localUsers.find((lu:any) => 
                (lu.id && lu.id === dbUser.id) || 
                (lu.email && lu.email === dbUser.email) || 
                (lu.name && lu.name === dbUser.name)
              );
              return localMatch ? { ...dbUser, ...localMatch, category: localMatch.category || dbUser.category } : dbUser;
            });
            // Also append any local users that aren't in Supabase at all
            localUsers.forEach((lu:any) => {
              if (!mergedProfiles.some((mp:any) => mp.email === lu.email || mp.name === lu.name)) {
                mergedProfiles.push(lu);
              }
            });
            setCrmUsers(mergedProfiles);
          } catch(e) {
            setCrmUsers(dbProfiles);
          }
        }
        setClients(dbClients ? dbClients.map(mapClientToTS) : []);
        setProducts(dbProducts ? dbProducts.map(mapProductToTS) : []);
        setComments(dbComments ? dbComments.map(mapCommentToTS) : []);
        setLeads(dbLeads ? dbLeads.map(mapLeadToTS) : []);
        setFlags(dbFlags ? dbFlags.map(mapFlagToTS) : []);
        setReleases(dbReleases ? dbReleases.map(mapReleaseToTS) : []);
        setInternalTasks(dbTasks ? dbTasks.map(mapTaskToTS) : []);
        if (dbAuthEmails && dbAuthEmails.length > 0) setAuthorizedEmails(dbAuthEmails.map(mapAuthEmailToTS));
        setSocialMedia(dbSocial ? dbSocial.map(mapSocialToTS) : []);
      } else {
        // Client sandboxing - fetch ONLY their record
        setClients([]);
        setComments([]);
        setFlags([]);
        setReleases([]);

        const { data: dbClients, error: clientErr } = await supabase
          .from("clients")
          .select("*")
          .eq("profile_id", profile.id);

        if (clientErr) console.warn("Client fetch error:", clientErr.message);

        if (dbClients && dbClients.length > 0) {
          const clientData = mapClientToTS(dbClients[0]);
          setClients([clientData]);
          setSelectedClientId(clientData.id);

          // Isolated subqueries
          const safeFetch = async (promise: PromiseLike<any>) => {
            const res = await promise;
            if (res.error) console.warn("Supabase isolated fetch error:", res.error.message);
            return res.data || null;
          };

          const dbComments = await safeFetch(supabase.from("comments").select("*").eq("client_id", clientData.id));
          const dbFlags = await safeFetch(supabase.from("project_flags").select("*").eq("client_id", clientData.id));
          const dbReleases = await safeFetch(supabase.from("releases").select("*").eq("client_id", clientData.id));

          if (dbComments) setComments(dbComments.map(mapCommentToTS));
          if (dbFlags) setFlags(dbFlags.map(mapFlagToTS));
          if (dbReleases) setReleases(dbReleases.map(mapReleaseToTS));
        }
      }
    } catch (err) {
      console.error("Error loading operational telemetry from Supabase:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        // If no profile row exists, we use an empty object and rely entirely on JWT metadata fallbacks.
        const pData = profileData || {};

        const profile: UserProfile = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || pData.name || session.user.email || "User",
          role: session.user.user_metadata?.role || pData.role || "",
          category: session.user.user_metadata?.category || pData.category || "client",
          assignedClientId: session.user.user_metadata?.assignedClientId || pData.assigned_client_id,
          assignedProjects: pData.assigned_projects,
          allowedTabs: session.user.user_metadata?.allowedTabs || pData.allowed_tabs || null,
          avatar: session.user.user_metadata?.avatar || pData.avatar || (pData.name || session.user.user_metadata?.name ? (pData.name || session.user.user_metadata?.name).substring(0, 2).toUpperCase() : "U"),
          colorVar: pData.color_var || "var(--color-admin-lakshya)",
          primaryFocus: pData.primary_focus || "Operations",
          responsibilities: pData.responsibilities || [],
          activeTasks: pData.active_tasks || [],
        };
        
        if (mounted) {
          setUserProfile(profile);
          fetchOperationalData(profile);
        }

        // Self-heal the database profile row in the background if it's missing or out of sync
        const needsHeal = !profileData || pData.category !== profile.category || pData.role !== profile.role;
        if (needsHeal) {
          supabase.from("profiles").upsert({
            id: profile.id,
            category: profile.category,
            role: profile.role,
            name: profile.name,
            allowed_tabs: profile.allowedTabs,
            assigned_client_id: profile.assignedClientId,
            email: profile.email
          }).then(({error}) => {
             if (error) console.warn("Self-heal profile update failed:", error);
          });
        }
      } else {
        if (mounted) {
          setUserProfile(null);
          // If offline mode
          if (!checkSupabaseStatus()) {
            setClients(INITIAL_CLIENTS);
            setProducts(INITIAL_PRODUCTS);
            setComments(INITIAL_COMMENTS);
            setActivities(INITIAL_ACTIVITY);
            setSocialMedia(INITIAL_SOCIAL_MEDIA);
            setLeads(INITIAL_LEADS);
            setFlags(INITIAL_FLAGS);
            setReleases(INITIAL_RELEASES);
            setInternalTasks(INITIAL_INTERNAL_TASKS);
          }
        }
      }
      if (mounted) setLoading(false);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadSession();
      } else if (event === "SIGNED_OUT") {
        setUserProfile(null);
        window.location.href = "/portal/auth";
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };


  }, []);

  const addCrmUser = useCallback(async (user: any) => {
    if (isSupabaseConfigured) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        try {
          const authRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": supabaseKey },
            body: JSON.stringify({
              email: user.email,
              password: user.password,
              data: {
                name: user.name,
                role: user.role,
                category: user.category,
                assignedClientId: user.assignedClientId || null,
                allowedTabs: user.allowedTabs || null
              }
            })
          });
          const authData = await authRes.json();
          const userId = authData?.user?.id || authData?.id;
          
          if (userId) {
            user.id = userId; // Ensure local UI knows the true ID
            await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` },
              body: JSON.stringify({
                role: user.role,
                category: user.category,
                name: user.name,
                assigned_client_id: user.assignedClientId || null,
                allowed_tabs: user.allowedTabs || null
              })
            });
          }
        } catch (e) {
          console.error("Failed to provision user to Supabase Auth:", e);
        }
      }
    }
    
    // Fallback/Sync for UI
    setCrmUsers(prev => {
      const updated = [...prev, user];
      localStorage.setItem("almmatix_users", JSON.stringify(updated));
      return updated;
    });
  }, [isSupabaseConfigured]);

  const deleteCrmUser = useCallback((email: string) => {
    setCrmUsers(prev => {
      const updated = prev.filter(u => u.email !== email);
      localStorage.setItem("almmatix_users", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    window.location.href = "/portal/auth";
  }, []);

  const provisionUser = useCallback(async (emailData: Omit<AuthorizedEmail, "createdAt">) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("authorized_emails")
        .insert({
          email: emailData.email.toLowerCase(),
          name: emailData.name,
          role: emailData.role,
          category: emailData.category,
          avatar: emailData.avatar,
          color_var: emailData.colorVar,
          primary_focus: emailData.primaryFocus,
          responsibilities: emailData.responsibilities,
          active_tasks: emailData.activeTasks,
          client_id: emailData.clientId || null,
        })
        .select();

      if (error) {
        console.error("Database insert pre-authorized email error:", error);
        return false;
      } else if (data && data.length > 0) {
        setAuthorizedEmails((prev) => [mapAuthEmailToTS(data[0]), ...prev]);
        return true;
      }
    }
    // Safe Local Fallback
    const newAuth: AuthorizedEmail = {
      ...emailData,
      email: emailData.email.toLowerCase(),
      createdAt: "Just now",
    };
    setAuthorizedEmails((prev) => [newAuth, ...prev]);
    return true;
  }, [isSupabaseConfigured]);

  const deprovisionUser = useCallback(async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("authorized_emails")
        .delete()
        .eq("email", email.toLowerCase());

      if (error) {
        console.error("Database delete pre-authorized email error:", error);
        return false;
      } else {
        setAuthorizedEmails((prev) => prev.filter((ae) => ae.email.toLowerCase() !== email.toLowerCase()));
        return true;
      }
    }
    setAuthorizedEmails((prev) => prev.filter((ae) => ae.email.toLowerCase() !== email.toLowerCase()));
    return true;
  }, [isSupabaseConfigured]);

  // --- MUTATOR WRAPPERS WITH RESILIENT LOCAL FALLBACKS ---

  const addComment = useCallback(async (newComment: Omit<Comment, "id">) => {
    if (isSupabaseConfigured && userProfile) {
      const { data, error } = await supabase.from("comments").insert({
        author: newComment.author,
        role: newComment.role,
        text: newComment.text,
        timestamp: newComment.timestamp,
        time_elapsed: newComment.timeElapsed,
        client_id: newComment.clientId,
      }).select();

      if (error) console.error("Database insert comment error:", error);
      else if (data && data.length > 0) {
        setComments((prev) => [mapCommentToTS(data[0]), ...prev]);
        return;
      }
    }
    // Safe Local Fallback
    setComments((prev) => [{ ...newComment, id: Date.now().toString(), isUnreadAdmin: newComment.role === 'client' }, ...prev]);
  }, [isSupabaseConfigured, userProfile]);

  const markCommentAsRead = useCallback(async (id: string) => {
    // Local state only for now
    setComments(prev => prev.map(c => c.id === id ? { ...c, isUnreadAdmin: false } : c));
  }, []);

  const deleteComment = useCallback(async (id: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) console.error("Database delete comment error:", error);
      else {
        setComments((prev) => prev.filter(c => c.id !== id));
        return;
      }
    }
    setComments((prev) => prev.filter(c => c.id !== id));
  }, [isSupabaseConfigured]);

  const updateClientStage = useCallback(async (clientId: number, newStage: ClientStage) => {
    const category: ClientCategory = (newStage === "Requirement" || newStage === "Model" || newStage === "Demo 1") ? "Potential" : "Ongoing";
    
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("clients")
        .update({ stage: newStage, category })
        .eq("id", clientId);
      
      if (error) console.error("Database update client stage error:", error);
      else {
        setClients((prev) =>
          prev.map((c) => (c.id === clientId ? { ...c, stage: newStage, category } : c))
        );
        return;
      }
    }
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, stage: newStage, category } : c))
    );
  }, [isSupabaseConfigured]);

  const updateClientAdmin = useCallback(async (clientId: number, adminId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("clients")
        .update({ assigned_admin_id: adminId })
        .eq("id", clientId);

      if (error) console.error("Database assign admin error:", error);
      else {
        setClients((prev) =>
          prev.map((c) => (c.id === clientId ? { ...c, assignedAdminId: adminId } : c))
        );
        return;
      }
    }
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, assignedAdminId: adminId } : c))
    );
  }, [isSupabaseConfigured]);

  const updateClient = useCallback(async (clientId: number, updates: Partial<CRMClient>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.project !== undefined) dbUpdates.project = updates.project;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
    if (updates.health !== undefined) dbUpdates.health = updates.health;
    if (updates.revenue !== undefined) dbUpdates.revenue = updates.revenue;
    if (updates.amountPaid !== undefined) dbUpdates.amount_paid = updates.amountPaid;
    if (updates.margin !== undefined) dbUpdates.margin = updates.margin;
    if (updates.lastActivity !== undefined) dbUpdates.last_activity = updates.lastActivity;
    if (updates.assignedAdminId !== undefined) dbUpdates.assigned_admin_id = updates.assignedAdminId;

    if (isSupabaseConfigured && Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from("clients").update(dbUpdates).eq("id", clientId);
      if (error) console.error("Database update client error:", error);
    }
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
  }, [isSupabaseConfigured]);

  const updateLead = useCallback(async (leadId: string, updates: Partial<OutreachLead>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
    if (updates.projectDescription !== undefined) dbUpdates.project_description = updates.projectDescription;
    if (updates.source !== undefined) dbUpdates.source = updates.source;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.estimatedValue !== undefined) dbUpdates.estimated_value = updates.estimatedValue;
    if (updates.assignedAdminId !== undefined) dbUpdates.assigned_admin_id = updates.assignedAdminId;
    if (updates.engagementScore !== undefined) dbUpdates.engagement_score = updates.engagementScore;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    if (isSupabaseConfigured && Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from("outreach_leads").update(dbUpdates).eq("id", leadId);
      if (error) console.error("Database update lead error:", error);
    }
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates } : l));
  }, [isSupabaseConfigured]);

  const updateInternalTask = useCallback(async (taskId: string, updates: Partial<InternalTask>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.assignedAdminId !== undefined) dbUpdates.assigned_admin_id = updates.assignedAdminId;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.internalNotes !== undefined) dbUpdates.internal_notes = updates.internalNotes;

    if (isSupabaseConfigured && Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from("internal_tasks").update(dbUpdates).eq("id", taskId);
      if (error) console.error("Database update task error:", error);
    }
    setInternalTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, [isSupabaseConfigured]);

  const updateFlag = useCallback(async (flagId: string, updates: Partial<ProjectFlag>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.severity !== undefined) dbUpdates.severity = updates.severity;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.assignedAdminId !== undefined) dbUpdates.assigned_admin_id = updates.assignedAdminId;
    if (updates.resolutionNotes !== undefined) dbUpdates.resolution_notes = updates.resolutionNotes;

    if (isSupabaseConfigured && Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from("project_flags").update(dbUpdates).eq("id", flagId);
      if (error) console.error("Database update flag error:", error);
    }
    setFlags(prev => prev.map(f => f.id === flagId ? { ...f, ...updates } : f));
  }, [isSupabaseConfigured]);

  const updateLeadStatus = useCallback(async (leadId: string, status: OutreachStatus) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("outreach_leads")
        .update({ status })
        .eq("id", leadId);
      
      if (error) console.error("Database lead status error:", error);
      else {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
        return;
      }
    }
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  }, [isSupabaseConfigured]);

  const incrementLeadCalls = useCallback(async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const calls = lead.callsMade + 1;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("outreach_leads")
        .update({ calls_made: calls })
        .eq("id", leadId);

      if (error) console.error("Database calls counter error:", error);
      else {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, callsMade: calls } : l));
        return;
      }
    }
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, callsMade: calls } : l));
  }, [leads, isSupabaseConfigured]);

  const addLeadNote = useCallback(async (leadId: string, note: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const notes = [...lead.notes, note];

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("outreach_leads")
        .update({ notes, last_contacted: "Just now" })
        .eq("id", leadId);

      if (error) console.error("Database lead note error:", error);
      else {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes, lastContacted: "Just now" } : l));
        return;
      }
    }
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: [...l.notes, note], lastContacted: "Just now" } : l));
  }, [leads, isSupabaseConfigured]);

  const addNewLead = useCallback(async (lead: Omit<OutreachLead, "id" | "callsMade" | "notes" | "lastContacted">) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("outreach_leads").insert({
        company_name: lead.companyName,
        company_info: lead.companyInfo,
        project_description: lead.projectDescription,
        source: lead.source,
        person_contacted: lead.personContacted,
        status: lead.status,
        estimated_value: lead.estimatedValue,
        assigned_admin_id: lead.assignedAdminId || null,
        calls_made: 0,
        notes: ["Lead sourced, initial status logged."],
        last_contacted: "Just now",
        sourced_by_id: lead.sourcedById || null,
        engagement_score: lead.engagementScore,
      }).select();

      if (error) console.error("Database add lead error:", error);
      else if (data && data.length > 0) {
        setLeads(prev => [...prev, mapLeadToTS(data[0])]);
        return;
      }
    }
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
    setActivities(prev => [{ id: Date.now(), action: `📥 New lead added: ${lead.companyName}`, client: lead.companyName, time: "Just now", type: "comment" as const }, ...prev]);
  }, [isSupabaseConfigured]);

  const convertLeadToClient = useCallback(async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (isSupabaseConfigured) {
      // Create new client in db
      const { data: clientData, error: clientErr } = await supabase.from("clients").insert({
        name: lead.companyName,
        project: lead.projectDescription,
        location: "India",
        category: "Ongoing",
        stage: "Converted",
        health: 80,
        revenue: lead.estimatedValue,
        last_activity: "Lead converted into project",
        avatar: lead.companyName.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2),
        assigned_admin_id: lead.assignedAdminId || null,
      }).select();

      if (clientErr) {
        console.error("Error creating client from lead:", clientErr);
        return;
      }

      if (clientData && clientData.length > 0) {
        const newClient = mapClientToTS(clientData[0]);
        
        // Add automatic onboarding tasks in DB
        const dbTasks = [
          { client_id: newClient.id, title: "Draft custom branding mockups", assigned_admin_id: "da444444-4444-4444-4444-444444444444", status: "Todo", internal_notes: ["Muskan to align with lead branding parameters."], created_at: "Just now" },
          { client_id: newClient.id, title: "Initialize database schema & env", assigned_admin_id: "da222222-2222-2222-2222-222222222222", status: "Todo", internal_notes: ["Mouriyan to construct Supabase instance."], created_at: "Just now" },
          { client_id: newClient.id, title: "Draft delivery roadmap agreement", assigned_admin_id: "da111111-1111-1111-1111-111111111111", status: "Todo", internal_notes: ["Lakshya to review contract SLA milestones."], created_at: "Just now" }
        ];

        await Promise.all([
          supabase.from("internal_tasks").insert(dbTasks),
          supabase.from("outreach_leads").delete().eq("id", leadId),
          supabase.from("activities").insert({
            action: `🤝 Converted lead to client`,
            client: lead.companyName,
            time: "Just now",
            type: "milestone"
          })
        ]);

        // Re-trigger global dashboard fetch to sync everything properly
        if (userProfile) await fetchOperationalData(userProfile);
        return;
      }
    }

    // Local Fallback
    const newId = clients.length + 1;
    const newClient: CRMClient = {
      id: newId,
      name: lead.companyName,
      project: lead.projectDescription,
      location: "India",
      category: "Ongoing",
      stage: "Converted",
      health: 80,
      revenue: lead.estimatedValue,
      lastActivity: "Lead converted into project",
      avatar: lead.companyName.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2),
      assignedAdminId: lead.assignedAdminId || "a1"
    };

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
  }, [leads, clients, isSupabaseConfigured, userProfile, fetchOperationalData]);

  const addFlag = useCallback(async (newFlag: Omit<ProjectFlag, "id" | "createdAt" | "status" | "sprintLogs">) => {
    const logs = [{ id: `sl_flag_${Date.now()}`, author: "System", text: "Flag logged by client portal. Assigned sprint owner notified.", timestamp: "Just now" }];
    
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("project_flags").insert({
        client_id: newFlag.clientId,
        title: newFlag.title,
        description: newFlag.description,
        severity: newFlag.severity,
        status: "Open",
        created_at: "Just now",
        assigned_admin_id: newFlag.assignedAdminId || null,
        sprint_logs: logs,
      }).select();

      if (error) console.error("Database flag logging error:", error);
      else if (data && data.length > 0) {
        setFlags(prev => [...prev, mapFlagToTS(data[0])]);
        
        await supabase.from("activities").insert({
          action: `🚨 New Flag: ${newFlag.title}`,
          client: clients.find(c => c.id === newFlag.clientId)?.name || `Client ID ${newFlag.clientId}`,
          time: "Just now",
          type: "alert"
        });
        
        return;
      }
    }
    // Local Fallback
    setFlags(prev => [
      ...prev,
      {
        ...newFlag,
        id: `f_${Date.now()}`,
        status: "Open",
        createdAt: "Just now",
        sprintLogs: logs
      }
    ]);
    setActivities(prev => [
      { id: Date.now(), action: `🚨 New Flag: ${newFlag.title}`, client: `Client ID ${newFlag.clientId}`, time: "Just now", type: "alert" },
      ...prev
    ]);
  }, [isSupabaseConfigured, clients]);

  const updateFlagStatus = useCallback(async (flagId: string, status: FlagStatus) => {
    const flag = flags.find(f => f.id === flagId);
    if (!flag) return;

    const updatedLogs = [
      ...flag.sprintLogs,
      { id: `sl_status_${Date.now()}`, author: "System", text: `Ticket transitioned to status: ${status}`, timestamp: "Just now" }
    ];

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("project_flags")
        .update({ status, sprint_logs: updatedLogs })
        .eq("id", flagId);

      if (error) console.error("Database flag status error:", error);
      else {
        setFlags(prev => prev.map(f => f.id === flagId ? { ...f, status, sprintLogs: updatedLogs } : f));
        return;
      }
    }
    setFlags(prev => prev.map(f => f.id === flagId ? { ...f, status, sprintLogs: updatedLogs } : f));
  }, [flags, isSupabaseConfigured]);

  const assignFlagAdmin = useCallback(async (flagId: string, adminId: string) => {
    const flag = flags.find(f => f.id === flagId);
    if (!flag) return;

    const admin = team.find((t: any) => t.id === adminId);
    const updatedLogs = [
      ...flag.sprintLogs,
      { id: `sl_assign_${Date.now()}`, author: "System", text: `Sprint owner assigned: ${admin?.name || "Unassigned"}`, timestamp: "Just now" }
    ];

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("project_flags")
        .update({ assigned_admin_id: adminId, sprint_logs: updatedLogs })
        .eq("id", flagId);

      if (error) console.error("Database assign flag admin error:", error);
      else {
        setFlags(prev => prev.map(f => f.id === flagId ? { ...f, assignedAdminId: adminId, sprintLogs: updatedLogs } : f));
        return;
      }
    }
    setFlags(prev => prev.map(f => f.id === flagId ? { ...f, assignedAdminId: adminId, sprintLogs: updatedLogs } : f));
  }, [flags, team, isSupabaseConfigured]);

  const addFlagSprintLog = useCallback(async (flagId: string, author: string, text: string) => {
    const flag = flags.find(f => f.id === flagId);
    if (!flag) return;

    const updatedLogs = [
      ...flag.sprintLogs,
      { id: `sl_note_${Date.now()}`, author, text, timestamp: "Just now" }
    ];

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("project_flags")
        .update({ sprint_logs: updatedLogs })
        .eq("id", flagId);

      if (error) console.error("Database flag note error:", error);
      else {
        setFlags(prev => prev.map(f => f.id === flagId ? { ...f, sprintLogs: updatedLogs } : f));
        return;
      }
    }
    setFlags(prev => prev.map(f => f.id === flagId ? { ...f, sprintLogs: updatedLogs } : f));
  }, [flags, isSupabaseConfigured]);

  const createRelease = useCallback(async (newRelease: Omit<ChangelogRelease, "id" | "publishedAt" | "status">) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("releases").insert({
        client_id: newRelease.clientId,
        version: newRelease.version,
        title: newRelease.title,
        what_was_improved: newRelease.whatWasImproved,
        published_at: "Just now",
        status: "Awaiting Review",
        release_notes: newRelease.releaseNotes || null,
      }).select();

      if (error) console.error("Database create release error:", error);
      else if (data && data.length > 0) {
        setReleases(prev => [mapReleaseToTS(data[0]), ...prev]);
        
        await supabase.from("activities").insert({
          action: `📢 Changelog Drafted: ${newRelease.title}`,
          client: clients.find(c => c.id === newRelease.clientId)?.name || `Client ID ${newRelease.clientId}`,
          time: "Just now",
          type: "comment"
        });
        
        return;
      }
    }
    // Local Fallback
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
  }, [isSupabaseConfigured, clients]);

  const approveRelease = useCallback(async (releaseId: string) => {
    const rel = releases.find(r => r.id === releaseId);
    if (!rel) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("releases")
        .update({ status: "Approved", approved_at: "Just now" })
        .eq("id", releaseId);

      if (error) console.error("Database approve release error:", error);
      else {
        setReleases(prev => prev.map(r => r.id === releaseId ? { ...r, status: "Approved", approvedAt: "Just now" } : r));
        
        await supabase.from("activities").insert({
          action: `✅ Changelog Approved: ${rel.title}`,
          client: clients.find(c => c.id === rel.clientId)?.name || `Client ID ${rel.clientId}`,
          time: "Just now",
          type: "milestone"
        });
        
        return;
      }
    }
    // Local Fallback
    setReleases(prev => prev.map(r => r.id === releaseId ? { ...r, status: "Approved", approvedAt: "Just now" } : r));
    setActivities(prev => [
      { id: Date.now(), action: `✅ Changelog Approved: ${rel?.title || "Release"}`, client: `Client ID ${rel?.clientId}`, time: "Just now", type: "milestone" },
      ...prev
    ]);
  }, [releases, isSupabaseConfigured, clients]);

  const addInternalTask = useCallback(async (task: Omit<InternalTask, "id" | "createdAt" | "status" | "internalNotes">) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("internal_tasks").insert({
        client_id: task.clientId || null,
        product_id: task.productId || null,
        title: task.title,
        assigned_admin_id: task.assignedAdminId,
        status: "Todo",
        origin_comment_id: task.originCommentId || null,
        internal_notes: ["Internal task initialized by collaboration review gate."],
        created_at: "Just now",
      }).select();

      if (error) console.error("Database internal task creation error:", error);
      else if (data && data.length > 0) {
        setInternalTasks(prev => [mapTaskToTS(data[0]), ...prev]);
        return;
      }
    }
    // Local Fallback
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
    setActivities(prev => [{ id: Date.now(), action: `📌 New task: ${task.title}`, client: "Internal", time: "Just now", type: "comment" as const }, ...prev]);
  }, [isSupabaseConfigured]);

  const updateInternalTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("internal_tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) console.error("Database internal task update error:", error);
      else {
        setInternalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
        return;
      }
    }
    setInternalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  }, [isSupabaseConfigured]);

  const addInternalTaskNote = useCallback(async (taskId: string, note: string) => {
    const task = internalTasks.find(t => t.id === taskId);
    if (!task) return;

    const notes = [...task.internalNotes, note];

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("internal_tasks")
        .update({ internal_notes: notes })
        .eq("id", taskId);

      if (error) console.error("Database internal task note error:", error);
      else {
        setInternalTasks(prev => prev.map(t => t.id === taskId ? { ...t, internalNotes: notes } : t));
        return;
      }
    }
    setInternalTasks(prev => prev.map(t => t.id === taskId ? { ...t, internalNotes: notes } : t));
  }, [internalTasks, isSupabaseConfigured]);

  const addNewClient = useCallback(async (client: Omit<CRMClient, "id" | "health" | "lastActivity" | "avatar">) => {
    const avatar = client.name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2);
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("clients").insert({
        name: client.name,
        project: client.project,
        location: client.location,
        category: client.category,
        stage: client.stage,
        health: 100,
        revenue: client.revenue,
        amount_paid: client.amountPaid || 0,
        margin: client.margin || 0,
        last_activity: "Client workspace initialized",
        avatar,
        assigned_admin_id: client.assignedAdminId || null,
      }).select();

      if (!error && data && data.length > 0) {
        setClients(prev => [...prev, mapClientToTS(data[0])]);
        setActivities(prev => [{ id: Date.now(), action: `📋 New project created: ${client.name}`, client: client.name, time: "Just now", type: "milestone" }, ...prev]);
        return;
      }
      if (error) console.error("Database add client error:", error);
    }
    // Always update local state as fallback
    const newClient: CRMClient = {
      ...client,
      id: Date.now(),
      health: 100,
      lastActivity: "Client workspace initialized",
      avatar
    };
    setClients(prev => [...prev, newClient]);
    setActivities(prev => [{ id: Date.now(), action: `📋 New project created: ${client.name}`, client: client.name, time: "Just now", type: "milestone" }, ...prev]);
  }, [isSupabaseConfigured]);

  const deleteClient = useCallback(async (clientId: number) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("clients").delete().eq("id", clientId);
      if (error) console.error("Database delete client error:", error);
    }
    setClients(prev => prev.filter(c => c.id !== clientId));
  }, [isSupabaseConfigured]);

  const deleteLead = useCallback(async (leadId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("outreach_leads").delete().eq("id", leadId);
      if (error) console.error("Database delete lead error:", error);
    }
    setLeads(prev => prev.filter(l => l.id !== leadId));
  }, [isSupabaseConfigured]);

  const deleteInternalTask = useCallback(async (taskId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("internal_tasks").delete().eq("id", taskId);
      if (error) console.error("Database delete task error:", error);
    }
    setInternalTasks(prev => prev.filter(t => t.id !== taskId));
  }, [isSupabaseConfigured]);

  const deleteFlag = useCallback(async (flagId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("project_flags").delete().eq("id", flagId);
      if (error) console.error("Database delete flag error:", error);
    }
    setFlags(prev => prev.filter(f => f.id !== flagId));
  }, [isSupabaseConfigured]);

  const deleteRelease = useCallback(async (releaseId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("releases").delete().eq("id", releaseId);
      if (error) console.error("Database delete release error:", error);
    }
    setReleases(prev => prev.filter(r => r.id !== releaseId));
  }, [isSupabaseConfigured]);

  const purgeAllMockData = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        await Promise.all([
          supabase.from("clients").delete().neq("id", 0),
          supabase.from("outreach_leads").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("internal_tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("project_flags").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("releases").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
          supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000")
        ]);
      } catch (err) {
        console.error("Error purging Supabase database data:", err);
      }
    }
    // Reset local/sandbox states
    setClients([]);
    setLeads([]);
    setInternalTasks([]);
    setFlags([]);
    setReleases([]);
    setComments([]);
    setActivities([]);
  }, [isSupabaseConfigured]);

  const updateProduct = useCallback(async (id: string, updates: Partial<InternalProduct>) => {
    if (isSupabaseConfigured) {
      const isValidUUID = (uid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uid);
      const dbUpdates: any = {
        name: updates.name,
        stage: updates.stage,
        progress: updates.progress,
        description: updates.description,
        repo_link: updates.repoLink,
        sandbox_link: updates.sandboxLink,
        metrics: updates.metrics,
      };
      if (updates.leadId !== undefined) {
        dbUpdates.lead_id = isValidUUID(updates.leadId) ? updates.leadId : null;
      }
      // Clean up undefined values
      Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);
      
      const { error } = await supabase.from("internal_products").update(dbUpdates).eq("id", id);
      if (error) {
        console.error("Database update product error:", error);
        return;
      }
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [isSupabaseConfigured]);

  const addProduct = useCallback(async (product: Partial<InternalProduct>) => {
    if (!isSupabaseConfigured) {
      alert("WARNING: Supabase is not connected! Your changes are only saved locally and will disappear on refresh. Please ensure NEXT_PUBLIC_SUPABASE_URL is set in your Vercel Environment Variables.");
    }

    const newProduct: InternalProduct = {
      id: "p" + Date.now(),
      name: product.name || "New Product",
      stage: product.stage || "Ideation",
      progress: product.progress || 0,
      description: product.description || "",
      leadId: product.leadId || "a1",
      repoLink: product.repoLink,
      sandboxLink: product.sandboxLink,
      metrics: product.metrics
    };

    if (isSupabaseConfigured) {
      const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      const dbItem = {
        id: newProduct.id,
        name: newProduct.name,
        stage: newProduct.stage,
        progress: newProduct.progress,
        description: newProduct.description,
        lead_id: isValidUUID(newProduct.leadId) ? newProduct.leadId : null,
        repo_link: newProduct.repoLink,
        sandbox_link: newProduct.sandboxLink,
        metrics: newProduct.metrics,
      };
      const { data, error } = await supabase.from("internal_products").insert(dbItem).select().single();
      if (error) {
        console.error("Database insert product error:", error);
        alert(`Database error: ${error.message}\nDetails: ${error.details || 'none'}\nHint: ${error.hint || 'none'}`);
      } else if (data) {
        newProduct.id = data.id;
        setProducts(prev => [...prev, newProduct]);
        return;
      }
    }
    setProducts(prev => [...prev, newProduct]);
  }, [isSupabaseConfigured]);

  const deleteProduct = useCallback(async (id: string) => {
    // Find the product to get its name as a fallback deletion method
    // In case the 'id' column in Supabase is of a different type and silently fails to match
    setProducts(prev => {
      const pToDelete = prev.find(p => p.id === id);
      
      if (isSupabaseConfigured && pToDelete) {
        // Delete by name since it's guaranteed to be a text match
        supabase.from("internal_products").delete().eq("name", pToDelete.name).then(({ error }) => {
          if (error) console.error("Database delete product error:", error);
        });
      } else if (isSupabaseConfigured) {
        supabase.from("internal_products").delete().eq("id", id).then(({ error }) => {
          if (error) console.error("Database delete product error:", error);
        });
      }
      
      return prev.filter(p => p.id !== id);
    });
  }, [isSupabaseConfigured]);

  const updateCrmUser = useCallback((email: string, updates: any) => {
    setCrmUsers(prev => {
      const updated = prev.map(u => u.email === email ? { ...u, ...updates } : u);
      localStorage.setItem("almmatix_users", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addSocialMedia = useCallback(async (item: SocialMediaItem) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("social_media").insert({
        id: item.id,
        platform: item.platform,
        content_type: item.contentType,
        description: item.description,
        status: item.status,
        assigned_admin_id: item.assignedAdminId,
        scheduled_date: item.scheduledDate,
        client_tag: item.clientTag
      });
      if (error) console.error("Database insert social media error:", error);
    }
    setSocialMedia(prev => [...prev, item]);
  }, [isSupabaseConfigured]);

  const updateSocialMedia = useCallback(async (id: string, updates: Partial<SocialMediaItem>) => {
    if (isSupabaseConfigured) {
      const dbUpdates: any = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase.from("social_media").update(dbUpdates).eq("id", id);
        if (error) console.error("Database update social media error:", error);
      }
    }
    setSocialMedia(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [isSupabaseConfigured]);

  const deleteSocialMedia = useCallback(async (id: string) => {
    setSocialMedia(prev => {
      const sToDelete = prev.find(s => s.id === id);
      
      if (isSupabaseConfigured && sToDelete) {
        supabase.from("social_media").delete().eq("description", sToDelete.description).then(({ error }) => {
          if (error) console.error("Database delete social media error:", error);
        });
      } else if (isSupabaseConfigured) {
        supabase.from("social_media").delete().eq("id", id).then(({ error }) => {
          if (error) console.error("Database delete social media error:", error);
        });
      }
      
      return prev.filter(s => s.id !== id);
    });
  }, [isSupabaseConfigured]);

  const addRelease = useCallback((release: Partial<ChangelogRelease>) => {
    setReleases(prev => [...prev, {
      id: "r" + Date.now(),
      clientId: release.clientId || 1,
      version: release.version || "1.0",
      title: release.title || "New Release",
      whatWasImproved: release.whatWasImproved || [],
      publishedAt: new Date().toISOString(),
      status: "Awaiting Review",
      videoUrl: release.videoUrl
    } as ChangelogRelease]);
  }, []);



  return (
    <CRMContext.Provider value={{ 
      clients, team, products, comments, activities, socialMedia, setSocialMedia, leads, flags, releases, internalTasks, currentAdminId, selectedClientId, setSelectedClientId,
      addComment, deleteComment, markCommentAsRead, updateClientStage, updateClientAdmin,
      updateClient, updateLead, updateInternalTask, updateFlag, updateProduct, addProduct, deleteProduct, updateCrmUser, addRelease,
      updateLeadStatus, incrementLeadCalls, addLeadNote, convertLeadToClient, addNewLead,
      addFlag, updateFlagStatus, assignFlagAdmin, addFlagSprintLog,
      createRelease, approveRelease,
      addInternalTask, updateInternalTaskStatus, addInternalTaskNote,
      addNewClient, deleteClient, deleteLead, deleteInternalTask, deleteFlag, deleteRelease,
      addSocialMedia, updateSocialMedia, deleteSocialMedia,
      userProfile, setUserProfile, loading, isSupabaseConfigured, isSupabaseOnline, signOut,
      authorizedEmails, provisionUser, deprovisionUser, purgeAllMockData, addCrmUser, deleteCrmUser, crmUsers
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
