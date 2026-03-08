# CMS Desktop App - Hyper-Detailed Implementation Plan

> **Document Version:** 1.0
> **Created:** 2026-01-06
> **Project:** Transform Twenty CRM into standalone CMS Desktop Application
> **Estimated Effort:** 40-60 hours

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites & External Services Setup](#2-prerequisites--external-services-setup)
3. [Repository Structure](#3-repository-structure)
4. [Phase 1: Renaming Twenty to CMS](#4-phase-1-renaming-twenty-to-cms)
5. [Phase 2: Frontend Modifications](#5-phase-2-frontend-modifications)
6. [Phase 3: Backend Modifications](#6-phase-3-backend-modifications)
7. [Phase 4: Tauri Project Setup](#7-phase-4-tauri-project-setup)
8. [Phase 5: Configuration & Onboarding System](#8-phase-5-configuration--onboarding-system)
9. [Phase 6: Sidecar Management](#9-phase-6-sidecar-management)
10. [Phase 7: Backend Compilation](#10-phase-7-backend-compilation)
11. [Phase 8: Build Pipeline](#11-phase-8-build-pipeline)
12. [Phase 9: Testing](#12-phase-9-testing)
13. [Phase 10: Distribution & Packaging](#13-phase-10-distribution--packaging)
14. [File-by-File Change List](#14-file-by-file-change-list)
15. [Environment Variables Reference](#15-environment-variables-reference)
16. [Troubleshooting Guide](#16-troubleshooting-guide)

---

## 1. Project Overview

### 1.1 What We're Building

A standalone desktop application for macOS and Windows that packages:

- **Frontend**: React-based CMS web application (formerly twenty-front)
- **Backend**: NestJS API server running as a sidecar process (formerly twenty-server)
- **Shell**: Tauri wrapper providing native OS integration

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CMS Desktop Application                          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        Tauri Shell (Rust)                          │ │
│  │                                                                     │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐│ │
│  │  │ Window Manager  │  │ Config Manager  │  │ Sidecar Controller  ││ │
│  │  │                 │  │                 │  │                     ││ │
│  │  │ • Create window │  │ • Load config   │  │ • Start backend     ││ │
│  │  │ • Handle events │  │ • Save config   │  │ • Stop backend      ││ │
│  │  │ • Menu bar      │  │ • Encrypt/decrypt│ │ • Health checks     ││ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘│ │
│  │                                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │                    IPC Command Bridge                        │  │ │
│  │  │  • save_config  • load_config  • get_app_state  • restart   │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    │ Webview                             │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      Frontend (React/Vite)                         │ │
│  │                                                                     │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐│ │
│  │  │ Onboarding Page │  │   Main CMS App  │  │   Settings Page     ││ │
│  │  │                 │  │                 │  │                     ││ │
│  │  │ • Paste .env    │  │ • All CMS       │  │ • Edit .env         ││ │
│  │  │ • Validate      │  │   functionality │  │ • Restart backend   ││ │
│  │  │ • Save & launch │  │                 │  │ • View logs         ││ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘│ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    │ HTTP (localhost:3000)               │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    Backend Sidecar (Node.js)                       │ │
│  │                                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │                    cms-server binary                         │  │ │
│  │  │                                                               │  │ │
│  │  │  • NestJS application                                        │  │ │
│  │  │  • GraphQL API                                                │  │ │
│  │  │  • REST API                                                   │  │ │
│  │  │  • Background worker (embedded)                              │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                                     │ HTTPS (Internet)
                                     ▼
              ┌──────────────────────────────────────────────┐
              │              External Services               │
              │                                              │
              │  ┌────────────┐ ┌────────────┐ ┌──────────┐ │
              │  │   Neon     │ │  Upstash   │ │Cloudflare│ │
              │  │ PostgreSQL │ │   Redis    │ │    R2    │ │
              │  │  (FREE)    │ │  (FREE)    │ │  (FREE)  │ │
              │  └────────────┘ └────────────┘ └──────────┘ │
              │                                              │
              └──────────────────────────────────────────────┘
```

### 1.3 Target Specifications

| Specification | Value |
|---------------|-------|
| **App Name** | CMS Desktop |
| **Bundle ID** | `com.cms.desktop` |
| **Minimum macOS** | 10.15 (Catalina) |
| **Minimum Windows** | Windows 10 (1803+) |
| **App Size** | ~100-120 MB |
| **RAM Usage** | ~400-600 MB |
| **Startup Time** | ~5-10 seconds |

### 1.4 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Desktop Shell** | Tauri | 2.x |
| **Shell Language** | Rust | 1.75+ |
| **Frontend** | React | 18.x |
| **Frontend Build** | Vite | 5.x |
| **Backend** | NestJS | 11.x |
| **Backend Runtime** | Node.js | 24.x |
| **Backend Compiler** | pkg | 5.x |
| **Database** | PostgreSQL | 16.x (external) |
| **Cache** | Redis | 7.x (external) |
| **Storage** | S3-compatible | Cloudflare R2 |

---

## 2. Prerequisites & External Services Setup

### 2.1 Development Machine Requirements

| Requirement | macOS | Windows |
|-------------|-------|---------|
| **OS Version** | macOS 11+ | Windows 10+ |
| **RAM** | 8 GB minimum, 16 GB recommended | 8 GB minimum, 16 GB recommended |
| **Disk Space** | 10 GB free | 10 GB free |
| **Node.js** | v24.5.0+ | v24.5.0+ |
| **Rust** | 1.75+ | 1.75+ |
| **Yarn** | 4.x | 4.x |

### 2.2 Required Development Tools

#### 2.2.1 macOS Setup

| Tool | Installation | Purpose |
|------|--------------|---------|
| **Xcode Command Line Tools** | `xcode-select --install` | C/C++ compiler for native modules |
| **Homebrew** | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` | Package manager |
| **Rust** | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` | Tauri backend |
| **Node.js** | `brew install node@24` | JavaScript runtime |
| **Yarn** | `corepack enable && corepack prepare yarn@4 --activate` | Package manager |
| **pkg** | `npm install -g pkg` | Node.js compiler |

#### 2.2.2 Windows Setup

| Tool | Installation | Purpose |
|------|--------------|---------|
| **Visual Studio Build Tools** | Download from Microsoft | C/C++ compiler |
| **Rust** | Download rustup-init.exe | Tauri backend |
| **Node.js** | Download from nodejs.org | JavaScript runtime |
| **Yarn** | `corepack enable && corepack prepare yarn@4 --activate` | Package manager |
| **pkg** | `npm install -g pkg` | Node.js compiler |

### 2.3 External Services Setup

#### 2.3.1 PostgreSQL (Neon)

| Step | Action | Details |
|------|--------|---------|
| 1 | Create account | Go to https://neon.tech, sign up |
| 2 | Create project | Click "New Project", name it "cms-desktop" |
| 3 | Select region | Choose closest to your users |
| 4 | Copy connection string | Format: `postgres://user:pass@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| 5 | Note limits | Free tier: 512 MB storage, 0.5 compute units |

#### 2.3.2 Redis (Upstash)

| Step | Action | Details |
|------|--------|---------|
| 1 | Create account | Go to https://upstash.com, sign up |
| 2 | Create database | Click "Create Database" |
| 3 | Select region | Choose closest to your PostgreSQL region |
| 4 | Enable TLS | Ensure TLS is enabled (default) |
| 5 | Copy connection string | Format: `rediss://default:xxx@us1-xxx-xxx.upstash.io:6379` |
| 6 | Note limits | Free tier: 10,000 commands/day, 256 MB |

#### 2.3.3 Cloudflare R2 Storage

| Step | Action | Details |
|------|--------|---------|
| 1 | Create account | Go to https://cloudflare.com, sign up |
| 2 | Navigate to R2 | Dashboard → R2 Object Storage |
| 3 | Create bucket | Name: "cms-files", Location: Auto |
| 4 | Create API token | R2 → Manage R2 API Tokens → Create API Token |
| 5 | Set permissions | Object Read & Write |
| 6 | Copy credentials | Account ID, Access Key ID, Secret Access Key |
| 7 | Note endpoint | `https://{ACCOUNT_ID}.r2.cloudflarestorage.com` |
| 8 | Note limits | Free tier: 10 GB storage, 1M Class A ops, 10M Class B ops |

---

## 3. Repository Structure

### 3.1 Current Structure (Before Changes)

```
twenty/
├── packages/
│   ├── twenty-front/              # React frontend
│   ├── twenty-server/             # NestJS backend
│   ├── twenty-ui/                 # UI component library
│   ├── twenty-shared/             # Shared utilities
│   ├── twenty-emails/             # Email templates
│   ├── twenty-docker/             # Docker configurations
│   ├── twenty-website/            # Documentation website
│   ├── twenty-zapier/             # Zapier integration
│   └── twenty-e2e-testing/        # E2E tests
├── nx.json
├── package.json
├── tsconfig.base.json
└── yarn.lock
```

### 3.2 Target Structure (After Changes)

```
cms/
├── packages/
│   ├── cms-front/                 # React frontend (renamed)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   └── Onboarding/    # NEW: Onboarding page
│   │   │   ├── modules/
│   │   │   │   └── tauri/         # NEW: Tauri integration
│   │   │   └── config/
│   │   │       └── index.ts       # MODIFIED: Tauri-aware config
│   │   ├── index.html
│   │   └── vite.config.ts
│   │
│   ├── cms-server/                # NestJS backend (renamed)
│   │   ├── src/
│   │   └── dist/                  # Compiled output
│   │
│   ├── cms-desktop/               # NEW: Tauri application
│   │   ├── src/                   # Rust source code
│   │   │   ├── main.rs            # Application entry point
│   │   │   ├── lib.rs             # Library exports
│   │   │   ├── config/            # Configuration management
│   │   │   │   ├── mod.rs
│   │   │   │   ├── storage.rs     # Config file read/write
│   │   │   │   ├── encryption.rs  # AES encryption
│   │   │   │   ├── keychain.rs    # OS keychain integration
│   │   │   │   └── parser.rs      # .env file parser
│   │   │   ├── sidecar/           # Backend process management
│   │   │   │   ├── mod.rs
│   │   │   │   ├── manager.rs     # Start/stop/restart
│   │   │   │   └── health.rs      # Health checking
│   │   │   └── commands/          # Tauri IPC commands
│   │   │       ├── mod.rs
│   │   │       ├── config.rs      # Config-related commands
│   │   │       └── app.rs         # App state commands
│   │   ├── binaries/              # Compiled backend binaries
│   │   │   ├── cms-server-aarch64-apple-darwin    # macOS ARM
│   │   │   ├── cms-server-x86_64-apple-darwin     # macOS Intel
│   │   │   └── cms-server-x86_64-pc-windows-msvc.exe  # Windows
│   │   ├── icons/                 # Application icons
│   │   │   ├── icon.icns          # macOS icon
│   │   │   ├── icon.ico           # Windows icon
│   │   │   ├── icon.png           # Linux/generic icon
│   │   │   ├── 32x32.png
│   │   │   ├── 128x128.png
│   │   │   └── 128x128@2x.png
│   │   ├── tauri.conf.json        # Tauri configuration
│   │   ├── Cargo.toml             # Rust dependencies
│   │   ├── Cargo.lock
│   │   └── build.rs               # Build script
│   │
│   ├── cms-ui/                    # UI library (renamed)
│   ├── cms-shared/                # Shared utilities (renamed)
│   └── cms-emails/                # Email templates (renamed)
│
├── scripts/
│   ├── build-desktop.sh           # NEW: Desktop build script
│   ├── build-backend-binary.sh    # NEW: Backend compilation script
│   └── package-app.sh             # NEW: Packaging script
│
├── nx.json                        # MODIFIED: Updated project names
├── package.json                   # MODIFIED: Updated workspace config
├── tsconfig.base.json             # MODIFIED: Updated paths
└── yarn.lock
```

---

## 4. Phase 1: Renaming Twenty to CMS

### 4.1 Overview

Systematic renaming of all "twenty" references to "cms" throughout the codebase.

### 4.2 Naming Conventions

| Context | Old Name | New Name |
|---------|----------|----------|
| Package names | `twenty-front` | `cms-front` |
| Package names | `twenty-server` | `cms-server` |
| Package names | `twenty-ui` | `cms-ui` |
| Package names | `twenty-shared` | `cms-shared` |
| Class names | `TwentyConfigService` | `CmsConfigService` |
| Variable names | `twentyServer` | `cmsServer` |
| Constants | `TWENTY_` prefix | `CMS_` prefix |
| Database names | `twentycrm` | `cms` |
| Docker images | `twentycrm/twenty` | `cms/cms-server` |
| URLs/paths | `/twenty/` | `/cms/` |

### 4.3 File Renaming

#### 4.3.1 Directory Renames

| Old Path | New Path |
|----------|----------|
| `packages/twenty-front/` | `packages/cms-front/` |
| `packages/twenty-server/` | `packages/cms-server/` |
| `packages/twenty-ui/` | `packages/cms-ui/` |
| `packages/twenty-shared/` | `packages/cms-shared/` |
| `packages/twenty-emails/` | `packages/cms-emails/` |
| `packages/twenty-docker/` | `packages/cms-docker/` |
| `packages/twenty-e2e-testing/` | `packages/cms-e2e-testing/` |

#### 4.3.2 File Renames Within Packages

| Package | Old File | New File |
|---------|----------|----------|
| cms-server | `src/engine/core-modules/twenty-config/` | `src/engine/core-modules/cms-config/` |
| cms-server | `twenty-config.service.ts` | `cms-config.service.ts` |
| cms-server | `twenty-config.module.ts` | `cms-config.module.ts` |
| cms-server | `twenty-standard-application/` | `cms-standard-application/` |
| cms-front | `src/modules/twenty-*/` | `src/modules/cms-*/` (if any exist) |

### 4.4 Content Replacements

#### 4.4.1 Package.json Files

**File: `packages/cms-front/package.json`**

| Field | Old Value | New Value |
|-------|-----------|-----------|
| `name` | `twenty-front` | `cms-front` |
| Dependencies referencing twenty | `twenty-shared` | `cms-shared` |
| Dependencies referencing twenty | `twenty-ui` | `cms-ui` |

**File: `packages/cms-server/package.json`**

| Field | Old Value | New Value |
|-------|-----------|-----------|
| `name` | `twenty-server` | `cms-server` |
| Dependencies referencing twenty | `twenty-shared` | `cms-shared` |
| Dependencies referencing twenty | `twenty-emails` | `cms-emails` |

#### 4.4.2 TypeScript/JavaScript Content

| Pattern | Replacement | Files Affected |
|---------|-------------|----------------|
| `twenty-front` | `cms-front` | All import statements |
| `twenty-server` | `cms-server` | All import statements |
| `twenty-shared` | `cms-shared` | All import statements |
| `twenty-ui` | `cms-ui` | All import statements |
| `TwentyConfigService` | `CmsConfigService` | ~50 files |
| `TwentyORMModule` | `CmsORMModule` | ~30 files |
| `twentycrm` | `cms` | Docker configs, DB names |
| `TWENTY_` | `CMS_` | Environment variables |

#### 4.4.3 Configuration Files

**File: `nx.json`**

| Section | Change |
|---------|--------|
| `targetDefaults` | Replace all `twenty-*` references with `cms-*` |
| `projects` | Update all project names |

**File: `tsconfig.base.json`**

| Path Alias | Old | New |
|------------|-----|-----|
| `twenty-front/*` | `packages/twenty-front/src/*` | `packages/cms-front/src/*` |
| `twenty-server/*` | `packages/twenty-server/src/*` | `packages/cms-server/src/*` |
| `twenty-shared/*` | `packages/twenty-shared/src/*` | `packages/cms-shared/src/*` |
| `twenty-ui/*` | `packages/twenty-ui/src/*` | `packages/cms-ui/src/*` |

### 4.5 Automated Renaming Commands

Execute in order:

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `find . -type d -name "*twenty*" -not -path "*/node_modules/*" -not -path "*/.git/*"` | List directories to rename |
| 2 | Rename directories (deepest first) | Avoid path conflicts |
| 3 | `find . -type f -name "*twenty*" -not -path "*/node_modules/*" -not -path "*/.git/*"` | List files to rename |
| 4 | Rename files | Update filenames |
| 5 | `grep -r "twenty" --include="*.ts" --include="*.tsx" --include="*.json"` | Find content to replace |
| 6 | Bulk replace content | Update all references |
| 7 | `yarn install` | Regenerate lockfile |
| 8 | `yarn build` | Verify build works |

### 4.6 Verification Checklist

| Check | Command | Expected Result |
|-------|---------|-----------------|
| No "twenty" in package names | `grep -r "twenty-" package.json` | No results |
| No "twenty" in imports | `grep -r "from 'twenty-" --include="*.ts"` | No results |
| Build succeeds | `yarn build` | Exit code 0 |
| Tests pass | `yarn test` | All tests pass |
| No broken imports | `yarn typecheck` | No type errors |

---

## 5. Phase 2: Frontend Modifications

### 5.1 Overview

Modify the cms-front package to:
1. Detect Tauri environment
2. Work with localhost backend
3. Add onboarding page
4. Integrate with Tauri IPC

### 5.2 Tauri Detection Utility

**New File: `packages/cms-front/src/utils/tauri.ts`**

| Export | Purpose |
|--------|---------|
| `isTauri()` | Returns `true` if running in Tauri webview |
| `getTauriAPI()` | Returns Tauri API object or null |
| `invokeTauriCommand(cmd, args)` | Wrapper for Tauri invoke |

**Detection Logic:**
- Check for `window.__TAURI__` global
- Check for `window.__TAURI_INTERNALS__`

### 5.3 Configuration Changes

**File: `packages/cms-front/src/config/index.ts`**

| Change | Before | After |
|--------|--------|-------|
| URL detection | Uses `window.location` | Checks Tauri first, falls back to window.location |
| Default URL | Dynamic based on hostname | `http://localhost:3000` for Tauri |
| Protocol check | Relies on browser | Returns `http` for Tauri |

**Modified Logic Flow:**

```
getServerUrl()
    │
    ├── Is Tauri?
    │   └── YES → return "http://localhost:3000"
    │
    ├── Has window._env_.REACT_APP_SERVER_BASE_URL?
    │   └── YES → return that value
    │
    ├── Has import.meta.env.VITE_SERVER_BASE_URL?
    │   └── YES → return that value
    │
    └── NO to all → use dynamic window.location detection
```

### 5.4 Cookie Storage Modification

**File: `packages/cms-front/src/utils/cookie-storage.ts`**

| Change | Before | After |
|--------|--------|-------|
| Secure flag | `window.location.protocol === 'https:'` | `isTauri() ? false : window.location.protocol === 'https:'` |
| SameSite | `'lax'` | `isTauri() ? 'strict' : 'lax'` |

### 5.5 New Onboarding Module

**New Directory: `packages/cms-front/src/modules/onboarding/`**

| File | Purpose |
|------|---------|
| `components/OnboardingPage.tsx` | Main onboarding container |
| `components/EnvPasteArea.tsx` | Textarea for .env paste |
| `components/ValidationStatus.tsx` | Shows missing/invalid keys |
| `components/SaveButton.tsx` | Save and launch button |
| `hooks/useEnvValidation.ts` | Validates .env content |
| `hooks/useTauriConfig.ts` | Tauri IPC for config |
| `utils/envParser.ts` | Parse .env format |
| `constants/requiredEnvKeys.ts` | List of required keys |

### 5.6 Required Environment Keys Validation

**File: `packages/cms-front/src/modules/onboarding/constants/requiredEnvKeys.ts`**

| Key | Required | Validation |
|-----|----------|------------|
| `PG_DATABASE_URL` | Yes | Must start with `postgres://` or `postgresql://` |
| `REDIS_URL` | Yes | Must start with `redis://` or `rediss://` |
| `APP_SECRET` | Yes (auto-generate if missing) | Minimum 16 characters |
| `STORAGE_TYPE` | No | Must be `local` or `S3` |
| `STORAGE_S3_REGION` | If S3 | Non-empty string |
| `STORAGE_S3_NAME` | If S3 | Non-empty string |
| `STORAGE_S3_ENDPOINT` | If S3 | Valid URL |
| `STORAGE_S3_ACCESS_KEY_ID` | If S3 | Non-empty string |
| `STORAGE_S3_SECRET_ACCESS_KEY` | If S3 | Non-empty string |

### 5.7 Routing Changes

**File: `packages/cms-front/src/App.tsx`**

| Change | Description |
|--------|-------------|
| Add `/onboarding` route | New route for onboarding page |
| Add route guard | Redirect to onboarding if no config (Tauri only) |

**Route Guard Logic:**

```
On app load (Tauri only):
    │
    ├── Call Tauri command: has_config()
    │
    ├── Config exists?
    │   ├── YES → Continue to requested route
    │   └── NO → Redirect to /onboarding
    │
    └── After onboarding complete → Redirect to /
```

### 5.8 Tauri IPC Integration

**New File: `packages/cms-front/src/modules/tauri/commands.ts`**

| Command | Purpose | Parameters | Returns |
|---------|---------|------------|---------|
| `has_config` | Check if config exists | None | `boolean` |
| `load_config` | Load existing config | None | `string` (.env content) |
| `save_config` | Save new config | `content: string` | `{ success: boolean, error?: string }` |
| `get_app_state` | Get backend status | None | `{ running: boolean, port: number }` |
| `restart_backend` | Restart sidecar | None | `{ success: boolean }` |

### 5.9 Settings Page Addition

**New File: `packages/cms-front/src/modules/settings/components/DesktopSettings.tsx`**

| Feature | Description |
|---------|-------------|
| View current config | Display .env content (masked secrets) |
| Edit config | Textarea to modify |
| Save changes | Calls `save_config` + `restart_backend` |
| View backend logs | Shows recent sidecar output |
| Backend status | Shows running/stopped status |

### 5.10 Frontend Build Configuration

**File: `packages/cms-front/vite.config.ts`**

| Change | Description |
|--------|-------------|
| Add Tauri environment variable | `VITE_IS_TAURI=true` during desktop build |
| Adjust base path | Set to `./` for Tauri file:// loading |
| Output directory | Ensure outputs to `build/` |

---

## 6. Phase 3: Backend Modifications

### 6.1 Overview

Modify cms-server for desktop deployment:
1. Embed worker into main process (optional)
2. Adjust startup for sidecar mode
3. Health check endpoint optimization

### 6.2 Worker Embedding

**Current Architecture:**
- Main server process: `yarn start:prod`
- Separate worker process: `yarn worker:prod`

**Desktop Architecture:**
- Single process running both server and worker
- Reduces resource usage
- Simplifies sidecar management

**File: `packages/cms-server/src/main.ts`**

| Change | Description |
|--------|-------------|
| Add `EMBED_WORKER` env check | If true, initialize worker in same process |
| Import worker module conditionally | Load QueueWorkerModule when embedded |

### 6.3 Health Check Optimization

**File: `packages/cms-server/src/engine/core-modules/health/health.controller.ts`**

| Endpoint | Current Behavior | Desktop Behavior |
|----------|------------------|------------------|
| `GET /healthz` | Full health check | Quick response for sidecar readiness |
| `GET /healthz/ready` | N/A (new) | Full readiness check |

### 6.4 Startup Logging

**File: `packages/cms-server/src/main.ts`**

| Change | Description |
|--------|-------------|
| Add startup marker | Log `CMS_SERVER_READY` when fully initialized |
| Add port announcement | Log `Listening on port {PORT}` |

These markers are used by the Tauri sidecar manager to detect successful startup.

### 6.5 Graceful Shutdown

**File: `packages/cms-server/src/main.ts`**

| Signal | Behavior |
|--------|----------|
| `SIGTERM` | Graceful shutdown, close connections |
| `SIGINT` | Same as SIGTERM |
| `SIGKILL` | Immediate termination (no handler) |

---

## 7. Phase 4: Tauri Project Setup

### 7.1 Project Initialization

**Directory: `packages/cms-desktop/`**

| Step | Action |
|------|--------|
| 1 | Create directory structure |
| 2 | Initialize Cargo.toml |
| 3 | Create tauri.conf.json |
| 4 | Create Rust source files |
| 5 | Add icons |

### 7.2 Cargo.toml Configuration

**File: `packages/cms-desktop/Cargo.toml`**

| Section | Content |
|---------|---------|
| `[package]` | name = "cms-desktop", version = "1.0.0" |
| `[dependencies]` | tauri, serde, serde_json, keyring, aes-gcm, etc. |
| `[build-dependencies]` | tauri-build |
| `[features]` | Custom feature flags |

**Dependencies:**

| Crate | Version | Purpose |
|-------|---------|---------|
| `tauri` | 2.x | Core framework |
| `tauri-plugin-shell` | 2.x | Sidecar management |
| `tauri-plugin-process` | 2.x | Process control |
| `serde` | 1.x | Serialization |
| `serde_json` | 1.x | JSON handling |
| `keyring` | 2.x | OS keychain access |
| `aes-gcm` | 0.10.x | Encryption |
| `rand` | 0.8.x | Random generation |
| `base64` | 0.21.x | Encoding |
| `tokio` | 1.x | Async runtime |

### 7.3 Tauri Configuration

**File: `packages/cms-desktop/tauri.conf.json`**

```json
{
  "$schema": "https://schema.tauri.app/config/2",

  "productName": "CMS Desktop",
  "version": "1.0.0",
  "identifier": "com.cms.desktop",

  "build": {
    "beforeBuildCommand": "yarn workspace cms-front build",
    "devUrl": "http://localhost:3001",
    "frontendDist": "../cms-front/build"
  },

  "app": {
    "windows": [
      {
        "title": "CMS Desktop",
        "width": 1280,
        "height": 800,
        "minWidth": 900,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "center": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; connect-src 'self' http://localhost:3000 https://*.neon.tech https://*.upstash.io https://*.r2.cloudflarestorage.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"
    }
  },

  "bundle": {
    "active": true,
    "targets": ["dmg", "app", "nsis", "msi"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "externalBin": ["binaries/cms-server"],
    "macOS": {
      "minimumSystemVersion": "10.15",
      "signingIdentity": null,
      "entitlements": null
    },
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256"
    }
  },

  "plugins": {
    "shell": {
      "sidecar": true
    }
  }
}
```

### 7.4 Application Icons

**Directory: `packages/cms-desktop/icons/`**

| File | Size | Platform |
|------|------|----------|
| `32x32.png` | 32x32 | All |
| `128x128.png` | 128x128 | All |
| `128x128@2x.png` | 256x256 | macOS Retina |
| `icon.icns` | Multiple | macOS |
| `icon.ico` | Multiple | Windows |
| `icon.png` | 512x512 | Linux |

Icon requirements:
- PNG format with transparency
- Square aspect ratio
- Clean, recognizable at small sizes

### 7.5 Rust Project Structure

**File: `packages/cms-desktop/src/main.rs`**

| Section | Purpose |
|---------|---------|
| Imports | Tauri, config, sidecar modules |
| Main function | Tauri builder setup |
| Setup hook | Initialize config, start sidecar |
| Exit hook | Stop sidecar cleanly |

**File: `packages/cms-desktop/src/lib.rs`**

| Export | Purpose |
|--------|---------|
| `run()` | Main entry point for Tauri |
| Command registrations | All IPC commands |

---

## 8. Phase 5: Configuration & Onboarding System

### 8.1 Configuration File Format

**File Location:** `{app_config_dir}/config.env.enc`

| Platform | Full Path |
|----------|-----------|
| macOS | `~/Library/Application Support/com.cms.desktop/config.env.enc` |
| Windows | `%APPDATA%\com.cms.desktop\config.env.enc` |
| Linux | `~/.config/com.cms.desktop/config.env.enc` |

**Format:** AES-256-GCM encrypted .env content

### 8.2 Encryption System

**Encryption Flow:**

| Step | Action |
|------|--------|
| 1 | Generate random 256-bit key |
| 2 | Store key in OS keychain under service "cms-desktop" |
| 3 | Generate random 96-bit nonce |
| 4 | Encrypt .env content with AES-256-GCM |
| 5 | Prepend nonce to ciphertext |
| 6 | Base64 encode result |
| 7 | Write to config.env.enc |

**Decryption Flow:**

| Step | Action |
|------|--------|
| 1 | Read config.env.enc |
| 2 | Base64 decode |
| 3 | Extract nonce (first 12 bytes) |
| 4 | Retrieve key from OS keychain |
| 5 | Decrypt with AES-256-GCM |
| 6 | Return plaintext .env content |

### 8.3 Keychain Integration

**File: `packages/cms-desktop/src/config/keychain.rs`**

| Platform | Backend |
|----------|---------|
| macOS | Keychain Services |
| Windows | Credential Manager |
| Linux | Secret Service (libsecret) |

**Keychain Entry:**

| Field | Value |
|-------|-------|
| Service | `cms-desktop` |
| Account | `encryption-key` |
| Secret | 32-byte random key (hex encoded) |

### 8.4 .env Parser

**File: `packages/cms-desktop/src/config/parser.rs`**

| Feature | Handling |
|---------|----------|
| Comments | Lines starting with `#` are ignored |
| Empty lines | Preserved but ignored |
| Key=Value | Parsed into HashMap |
| Quoted values | Quotes stripped (`"value"` → `value`) |
| Whitespace | Trimmed from keys and values |
| Multi-line | `\` continuation supported |
| Export prefix | `export KEY=value` handled |

### 8.5 Configuration Validation

**File: `packages/cms-desktop/src/config/validation.rs`**

| Validation | Action |
|------------|--------|
| Required keys present | Return list of missing keys |
| URL format valid | Check postgres://, redis://, https:// |
| S3 config complete | If STORAGE_TYPE=S3, check all S3 keys |
| APP_SECRET present | Auto-generate if missing |

### 8.6 Tauri Commands for Config

**File: `packages/cms-desktop/src/commands/config.rs`**

| Command | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `has_config` | None | `bool` | Check if config file exists |
| `load_config` | None | `Result<String, String>` | Load and decrypt config |
| `save_config` | `content: String` | `Result<(), String>` | Encrypt and save config |
| `validate_config` | `content: String` | `ValidationResult` | Validate without saving |
| `delete_config` | None | `Result<(), String>` | Delete config and keychain entry |
| `get_config_path` | None | `String` | Return config file path |

**ValidationResult Structure:**

| Field | Type | Description |
|-------|------|-------------|
| `valid` | `bool` | Overall validity |
| `missing_keys` | `Vec<String>` | Required keys not found |
| `invalid_keys` | `Vec<(String, String)>` | Key and error message |
| `warnings` | `Vec<String>` | Non-fatal issues |

### 8.7 First-Run Detection

**Logic in `packages/cms-desktop/src/main.rs`:**

| Check | Action |
|-------|--------|
| Config file exists? | If no, set `needs_onboarding = true` |
| Keychain entry exists? | If no (but file exists), config is corrupted |
| Config decrypts successfully? | If no, config is corrupted |

**App State Passed to Frontend:**

| Field | Type | Description |
|-------|------|-------------|
| `needs_onboarding` | `bool` | Should show onboarding |
| `config_error` | `Option<String>` | Error message if config corrupted |
| `backend_running` | `bool` | Is sidecar running |
| `backend_port` | `u16` | Port backend is on |

### 8.8 Onboarding UI Flow

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    Welcome to CMS Desktop                       │
│                                                                 │
│   Paste your .env configuration below:                         │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │ # Database                                                │ │
│   │ PG_DATABASE_URL=postgres://user:pass@host/db             │ │
│   │                                                           │ │
│   │ # Redis                                                   │ │
│   │ REDIS_URL=rediss://default:xxx@host:6379                 │ │
│   │                                                           │ │
│   │ # Storage                                                 │ │
│   │ STORAGE_TYPE=S3                                          │ │
│   │ STORAGE_S3_REGION=auto                                   │ │
│   │ STORAGE_S3_NAME=my-bucket                                │ │
│   │ STORAGE_S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com │ │
│   │ STORAGE_S3_ACCESS_KEY_ID=xxx                             │ │
│   │ STORAGE_S3_SECRET_ACCESS_KEY=xxx                         │ │
│   │                                                           │ │
│   │ # App                                                     │ │
│   │ APP_SECRET=my-random-secret-string                       │ │
│   │                                                           │ │
│   └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│   ⚠️  Missing required: APP_SECRET                              │
│                                                                 │
│                              [ Save & Launch ]                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 9. Phase 6: Sidecar Management

### 9.1 Sidecar Binary Naming Convention

**Tauri Sidecar Naming:**

| Platform | Binary Name | Full Path |
|----------|-------------|-----------|
| macOS ARM | `cms-server-aarch64-apple-darwin` | `binaries/cms-server-aarch64-apple-darwin` |
| macOS Intel | `cms-server-x86_64-apple-darwin` | `binaries/cms-server-x86_64-apple-darwin` |
| Windows | `cms-server-x86_64-pc-windows-msvc.exe` | `binaries/cms-server-x86_64-pc-windows-msvc.exe` |

Tauri automatically selects the correct binary based on the host platform.

### 9.2 Sidecar Manager

**File: `packages/cms-desktop/src/sidecar/manager.rs`**

| Method | Description |
|--------|-------------|
| `start(env_vars: HashMap)` | Spawn sidecar with environment variables |
| `stop()` | Send SIGTERM, wait, then SIGKILL if needed |
| `restart(env_vars: HashMap)` | Stop then start |
| `is_running()` | Check if process is alive |
| `get_pid()` | Return process ID |
| `get_output()` | Get stdout/stderr buffer |

### 9.3 Environment Variable Passing

**How env vars are passed to sidecar:**

| Step | Action |
|------|--------|
| 1 | Load and decrypt config.env.enc |
| 2 | Parse .env content into HashMap |
| 3 | Add static vars: `NODE_PORT=3000`, `SERVER_URL=http://localhost:3000` |
| 4 | Add `EMBED_WORKER=true` for embedded worker mode |
| 5 | Pass HashMap to `Command::new_sidecar().envs()` |

### 9.4 Startup Sequence

**Detailed startup flow:**

| Step | Action | Timeout | On Failure |
|------|--------|---------|------------|
| 1 | Load config | - | Show onboarding |
| 2 | Parse config | - | Show error |
| 3 | Spawn sidecar | - | Show error |
| 4 | Wait for stdout `CMS_SERVER_READY` | 30s | Show error with logs |
| 5 | Health check `GET /healthz` | 5s | Retry 3x, then error |
| 6 | Load frontend | - | - |

### 9.5 Health Checking

**File: `packages/cms-desktop/src/sidecar/health.rs`**

| Check | Endpoint | Interval | Timeout |
|-------|----------|----------|---------|
| Startup readiness | `http://localhost:3000/healthz` | Once | 5s |
| Runtime health | `http://localhost:3000/healthz` | 30s | 5s |

**On Health Check Failure:**

| Consecutive Failures | Action |
|---------------------|--------|
| 1-2 | Log warning |
| 3+ | Attempt restart |
| Restart fails | Show error to user |

### 9.6 Output Capture

**Sidecar output handling:**

| Stream | Handling |
|--------|----------|
| stdout | Buffer last 1000 lines, parse for markers |
| stderr | Buffer last 1000 lines, log errors |

**Markers to detect:**

| Marker | Meaning |
|--------|---------|
| `CMS_SERVER_READY` | Server fully initialized |
| `Listening on port` | HTTP server started |
| `error` (case-insensitive) | Log as error |
| `FATAL` | Critical failure |

### 9.7 Graceful Shutdown

**App exit sequence:**

| Step | Action | Timeout |
|------|--------|---------|
| 1 | Send SIGTERM to sidecar | - |
| 2 | Wait for process exit | 5s |
| 3 | If still running, SIGKILL | - |
| 4 | Clean up temp files | - |
| 5 | Exit app | - |

---

## 10. Phase 7: Backend Compilation

### 10.1 Compilation Tool: pkg

**Why pkg:**
- Mature and stable
- Produces single executable
- Includes Node.js runtime
- Supports all target platforms

### 10.2 Build Process

**Script: `scripts/build-backend-binary.sh`**

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `cd packages/cms-server` | Navigate to backend |
| 2 | `yarn build` | Compile TypeScript to JavaScript |
| 3 | `pkg dist/src/main.js --config pkg.config.json` | Compile to binary |
| 4 | Move binaries to `packages/cms-desktop/binaries/` | Place for Tauri |

### 10.3 pkg Configuration

**File: `packages/cms-server/pkg.config.json`**

```json
{
  "pkg": {
    "scripts": [
      "dist/**/*.js"
    ],
    "assets": [
      "node_modules/@nestjs/**/*",
      "node_modules/graphql/**/*",
      "node_modules/sharp/**/*",
      "dist/**/*.json"
    ],
    "targets": [
      "node18-macos-arm64",
      "node18-macos-x64",
      "node18-win-x64"
    ],
    "outputPath": "../cms-desktop/binaries",
    "compress": "GZip"
  }
}
```

### 10.4 Target Platforms

| Target | pkg Target String | Output Name |
|--------|-------------------|-------------|
| macOS ARM | `node18-macos-arm64` | `cms-server-aarch64-apple-darwin` |
| macOS Intel | `node18-macos-x64` | `cms-server-x86_64-apple-darwin` |
| Windows x64 | `node18-win-x64` | `cms-server-x86_64-pc-windows-msvc.exe` |

### 10.5 Binary Renaming

After pkg compilation, rename to Tauri convention:

| pkg Output | Tauri Name |
|------------|------------|
| `cms-server-macos-arm64` | `cms-server-aarch64-apple-darwin` |
| `cms-server-macos-x64` | `cms-server-x86_64-apple-darwin` |
| `cms-server-win-x64.exe` | `cms-server-x86_64-pc-windows-msvc.exe` |

### 10.6 Binary Size Optimization

| Technique | Savings | Applied |
|-----------|---------|---------|
| Tree-shaking (during TS build) | ~10-20% | Yes |
| Compression (GZip in pkg) | ~30-40% | Yes |
| Exclude dev dependencies | ~20% | Yes |
| Strip debug symbols | ~5% | Platform-dependent |

**Expected sizes:**

| Platform | Uncompressed | Compressed |
|----------|--------------|------------|
| macOS ARM | ~90 MB | ~65 MB |
| macOS Intel | ~95 MB | ~70 MB |
| Windows | ~85 MB | ~60 MB |

---

## 11. Phase 8: Build Pipeline

### 11.1 Complete Build Script

**Script: `scripts/build-desktop.sh`**

| Step | Command | Time Est. |
|------|---------|-----------|
| 1 | Clean previous builds | 5s |
| 2 | Install dependencies | 30-60s |
| 3 | Build cms-shared | 10s |
| 4 | Build cms-ui | 20s |
| 5 | Build cms-front | 30s |
| 6 | Build cms-server | 45s |
| 7 | Compile backend binary | 60-90s |
| 8 | Rename binaries | 5s |
| 9 | Build Tauri app | 60-120s |
| **Total** | | **~5-7 min** |

### 11.2 Development Mode

**Command: `yarn desktop:dev`**

| Process | Port | Purpose |
|---------|------|---------|
| Vite dev server | 3001 | Frontend hot reload |
| cms-server (local) | 3000 | Backend (run separately) |
| Tauri dev | - | Native window |

**Development workflow:**

| Terminal 1 | Terminal 2 | Terminal 3 |
|------------|------------|------------|
| `yarn workspace cms-front dev` | `yarn workspace cms-server start` | `yarn workspace cms-desktop tauri dev` |

### 11.3 Production Build

**Command: `yarn desktop:build`**

| Platform | Output Location |
|----------|-----------------|
| macOS DMG | `packages/cms-desktop/target/release/bundle/dmg/` |
| macOS App | `packages/cms-desktop/target/release/bundle/macos/` |
| Windows MSI | `packages/cms-desktop/target/release/bundle/msi/` |
| Windows NSIS | `packages/cms-desktop/target/release/bundle/nsis/` |

### 11.4 Cross-Compilation

**Building for different platforms:**

| Host | Target | Method |
|------|--------|--------|
| macOS ARM | macOS ARM | Native |
| macOS ARM | macOS Intel | Cross-compile with `--target x86_64-apple-darwin` |
| macOS | Windows | Requires cross-compilation toolchain |
| Windows | Windows | Native |
| Windows | macOS | Not supported (use macOS host) |

**Recommended approach:**
- Build macOS versions on macOS
- Build Windows version on Windows (or use CI)

### 11.5 CI/CD Pipeline (GitHub Actions)

**File: `.github/workflows/build-desktop.yml`**

| Job | Runner | Builds |
|-----|--------|--------|
| `build-macos` | `macos-latest` | DMG, App (ARM + Intel) |
| `build-windows` | `windows-latest` | MSI, NSIS |
| `release` | `ubuntu-latest` | Upload artifacts |

---

## 12. Phase 9: Testing

### 12.1 Test Categories

| Category | Scope | Tools |
|----------|-------|-------|
| Unit tests | Individual functions | Jest |
| Integration tests | Backend API | Jest + Supertest |
| E2E tests (web) | Frontend flows | Playwright |
| E2E tests (desktop) | Desktop app | Playwright + Tauri Driver |
| Config tests | Encryption, parsing | Rust tests |

### 12.2 Frontend Tests

**Test: Onboarding Flow**

| Test Case | Steps | Expected |
|-----------|-------|----------|
| Empty .env shows errors | Paste empty, click save | Show missing required keys |
| Valid .env saves | Paste valid, click save | Config saved, redirect to main |
| Invalid URL rejected | Paste invalid PG_DATABASE_URL | Show URL format error |
| S3 config validation | Set STORAGE_TYPE=S3 without keys | Show missing S3 keys |

### 12.3 Backend Tests

**Test: Health Endpoints**

| Endpoint | Test | Expected |
|----------|------|----------|
| `GET /healthz` | Call endpoint | 200 OK, `{ "status": "ok" }` |
| `GET /healthz` (DB down) | Disconnect DB | 503, `{ "status": "error" }` |

### 12.4 Desktop Tests

**Test: Sidecar Management**

| Test Case | Steps | Expected |
|-----------|-------|----------|
| Sidecar starts | Launch app with valid config | Backend running on port 3000 |
| Sidecar restarts | Change config, restart | New config applied |
| Graceful shutdown | Close app | Sidecar terminates cleanly |
| Health recovery | Kill sidecar manually | Auto-restart within 30s |

### 12.5 Config System Tests

**Rust tests in `packages/cms-desktop/src/config/`**

| Test | Verifies |
|------|----------|
| `test_parse_env` | .env parsing |
| `test_encrypt_decrypt` | Encryption roundtrip |
| `test_keychain_store_retrieve` | Keychain operations |
| `test_validation_required_keys` | Required key detection |
| `test_validation_url_format` | URL validation |

---

## 13. Phase 10: Distribution & Packaging

### 13.1 macOS Distribution

**DMG Contents:**

```
CMS Desktop.dmg
├── CMS Desktop.app
├── Applications (symlink)
└── Background.png
```

**App Bundle Structure:**

```
CMS Desktop.app/
├── Contents/
│   ├── Info.plist
│   ├── MacOS/
│   │   └── CMS Desktop (main executable)
│   ├── Resources/
│   │   ├── icon.icns
│   │   └── cms-server-aarch64-apple-darwin (sidecar)
│   └── _CodeSignature/
└── ...
```

### 13.2 Windows Distribution

**NSIS Installer:**
- Single .exe installer
- Installs to Program Files
- Creates Start Menu shortcut
- Creates Desktop shortcut (optional)
- Registers uninstaller

**MSI Installer:**
- Enterprise deployment friendly
- Silent install support
- Group Policy compatible

### 13.3 Code Signing

**macOS:**

| Requirement | For Distribution |
|-------------|------------------|
| Developer ID | Required for Gatekeeper |
| Notarization | Required for Gatekeeper |
| Hardened Runtime | Required for notarization |

**Windows:**

| Requirement | For Distribution |
|-------------|------------------|
| Code Signing Certificate | Recommended (avoids SmartScreen) |
| EV Certificate | For instant SmartScreen trust |

### 13.4 Auto-Update System

**Tauri Updater Configuration:**

| Setting | Value |
|---------|-------|
| Update endpoint | `https://releases.cms.app/{{target}}/{{current_version}}` |
| Public key | Generated during setup |
| Check interval | On app launch |

**Update Flow:**

| Step | Action |
|------|--------|
| 1 | App checks update endpoint |
| 2 | If update available, download in background |
| 3 | Prompt user to install |
| 4 | Replace app and restart |

### 13.5 Release Checklist

| Item | Verification |
|------|--------------|
| Version bumped | Check tauri.conf.json, package.json |
| Changelog updated | CHANGELOG.md has new entry |
| All tests pass | CI green |
| macOS signed | `codesign -dv` shows valid signature |
| macOS notarized | `spctl -a -v` shows accepted |
| Windows signed | signtool verify succeeds |
| DMG opens correctly | Manual test |
| Windows installer works | Manual test |
| Onboarding works | Fresh install test |
| Sidecar starts | Backend health check passes |

---

## 14. File-by-File Change List

### 14.1 Files to Rename

| # | Old Path | New Path |
|---|----------|----------|
| 1 | `packages/twenty-front/` | `packages/cms-front/` |
| 2 | `packages/twenty-server/` | `packages/cms-server/` |
| 3 | `packages/twenty-ui/` | `packages/cms-ui/` |
| 4 | `packages/twenty-shared/` | `packages/cms-shared/` |
| 5 | `packages/twenty-emails/` | `packages/cms-emails/` |
| 6 | `packages/twenty-docker/` | `packages/cms-docker/` |
| 7 | `packages/twenty-e2e-testing/` | `packages/cms-e2e-testing/` |

### 14.2 Files to Modify

| # | File | Changes |
|---|------|---------|
| 1 | `package.json` | Update workspace references |
| 2 | `nx.json` | Update project names |
| 3 | `tsconfig.base.json` | Update path aliases |
| 4 | `packages/cms-front/package.json` | Update name and deps |
| 5 | `packages/cms-front/src/config/index.ts` | Add Tauri detection |
| 6 | `packages/cms-front/src/utils/cookie-storage.ts` | Handle Tauri context |
| 7 | `packages/cms-front/src/App.tsx` | Add onboarding route |
| 8 | `packages/cms-front/vite.config.ts` | Add Tauri build config |
| 9 | `packages/cms-server/package.json` | Update name and deps |
| 10 | `packages/cms-server/src/main.ts` | Add startup markers |
| 11 | All `*.ts` files with "twenty" imports | Update import paths |

### 14.3 Files to Create

| # | File | Purpose |
|---|------|---------|
| 1 | `packages/cms-desktop/` | Entire new package |
| 2 | `packages/cms-desktop/Cargo.toml` | Rust dependencies |
| 3 | `packages/cms-desktop/tauri.conf.json` | Tauri config |
| 4 | `packages/cms-desktop/src/main.rs` | App entry |
| 5 | `packages/cms-desktop/src/lib.rs` | Library exports |
| 6 | `packages/cms-desktop/src/config/mod.rs` | Config module |
| 7 | `packages/cms-desktop/src/config/storage.rs` | File I/O |
| 8 | `packages/cms-desktop/src/config/encryption.rs` | AES encryption |
| 9 | `packages/cms-desktop/src/config/keychain.rs` | OS keychain |
| 10 | `packages/cms-desktop/src/config/parser.rs` | .env parser |
| 11 | `packages/cms-desktop/src/config/validation.rs` | Config validation |
| 12 | `packages/cms-desktop/src/sidecar/mod.rs` | Sidecar module |
| 13 | `packages/cms-desktop/src/sidecar/manager.rs` | Process management |
| 14 | `packages/cms-desktop/src/sidecar/health.rs` | Health checks |
| 15 | `packages/cms-desktop/src/commands/mod.rs` | IPC commands |
| 16 | `packages/cms-desktop/src/commands/config.rs` | Config commands |
| 17 | `packages/cms-desktop/src/commands/app.rs` | App state commands |
| 18 | `packages/cms-desktop/icons/*` | App icons |
| 19 | `packages/cms-front/src/utils/tauri.ts` | Tauri utilities |
| 20 | `packages/cms-front/src/modules/onboarding/*` | Onboarding UI |
| 21 | `packages/cms-front/src/modules/tauri/*` | Tauri integration |
| 22 | `packages/cms-server/pkg.config.json` | pkg configuration |
| 23 | `scripts/build-desktop.sh` | Build script |
| 24 | `scripts/build-backend-binary.sh` | Binary compilation |

### 14.4 Files to Delete (Optional)

| # | File | Reason |
|---|------|--------|
| 1 | `packages/twenty-website/` | Not needed for desktop |
| 2 | `packages/twenty-zapier/` | Not needed for desktop |
| 3 | Docker-related files | Not needed for desktop |

---

## 15. Environment Variables Reference

### 15.1 Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `PG_DATABASE_URL` | `postgres://user:pass@host/db` | PostgreSQL connection |
| `REDIS_URL` | `rediss://default:xxx@host:6379` | Redis connection |
| `APP_SECRET` | `32-char-random-string` | JWT signing key |

### 15.2 Storage Variables (if using S3)

| Variable | Example | Description |
|----------|---------|-------------|
| `STORAGE_TYPE` | `S3` | Storage backend type |
| `STORAGE_S3_REGION` | `auto` | S3 region |
| `STORAGE_S3_NAME` | `cms-files` | Bucket name |
| `STORAGE_S3_ENDPOINT` | `https://xxx.r2.cloudflarestorage.com` | S3 endpoint |
| `STORAGE_S3_ACCESS_KEY_ID` | `xxx` | Access key |
| `STORAGE_S3_SECRET_ACCESS_KEY` | `xxx` | Secret key |

### 15.3 Auto-Set Variables (by Tauri)

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_PORT` | `3000` | Backend port |
| `SERVER_URL` | `http://localhost:3000` | Backend URL |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL |
| `EMBED_WORKER` | `true` | Embed worker in main process |
| `EMAIL_DRIVER` | `LOGGER` | Default to logging |
| `TELEMETRY_ENABLED` | `false` | Disable telemetry |
| `ANALYTICS_ENABLED` | `false` | Disable analytics |

### 15.4 Complete .env Template

```bash
# ═══════════════════════════════════════════════════════════════════════════
# CMS Desktop Configuration
# Paste this into the app on first launch
# ═══════════════════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────────────────
# DATABASE (Required)
# Get free PostgreSQL at: https://neon.tech
# ───────────────────────────────────────────────────────────────────────────
PG_DATABASE_URL=postgres://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# ───────────────────────────────────────────────────────────────────────────
# REDIS (Required)
# Get free Redis at: https://upstash.com
# ───────────────────────────────────────────────────────────────────────────
REDIS_URL=rediss://default:your-password-here@us1-example-12345.upstash.io:6379

# ───────────────────────────────────────────────────────────────────────────
# FILE STORAGE (Required for file uploads)
# Get free storage at: https://cloudflare.com (R2)
# ───────────────────────────────────────────────────────────────────────────
STORAGE_TYPE=S3
STORAGE_S3_REGION=auto
STORAGE_S3_NAME=cms-files
STORAGE_S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
STORAGE_S3_ACCESS_KEY_ID=your-access-key-id
STORAGE_S3_SECRET_ACCESS_KEY=your-secret-access-key

# ───────────────────────────────────────────────────────────────────────────
# SECURITY (Required)
# Generate a random 32+ character string
# ───────────────────────────────────────────────────────────────────────────
APP_SECRET=generate-a-secure-random-string-here-minimum-32-chars

# ───────────────────────────────────────────────────────────────────────────
# OPTIONAL: Email Configuration
# Uncomment and configure if you want email functionality
# ───────────────────────────────────────────────────────────────────────────
# EMAIL_DRIVER=SMTP
# EMAIL_SMTP_HOST=smtp.gmail.com
# EMAIL_SMTP_PORT=465
# EMAIL_SMTP_USER=your-email@gmail.com
# EMAIL_SMTP_PASSWORD=your-app-password
# EMAIL_FROM_ADDRESS=your-email@gmail.com
# EMAIL_FROM_NAME=CMS

# ───────────────────────────────────────────────────────────────────────────
# OPTIONAL: OAuth (for Google/Microsoft login)
# ───────────────────────────────────────────────────────────────────────────
# AUTH_GOOGLE_CLIENT_ID=xxx
# AUTH_GOOGLE_CLIENT_SECRET=xxx
# AUTH_GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/redirect
```

---

## 16. Troubleshooting Guide

### 16.1 Build Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot find module 'twenty-shared'` | Rename not complete | Run full rename script |
| `pkg: Error reading` | pkg can't find entry | Check dist/src/main.js exists |
| `Tauri: failed to bundle` | Missing icon | Ensure all icon sizes present |
| `Rust compilation failed` | Missing deps | Run `cargo build` to see details |

### 16.2 Runtime Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Backend doesn't start | Config error | Check logs in sidecar output |
| `ECONNREFUSED localhost:3000` | Sidecar not running | Check startup sequence |
| `Invalid token` | APP_SECRET mismatch | Ensure same secret used |
| `S3 access denied` | Wrong credentials | Verify R2 API token |

### 16.3 Config Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to decrypt config` | Keychain entry missing | Delete config, re-onboard |
| `Missing required key` | Incomplete .env | Add missing keys |
| `Invalid URL format` | Malformed connection string | Check URL syntax |

### 16.4 Platform-Specific Issues

**macOS:**

| Issue | Solution |
|-------|----------|
| App won't open (Gatekeeper) | Sign and notarize, or right-click → Open |
| Keychain permission denied | Allow in Security preferences |

**Windows:**

| Issue | Solution |
|-------|----------|
| SmartScreen warning | Sign with EV certificate |
| Credential Manager access | Run as admin first time |

---

## Summary

This plan covers the complete transformation of Twenty CRM into a standalone CMS Desktop application. The implementation is organized into 10 phases:

1. **Renaming** - Twenty → CMS throughout
2. **Frontend mods** - Tauri detection, onboarding
3. **Backend mods** - Startup markers, worker embedding
4. **Tauri setup** - New package with Rust code
5. **Config system** - Encrypted .env storage
6. **Sidecar management** - Backend process control
7. **Backend compilation** - pkg binary creation
8. **Build pipeline** - Automated builds
9. **Testing** - Comprehensive test coverage
10. **Distribution** - Signed installers, auto-update

---

## Appendix A: Quick Reference Commands

```bash
# Development
yarn workspace cms-front dev          # Start frontend dev server
yarn workspace cms-server start       # Start backend dev server
yarn workspace cms-desktop tauri dev  # Start Tauri dev mode

# Building
yarn workspace cms-front build        # Build frontend
yarn workspace cms-server build       # Build backend
./scripts/build-backend-binary.sh     # Compile backend to binary
yarn workspace cms-desktop tauri build # Build desktop app

# Testing
yarn workspace cms-front test         # Frontend tests
yarn workspace cms-server test        # Backend tests
cargo test --manifest-path packages/cms-desktop/Cargo.toml  # Rust tests
```

---

## Appendix B: Estimated Effort by Phase

| Phase | Description | Hours |
|-------|-------------|-------|
| 1 | Renaming Twenty to CMS | 4-6 |
| 2 | Frontend Modifications | 6-8 |
| 3 | Backend Modifications | 2-3 |
| 4 | Tauri Project Setup | 4-6 |
| 5 | Configuration & Onboarding | 8-10 |
| 6 | Sidecar Management | 4-6 |
| 7 | Backend Compilation | 2-3 |
| 8 | Build Pipeline | 3-4 |
| 9 | Testing | 4-6 |
| 10 | Distribution & Packaging | 3-4 |
| **Total** | | **40-56 hours** |

---

*Document End*
