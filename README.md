# Catalyst NestJS

A robust, scalable, and production-ready NestJS boilerplate for building enterprise-grade, multi-tenant applications.
This template is designed to demonstrate best practices for modular architecture, transactional and multi-tenant data
management, safe migrations, advanced logging, and operational endpoints for cloud-native deployments.

## What This Project Demonstrates

- **Multi-Tenancy:**
    - Dynamic schema-based multi-tenant support using TypeORM and PostgreSQL.
    - Safe, parallel migration execution with advisory locking to prevent race conditions.
    - Tenant context propagation for request isolation and transactional integrity.

- **Transactional Operations:**
    - Declarative transactional decorators and interceptors for automatic transaction management.
    - Ensures data consistency and rollback on errors across tenant boundaries.

- **Operational Endpoints (Actuator):**
    - Health, readiness, liveness, metrics, and info endpoints for monitoring and orchestration.
    - Info endpoint exposes UTC time and deployed commit hash for traceability.

- **Logging:**
    - Integrated Pino logger with context support (MDC-like), file/class-based logging, and sensitive data redaction.
    - Configurable log levels and formats for development and production.

- **Error Handling & Validation:**
    - Centralized error handling for consistent API responses.
    - Request validation using class-validator and class-transformer.

- **Environment & Configuration:**
    - Environment management with dotenv and @nestjs/config.
    - Secure, environment-specific configuration for database, logging, and app settings.

- **Testing & CI/CD:**
    - Pre-configured Jest for unit, integration, and e2e tests.
    - Sample GitHub Actions workflow for CI/CD.

- **Containerization:**
    - Production-ready Dockerfile with multi-stage build, healthcheck, commit hash injection, and non-root user.
    - .dockerignore for efficient builds.

## How to Build, Run, and Test

### Build Locally

```sh
yarn install --frozen-lockfile
yarn build
```

### Run Locally

```sh
yarn start:dev # For development
yarn start:prod     # For production
```

### Run Tests

```sh
yarn test           # Unit tests
yarn test:e2e       # End-to-end tests
```

### Run Migrations

- Migrations are run automatically on bootstrap for all tenant schemas.
- Safe for parallel execution (advisory lock).

### Build and Run as Docker Container

```sh
docker build --build-arg COMMIT_HASH=$(git rev-parse HEAD) -t catalyst-nestjs .
docker run -p 3000:3000 catalyst-nestjs
```

### Operational Endpoints

- `/actuator/health` — Multi-tenant database health
- `/actuator/readiness` — Readiness probe (all datasources connected)
- `/actuator/liveness` — Liveness probe
- `/actuator/info` — UTC time and deployed commit hash

### Code Quality: Format and Lint

To keep your codebase clean and consistent, use the following commands:

```sh
yarn format   # Automatically format your code using Prettier
yarn lint     # Run ESLint to check for code quality issues
```

### Environment Setup

- Copy `.env.example` to `.env` and update required environment variables for your local setup.

### Create a New Project from This Template

You can use this repository as a template to start a new project:

1. Go to [GitHub](https://github.com/) and navigate to this `catalyst-nest` repository.
2. Click the **"Use this template"** button at the top right.
3. Enter a name for your new repository and choose your organization or user.
4. Click **"Create repository from template"**.
5. Clone your new repository and update the project details as needed.

Or, [follow the official GitHub documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template#creating-a-repository-from-a-template).

### Troubleshooting

- If you see `Cannot find module '@nestjs/config'`, make sure it is listed in your `dependencies` and not just `devDependencies`.
- For Docker build issues, ensure your `.dockerignore` is present and up to date.
- For migration or database errors, check your environment variables and database connectivity.


> For more details on architecture, migration safety, multi-tenancy, and operational best practices, see the inline code
> comments and documentation in the `/docs` folder.
