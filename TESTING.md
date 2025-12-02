# Testing Documentation

This project includes comprehensive unit and UI tests to achieve 100% code coverage.

## Test Setup

The project uses:

- **Jest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Unit Tests

#### Lib Functions (`lib/__tests__/`)

- `get-session.test.ts` - Tests for session management utilities
- `prisma.test.ts` - Tests for Prisma client initialization

#### API Routes (`app/api/**/__tests__/`)

- **Guides**: `guides/route.test.ts`, `guides/[id]/route.test.ts`
- **Resources**: `resources/route.test.ts`, `resources/[id]/route.test.ts`
- **Sessions**: `sessions/route.test.ts`, `sessions/[id]/route.test.ts`
- **Studies**: `studies/route.test.ts`, `studies/[id]/route.test.ts`
- **Schedules**: `schedules/route.test.ts`

Each API route test covers:

- Authentication checks (401 errors)
- Authorization checks (404 errors for unauthorized access)
- Input validation (400 errors)
- Successful CRUD operations
- Error handling

#### Proxy (`proxy.test.ts`)

- Tests authentication and authorization proxy
- Tests route protection
- Tests redirects for unauthenticated users

### UI Tests

#### Components (`app/components/__tests__/`)

- `Logo.test.tsx` - Logo component rendering and navigation
- `TopNavBar.test.tsx` - Navigation bar functionality, user menu, sign out
- `CountdownTimer.test.tsx` - Timer functionality, modal interactions, localStorage

#### Contexts (`app/contexts/__tests__/`)

- `WalkthroughContext.test.tsx` - Walkthrough state management
- `FormStateContext.test.tsx` - Form state management across components

## Test Coverage

The test suite aims for 100% code coverage including:

- All branches
- All functions
- All lines
- All statements

## Key Testing Patterns

### API Route Testing

```typescript
// Mock authentication
jest.mock('@/lib/get-session');
mockGetCurrentUser.mockResolvedValue(mockUser);

// Mock Prisma
jest.mock('@/lib/prisma');
mockPrisma.model.method.mockResolvedValue(mockData);

// Test authentication
expect(response.status).toBe(401);

// Test authorization
expect(response.status).toBe(404);

// Test success
expect(response.status).toBe(200);
```

### Component Testing

```typescript
// Render component
render(<Component />);

// Query elements
const element = screen.getByTestId('test-id');

// Simulate user interactions
await user.click(button);

// Assert results
expect(element).toBeInTheDocument();
```

### Context Testing

```typescript
// Wrap component with provider
render(
  <ContextProvider>
    <TestComponent />
  </ContextProvider>
);

// Test context values and updates
expect(screen.getByTestId('value')).toHaveTextContent('expected');
```

## Security Testing

All API routes include tests for:

- **Authentication bypass** - Verifying 401 responses for unauthenticated requests
- **Authorization bypass** - Verifying users can only access their own resources
- **Input validation** - Verifying invalid inputs are rejected
- **ID validation** - Verifying invalid IDs return proper errors

## Notes

- Tests use mocked dependencies to avoid database connections
- Component tests use jsdom environment
- API route tests use node environment
- All tests are isolated and can run independently
