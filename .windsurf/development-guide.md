# Development Guide

## Getting Started

### Prerequisites
- Node.js (compatible with Backstage requirements)
- Yarn 4.9.1 (specified in packageManager)
- Backstage instance (1.17.0+)
- Spacelift account with API credentials

### Initial Setup
```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run tests
yarn test
```

## Project Structure Deep Dive

### Root Level
- `package.json`: Monorepo configuration with workspaces
- `tsconfig.json`: TypeScript configuration for the entire project
- `yarn.lock`: Dependency lock file
- `.yarnrc.yml`: Yarn configuration

### Backend Package (`packages/spacelift-io-backend/`)
```
src/
├── services/           # Spacelift API client services
├── helpers/           # Utility functions
├── types/             # TypeScript type definitions
├── router.ts          # Express router with API endpoints
├── plugin.ts          # Backstage plugin definition
└── index.ts           # Main export
```

**Key Files to Understand:**
- `plugin.ts`: Backstage backend plugin registration
- `router.ts`: REST API endpoints for frontend communication
- `services/`: Contains Spacelift GraphQL client logic
- `types/`: Zod schemas and TypeScript interfaces

### Frontend Package (`packages/spacelift-io-frontend/`)
```
src/
├── components/        # React UI components
├── api/              # API client for backend communication
├── hooks/            # React hooks for data fetching
├── types/            # TypeScript type definitions
├── plugin.ts         # Backstage plugin definition
├── routes.ts         # Plugin routing configuration
└── constants.ts      # Application constants
```

**Key Files to Understand:**
- `plugin.ts`: Backstage frontend plugin registration
- `routes.ts`: Plugin page routing
- `components/`: React components for displaying Spacelift data
- `hooks/`: Custom hooks with polling logic
- `api/`: Client for communicating with backend

## Development Patterns

### Backend Development
1. **API Endpoints**: Follow REST conventions in `router.ts`
2. **Error Handling**: Use Backstage error types from `@backstage/errors`
3. **Validation**: Use Zod schemas for request/response validation
4. **Testing**: Mock Spacelift API responses in tests
5. **Authentication**: Handle JWT tokens for Spacelift API

### Frontend Development
1. **Components**: Use Material-UI components for consistency
2. **State Management**: Use React hooks and context
3. **Data Fetching**: Implement polling with `react-use` hooks
4. **Error Handling**: Display user-friendly error messages
5. **Testing**: Use React Testing Library with MSW for API mocking

## Common Development Tasks

### Adding New API Endpoints
1. Define endpoint in `packages/spacelift-io-backend/src/router.ts`
2. Add corresponding service method if needed
3. Update frontend API client in `packages/spacelift-io-frontend/src/api/`
4. Add tests for both backend and frontend

### Adding New UI Components
1. Create component in `packages/spacelift-io-frontend/src/components/`
2. Add to appropriate page or parent component
3. Write tests with React Testing Library
4. Update types if needed

### Modifying Spacelift API Integration
1. Update GraphQL queries/mutations in backend services
2. Update Zod schemas for validation
3. Update TypeScript types
4. Update tests with new mock data

## Testing Strategy

### Backend Tests
- Unit tests for services and utilities
- Integration tests for router endpoints
- Mock Spacelift API responses
- 90% coverage requirement

### Frontend Tests
- Component testing with React Testing Library
- Hook testing for custom hooks
- API client testing with MSW
- 90% coverage requirement

## Build and Deployment

### Local Development
```bash
# Start backend in watch mode
cd packages/spacelift-io-backend
yarn start

# Start frontend in watch mode
cd packages/spacelift-io-frontend
yarn start
```

### Production Build
```bash
# Build all packages
yarn build

# Run CI tests
yarn test:ci
```

### Publishing
- Packages are published to npm under `@spacelift-io` scope
- Version is managed centrally (replace `<VERSION>` placeholder)
- Both packages should be published together for compatibility

## Configuration

### Backstage Configuration
Required in `app-config.yaml`:
```yaml
spacelift:
  hostUrl: '<subdomain>.app.spacelift.io'
  apiKey: ${SPACELIFT_API_KEY}
  apiSecret: ${SPACELIFT_API_SECRET}
```

### Plugin Registration
- Backend: Register in `packages/backend/src/index.ts`
- Frontend: Register in `packages/app/src/App.tsx`

## Troubleshooting

### Common Issues
1. **Build Failures**: Check TypeScript errors and dependency versions
2. **Test Failures**: Ensure mocks are up to date with API changes
3. **Runtime Errors**: Check Backstage configuration and API credentials
4. **Version Conflicts**: Ensure Backstage dependencies are compatible

### Debugging Tips
1. Use Backstage CLI for consistent builds
2. Check browser console for frontend issues
3. Check backend logs for API communication issues
4. Verify Spacelift API credentials and permissions
