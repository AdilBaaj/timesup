# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
pnpm dev              # Start Next.js development server
pnpm build            # Build production bundle
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm typecheck        # Run typescript checks
```

### Database Operations
```bash
# Local environment
pnpm db:migration:create        # Generate migration from schema changes
pnpm db:migrate:local           # Apply migrations to local DB

# Production environment
pnpm db:migrate:prod            # Apply migrations to production DB
```

## System Architecture

### Technology Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **AI Framework**: AI SDK (Vercel AI SDK) - streaming AI responses with React hooks
- **AI Providers**: OpenRouter (primary, using GPT-5.1) and OpenAI
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Google OAuth
- **Charting**: ECharts with custom schema conversion layer
- **Frontend**: See `.claude/agents/frontend-feature-builder.md` for UI/component patterns
- **Backend**: See `.claude/agents/backend-ddd-architect.md` for DDD/hexagonal architecture patterns

### Specialized Agents

IMPORTANT: Use specialized agents for frontend and backend code:

| Task Type | Agent | When to Use |
|-----------|-------|-------------|
| **Frontend** | `frontend-feature-builder` | Creating pages, components, UI features, styling, client-side state, AI SDK hooks (`useChat`, `useCompletion`) |
| **Backend** | `backend-ddd-architect` | Creating API endpoints, business logic, database entities, repositories, cross-module communication |

**Frontend Agent** (`frontend-feature-builder`):
- New pages in `src/app/`
- React components in `src/components/`
- UI styling with Tailwind/shadcn/ui
- Client-side features using AI SDK hooks
- Responsive design and animations

**Backend Agent** (`backend-ddd-architect`):
- New modules in `src/backend/`
- Domain entities, value objects, use cases
- Repository ports and adapters
- API routes in `src/app/api/` that delegate to use cases
- Database schemas with Drizzle ORM
- Cross-module communication adapters

**Decision Guide:**
- "Create a dashboard page" → Frontend
- "Add a chart component" → Frontend
- "Create an API endpoint for reports" → Backend
- "Add business logic for analytics" → Backend
- "Build a form with validation UI" → Frontend
- "Implement data validation rules" → Backend
- "Use useChat() for AI streaming" → Frontend
- "Create AI tools with streamText()" → Backend (API route) + Frontend (UI)

### Package Requirements
- **pnpm**: >= 9.0.0
- **Node**: >= 20.0.0
- Uses `packageManager` field in package.json for Corepack

### Docker Deployment
Dockerfile requires all environment variables as build ARGs:
- See `Dockerfile` lines 8-21 for complete list
- Includes predeploy migration step
- Multi-stage build with pnpm fetch optimization
