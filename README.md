# 🌐 GlobeVote — AI-Powered Civic Intelligence Platform

<div align="center">

![GlobeVote Banner](https://img.shields.io/badge/GlobeVote-Civic%20Intelligence-6366f1?style=for-the-badge&logo=globe&logoColor=white)

**The world's most knowledgeable political scientist in your pocket.**

Understand global elections · Fact-check claims instantly · Simulate electoral systems · Learn civics interactively

[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-10a37f?style=flat-square&logo=openai)](https://openai.com)
[![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev)

</div>

---

## ✨ What is GlobeVote?

GlobeVote is a full-stack civic education platform that makes democracy accessible to everyone. It combines an AI assistant, real election data, interactive simulations, and gamified learning into one premium dark-themed web application.

Whether you're a first-time voter who wants to understand how elections work, a student researching electoral systems, or a journalist fact-checking political claims — GlobeVote has you covered.

---

## 🚀 Features

### 🤖 AI Civic Assistant
- Powered by **GPT-4o Mini** for fast, accurate responses
- Three response modes: **Standard**, **ELI5** (simple), and **Expert**
- Full conversation history per session
- Strictly neutral — no political bias, ever
- One-click copy for any assistant response
- Suggested starter questions to get you going

### 🗺️ Country Explorer
- 190+ countries with electoral system data
- Search and filter by region or system type
- Deep-dive country profiles: voting age, registration rules, political landscape

### 🗳️ Elections Hub
- Live upcoming and recent elections database
- Detailed election pages: candidates, polls, key issues
- Countdown timers and election phase tracking
- Filter by type: presidential, parliamentary, local

### 📚 Interactive Election Guide
- **6-phase election process** — from announcement to inauguration
- Each phase expands into step-by-step detail with "Did you know?" facts
- **Interactive voter journey** — 6 steps every citizen should know
- **Real upcoming elections timeline** with progress bars
- **Key terms glossary** — 12 click-to-reveal definitions
- Interactive checklists you can tick off as you complete them

### 🔬 Electoral Systems Lab
- Simulate how **FPTP, PR, MMP, STV, TRS** convert votes to seats
- Adjust vote inputs and watch seat allocations change live
- Side-by-side system comparisons
- Gallagher Index proportionality scoring

### 🛡️ Misinformation Firewall
- Submit any political claim for AI fact-checking
- Verdict scale: True → Mostly True → Mixed → Mostly False → False
- Confidence scoring and source notes
- Recent community verifications feed

### 🧠 Civic Quiz
- Timed questions across 5 categories
- XP system with streaks and weekly leaderboard
- Adaptive difficulty

### 📰 Curated News
- Civic and election news aggregated and categorised
- Filterable by topic and country

### 👤 User Profile & Progress
- Session-based progress tracking
- Achievements and civic score
- Quiz history and accuracy stats

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 7, Wouter (routing) |
| **UI** | Tailwind CSS, shadcn/ui, Framer Motion |
| **State / Data** | TanStack Query (React Query), Orval-generated hooks |
| **Backend** | Express.js, TypeScript, Pino (logging) |
| **Database** | PostgreSQL 15, Drizzle ORM |
| **AI** | OpenAI GPT-4o Mini (chat + fact-checking) |
| **API Contract** | OpenAPI 3.0 spec with Zod validation |
| **Monorepo** | pnpm workspaces |
| **Build** | esbuild (API), Vite (frontend) |

---

## 📁 Project Structure

```
globevote/
├── artifacts/
│   ├── globevote/          # React + Vite frontend
│   │   └── src/
│   │       ├── pages/      # 12 page components
│   │       ├── components/ # UI components + layout
│   │       └── lib/        # Utilities (session, etc.)
│   └── api-server/         # Express API backend
│       └── src/
│           └── routes/     # API route handlers
├── lib/
│   ├── api-spec/           # OpenAPI specification
│   ├── api-zod/            # Generated Zod schemas
│   ├── api-client-react/   # Generated React Query hooks
│   ├── db/                 # Drizzle ORM schema + migrations
│   └── integrations*/      # OpenAI + other integrations
└── scripts/                # Seed scripts and utilities
```

---

## 🏃 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/globevote.git
cd globevote

# Install dependencies
pnpm install

# ── 🛠️ Development Workflow ───────────────────────────────────────────

GlobeVote uses a **pnpm monorepo** structure. All commands should be run from the root directory.

### 📋 Prerequisites
- **Node.js**: v20 or higher
- **pnpm**: v9 or v10
- **PostgreSQL**: v15 or higher
- **FFmpeg**: Required for voice features (converts audio formats for OpenAI)

### 🔑 Local Environment Setup
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your `DATABASE_URL` and `OPENAI_API_KEY`.

### 🗄️ Database Initialization
```bash
# Generate and push schema to database
pnpm --filter @workspace/db run push

# Seed the database with initial data
pnpm --filter @workspace/scripts run seed
```

### 🚀 Running the Application
You can run the full stack (API + Frontend) concurrently:
```bash
pnpm dev
```
*Note: Ensure the API starts first if running separately.*

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/globevote

# OpenAI
OPENAI_API_KEY=sk-...

# Session
SESSION_SECRET=your-super-secret-key-here
```

### Database Setup

```bash
# Run migrations
pnpm --filter @workspace/db run migrate

# Seed with initial data (countries, elections, quiz questions)
pnpm --filter @workspace/scripts run seed
```

### Development

```bash
# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (port 5173)
pnpm --filter @workspace/globevote run dev
```

Then visit `http://localhost:5173` in your browser.

### Code Generation

After modifying the OpenAPI spec:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates the Zod schemas and React Query hooks automatically.

---

## 🌐 API Reference

The API is documented via OpenAPI. Key endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/ask` | Ask the AI civic assistant |
| `GET` | `/api/chat/history` | Get session chat history |
| `GET` | `/api/countries` | List all countries |
| `GET` | `/api/countries/:id` | Get country detail |
| `GET` | `/api/elections` | List elections (filter by status) |
| `GET` | `/api/elections/:id` | Get election detail |
| `GET` | `/api/electoral-systems` | List electoral systems |
| `POST` | `/api/electoral-systems/simulate` | Simulate seat allocation |
| `GET` | `/api/quiz/questions` | Get quiz questions |
| `POST` | `/api/quiz/submit` | Submit a quiz answer |
| `POST` | `/api/claims/verify` | AI fact-check a claim |
| `GET` | `/api/claims/recent` | Recent community verifications |
| `GET` | `/api/news` | Curated civic news |
| `GET` | `/api/stats/dashboard` | Platform statistics |
| `GET` | `/api/progress/:sessionId` | User progress data |

---

## 🎨 Design System

GlobeVote uses a **dark deep-space aesthetic**:

- **Background**: Near-black (`#05070f` → `#090d1a`) with subtle grid overlay
- **Accent colors**: Blue (#60a5fa), Purple (#a78bfa), Pink (#f472b6), Emerald (#34d399)
- **Typography**: Bold-black headlines with multi-color gradient text
- **Glass morphism**: Frosted glass cards with `backdrop-filter: blur`
- **Animation**: Framer Motion for entrance animations, floating orbs, 3D tilt cards, and animated counters

---

## 🧪 Data Model

The database includes:

- **countries** — name, flag, system, voting age, region
- **electoral_systems** — type, description, examples, Gallagher scoring
- **elections** — title, date, country, type, candidates, status
- **chat_messages** — session history, role, content, confidence
- **claims** — submitted claims, verdict, explanation, confidence
- **quiz_questions** — question, options, correct answer, category
- **quiz_responses** — session answers, scores, streaks
- **user_progress** — session XP, achievements, interaction counts
- **news_articles** — title, summary, source, tags, published date

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add X feature"`
4. Open a Pull Request

### Code Style

- TypeScript strict mode throughout
- ESLint + Prettier enforced
- Server code uses `req.log` — never `console.log`
- All API changes must update the OpenAPI spec first

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgements

- [OpenAI](https://openai.com) for GPT-4o
- [shadcn/ui](https://ui.shadcn.com) for component primitives
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Drizzle ORM](https://orm.drizzle.team) for type-safe database access
- [TanStack Query](https://tanstack.com/query) for server state management

---

<div align="center">
  <p>Built with ❤️ to make democracy accessible to everyone.</p>
  <p><strong>GlobeVote — Civic Intelligence for Every Citizen</strong></p>
</div>
