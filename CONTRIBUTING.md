# Contributing to Internal Backend

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Project Structure

This project follows a clean architecture pattern with clear separation of concerns:

- `src/domain/`: Core business logic (entities and services)
- `src/adapters/`: Interface adapters and external service integrations
- `src/db/`: Database related code (repositories and schemas)
- `src/http/`: HTTP server and API related code
- `src/shared/`: Shared code and utilities
- `src/utils/`: Utility functions and helpers
- `src/test/`: Test related code

For more details, refer to the project structure documentation.

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure environment variables
3. Install dependencies:
   ```
   bun install
   ```
4. Start the development environment:
   ```
   docker-compose up -d
   ```
5. Run migrations:
   ```
   bun run db:migrate
   ```
6. Start the development server:
   ```
   bun run dev
   ```

## Testing Guidelines

We follow a "real dependencies over mocks" approach:

- Place test files next to the file being tested with a `.spec.ts` suffix
- Use test factories from `src/test/factories/` to generate test data
- Tests should run in isolated transactions that are rolled back
- Aim for high test coverage, especially for business logic
- Test both happy paths and error scenarios

Run tests with:
```
bun run test
```

## Code Style and Standards

- Follow TypeScript best practices
- Use ESLint for code linting: `bun run lint`
- Maintain clear separation of concerns according to clean architecture
- Document public APIs and complex logic
- Follow the existing patterns in the codebase

## Database Changes

1. Create new migrations:
   ```
   bun run db:generate <migration_name>
   ```
2. Apply migrations:
   ```
   bun run db:migrate
   ```
3. Update schema files in `src/db/schemas/`
4. Update corresponding repositories in `src/db/repositories/`

## Authentication and Authorization

When working with authentication:
- Authentication logic is in `src/domain/services/auth/`
- HTTP routes are in `src/http/routes/v1/auth/`
- Error handling is in `src/shared/errors/auth/`
- Session management is in `src/utils/sessions/`
- Password utilities are in `src/utils/password/`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the guidelines above
3. Ensure all tests pass
4. Update documentation as needed
5. Submit a pull request with a clear description of the changes
6. Address any feedback from code reviews

## Commit Guidelines

- Use clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused on single concerns

## Questions?

If you have any questions, feel free to open an issue for discussion.

Thank you for contributing! 