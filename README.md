# 🌌 SOLARIS - Enterprise Task Board & Workflow Management Platform

<p align="center">
  <b>Modern Enterprise Project Management, Multi-Dimensional Workflow Coordination, Work Schedule & Leave Management Platform.</b><br/>
  <i>Integrated 3-Tier RBAC, 6-State Kanban Matrix, Real-Time Work Schedule & Leave Approval, Multi-Channel Notification Center, 1-on-1 Chat, 14-Day System Recycle Bin, and 100% Strict Type-Safety.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/TypeScript-Strict_TypeSafe-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
</p>

---

## 🚀 1. System Overview

**Solaris Task Board Manager** is a comprehensive management platform designed for high-performance software engineering teams and modern enterprise organizations operating under Agile/Scrum methodologies.

The user interface features a **Solar Glassmorphism Dark Theme** (`#030712`) with vibrant Amber lighting accents, fluid 60 FPS transitions, and optimized role-based workflows for Employees, Project Managers, and System Administrators.

---

## 🌟 2. Core Modules & Key Features

```
                    ┌────────────────────────────────────────────────────────┐
                    │            🌌 SOLARIS WORKSPACE PLATFORM               │
                    └────────────────────────────────────────────────────────┘
                                │                │                │
            ┌──────────────────┴──┐    ┌────────┴────────┐    ┌──┴──────────────────┐
            │ 📋 TASK & WORKFLOW  │    │ 📅 WORK & LEAVE │    │ 👤 USER & ORG HUB   │
            ├─────────────────────┤    ├─────────────────┤    ├─────────────────────┤
            │ • Kanban Matrix     │    │ • Leave Request │    │ • 1-Click Upload    │
            │ • Pipeline Roadmap  │    │ • Review Modal  │    │ • Real DB Sync      │
            │ • Subtask Approval  │    │ • Direct Shift  │    │ • Org & Department  │
            │ • Task History Log  │    │ • Month/Week UI │    │ • 14-Day Trash Bin  │
            └─────────────────────┘    └─────────────────┘    └─────────────────────┘
```

### 📋 A. Task Workspace & Kanban Matrix
* **6 Standard Operational Columns**: `TODO`, `IN_PROGRESS`, `PAUSED`, `BLOCKED`, `IN_REVIEW` 🔒, `DONE`.
* **Smooth Drag-and-Drop with Fixed Portal Container**: Zero scroll flickering, equipped with **Drag Ownership Rules** preventing unauthorized task manipulation.
* **Subtask Decomposition (Checklists)**: Assign independent assignees to subtasks, estimate workload, and submit for formal approval (`PENDING` ➔ `APPROVED` / `REJECTED`).
* **Automated Audit Logging (`TaskHistory`)**: Detailed activity tracking for column movements, progress changes, and description edits.

### 📅 B. Work Schedule & Leave Management
* **📝 Leave & WFH Request Filing (`CreateLeaveRequestModal`)**:
  * Multi-category requests: *Remote Work (WFH), Annual Leave, Sick Leave, Unpaid Leave, On-Site Business Trips, Personal Leave*.
  * Flexible time options: *Morning (0.5 day), Afternoon (0.5 day), Full Day*, or extended date ranges with handover plans.
  * Overlap Prevention: Real-time validation preventing duplicate active leave requests.
* **⚖️ Real-Time Leave Approval Center (`ReviewLeaveRequestsModal`)**:
  * Dedicated to Managers & Admins with live pending counter badges.
  * Supports direct approval, rejection, or modified date/shift approval (`APPROVED_MODIFIED`).
  * Enforces LC-170: Prevents self-approval of personal leave requests.
* **👑 Direct Schedule Assignment (`AssignScheduleModal`)**:
  * Allocate and batch-assign shifts and work locations for any employee across multiple dates.
* **🗓️ Multi-Mode Interactive Calendar (`MonthCalendarView`, `WeekTimelineView`, `DayScheduleView`)**:
  * Displays tasks alongside employee attendance status (Office, WFH, Leave, On-Site) with assignee filtering.

### 👤 C. User Profile & Organization Hub
* **📸 1-Click Direct Image Upload**: Upload avatar and cover images directly from local storage with instant preview.
* **🏢 Real-Time Database Synchronization**:
  * Displays assigned department and team structure.
  * Dynamically aggregates active project participation and assigned roles (*Owner, Manager, Member*).
* **📍 Daily Work Location Status**: Update daily work presence (*In Office, WFH, On-Site, On Leave*).
* **👥 User & Department Management (`/admin/users`)**: Allocate staff, batch transfer departments, lock/unlock accounts, and assign specialized professions (`DEV`, `TESTER`, `DESIGNER`, `BA`, `DEVOPS`, `PRODUCT_OWNER`...).

### 🗄️ D. 14-Day System Recycle Bin (`/admin/trash`)
* **14-Day Data Retention Policy**: Deleted projects and tasks are safely held in soft-delete state.
* **Visual Countdown Badges**: Cyan (> 7 days), Amber (3-7 days), Rose (< 3 days).
* **1-Click Restore**: Instant recovery with automatic parent project reactivation when restoring orphan subtasks.
* **Permanent Purge**: Clean up individual items or empty the entire bin permanently.

### 🔔 E. Real-Time Notifications & 1-on-1 Chat
* **WebSocket-Powered Events (Socket.IO)**: Real-time alerts for task assignment, subtask review requests, and leave application approvals.
* **Smart Filter Tabs**: *All*, *Unread*, *Urgent 🔥*.
* **1-Click Context Navigation**: Clicking a notification opens the associated task modal immediately.
* **Direct 1-on-1 Messaging**: Real-time communication between organization members.

---

## 🛡️ 3. Type-Safe Architecture & Engineering Standards

* **Backend (NestJS 11 + Prisma ORM 7)**:
  * Strict JWT authentication payload typing via `AuthUserPayload` and `AuthenticatedRequest`.
  * Fully typed Controllers, Services, and DTOs with zero `any` usage.
  * Atomic database transactions (`prisma.$transaction`) ensuring data integrity across complex workflows.
* **Frontend (React 19 + TypeScript + Zustand)**:
  * Unified domain models: `User`, `TaskItem`, `SubtaskItem`, `Project`, `WorkScheduleRecord`, `LeaveRequestRecord`.
  * Zero TypeScript compiler errors (`tsc -b` clean build).

---

## 🛠️ 4. Tech Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & UI** | TailwindCSS v4, Lucide React Icons |
| **State Management** | Zustand (Global Store, Schedule Store, User Store, Auth Store) |
| **Drag & Drop** | `@hello-pangea/dnd` with Dedicated Fixed Portal Container |
| **Backend Framework** | NestJS 11 (Modular Architecture) |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 7 |
| **Realtime Engine** | Socket.IO 4.x (Gateway Rooms, User-specific broadcasts) |
| **Authentication** | JWT (JSON Web Tokens), Passport, BCrypt |

---

## 💻 5. Installation & Quick Start Guide

### Prerequisites:
* **Node.js**: Version 18+ or 20+ LTS
* **PostgreSQL**: Port `5432` (or Docker Desktop)

---

### Step 1: Start Backend (NestJS API)

```bash
# Navigate to the backend directory
cd be

# Install dependencies
npm install

# Push Database Schema with Prisma
npx prisma db push

# Start Backend Server (Development Mode)
npm run start:dev
```
> 🚀 **Backend API** will run at: `http://localhost:3000` (API Prefix: `/api`)

---

### Step 2: Start Frontend (React / Vite)

```bash
# Open a new terminal and navigate to the frontend directory
cd fe

# Install dependencies
npm install

# Launch Development Server
npm run dev
```
> 🌐 **Frontend UI** will run at: `http://localhost:5173`

---

### Step 3: Production Build Verification

```bash
# Verify Frontend build
cd fe && npm run build

# Verify Backend build
cd be && npm run build
```

---

## 👥 6. Default Demo Accounts

| Email | Password | Role | Key Permissions |
| :--- | :---: | :---: | :--- |
| `huydatne@gmail.com` | `admin123` | **ADMIN** | Full system access, Leave approvals, Schedule assignment, 14-day Trash Bin, User management |
| `manager@solaris.io` | `manager123` | **MANAGER** | Project management, Subtask review, Member leave approval, Task coordination |
| `employee@solaris.io` | `employee123` | **EMPLOYEE** | Task execution, Leave/WFH requests submission, Subtask progress updates |

---

<p align="center">
  <b>Developed with ❤️ for High-Performance Agile Teams</b><br/>
  <i>Solaris Task Board & Workflow Platform © 2026. All Rights Reserved.</i>
</p>
