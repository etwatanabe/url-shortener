# Changelog

## [v0.5.0] - 2025-01-30

### Added

- **Complete production deployment** on Render cloud platform with both services fully operational:
  - URL Shortener Service: https://url-shortener-m4dk.onrender.com
  - Auth Service: https://url-shortener-auth.onrender.com
- **Live API documentation** accessible via Swagger UI for both production services
- **Full feature set available in production** including anonymous URL shortening, user authentication, and complete URL management
- **Comprehensive production examples** in README for multiple platforms (Bash, PowerShell, JavaScript)
- **Production architecture documentation** explaining independent service deployment and cross-service communication


## [v0.4.2] - 2025-01-29

### Fixed

- Fixed Jest E2E configuration for auth-service that was causing module resolution errors with custom-logger library.
- Corrected module path mapping in Jest configuration to properly resolve workspace libraries during E2E testing.

### Changed

- Improved logging system with structured logging using Pino across all services.
- Enhanced observability with contextual log messages for better debugging and monitoring.

---

## [v0.4.1] - 2024-06-29

### Fixed

- Fixed a bug in the KrakenD API Gateway configuration where using multiple HTTP methods (`PATCH,DELETE`) in a single endpoint caused routing errors.  
  Now, each method (`PATCH` and `DELETE`) for `/urls/{id}` is configured as a separate endpoint in [`krakend/krakend.json`](krakend/krakend.json), ensuring proper request routing and compatibility with KrakenD.

---

## [v0.4.0] - 2024-06-28

### API Gateway Integration and Improved Error Handling

This release introduces the KrakenD API Gateway, providing a unified entry point for all services and improved error handling across the system.

**Added**
- KrakenD API Gateway for unified access to all services via port 8080.
- Configured gateway endpoints for authentication and URL shortener services.
- Improved error handling: gateway now forwards backend error status codes and JSON error responses.
- Updated documentation with gateway usage instructions and environment variable recommendations.
- Minor improvements and fixes for service startup and integration.

---

## [v0.3.1] - 2024-06-28

### Developer Tooling: Pre-commit and Pre-push Git Hooks

This release adds automated Git hooks to improve code quality and consistency.

**Added**
- Husky and lint-staged configuration for pre-commit and pre-push Git hooks.
  - Pre-commit: runs Prettier and ESLint on staged files.
  - Pre-push: runs unit tests.
- Updated README with instructions for setting up and using Git hooks.

---

## [v0.3.0] - 2024-06-28

### Documentation, Testing, and CI Improvements

This release standardizes API documentation, enhances error responses, and improves CI/CD reliability.

**Added**
- Standardized Swagger documentation for all endpoints in both services.
- Improved error response schemas for all endpoints.
- E2E tests now ensure integration between `auth-service` and `url-shortener-service`.
- GitHub Actions workflow now waits for services to be healthy before running tests.
- Added Prisma health checks and improved migration handling in CI.
- Updated environment variable usage for better compatibility in CI and Docker Compose.
- Improved test robustness and reliability for concurrent service startup.

**Fixed**
- Fixed foreign key constraint errors in E2E tests by ensuring user creation and DB propagation.
- Fixed issues with service startup order in CI/CD pipelines.

---

## [v0.2.0] - 2024-06-27

### Authentication Service and Multi-Service Support

This release introduces the authentication service and JWT integration, along with multi-service support.

**Added**
- Auth service (`auth-service`) with user registration and login endpoints.
- JWT authentication integration for secure access.
- Swagger documentation for authentication endpoints.
- Automated unit and e2e tests for authentication flows.
- Docker Compose adjustments to support multiple services.
- Lint and test GitHub Actions workflows.
- Improved error handling and validation in both services.

---

## [v0.1.0] - 2024-06-27

### Initial Release

**Added**
- Basic URL shortening service.
- Swagger documentation for the API.
- Docker Compose for service and database.