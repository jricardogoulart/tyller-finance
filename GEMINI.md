# TyllerFinance — GSD Workspace Context

<!-- GSD:project-start source:PROJECT.md -->
## Project

Seu assistente financeiro pessoal com IA proativa — saiba exatamente quanto vai sobrar no fim do mês.

### Core Value
**"Saber exatamente quanto vai sobrar no fim do mês — e o que fazer para melhorar."**

### Active MVP Scope (v1.0)
- **AUTH-01 / AUTH-02**: Sign up and session-persistent login with email/password.
- **WORK-01**: Dynamic logical user workspace isolation.
- **IMPO-01 / IMPO-02**: PDF/OFX bank statement upload and transaction parser.
- **AI-01 / AI-02**: User IA Context Map profile initialized and proactive transaction categorization.
- **DASH-01 / DASH-02**: Visual, premium expense breakdown dashboard and interactive projection chart.
- **PROJ-01**: Real-time projection calculation algorithm.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

- **Frontend**: React + TypeScript (Vite).
- **Styling & Components**: Pure HSL Tailwind/CSS, glassmorphism aesthetics, dynamic interactions (built-in design system present in `/front`).
- **Backend**: Node.js (Express or Fastify) + TypeScript.
- **Database Leve**: Redis or MongoDB (for cache, session, and IA Context Map).
- **Database Rígido**: PostgreSQL (for critical transactions, workspace data, and historical backups).
- **IA**: Groq API or OpenRouter API (Deepseek / Gemma).
- **Parsing**: `ofx-js` & `pdf-parse` (open-source Node packages).
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

- **Design System Constraint**: Interface must exclusively consume style tokens and visual patterns defined in the pre-initialized `/front` directory.
- **Code Standards**: Type safety (strict TypeScript types), modular component layout, asynchronous event pipelines, lightweight backend architecture.
- **Database Isolation**: Always ensure operations query against the authenticated user's workspace context (filter by `user_id`).
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

- **Double-Layer Database**: High-speed ephemeral reads from Redis/MongoDB (Context Map) + structured transactional storage in PostgreSQL.
- **Dynamic Workspaces**: Logical isolation via `user_id` query filters on the rigid database layers instead of heavy multiple database instances.
- **IA Context Map**: A cached user behavior model keeping aggregates (average spend, recurrences, category patterns) to reduce live token usage on recurrent queries.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` — do not edit manually.
<!-- GSD:profile-end -->
