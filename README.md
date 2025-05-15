# Tesseract Internal Backend

This repository contains the core backend services for Tesseract's internal organization management system. It provides the APIs and infrastructure for organization management, user authentication, and team collaboration within the Tesseract platform.

## Features

- **Organization Management**
  - Create and manage organizations
  - Invite members to organizations
  - Role-based access control within organizations
  - Organization profile and settings management
  - Usage tracking and billing integration

- **User Management**
  - User registration and authentication
  - Profile management
  - Session handling and security
  - Two-factor authentication (2FA)
  - API key generation and management

- **Team Collaboration**
  - Team creation and management
  - Member permissions and roles
  - Activity logs and audit trails
  - Resource sharing between team members
  - Collaboration settings and preferences

- **API & Developer Experience**
  - RESTful API with comprehensive documentation
  - WebSocket support for real-time updates
  - Rate limiting and security measures
  - SDK integration helpers
  - Webhook configuration for external systems

## Getting Started

### Prerequisites

- Bun 1.2.8 runtime
- Docker and Docker Compose
- PostgreSQL (included in Docker setup)
- Redis (included in Docker setup)

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/usetesseractdotco/internal-backend.git
   cd internal-backend
   ```

2. Install dependencies
   ```bash
   bun install
   ```

3. Start the development environment
   ```bash
   docker-compose up -d
   ```

4. Create a `.env` file based on the example and configure your environment variables

5. Start the development server
   ```bash
   bun dev
   ```

### Database Management

- Generate migrations: `bun db:generate`
- Run migrations: `bun db:migrate`
- Open Drizzle Studio: `bun db:studio`

## Architecture

The backend is built with:
- Bun runtime
- Fastify for API server
- Drizzle ORM for database interactions
- PostgreSQL for persistence
- Redis for caching and real-time features

## Development

- `bun dev` - Start development server with hot reloading
- `bun build` - Build for production
- `bun start` - Start production server
- `bun test` - Run tests
- `bun lint` - Lint code

## API Documentation

API documentation is available at `/docs` when the server is running.

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting PRs.

## License

Copyright © 2025 Tesseract, Co. All rights reserved.
