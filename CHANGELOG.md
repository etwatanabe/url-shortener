# Changelog

## [v0.3.0] - 2024-06-28

### Added

- Standardized Swagger documentation for all endpoints in both services.
- Improved error response schemas for all endpoints.
- E2E tests now ensure integration between `auth-service` and `url-shortener-service`.
- GitHub Actions workflow now waits for services to be healthy before running tests.
- Added Prisma health checks and improved migration handling in CI.
- Updated environment variable usage for better compatibility in CI and Docker Compose.
- Improved test robustness and reliability for concurrent service startup.

### Fixed

- Fixed foreign key constraint errors in E2E tests by ensuring user creation and DB propagation.
- Fixed issues with service startup order in CI/CD pipelines.

---

## [v0.2.0] - 2024-06-27

### Added

- Implementation of the authentication service (`auth-service`) with user registration and login endpoints.
- JWT authentication integration.
- Swagger documentation for the authentication service.
- Automated tests (unit and e2e) for authentication flows.
- Docker Compose adjustments to support multiple services.
- Lint and test GitHub Actions workflows.
- Improved error handling and validation in both services.

---

## [v0.1.0] - 2024-06-27

### Added

- Basic URL shortening service.
- Swagger documentation for the API.
- Docker Compose for service and database