# 📋 Voice-Assisted Task Board

<p align="center">
  <b>A modern, multi-user Kanban Task Management Board featuring Role-Based Access Control (RBAC), Vietnamese Smart Voice Command (Speech-to-Text), Google OAuth 2.0, Real-time WebSockets, WebRTC Audio/Video Calls, and Multi-Department Collaboration.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/React%2FVite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
</p>

---

## 🚀 Project Overview

This project is a state-of-the-art Kanban Task Board platform designed specifically for modern enterprise office environments. Key highlights include **Role-Based Access Control (RBAC)**, **Vietnamese Smart Voice Input & Command Parsing (Web Speech API)**, **Google OAuth 2.0 Authentication**, **Real-time Collaboration via Socket.IO**, and **WebRTC Audio/Video Calling**.

---

## 🛠 Tech Stack

- **Database:** PostgreSQL 16
- **Backend:** NestJS 11 (Node.js) + Prisma ORM 7 + Driver Adapter (`@prisma/adapter-pg`)
- **Frontend:** React 19 + Vite 8, Zustand, Axios, Recharts, Socket.IO Client, TailwindCSS v4
- **Real-Time & Media:** Socket.IO, WebRTC (Audio & Video Streaming)
- **Deployment & DevOps:** Docker & Docker Compose

---

## 👥 Role-Based Access Control (RBAC) & Multi-Department

The system clearly differentiates system-wide roles (`GlobalRole`) and project-scoped permissions (`ProjectRole`):

- 🔴 **Admin:** System administrator with full access to accounts, role assignments, and all projects.
- 🟡 **Manager:** Project manager. Creates & manages assigned projects, manages team members, delegates tasks, and views analytics.
- 🟢 **Employee:** Team member executing tasks in assigned projects and updating delegated task statuses.
- 🏢 **Multi-Department (`ProjectDepartment`):** Dynamic department management (e.g., `Product`, `Client`, `Dev`, `Marketing`). Supports multi-department collaboration within a single project.

---

## ✨ Key Features

1. **Smooth Drag-and-Drop Kanban Board:**
   - Standard 3-column workflow: _To Do_, _In Progress_, _Done_.
   - Built with _Optimistic UI Updates_ for instant 0ms user responsiveness with automatic rollback on network failure.
2. **Vietnamese Smart Voice Command (Voice-to-Text):**
   - Integrates Web Speech API supporting Vietnamese natural language processing.
   - Automatically extracts task Title, Due Date, and Priority (`URGENT`, `IMPORTANT`, etc.) from speech.
   - Smart safety: Auto-assigns voice-created tasks to the current user with a 10-second Undo popup.
3. **Google OAuth 2.0 & Authentication:**
   - 1-Click Login via Google / Gmail accounts alongside traditional Email & Password authentication.
4. **Real-time Synchronization (Socket.IO):**
   - Instant broadcast of task moves, status updates, and comments across all team members in the project without page refresh.
5. **Real-Time Communication (1-1 Chat & WebRTC Calls):**
   - **Task Discussion:** Contextual comment section in each task card.
   - **Direct Messaging (1-1):** Instant private chat between team members with read receipts.
   - **WebRTC Audio & Video Calls:** Crystal-clear 1-1 voice and video calling with call history logging (`CallLog`).
6. **Audit Logging & Clean Board (Archiving):**
   - Automatically logs all data changes (Who changed what, when, old & new values snapshot).
   - "Archive Board" feature safely hides completed tasks while retaining historical metrics for dashboards.
7. **Analytics Dashboard & Reports:**
   - Interactive charts using Recharts for Managers/Admins and personal productivity metrics for Employees.

---

## 💻 Local Development Setup

To run and develop the project locally with Hot-Reload enabled:

### Step 1: Start PostgreSQL Database
Prerequisites: Install and run [Docker Desktop](https://www.docker.com/products/docker-desktop).
Open a terminal in the project root directory and run:
```bash
docker-compose up -d postgres_db
```

### Step 2: Start Backend (NestJS)
Open a new terminal, navigate to the `be` directory, and run:
```bash
cd be
npm install
npm run start:dev
```
*(Backend will run at http://localhost:3000)*

### Step 3: Start Frontend (React/Vite)
Open another terminal, navigate to the `fe` directory, and run:
```bash
cd fe
npm install
npm run dev
```
*(Frontend will run at http://localhost:5173)*

---

**💡 Quick Run (Run entire stack in Docker)**
To run all services inside Docker containers without local development setup:
```bash
docker-compose up -d --build
```
