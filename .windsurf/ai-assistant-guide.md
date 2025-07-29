# AI Assistant Guide

## Project Context
This is a **Backstage plugins monorepo** for Spacelift integration. When working with this project, always consider:

1. **Backstage Plugin Architecture**: This follows Backstage's plugin system with separate backend and frontend packages
2. **Monorepo Structure**: Changes may affect multiple packages - always consider cross-package dependencies
3. **High Test Coverage**: Both packages require 90% test coverage - always include tests with code changes
4. **Spacelift Integration**: The core purpose is integrating with Spacelift's GraphQL API for Infrastructure-as-Code management

## Key Principles for AI Assistance

### Understanding the Domain
- **Spacelift**: Infrastructure-as-Code platform with stacks, runs, and deployments
- **Backstage**: Developer portal platform with plugin ecosystem
- **Integration Goal**: Display Spacelift stacks and runs within Backstage UI

### Code Quality Standards
- **TypeScript First**: All code should be properly typed
- **Test Coverage**: Include tests for all new functionality
- **Error Handling**: Use Backstage error types and provide meaningful messages
- **Documentation**: Update relevant documentation for significant changes

## Common AI Tasks and Approaches

### 1. Adding New Features

**For Backend Features:**
1. Start with the service layer (`src/services/`)
2. Add router endpoints (`src/router.ts`)
3. Update types and Zod schemas (`src/types/`)
4. Write comprehensive tests
5. Update plugin configuration if needed

**For Frontend Features:**
1. Create React components (`src/components/`)
2. Add custom hooks for data fetching (`src/hooks/`)
3. Update API client (`src/api/`)
4. Write component and hook tests
5. Update routing if adding new pages

### 2. Debugging Issues

**Backend Debugging:**
- Check Spacelift API integration in services
- Verify JWT token handling and caching
- Review router endpoint implementations
- Check configuration and environment variables

**Frontend Debugging:**
- Verify API client calls and responses
- Check React hook implementations and polling logic
- Review component state management
- Verify Material-UI component usage

### 3. Updating Dependencies

**Backstage Dependencies:**
- Ensure compatibility with Backstage 1.17.0+
- Check for breaking changes in Backstage APIs
- Update both backend and frontend packages together
- Run full test suite after updates

**Other Dependencies:**
- Maintain compatibility with existing TypeScript version
- Update lock files with `yarn install`
- Check for security vulnerabilities

## File Navigation Guide

### Most Important Files to Understand

**Backend (`packages/spacelift-io-backend/`):**
- `src/plugin.ts` - Plugin registration and configuration
- `src/router.ts` - API endpoints and request handling
- `src/services/` - Spacelift API integration logic
- `src/types/` - Type definitions and Zod schemas

**Frontend (`packages/spacelift-io-frontend/`):**
- `src/plugin.ts` - Plugin registration and routing
- `src/components/` - React UI components
- `src/hooks/` - Data fetching and state management
- `src/api/` - Backend communication client

### Configuration Files
- `package.json` files - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `config.d.ts` - Backstage configuration schema

## Testing Guidelines

### Backend Testing
```typescript
// Always mock external dependencies
const mockSpaceliftService = {
  getStacks: jest.fn(),
};

// Test both success and error scenarios
describe('GET /stacks', () => {
  it('should return stacks successfully', async () => {
    // Test implementation
  });

  it('should handle API errors gracefully', async () => {
    // Test error handling
  });
});
```

### Frontend Testing
```typescript
// Use TestApiProvider for API mocking
render(
  <TestApiProvider apis={[[spaceliftApiRef, mockApi]]}>
    <ComponentUnderTest />
  </TestApiProvider>
);

// Test loading states, error states, and success states
```

## Common Patterns to Follow

### API Integration
- Always use Zod schemas for validation
- Implement proper error handling with Backstage error types
- Cache JWT tokens appropriately
- Handle rate limiting and timeouts

### React Components
- Use functional components with hooks
- Implement proper loading and error states
- Use Material-UI components for consistency
- Follow React best practices for performance

### Data Fetching
- Use custom hooks for data fetching logic
- Implement polling with `react-use` hooks
- Handle authentication and authorization properly
- Provide meaningful error messages to users

## Troubleshooting Common Issues

### Build Failures
1. Check TypeScript errors first
2. Verify all imports are correct
3. Ensure Backstage dependencies are compatible
4. Run `yarn install` to update dependencies

### Test Failures
1. Check if mocks are up to date with API changes
2. Verify test setup and teardown
3. Ensure proper async/await handling
4. Check coverage requirements are met

### Runtime Issues
1. Verify Backstage configuration in `app-config.yaml`
2. Check Spacelift API credentials and permissions
3. Review browser console for frontend errors
4. Check backend logs for API communication issues

## Best Practices for AI Assistance

### When Making Changes
1. **Understand the Context**: Always read related code before making changes
2. **Consider Impact**: Changes may affect both packages - check dependencies
3. **Follow Patterns**: Use existing patterns and conventions consistently
4. **Test Thoroughly**: Include unit tests and consider integration testing
5. **Document Changes**: Update relevant documentation and comments

### When Debugging
1. **Start with Logs**: Check both frontend console and backend logs
2. **Verify Configuration**: Ensure all required configuration is present
3. **Check API Integration**: Verify Spacelift API communication
4. **Test Incrementally**: Isolate issues by testing components separately

### When Adding Features
1. **Plan the Architecture**: Consider how new features fit into existing structure
2. **Start Small**: Implement minimal viable functionality first
3. **Follow TDD**: Write tests before or alongside implementation
4. **Consider UX**: Ensure new features provide good user experience
5. **Update Documentation**: Keep all documentation current

## Security Considerations

### API Keys and Secrets
- Never hardcode API keys or secrets
- Use environment variables for sensitive data
- Implement proper token refresh mechanisms
- Log security-related events appropriately

### Input Validation
- Always validate user inputs with Zod schemas
- Sanitize data before processing
- Handle edge cases and malicious inputs
- Provide clear error messages without exposing internals

## Performance Guidelines

### Frontend Performance
- Use React.memo for expensive components
- Implement proper loading states
- Avoid unnecessary API calls
- Use efficient polling intervals

### Backend Performance
- Implement caching for expensive operations
- Handle concurrent requests appropriately
- Use connection pooling where applicable
- Monitor and log performance metrics

This guide should help AI assistants understand the project structure, conventions, and best practices for working effectively with this Backstage plugins monorepo.
