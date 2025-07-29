# Spacelift Backstage Plugins - Project Overview

## Project Type
This is a **monorepo** containing Backstage plugins for integrating Spacelift (Infrastructure-as-Code platform) with Backstage.

## Architecture
- **Monorepo Structure**: Uses Yarn workspaces with two main packages
- **Plugin Architecture**: Follows Backstage's plugin system with separate backend and frontend packages
- **Communication Flow**: Frontend → Backend → Spacelift API (GraphQL)

## Main Packages

### 1. Backend Plugin (`packages/spacelift-io-backend/`)
- **Package Name**: `@spacelift-io/backstage-integration-backend`
- **Role**: Handles server-side logic and Spacelift API communication
- **Key Features**:
  - GraphQL client for Spacelift API
  - JWT token management and caching
  - Express router with REST endpoints
  - Data validation using Zod
  - High test coverage (90% threshold)

### 2. Frontend Plugin (`packages/spacelift-io-frontend/`)
- **Package Name**: `@spacelift-io/backstage-integration-frontend`
- **Role**: Provides UI components for displaying Spacelift data
- **Key Features**:
  - React components for stack visualization
  - API client for backend communication
  - React hooks with automatic polling (10-second intervals)
  - Material-UI components
  - High test coverage (90% threshold)

## Technology Stack
- **Language**: TypeScript
- **Package Manager**: Yarn 4.9.1 with workspaces
- **Build Tool**: Backstage CLI
- **Testing**: Jest with high coverage requirements
- **Frontend**: React 18, Material-UI
- **Backend**: Express, GraphQL Request
- **Validation**: Zod schemas
- **Linting**: ESLint

## Key Configuration
- **Backstage Compatibility**: Requires Backstage 1.17.0+
- **Plugin IDs**: 
  - Backend: `spacelift-io`
  - Frontend: `spacelift-io-frontend`
- **Configuration Schema**: Both plugins have `config.d.ts` files
- **Required Config**: Spacelift host URL, API key, and API secret

## Development Workflow
- **Build**: `yarn build` (builds all workspaces)
- **Test**: `yarn test` (runs tests across all packages)
- **CI**: `yarn test:ci` (with coverage reporting)
- **Individual Package**: Each package has its own scripts for development

## Publishing
- Both packages are published to npm under `@spacelift-io` scope
- Public access with MIT license
- Version managed centrally (uses `<VERSION>` placeholder)

## Documentation Structure
- Main README with comprehensive setup instructions
- Individual package READMEs
- Architecture diagrams in `docs/` folder
- DrawIO source files for diagrams
