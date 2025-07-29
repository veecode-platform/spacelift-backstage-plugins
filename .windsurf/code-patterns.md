# Code Patterns and Conventions

## TypeScript Conventions

### Type Definitions
- Use interfaces for object shapes that might be extended
- Use type aliases for unions, primitives, and computed types
- Export types from dedicated `types/` directories
- Use PascalCase for type names

```typescript
// Good
interface SpaceliftStack {
  id: string;
  name: string;
  status: StackStatus;
}

type StackStatus = 'active' | 'inactive' | 'pending';
```

### Zod Schemas (Backend)
- Define Zod schemas for all API request/response validation
- Co-locate schemas with their corresponding types
- Use descriptive error messages

```typescript
import { z } from 'zod';

export const StackSchema = z.object({
  id: z.string().min(1, 'Stack ID is required'),
  name: z.string().min(1, 'Stack name is required'),
  status: z.enum(['active', 'inactive', 'pending']),
});

export type Stack = z.infer<typeof StackSchema>;
```

## Backend Patterns

### Router Structure
- Use express-promise-router for async route handling
- Group related endpoints logically
- Include proper error handling and validation

```typescript
import { Router } from 'express';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/stacks', async (req, res) => {
    // Implementation
  });

  return router;
}
```

### Service Layer
- Separate business logic into service classes
- Use dependency injection for testability
- Handle errors gracefully with proper logging

```typescript
export class SpaceliftService {
  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
  ) {}

  async getStacks(): Promise<Stack[]> {
    try {
      // Implementation
    } catch (error) {
      this.logger.error('Failed to fetch stacks', error);
      throw new Error('Unable to fetch stacks');
    }
  }
}
```

### Error Handling
- Use Backstage error types for consistency
- Provide meaningful error messages
- Log errors appropriately

```typescript
import { NotFoundError, InputError } from '@backstage/errors';

// For client errors
throw new InputError('Invalid stack ID provided');

// For resource not found
throw new NotFoundError('Stack not found');
```

## Frontend Patterns

### Component Structure
- Use functional components with hooks
- Separate concerns with custom hooks
- Use Material-UI components consistently

```typescript
import React from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import { useSpaceliftStacks } from '../hooks/useSpaceliftStacks';

export const StacksList: React.FC = () => {
  const { stacks, loading, error } = useSpaceliftStacks();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {stacks.map(stack => (
        <Card key={stack.id}>
          <CardContent>
            <Typography variant="h6">{stack.name}</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

### Custom Hooks
- Use custom hooks for data fetching and state management
- Implement polling with `react-use` hooks
- Return consistent data structures

```typescript
import { useAsync, useInterval } from 'react-use';
import { spaceliftApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';

export const useSpaceliftStacks = () => {
  const api = useApi(spaceliftApiRef);
  
  const { value: stacks, loading, error, retry } = useAsync(
    () => api.getStacks(),
    []
  );

  // Poll every 10 seconds
  useInterval(retry, 10000);

  return { stacks, loading, error, retry };
};
```

### API Client
- Use consistent API client pattern
- Handle authentication and base URL configuration
- Provide typed responses

```typescript
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export class SpaceliftApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  async getStacks(): Promise<Stack[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('spacelift-io');
    const response = await this.fetchApi.fetch(`${baseUrl}/stacks`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stacks: ${response.statusText}`);
    }
    
    return response.json();
  }
}
```

## Testing Patterns

### Backend Testing
- Use supertest for API endpoint testing
- Mock external dependencies
- Test error scenarios

```typescript
import request from 'supertest';
import express from 'express';
import { createRouter } from '../router';

describe('GET /stacks', () => {
  let app: express.Express;

  beforeEach(async () => {
    const router = await createRouter({
      // Mock dependencies
    });
    app = express().use(router);
  });

  it('should return stacks', async () => {
    const response = await request(app)
      .get('/stacks')
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});
```

### Frontend Testing
- Use React Testing Library for component testing
- Mock API calls with MSW
- Test user interactions

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { StacksList } from './StacksList';
import { spaceliftApiRef } from '../api';

const mockApi = {
  getStacks: jest.fn(),
};

describe('StacksList', () => {
  it('should display stacks', async () => {
    mockApi.getStacks.mockResolvedValue([
      { id: '1', name: 'Test Stack', status: 'active' },
    ]);

    render(
      <TestApiProvider apis={[[spaceliftApiRef, mockApi]]}>
        <StacksList />
      </TestApiProvider>
    );

    expect(await screen.findByText('Test Stack')).toBeInTheDocument();
  });
});
```

## File Organization

### Naming Conventions
- Use PascalCase for components and classes
- Use camelCase for functions and variables
- Use kebab-case for file names (except components)
- Use descriptive names that indicate purpose

### Directory Structure
```
src/
├── components/
│   ├── StacksList/
│   │   ├── StacksList.tsx
│   │   ├── StacksList.test.tsx
│   │   └── index.ts
├── hooks/
│   ├── useSpaceliftStacks.ts
│   └── useSpaceliftStacks.test.ts
├── api/
│   ├── SpaceliftApi.ts
│   └── index.ts
└── types/
    └── spacelift.ts
```

### Export Patterns
- Use barrel exports (index.ts files) for clean imports
- Export types and implementations from appropriate modules
- Use named exports over default exports for better tree-shaking

```typescript
// api/index.ts
export { SpaceliftApi } from './SpaceliftApi';
export { spaceliftApiRef } from './SpaceliftApiRef';

// components/index.ts
export { StacksList } from './StacksList';
export { StackDetails } from './StackDetails';
```

## Configuration Patterns

### Plugin Configuration
- Use Backstage configuration schema
- Provide sensible defaults where possible
- Validate configuration at startup

```typescript
// config.d.ts
export interface Config {
  spacelift: {
    hostUrl: string;
    apiKey: string;
    apiSecret: string;
  };
}
```

### Environment Variables
- Use environment variables for sensitive data
- Document required environment variables
- Provide clear error messages for missing config

## Performance Considerations

### Frontend Optimization
- Use React.memo for expensive components
- Implement proper loading states
- Avoid unnecessary re-renders with useCallback/useMemo

### Backend Optimization
- Implement caching for expensive operations
- Use connection pooling for database connections
- Handle rate limiting gracefully

### Bundle Size
- Import only what you need from libraries
- Use tree-shaking friendly imports
- Monitor bundle size in CI/CD
