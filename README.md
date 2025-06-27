# URL Shortener Service

A simple URL shortener service built with [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), and [PostgreSQL](https://www.postgresql.org/).

## Features

- Shorten any valid URL to a short code.
- Redirect from a short code to the original URL.
- View API documentation via Swagger.
- Docker Compose for easy local development.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) (optional, for local development)
- [Make](https://www.gnu.org/software/make/) (optional, for easier commands)

### Environment Variables

Use the provided `.env.example` file as a base for your environment configuration.  
Copy it to create your local environment file:

```sh
cp .env.example .env.local
```

Then, adjust the values in `.env.local` if needed:

```
DATABASE_URL=postgres://urlshortener:urlshortener@postgres:5432/urlshortener
BASE_URL=http://localhost:3000
```

## Using Makefile

This project provides a `Makefile` to simplify common development tasks.  
**You can use `make` commands instead of long Docker Compose commands.**

Main commands:

- `make up` – Build and start all services with Docker Compose.
- `make down` – Stop and remove all containers.
- `make clean` – Remove containers, volumes, and networks (danger: data loss).

> On Windows, use a terminal that supports `make` (e.g., Git Bash, WSL, or PowerShell with Make installed). You can install `make` using [chocolatey](https://chocolatey.org).

---

## How to Run the Project

### With Docker Compose (recommended)

1. **Start all services:**

   ```sh
   make up
   ```

   This will build and start the database and the URL shortener service.

2. **Access the service:**

   - URL Shortener API: [http://localhost:3000](http://localhost:3000)
   - Swagger docs: [http://localhost:3000/docs](http://localhost:3000/docs)

3. **Stop all services:**

   ```sh
   make down
   ```

---

### Running Locally (without Docker)

1. **Start PostgreSQL** (you can use Docker just for the DB):

   ```sh
   docker compose up -d postgres
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Run Prisma migrations:**

   ```sh
   npx prisma migrate deploy
   ```

4. **Start the service:**

   ```sh
   npm run start
   ```

5. **Access the API and Swagger as above.**

---

## API Documentation

Swagger is available at: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## Usage Examples

### Shorten a URL

```http
POST http://localhost:3000/shorten
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
  "shortUrl": "http://localhost:3000/abc123",
  "userId": null,
  "clicks": 0,
  "createdAt": "2024-06-27T12:00:00.000Z",
  "updatedAt": "2024-06-27T12:00:00.000Z"
}
```

### Redirect

```http
GET http://localhost:3000/abc123
```
Redirects to the original URL.

---

## Running Tests

```sh
npm run test --workspace=apps/url-shortener-service
npm run test:e2e --workspace=apps/url-shortener-service
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes.