# 🌐 SOLARIS Frontend - Modern React 19 Client Application

Modern Single Page Application (SPA) client for the **Solaris Task Board & Workflow Platform**, built with **React 19**, **TypeScript**, **Vite 8**, **TailwindCSS v4**, and **Zustand**.

---

## 🚀 Key Frontend Features

* **Solar Glassmorphism Dark Theme**: Sleek `#030712` dark UI with amber illumination accents and smooth animations.
* **Kanban Matrix Board**: 6 workflow status columns with drag-and-drop powered by `@hello-pangea/dnd` and dedicated fixed portal rendering.
* **Interactive Work Calendar**: Multi-view calendar (`Month`, `Week`, `Day`) integrating employee work locations, shift assignments, and task milestones.
* **Leave Request & Review Workflows**: In-app request submission and approval modal for managers.
* **Realtime Synchronization**: Instant client updates via Socket.IO for notifications, task changes, and schedule modifications.
* **Zustand State Stores**: Modular state management (`useAuthStore`, `useScheduleStore`, `useUserStore`, `useProjectStore`).

---

## 💻 Installation & Setup

### 1. Install Dependencies:
```bash
npm install
```

### 2. Configure Environment Variables (`.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Launch Development Server:
```bash
npm run dev
```

### 4. Build for Production:
```bash
npm run build
```

The web client runs locally at: `http://localhost:5173`.
