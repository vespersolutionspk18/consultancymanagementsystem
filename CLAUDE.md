# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CMS is an open-source CRM built with modern technologies in a monorepo structure. The codebase is organized as an Nx workspace with multiple packages.

## Key Commands

### Development
```bash
# Start development environment (frontend + backend + worker)
yarn start

# Individual package development
npx nx start cms-front     # Start frontend dev server
npx nx start cms-server    # Start backend server
npx nx run cms-server:worker  # Start background worker
```

### Testing
```bash
# Run tests
npx nx test cms-front      # Frontend unit tests
npx nx test cms-server     # Backend unit tests
npx nx run cms-server:test:integration:with-db-reset  # Integration tests with DB reset

# Storybook
npx nx storybook:build cms-front         # Build Storybook
npx nx storybook:serve-and-test:static cms-front     # Run Storybook tests


When testing the UI end to end, click on "Continue with Email" and use the prefilled credentials.
```

### Code Quality
```bash
# Linting (changed files only - fastest)
npx nx lint:changed cms-front           # Lint only changed files vs main
npx nx lint:changed cms-server          # Lint only changed files vs main
npx nx lint:changed cms-front --configuration=fix  # Auto-fix changed files
npx nx lint:changed cms-front --configuration=staged  # Lint staged files only

# Linting (full project)
npx nx lint cms-front      # Lint all files in frontend
npx nx lint cms-server     # Lint all files in backend
npx nx lint cms-front --fix  # Auto-fix all linting issues

# Type checking
npx nx typecheck cms-front
npx nx typecheck cms-server

# Format code
npx nx fmt cms-front
npx nx fmt cms-server
```

### Build
```bash
# Build packages
npx nx build cms-front
npx nx build cms-server
```

### Database Operations
```bash
# Database management
npx nx database:reset cms-server         # Reset database
npx nx run cms-server:database:init:prod # Initialize database
npx nx run cms-server:database:migrate:prod # Run migrations

# Generate migration
npx nx run cms-server:typeorm migration:generate src/database/typeorm/core/migrations/common/[name] -d src/database/typeorm/core/core.datasource.ts

# Sync metadata
npx nx run cms-server:command workspace:sync-metadata
```

### GraphQL
```bash
# Generate GraphQL types
npx nx run cms-front:graphql:generate
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript, Recoil (state management), Emotion (styling), Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL (with GraphQL Yoga)
- **Monorepo**: Nx workspace managed with Yarn 4

### Package Structure
```
packages/
├── cms-front/          # React frontend application
├── cms-server/         # NestJS backend API
├── cms-ui/             # Shared UI components library
├── cms-shared/         # Common types and utilities
├── cms-emails/         # Email templates with React Email
├── cms-website/        # Next.js documentation website
├── cms-zapier/         # Zapier integration
└── cms-e2e-testing/    # Playwright E2E tests
```

### Key Development Principles
- **Functional components only** (no class components)
- **Named exports only** (no default exports)
- **Types over interfaces** (except when extending third-party interfaces)
- **String literals over enums** (except for GraphQL enums)
- **No 'any' type allowed**
- **Event handlers preferred over useEffect** for state updates

### State Management
- **Recoil** for global state management
- Component-specific state with React hooks
- GraphQL cache managed by Apollo Client

### Backend Architecture
- **NestJS modules** for feature organization
- **TypeORM** for database ORM with PostgreSQL
- **GraphQL** API with code-first approach
- **Redis** for caching and session management
- **BullMQ** for background job processing

### Database
- **PostgreSQL** as primary database
- **Redis** for caching and sessions
- **TypeORM migrations** for schema management
- **ClickHouse** for analytics (when enabled)

## Development Workflow

IMPORTANT: Use Context7 for code generation, setup or configuration steps, or library/API documentation. Automatically use the Context7 MCP tools to resolve library IDs and get library docs without waiting for explicit requests.

### Before Making Changes
1. Always run linting and type checking after code changes
2. Test changes with relevant test suites
3. Ensure database migrations are properly structured
4. Check that GraphQL schema changes are backward compatible

### Code Style Notes
- Use **Emotion** for styling with styled-components pattern
- Follow **Nx** workspace conventions for imports
- Use **Lingui** for internationalization
- Components should be in their own directories with tests and stories

### Testing Strategy
- **Unit tests** with Jest for both frontend and backend
- **Integration tests** for critical backend workflows
- **Storybook** for component development and testing
- **E2E tests** with Playwright for critical user flows

## Important Files
- `nx.json` - Nx workspace configuration with task definitions
- `tsconfig.base.json` - Base TypeScript configuration
- `package.json` - Root package with workspace definitions
- `.cursor/rules/` - Development guidelines and best practices
