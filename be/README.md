# ⚙️ SOLARIS Backend - Enterprise NestJS API Service

Backend API service for the **Solaris Task Board & Workflow Platform**, built with **NestJS 11**, **Prisma ORM 7**, and **PostgreSQL 16**.

---

## 🚀 Core Backend Features

* **Authentication & Authorization (RBAC)**: JWT Guard, 3-tier role hierarchy (`ADMIN`, `MANAGER`, `EMPLOYEE`), BCrypt password hashing.
* **Task & Subtask Module**: Complete CRUD, subtask review workflows, drag ownership verification, and automatic activity history audit logging (`TaskHistory`).
* **Work Schedule & Leave Management Module**:
  * Leave application submission & real-time review/approval (`LeaveRequest`).
  * Direct work location and shift scheduling (`WorkSchedule`) per date and shift (`MORNING`, `AFTERNOON`, `FULL_DAY`).
* **Project & Membership Management**: Lifecycle control, manager assignments, and department relations.
* **14-Day System Recycle Bin (`TrashService`)**: Soft-delete mechanism with 14-day TTL countdown and 1-click restore with automated parent project recovery.
* **Realtime WebSockets Gateway**: Socket.IO gateway with user-specific and project-room event broadcasting.
* **Strict Type-Safety**: Standardized `AuthUserPayload` and `AuthenticatedRequest` across all controllers, eliminating `any`.

---

## 💻 Installation & Setup

### 1. Install Dependencies:
```bash
npm install
```

### 2. Configure Environment Variables (`.env`):
```env
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/task_management_db?schema=public"
JWT_SECRET="solaris_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. Synchronize Database Schema:
```bash
npx prisma db push
```

### 4. Start Server:
```bash
# Development (watch mode)
npm run start:dev

# Production Build & Run
npm run build
npm run start:prod
```

The API service runs at: `http://localhost:3000/api`.
