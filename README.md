# SOLARIS - Enterprise Task Board & Workflow Management Platform

A modern, full-stack enterprise project management and workflow orchestration platform built for high-performance agile engineering teams.

Designed with a high-contrast dark theme, Solaris provides multi-level role-based access control, a 6-stage Kanban matrix, real-time work scheduling and leave approvals, an AI-powered bilingual voice assistant, a 14-day soft-delete recycle bin, and live WebSocket synchronizations.

---

## 1. System Overview

Solaris Task Board Manager streamlines collaboration between Software Engineers, Project Managers, and Executive Administrators. It balances agile delivery tracking with workplace presence management, workforce scheduling, and automated task dispatching.

Key Architectural Highlights:
- Strict end-to-end TypeScript type safety across both frontend and backend.
- Modular NestJS backend architecture with atomic database transactions via Prisma ORM.
- React 19 single-page application utilizing Zustand for reactive global state management.
- Real-time bidirectional event distribution powered by Socket.IO rooms.
- Multilingual and code-switched AI voice processing using Groq Whisper Large-v3 and LLaMA 3.3 70B models.

---

## 2. Core Modules and Capabilities

### A. Task Board and Kanban Matrix
- 6 Standard Workflow States: TODO, IN_PROGRESS, PAUSED, BLOCKED, IN_REVIEW, and DONE.
- Fixed Portal Drag and Drop: Smooth drag-and-drop mechanics with dedicated portal rendering to eliminate scrollbar flickering.
- Drag Ownership Rules: Role- and ownership-based validation preventing unauthorized state transitions.
- Multi-Assignee Support: Full support for multiple team members collaborating on a single task, complete with member detail modal view.
- Subtasks and Checklists: Granular subtask breakdown, independent assignees, man-day estimations, and submission-approval lifecycles (PENDING, APPROVED, REJECTED).
- Audit Trail and History Log: Automatic logging of task status transitions, priority updates, assignee changes, and descriptions.

### B. AI Voice Assistant (Bilingual Code-Switching)
- Speech-to-Text Pipeline: Powered by Groq Whisper Large-v3 for rapid voice transcription.
- Natural Bilingual Recognition: Tuned to recognize mixed Vietnamese and English IT terminology within the same sentence (e.g., "Create task fix bug login auth for Nam deadline tomorrow").
- Phonetic Normalization: Automatic correction of common spoken software development slang into standardized terms.
- Structured Extraction: LLaMA 3.3 70B extracts task titles, descriptions, assignees, project associations, deadlines, and priorities with a preview confirmation dialog before creation.

### C. Work Schedule and Leave Management
- Leave and Remote Work Requests: Submission workflow for Work From Home (WFH), Annual Leave, Sick Leave, Business Trip, and Personal Leave.
- Flexible Shift Configuration: Full-day, Morning (0.5 day), and Afternoon (0.5 day) selections with handover plans.
- Manager and Admin Review Center: Review, approve, reject, or adjust requested dates and shifts prior to final approval.
- Direct Shift Assignment: Administrative capability to assign working presence directly to any personnel without requiring leave request submissions.
- Interactive Work Calendar: Multi-view calendar (Month, Week, Day) displaying task deadlines alongside team availability and presence.

### D. User and Organization Management
- Role-Based Access Control (RBAC): Three explicit tiers: ADMIN, MANAGER, and EMPLOYEE.
- Department Organization: Grouping of personnel by engineering and business departments with cross-project staffing visibility.
- Direct Asset Uploads: Native file selection for user avatars and cover pictures with instant client-side preview.
- Presence Signal: Status indicators (Online, Busy, In Meeting, Away, Offline).

### E. 14-Day System Recycle Bin
- Data Preservation Policy: Deleted tasks and projects are moved to a temporary holding state rather than being immediately purged.
- Visual Expiration Countdown: Visual tracking of retention time across 14 days.
- One-Click Restoration: Instant recovery of archived items, including automatic restoration of parent project relationships.
- Permanent Purge Controls: Administrative capability to permanently wipe items or empty the recycle bin.

### F. Real-Time Notification Center
- WebSockets Engine: Immediate delivery of task delegations, subtask review requests, and leave approval decisions.
- Smart Filtering: Categorization across All, Unread, and Urgent alerts.
- Direct Navigation: Clicking on notification items immediately routes to the relevant task detail view.

---

## 3. Technology Stack

| Layer | Technologies and Libraries |
| :--- | :--- |
| Frontend Framework | React 19, TypeScript, Vite 8 |
| Styling and UI | TailwindCSS v4, Lucide React Icons |
| State Management | Zustand |
| Drag and Drop | @hello-pangea/dnd |
| Backend Framework | NestJS 11 (Modular Architecture) |
| Database and ORM | PostgreSQL 16, Prisma ORM 7 |
| Speech-to-Text and LLM | Groq Whisper Large-v3, LLaMA 3.3 70B |
| Real-time Communication | Socket.IO 4.x |
| Authentication | JWT (JSON Web Tokens), Passport, BCrypt |
| Containerization | Docker, Docker Compose |

---

## 4. Getting Started

### Prerequisites
- Node.js: Version 18.x or 20.x LTS
- PostgreSQL: Version 16 (or Docker installed)
- Package Manager: npm

---

### Option A: Local Development Setup

#### Step 1: Start PostgreSQL Database
If using Docker for the database:
```bash
docker compose up -d postgres_db
```
Or ensure a local PostgreSQL instance is running on port `5432`.

#### Step 2: Configure Environment Variables
Verify or create `be/.env`:
```env
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/task_management_db?schema=public"
GROQ_API_KEY="your_groq_api_key_here"
```

Verify or create `fe/.env`:
```env
VITE_API_URL="http://localhost:3000/api"
```

#### Step 3: Initialize and Start Backend
```bash
cd be
npm install
npx prisma db push
npm run start:dev
```
The backend API server will be available at: `http://localhost:3000` (API endpoint prefix: `/api`).

#### Step 4: Start Frontend Client
```bash
cd fe
npm install
npm run dev
```
The frontend web application will be available at: `http://localhost:5173`.

---

### Option B: Full Docker Compose Deployment

To build and run all services (Database, Backend, and Frontend) inside containers:
```bash
docker compose up --build -d
```

Service mapping:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- PostgreSQL Database: `localhost:5432`

---

## 5. Verification and Production Build

To verify code quality and build artifacts without launching development servers:

```bash
# Type check and build frontend
cd fe
npm run build

# Compile NestJS backend
cd ../be
npm run build
```

---

## 6. Default Demonstration Accounts

The following test accounts are pre-configured for verification of role-based features:

| Email | Password | Role | Permissions and Capabilities |
| :--- | :---: | :---: | :--- |
| `huydatne@gmail.com` | `admin123` | ADMIN | Full system control, direct shift assignment, leave request reviews, user management, and recycle bin administration. |
| `manager@solaris.io` | `manager123` | MANAGER | Project coordination, subtask approvals, team leave review, and task dispatching. |
| `employee@solaris.io` | `employee123` | EMPLOYEE | Task execution, checklist updates, personal leave and WFH request submissions. |

---

## 7. License

Proprietary and confidential. Built for high-performance agile workflows. All rights reserved.
