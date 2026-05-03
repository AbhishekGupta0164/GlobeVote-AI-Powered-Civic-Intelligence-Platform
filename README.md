# 🌐 GlobeVote — AI-Powered Civic Intelligence Platform

<div align="center">

![GlobeVote Banner](https://img.shields.io/badge/GlobeVote-Civic%20Intelligence-6366f1?style=for-the-badge&logo=globe&logoColor=white)

**The world's most knowledgeable political scientist in your pocket.**

Understand global elections · Fact-check claims instantly · Simulate electoral systems · Learn civics interactively

[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-10a37f?style=flat-square&logo=openai)](https://openai.com)
[![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## ✨ What is GlobeVote?

GlobeVote is a state-of-the-art civic education platform designed to make democracy transparent and accessible. It bridges the gap between complex political data and citizen engagement by combining an AI-powered assistant, real-time election tracking, and interactive simulations into a premium, dark-themed experience.

Whether you're a first-time voter, a political science student, or a curious citizen, GlobeVote provides the tools to understand how your world is governed.

---

## 🚀 Key Modules

### 🤖 AI Civic Assistant
- **GPT-4o Integration**: Context-aware, strictly neutral political analysis.
- **Multi-Mode**: Toggle between *Standard*, *ELI5* (simple), and *Expert* (deep-dive) responses.
- **Session Intelligence**: Persistent conversation history for continuous learning.

### 🔬 Electoral Systems Lab
- **Real-Time Simulation**: Model how FPTP, PR, MMP, and STV translate votes into seats.
- **Scientific Scoring**: Automatic Gallagher Index calculation for proportionality analysis.
- **Comparative Analysis**: View how different systems impact representation side-by-side.

### 🛡️ Misinformation Firewall
- **AI Fact-Checking**: Submit any political claim for instant verification.
- **Transparency Scale**: Clear verdicts from *True* to *False* with detailed evidence summaries.
- **Community Pulse**: View recent verifications to stay ahead of trending misinformation.

### 🗳️ Global Election Hub
- **Live Tracking**: Real-time countdowns and data for 190+ countries.
- **Voter Journey**: Step-by-step interactive guides to registration and voting.
- **Deep Data**: Historical results, upcoming candidates, and key political issues.

---

## 🛠️ Technical Excellence

| Layer | Technology | Why? |
|-------|-----------|------|
| **Core** | React 18 + TS | Type-safe, high-performance UI components. |
| **Styling** | Tailwind + Framer | Motion-heavy, premium dark-space aesthetic. |
| **Backend** | Express 5 + Pino | Modern, asynchronous API with structured logging. |
| **Database** | Postgres + Drizzle | Type-safe SQL access with automated migrations. |
| **AI Layer** | OpenAI SDK | Multi-modal support (text + future voice) via GPT-4o. |
| **Tooling** | pnpm Workspaces | Efficient monorepo management with shared catalogs. |

---

## 🏃 Quick Start

### 📋 Prerequisites
- **Node.js**: v20+
- **pnpm**: v9 or v10
- **PostgreSQL**: v15+
- **FFmpeg**: (Optional) For advanced audio/voice features

### ⚙️ Setup & Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/AbhishekGupta0164/-GlobeVote-AI-Powered-Civic-Intelligence-Platform.git
   cd GlobeVote
   pnpm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and OPENAI_API_KEY
   ```

3. **Database Initialization**
   ```bash
   # Push schema and seed initial data (Countries, Systems, Quizzes)
   pnpm --filter @workspace/db run push
   pnpm --filter @workspace/scripts run seed
   ```

4. **Launch Development Environment**
   ```bash
   pnpm dev
   ```
   *Visit `http://localhost:5173` to experience GlobeVote.*

---

## 📁 Repository Structure

```
globevote/
├── artifacts/
│   ├── globevote/          # React + Vite frontend application
│   └── api-server/         # Express.js API backend
├── lib/
│   ├── api-spec/           # OpenAPI 3.0 specification
│   ├── api-zod/            # Shared Zod validation schemas
│   ├── api-client-react/   # Generated TanStack Query hooks
│   ├── db/                 # Drizzle ORM schema & migrations
│   └── integrations/       # OpenAI, Audio, and Image processing modules
└── scripts/                # Database seeding and migration tools
```

---

## 🎨 Design Principles
GlobeVote adheres to a **Deep Space** aesthetic:
- **Glassmorphism**: High-blur backdrops for a premium feel.
- **Micro-interactions**: Subtle Framer Motion animations on every hover and click.
- **Data Viz**: Animated charts and counters to make statistics engaging.

---

## 🤝 Contributing & License

We welcome contributions that help make civic data more accessible!
1. Fork the repo.
2. Create your feature branch.
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/).
4. Submit a PR.

Released under the **[MIT License](LICENSE)**.
Copyright © 2026 GlobeVote.

---

<div align="center">
  <p>Built with ❤️ to make democracy accessible to everyone.</p>
  <p><strong>GlobeVote — Civic Intelligence for Every Citizen</strong></p>
</div>
