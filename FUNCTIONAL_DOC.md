# Almmatix CRM — Functional Documentation

> **Version**: 1.0  
> **Last Updated**: 20 May 2026  
> **Maintained by**: Lakshya Betala  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Authentication & Access Control](#3-authentication--access-control)
4. [Roles & Permissions](#4-roles--permissions)
5. [Admin Dashboard](#5-admin-dashboard)
6. [Projects](#6-projects)
7. [Leads](#7-leads)
8. [Tasks](#8-tasks)
9. [Issues](#9-issues)
10. [Team Management](#10-team-management)
11. [Client Portal](#11-client-portal)
12. [Data Architecture](#12-data-architecture)
13. [Offline Fallback](#13-offline-fallback)
14. [Current Data](#14-current-data)

---

## 1. Overview

Almmatix CRM is an internal management tool for the Almmatix team to track client projects, sales leads, internal tasks, support issues, and team workload. It also provides a client-facing portal where clients can view their project progress, submit feedback, and report issues.

**Core Principles:**
- One screen, know everything in 5 seconds
- Non-technical users can navigate without training
- Everything is editable inline
- All data is database-backed (Supabase) with offline fallback

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Hosting | Vercel |
| Fonts | Satoshi (body), Clash Display (display), JetBrains Mono (mono) |

---

## 3. Authentication & Access Control

### 3.1 Login Flow
1. User navigates to `/portal/auth`
2. Enters email + password
3. Supabase Auth validates credentials
4. On success → redirect to `/portal`
5. On failure → inline error message displayed

### 3.2 Signup Flow
1. User clicks "Need an account? Sign up"
2. Enters full name, email, password
3. System checks if email is in the authorized list:
   - **Core partner emails** (4 hardcoded) → allowed to register directly
   - **Pre-authorized emails** (in `authorized_emails` table) → allowed with pre-configured role
   - **All other emails** → rejected with "Access denied"
4. On success → Supabase sends verification email
5. On email verification → profile auto-created via database trigger

### 3.3 Core Partner Emails
These 4 emails have permanent admin access:
- `lakshbetala15@gmail.com` (Lakshya)
- `gandhimouriyan1234@gmail.com` (Mouriyan)
- `monarchankit25@gmail.com` (Ankit)
- `muskanabani01@gmail.com` (Muskan)

### 3.4 Session Management
- Auth state persisted via Supabase session cookies
- Sign out clears session and redirects to `/portal/auth`
- Session checked on every `/portal` page load

---

## 4. Roles & Permissions

### 4.1 Role Definitions

| Role | Who | Dashboard Access | Financials | Leads | Team Invites | Client Portal |
|---|---|---|---|---|---|---|
| **Core Partner** | Lakshya, Mouriyan, Ankit, Muskan | Full | ✓ Visible | All | ✓ Can invite | Can preview any client |
| **Admin** | Invited admins | Full | ✓ Visible | All | ✗ Cannot invite | Can preview any client |
| **Intern** | Invited interns | Restricted | ✗ Hidden | Only assigned | ✗ Cannot invite | ✗ No access |
| **Client** | Invited clients | ✗ No access | ✗ Hidden | ✗ No access | ✗ No access | Own project only |

### 4.2 Intern Restrictions
When `userProfile.role` contains the word "intern" (case-insensitive):
- Financial data (revenue, spent, remaining) is hidden in project detail drawers
- Repository and staging links are hidden
- Only leads assigned to the intern are visible
- Cannot access the main admin dashboard overview

### 4.3 Client Sandboxing
When `userProfile.category === "client"`:
- Only their linked project is loaded from the database
- Supabase RLS enforces `profile_id = auth.uid()` on the `clients` table
- Comments, issues, and releases are filtered to their project only
- No access to admin dashboard, leads, tasks, or team data

---

## 5. Admin Dashboard

**Route**: `/portal` (when logged in as admin)

### 5.1 Layout Structure
```
┌─────────────┬──────────────────────────────────────────────┐
│  Sidebar    │  Content Area                                │
│  (220px)    │                                              │
│             │  ┌─────────────────────┬────────────────┐    │
│  almmatix   │  │  Tab Content        │  Detail Drawer  │    │
│             │  │  (scrollable)       │  (420px, right) │    │
│  [Projects] │  │                     │                 │    │
│  [Leads]    │  │                     │                 │    │
│  [Tasks]    │  │                     │                 │    │
│  [Issues]   │  │                     │                 │    │
│  [Team]     │  │                     │                 │    │
│  [Client]   │  │                     │                 │    │
│             │  └─────────────────────┴────────────────┘    │
│  ● Online   │                                              │
│  Lakshya    │  Top bar: Tab title + [+ New] button         │
│  Sign out   │                                              │
└─────────────┴──────────────────────────────────────────────┘
```

### 5.2 Sidebar
- **Brand**: "almmatix" with subtitle "Management Console"
- **Navigation**: 6 tabs with active item count badges
- **Status**: Connection indicator (green dot = online, amber = offline)
- **User**: Current user name + sign out link

### 5.3 Detail Drawers
- All tabs except Team and Client View support a right-side detail drawer
- Drawer slides in from the right (420px width) when an item is clicked
- Contains editable fields, notes, and delete action
- Close button in top-right corner

---

## 6. Projects

### 6.1 Project List View
Displays all clients as card rows. Each card shows:
- Client avatar (2-letter initials)
- Client name and project name
- Location
- Stage badge (color-coded)
- Revenue (hidden from interns)
- Assigned team member
- Last activity description
- Health percentage

### 6.2 Stats Row
Four stat cards above the project list:
- **Confirmed**: Count of projects with stage "Confirmed" or "Maintenance"
- **Pipeline**: Total revenue across all projects + all lead estimated values
- **Open issues**: Count of flags where status ≠ "Resolved"
- **Active tasks**: Count of tasks where status ≠ "Resolved"

### 6.3 Project Stages
Pipeline stages in order:

| Stage | Category | Meaning |
|---|---|---|
| Lead | Potential | Initial interest, no contact yet |
| Requirements | Potential | Gathering client requirements |
| Demo | Potential | Building and showing demo |
| Quoted | Potential | Quotation sent, waiting response |
| Confirmed | Ongoing | Deal closed, work started |
| Maintenance | Ongoing | Delivered, ongoing support |

### 6.4 Project Detail Drawer
Opened by clicking a project card. Contains:

| Section | Fields | Editable |
|---|---|---|
| Header | Client name | Read-only |
| Details | Project name, location | Read-only |
| Stage | Current stage | ✓ Dropdown (6 options) |
| Assigned to | Team member | ✓ Dropdown (all team) |
| Health | Percentage | Read-only |
| Financials | Revenue, Spent (est. 45%), Remaining | Read-only (hidden from interns) |
| Tasks | Linked tasks with status badges | Read-only |
| Issues | Linked issues with severity dots | Read-only |
| Feedback | Recent comments thread | Read-only |
| Actions | Delete project | Button |

### 6.5 Add Project Form
Triggered by "+ New" button. Fields:
- Client name (required)
- Project name (required)
- Location (default: "India")
- Stage (dropdown, default: "Lead")
- Revenue in ₹ (number)
- Assigned to (dropdown)

---

## 7. Leads

### 7.1 Lead Table View
Displays all leads in a table format:

| Column | Data |
|---|---|
| Company | Lead company name |
| Project | Project description |
| Source | Channel (LinkedIn, Cold Call, etc.) |
| Value | Estimated deal value in ₹ |
| Status | Pipeline status badge |
| Owner | Assigned team member |

### 7.2 Lead Sources
Where leads come from:
- Cold Call
- LinkedIn
- Twitter
- Email
- Referral
- Instagram
- Social Media

### 7.3 Lead Statuses

| Status | Meaning |
|---|---|
| Lead | Just identified |
| Contacted | Initial outreach sent |
| Responded | They replied |
| Requirements | Gathering what they need |
| Demo | Building/showing demo |
| Quoted | Quotation sent |
| Converted | Became a confirmed project |
| Lost | Didn't work out |

### 7.4 Lead Detail Drawer
Opened by clicking a table row. Contains:

| Section | Editable |
|---|---|
| Company name, description | Read-only |
| Status | ✓ Dropdown (8 options) |
| Source | Read-only |
| Estimated value | Read-only |
| Calls made + increment button | ✓ +1 button |
| Owner | Read-only |
| Last contacted | Read-only |
| Notes list + add note input | ✓ Add notes |
| Convert to Project button | ✓ Action |
| Delete lead | ✓ Action |

### 7.5 Convert Lead to Project
When "Convert to Project" is clicked:
1. New client entry created with:
   - Name = lead's company name
   - Project = lead's project description
   - Stage = "Confirmed"
   - Revenue = lead's estimated value
   - Assigned admin = lead's assigned admin
2. Three onboarding tasks auto-created:
   - "Draft custom branding mockups" → Muskan
   - "Initialize database schema & env" → Mouriyan
   - "Draft delivery roadmap agreement" → Lakshya
3. Lead is deleted from leads table
4. Activity log entry created

### 7.6 Add Lead Form
Fields:
- Company name (required)
- Project description
- Source (dropdown)
- Estimated value in ₹
- Assigned to (dropdown)

---

## 8. Tasks

### 8.1 Kanban Board
Four columns displayed side by side:

| Column | Status Value | Meaning |
|---|---|---|
| To Do | `Todo` | Planned, not started |
| In Progress | `In Progress` | Actively working on it |
| Review | `In Review` | Done, needs verification |
| Done | `Resolved` | Completed |

Each column shows a count badge.

### 8.2 Task Cards
Each card in the kanban shows:
- Task title
- Linked project name (if any)
- Assigned team member name

### 8.3 Task Detail Drawer
Opened by clicking a task card:

| Field | Editable |
|---|---|
| Title | Read-only |
| Status | ✓ Dropdown (4 options) |
| Assigned to | ✓ Dropdown (all team) |
| Linked project | Read-only |
| Created date | Read-only |
| Internal notes + add note | ✓ Add notes |
| Delete task | ✓ Action |

### 8.4 Add Task Form
Fields:
- Task title (required)
- Assigned to (dropdown)
- Linked project (dropdown, optional)

---

## 9. Issues

### 9.1 Issue List
Cards with:
- Severity dot (color-coded)
- Issue title
- Linked project name
- Assigned team member
- Status badge

### 9.2 Severity Levels

| Severity | Dot Color | Meaning |
|---|---|---|
| Critical | 🔴 Red | System down, blocker |
| High | 🟡 Amber | Core feature broken |
| Medium | 🟠 Yellow | Enhancement needed |
| Low | ⚪ Gray | Cosmetic, polish |

### 9.3 Issue Statuses

| Status | Meaning |
|---|---|
| Open | Just reported |
| Investigating | Looking into it |
| In Dev | Fix is being built |
| Resolved | Deployed and confirmed |

### 9.4 Issue Detail Drawer

| Field | Editable |
|---|---|
| Title, description | Read-only |
| Project | Read-only |
| Severity | Read-only |
| Status | ✓ Dropdown (4 options) |
| Assigned to | ✓ Dropdown (all team) |
| Developer log + add entry | ✓ Add log entries |
| Delete issue | ✓ Action |

### 9.5 Report Issue Form
Fields:
- Title (required)
- Description (textarea)
- Severity (dropdown)
- Project (dropdown)
- Assigned to (dropdown)

---

## 10. Team Management

### 10.1 Team Grid
Card for each team member showing:
- Avatar (colored circle with initials)
- Name and role
- Count of assigned projects
- Count of active tasks
- Count of assigned leads

### 10.2 Invite Team Member (Core Partners Only)
Pre-authorize a new email for signup.

**Form fields:**
- Email address (required)
- Full name (required)
- Role title (required)
- Category: Admin/Intern or Client
- If client → link to a specific project (dropdown)

**On submit**: Entry added to `authorized_emails` table. When that person signs up, their profile auto-populates with the configured role and permissions.

### 10.3 Remove Team Member
- Core partners can remove entries from the authorized emails list
- Click "Remove" next to any authorized email entry

### 10.4 Authorized Accounts List
Shows all pre-authorized emails with:
- Name, email, role, category
- Remove button (per entry)

---

## 11. Client Portal

**Route**: `/portal` (when logged in as client, or via "Client View" tab in admin dashboard)

### 11.1 Layout
- Top header: "almmatix · [Client Name]" with project name
- Tab pills: Overview, Updates, Feedback, Support
- Single-column content below (max-width 768px, centered)
- Dark theme (zinc-950 background)

### 11.2 Admin Preview
Admins can preview any client's portal via:
- "Client View" tab in the sidebar
- Dropdown selector to switch between ongoing clients

### 11.3 Overview Tab
| Section | Content |
|---|---|
| Progress pipeline | Visual stage indicators (Lead → Maintenance) with current stage highlighted |
| Key metrics | Contract value (₹), Health (%), Current stage |
| Last activity | Description of most recent update |
| Your team | Assigned team member(s) with avatar and role |

### 11.4 Updates Tab (Release Approvals)
- Lists changelog releases published by admins
- Each release shows:
  - Version, title, publish date
  - Checklist of improvements
  - If "Awaiting Review": client must check all items, then "Approve" button unlocks
  - If "Approved": green badge with approval timestamp

### 11.5 Feedback Tab
- Simple chat thread (newest at top)
- Client posts messages (role: "client")
- Admin replies appear with blue accent (role: "admin")
- Text input + Send button at top
- Enter key sends message

### 11.6 Support Tab
**Report Issue Form:**
- Title (required)
- Description (textarea)
- Severity dropdown (Low / Medium / High / Critical)
- Submit button

**Existing Issues List:**
- Each issue shows severity dot, title, created date
- Status pipeline visualization: Open → Investigating → In Dev → Resolved
- Last 3 developer log entries visible per issue

---

## 12. Data Architecture

### 12.1 Supabase Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `profiles` | User accounts (auto-created on signup) | id, name, role, category, avatar, color_var, primary_focus, responsibilities |
| `clients` | Client projects | id, name, project, location, category, stage, health, revenue, assigned_admin_id |
| `outreach_leads` | Sales pipeline leads | id, company_name, project_description, source, status, estimated_value, assigned_admin_id |
| `internal_tasks` | Team tasks | id, title, assigned_admin_id, status, client_id, internal_notes |
| `project_flags` | Support issues | id, client_id, title, description, severity, status, sprint_logs |
| `comments` | Feedback threads | id, client_id, author, role, text, timestamp |
| `releases` | Changelog entries | id, client_id, version, title, what_was_improved, status |
| `internal_products` | Internal product pipeline | id, name, description, stage, progress, lead_id |
| `authorized_emails` | Pre-authorized signups | email, name, role, category, client_id |
| `activities` | Activity feed | id, action, client, time, type |

### 12.2 Row-Level Security (RLS)
- All tables have RLS enabled
- Admin access via `is_admin()` SECURITY DEFINER function
- Client access restricted to `profile_id = auth.uid()`
- Prevents clients from seeing other clients' data

### 12.3 CRUD Operations
Every entity supports full CRUD, all Supabase-backed:

| Operation | Supabase Method | Local Fallback |
|---|---|---|
| Create | `.insert().select()` | Append to React state with generated ID |
| Read | `.select("*")` | Use `INITIAL_*` constants |
| Update | `.update().eq("id", id)` | Map over React state |
| Delete | `.delete().eq("id", id)` | Filter from React state |

### 12.4 Data Mapping
- Supabase uses `snake_case` column names
- Frontend uses `camelCase` TypeScript interfaces
- Mapper functions convert between formats: `mapClientToTS()`, `mapLeadToTS()`, etc.

---

## 13. Offline Fallback

### 13.1 Detection
On load, the system checks:
1. Are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables set and not placeholders?
2. Can the system reach the `profiles` table with a `SELECT count` query?

Results stored as:
- `isSupabaseConfigured` — env vars are present
- `isSupabaseOnline` — network is reachable

### 13.2 Online Mode
- All reads fetch from Supabase
- All writes persist to Supabase
- Real-time data across all logged-in users

### 13.3 Offline Mode
- Uses hardcoded `INITIAL_*` arrays as mock data
- All operations work locally in React state
- Data is lost on page refresh
- User defaults to "Lakshya" (admin a1)
- Amber dot in sidebar indicates offline status

---

## 14. Current Data

### 14.1 Team

| ID | Name | Role | Focus |
|---|---|---|---|
| a1 | Lakshya | PM & Client Delivery Lead | Tech: UPKEM, SPC, NJ, DOITFORME |
| a2 | Mouriyan | Backend & Tech Delivery Lead | Client + Tech: Varsiddhi, MMXport, Sumati, Techie |
| a3 | Ankit | Outreach & Marketing Lead | Marketing, intern management |
| a4 | Muskan | Brand & Marketing Director | Social media for all clients |

### 14.2 Projects

| Client | Project | Stage | Revenue | Owner |
|---|---|---|---|---|
| UPKEM | Mobile App | Confirmed | ₹80,000 | Lakshya |
| SPC (Supreme Petro) | Tally BI Dashboard + AI Agents | Quoted | ₹40,000 | Lakshya |
| NJ Jewellers | Gold Price Board | Quoted | ₹25,000 | Lakshya |
| DOITFORME | Website | Maintenance | — | Lakshya |
| Sumati | Small project | Requirements | — | Mouriyan |
| Varsiddhi | TBD | Lead | — | Mouriyan |
| MMXport | TBD | Lead | — | Mouriyan |
| Techie | Personalized LinkedIn | Requirements | — | Mouriyan |
| Greenlit | New Product | Demo | — | Lakshya |

### 14.3 Sales Strategy
```
Get Requirements → Build Demo → Show Demo → Get Feedback → Send Quotation → Confirm → Build
```

---

*This document should be updated whenever new features are added or business rules change.*
