# Testing Documentation

## Overview
This document outlines the comprehensive testing strategy implemented for the Gym Management System API. The testing approach follows industry best practices and ensures high code coverage, reliability, and maintainability.

## Testing Stack
- **Framework**: Jest 30.x
- **Integration Testing**: Supertest
- **Mocking**: Jest mocks with TypeScript support
- **Coverage**: Built-in Jest coverage reporting
- **CI/CD**: GitHub Actions

## Test Structure

```
tests/
├── fixtures/              # Test data and mock objects
│   └── testData.ts        # Centralized test data
├── mocks/                 # Database and external service mocks
│   └── database.mock.ts   # MongoDB mock utilities
├── setup/                 # Test configuration and utilities
│   └── testApp.ts         # Express app setup for integration tests
├── unit/                  # Unit tests
│   ├── controllers/       # Controller unit tests
│   ├── middleware/        # Middleware unit tests
│   └── services/          # Service layer unit tests
└── integration/           # Integration tests
    ├── auth.integration.test.ts
    └── user.integration.test.ts
```

## Testing Principles

### 1. Test Pyramid
- **Unit Tests (70%)**: Test individual functions and methods in isolation
- **Integration Tests (20%)**: Test API endpoints and component interactions
- **E2E Tests (10%)**: Test complete user workflows (future implementation)

### 2. AAA Pattern
All tests follow the Arrange-Act-Assert pattern:
```typescript
it('should create user successfully', async () => {
  // Arrange
  const userData = createValidUserData();
  mockService.createUser.mockResolvedValue(mockUser);

  // Act
  const result = await userService.createUser(userData);

  // Assert
  expect(result).toEqual(mockUser);
  expect(mockService.createUser).toHaveBeenCalledWith(userData);
});
```

### 3. Isolated Testing
- Each test is independent and can run in any order
- Mocks are reset between tests
- No shared state between tests

## Test Categories

### Unit Tests

#### Services Tests
- **AuthService**: Authentication, token generation, user validation
- **UserService**: CRUD operations, filtering, role assignment

#### Controllers Tests
- **AuthController**: Request/response handling, DTO validation
- **UserController**: HTTP status codes, error handling

#### Middleware Tests
- **AuthMiddleware**: Authentication, authorization, token validation
- **ValidationMiddleware**: Schema validation, error formatting
- **ErrorMiddleware**: Error handling, status code mapping

### Integration Tests

#### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

#### User Management Endpoints
- `GET /api/users` - List users with filtering
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/toggle-status` - Toggle user status
- `POST /api/users/assign-roles` - Assign roles to user

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Configuration

### Jest Configuration
The project uses a comprehensive Jest configuration in `jest.config.js`:
- TypeScript support with ts-jest
- ES modules support
- Path mapping for clean imports
- Coverage thresholds
- Test environment setup

### Environment Variables
Tests use a separate environment configuration in `.env.test`:
- Isolated test database
- Test-specific JWT secrets
- Development-safe configurations

## Mocking Strategy

### Database Mocking
- MongoDB models are mocked using Jest
- Consistent mock data in `testData.ts`
- Realistic database behaviors simulated

### External Services
- JWT utilities mocked for predictable tokens
- Password hashing mocked for performance
- External API calls mocked (future implementation)

## Coverage Requirements

### Current Coverage Targets
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Coverage Reports
Coverage reports are generated in multiple formats:
- Console summary during test runs
- HTML reports in `coverage/` directory
- LCOV format for CI/CD integration

## Best Practices

### Test Naming
- Descriptive test names explaining the scenario
- Follow format: "should [expected behavior] when [condition]"
- Group related tests in describe blocks

### Test Data
- Use factory functions for creating test data
- Centralize mock data in fixtures
- Avoid hardcoded values in individual tests

### Assertions
- Use specific Jest matchers
- Test both positive and negative scenarios
- Verify all side effects

### Error Testing
- Test all error conditions
- Verify error messages and status codes
- Test edge cases and boundary conditions

## CI/CD Integration

### GitHub Actions
The CI pipeline runs:
1. **Linting**: Code style and TypeScript checks
2. **Unit Tests**: All service and utility tests
3. **Integration Tests**: API endpoint tests
4. **Coverage**: Generate and upload coverage reports
5. **Security**: Dependency audit and vulnerability checks

### Test Databases
- MongoDB containers in CI environment
- Isolated test databases per job
- Proper cleanup after test runs

## Troubleshooting

### Common Issues

#### Mock-related Problems
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### Async Test Issues
```typescript
// Always use async/await for async operations
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

#### TypeScript Mock Issues
```typescript
// Properly type mocked functions
const mockFunction = jest.fn() as jest.MockedFunction<typeof originalFunction>;
```

### Debugging Tests
- Use `console.log` for debugging (remove before commit)
- Run specific tests: `npm test -- --testNamePattern="specific test"`
- Use Jest's `--verbose` flag for detailed output

## Future Enhancements

### Planned Improvements
1. **E2E Tests**: Browser automation with Playwright
2. **Performance Tests**: Load testing with Artillery
3. **Mutation Testing**: Code quality validation with Stryker
4. **Visual Regression**: Screenshot comparison tests
5. **Contract Testing**: API contract validation

### Monitoring
- Test execution time monitoring
- Flaky test detection and reporting
- Coverage trend analysis
- Test reliability metrics

## Contributing to Tests

### Adding New Tests
1. Follow existing patterns and structure
2. Update coverage requirements if needed
3. Add appropriate mocks and fixtures
4. Document complex test scenarios

### Test Review Checklist
- [ ] Tests follow AAA pattern
- [ ] Appropriate mocking strategy
- [ ] Good coverage of edge cases
- [ ] Clear and descriptive test names
- [ ] No hardcoded values
- [ ] Proper cleanup and isolation