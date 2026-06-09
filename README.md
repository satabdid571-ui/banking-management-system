# Apex Banking App

A full-stack banking application with a React (Vite) frontend and Node.js/Express backend, organized as a clean monorepo.

---

## 📁 Project Structure

```
apex-banking-app/
├── frontend/              # React + Vite application
│   ├── src/               # App source (store, hooks, API)
│   ├── components/        # Page components (admin, employee, dashboard, home)
│   ├── layout/            # Layout wrappers
│   ├── public/            # Static assets
│   ├── index.html         # HTML entry point
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
│
├── backend/               # Node.js + Express API server
│   ├── server.js          # Express app & all routes
│   ├── db.js              # Database connection & helpers
│   └── package.json       # Backend dependencies
│
├── .gitignore             # Root gitignore
├── package.json           # Root scripts (run both together)
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install both frontend & backend at once
npm run install:all
```

Or manually:
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Run in Development

**Run both together (Windows):**
```bash
npm run dev
```

**Or separately:**
```bash
# Terminal 1 — Backend (http://localhost:5001)
npm run dev:backend

# Terminal 2 — Frontend (http://localhost:5173)
npm run dev:frontend
```

---

## 🛠 Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS, Ant Design, SWR |
| Backend   | Node.js, Express, JWT, bcryptjs               |
| HTTP      | Axios (frontend → backend)                    |

---

## 🔗 API

The frontend connects to the backend at `http://localhost:5001/api`.  
JWT tokens are stored in `localStorage` and sent with every request via an Axios interceptor.
