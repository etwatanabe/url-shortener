# URL Shortener Service

A simple URL shortener service built as a monorepo using [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), and [PostgreSQL](https://www.postgresql.org/).  
The project follows a modular architecture with multiple services (such as authentication and URL management), orchestrated via Docker Compose and exposed through a unified API Gateway ([KrakenD](https://www.krakend.io/)).


## Tech Stack

- [NestJS](https://nestjs.com/) – Backend framework (monorepo, modular architecture)
- [Prisma](https://www.prisma.io/) – ORM for PostgreSQL
- [PostgreSQL](https://www.postgresql.org/) – Database
- [Docker Compose](https://docs.docker.com/compose/) – Container orchestration for local development
- [KrakenD](https://www.krakend.io/) – API Gateway
- [Swagger / OpenAPI](https://swagger.io/) – API documentation
- [Jest](https://jestjs.io/) – Unit and E2E testing
- [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/lint-staged/lint-staged) – Git hooks for code quality
- [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) – Linting and code formatting

---

## Features

- Shorten any valid URL to a short code.
- Redirect from a short code to the original URL.
- Authenticated user support: each user can manage their own URLs.
- URL click count.
- Full API documentation via Swagger.
- Docker Compose for easy local development.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Make](https://www.gnu.org/software/make/) (optional, for easier commands)

### Environment Variables

Use the provided `.env.example` file as a base for your environment configuration.  
Copy it to create your local environment file:

```sh
cp .env.example .env
```

Then, adjust the values in `.env` if needed:


**Main variables:**

| Variable      | Description                                                      | Default Value                                         |
|---------------|------------------------------------------------------------------|-------------------------------------------------------|
| BASE_URL      | Public URL used to generate short URLs (should match the public address of the API Gateway).    | http://localhost:8080                                 |
| JWT_SECRET    | Secret key for signing JWT tokens.                               | jwt_secret_key                                        |
| DATABASE_URL  | PostgreSQL connection string.             | postgres://user:password@postgres:5432/database |
| POSTGRES_USER | Username for the PostgreSQL container (must match DATABASE_URL). | user                                     |
| POSTGRES_PASSWORD | Password for the PostgreSQL container (must match DATABASE_URL).                       | password                                 |
| POSTGRES_DB   | Database name for the PostgreSQL container (must match DATABASE_URL).                      | database                                       |

> These variables must be consistent between `.env` and your Docker Compose setup.

## Using Makefile

This project provides a `Makefile` to simplify common development tasks.  
**You can use `make` commands instead of long Docker Compose commands.**

Main commands:

- `make up` – Build and start all services with Docker Compose.
- `make down` – Stop and remove all containers.
- `make clean` – Remove containers, volumes, and networks (danger: data loss).

> On Windows, use a terminal that supports `make` (e.g., Git Bash, WSL, or PowerShell with Make installed).

You can install `make` using [chocolatey](https://chocolatey.org).

```sh
choco install make
```

---

## How to Run the Project

### Using Make (recommended)

1. **Start all services:**

   ```sh
   make up
   ```

   This will build and start the database and the URL shortener service.

2. **Access the service:**
   - URL Shortener API: [http://localhost:3000](http://localhost:3000)
   - URL Shortener Swagger docs: [http://localhost:3000/docs](http://localhost:3000/docs)
   - Auth API: [http://localhost:3001](http://localhost:3001)
   - Auth Swagger docs: [http://localhost:3001/docs](http://localhost:3001/docs)
   - API Gateway: [http://localhost:8080](http://localhost:8080)

3. **Stop all services:**

   ```sh
   make down
   ```

---

### Using Docker Compose directly

1. **Start all services:**

   ```sh
   docker compose -f docker-compose.yml --env-file .env up -d --build
   ```

2. **Access the services**

   Use the same URLs as with Make.

3. **Stop all services:**

   ```sh
   docker compose -f docker-compose.yml --env-file .env down
   ```

---

## API Gateway (KrakenD)

This project uses [KrakenD](https://www.krakend.io/) as an API Gateway to provide a unified entry point for all services.

- **Gateway URL:** [http://localhost:8080](http://localhost:8080)
- All API requests (authentication, URL shortening, redirection, etc.) can be made through the gateway.

### Example Endpoints via Gateway

- Register: `POST http://localhost:8080/auth/register`
- Login: `POST http://localhost:8080/auth/login`
- Shorten URL: `POST http://localhost:8080/shorten`
- List URLs: `GET http://localhost:8080/urls`
- Redirect: `GET http://localhost:8080/{shortUrl}`

### BASE_URL configuration

To ensure that generated short URLs point to the gateway, set in your `.env`:

```
BASE_URL=http://localhost:8080
```

### How to run with KrakenD

KrakenD is included in the Docker Compose setup.  
When you run `make up` or `docker compose up`, the gateway will be available at [http://localhost:8080](http://localhost:8080).

---

## API Documentation

Swagger is available at:

- [http://localhost:3000/docs](http://localhost:3000/docs) (URL Shortener)
- [http://localhost:3001/docs](http://localhost:3001/docs) (Auth Service)

---

## Usage Examples

### Shorten a URL

```http
POST http://localhost:8080/shorten
Content-Type: application/json

{
  "longUrl": "https://www.example.com"
}
```

**Response:**

```json
{
  "id": "string",
  "longUrl": "https://www.example.com",
  "shortUrl": "http://localhost:8080/abc123",
  "userId": null,
  "clicks": 0,
  "createdAt": "2024-06-27T12:00:00.000Z",
  "updatedAt": "2024-06-27T12:00:00.000Z"
}
```

### Redirect

```http
GET http://localhost:8080/abc123
```

Redirects to the original URL.

---

## Running Tests

```sh
npm run test
npm run test:e2e:auth
npm run test:e2e:url-shortener
```

E2E tests require both the Auth Service and URL Shortener Service to be running and use the same database.

---

## Git Hooks (Husky + lint-staged)

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to ensure code quality before commits and pushes.

- **Pre-commit:** Runs Prettier and ESLint only on staged files.
- **Pre-push:** Runs unit tests.

### How to set up hooks locally

After cloning the repository and installing dependencies, run:

```sh
npm run prepare
```

The hooks will be activated automatically.

### What happens on hooks

- On commit, code will be formatted and linted for staged files.
- On push, all unit tests will be executed.
- If any of these steps fail, the commit or push will be blocked.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes.
