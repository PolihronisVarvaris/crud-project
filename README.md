# Course CRUD API

RESTful CRUD API for managing courses. Built with **Node.js + TypeScript + Express + PostgreSQL**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| Database | PostgreSQL |
| Validation | express-validator |
| API Docs | Swagger / OpenAPI 3.0 |
| Testing | Jest + Supertest |
| Container | Docker + Docker Compose |

---

## Project Structure

```
├── app.ts                          # Express app (middleware, routes)
├── server.ts                       # Entry point
├── migrate.ts                      # Migration runner CLI
├── database/
│   └── migrations/
│       └── 001_create_courses_table.sql
└── src/
    ├── config/database.ts          # PostgreSQL pool
    ├── controllers/                # HTTP request handling
    ├── docs/swagger.ts             # OpenAPI spec
    ├── dto/                        # Request & response shapes
    ├── exceptions/                 # Custom HTTP exceptions
    ├── middleware/                 # Error handler, validation middleware
    ├── models/                     # TypeScript interfaces
    ├── repositories/               # Database queries
    ├── routes/                     # Express routes
    ├── services/                   # Business logic
    └── validators/                 # express-validator rule sets
```

---

## Getting Started

### 1. Prerequisites

- Node.js >= 18
- Docker + Docker Compose

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if needed (default values work with Docker setup below)
```

### 4. Start PostgreSQL

```bash
docker-compose up -d
```

This starts two containers:
- `courses_db` on port **5432** (development)
- `courses_test_db` on port **5433** (tests)

### 5. Run migrations

```bash
npm run migrate
```

### 6. Start the server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`
Swagger UI at: `http://localhost:3000/api-docs`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/courses` | List courses (paginated) |
| GET | `/api/v1/courses/:id` | Get course by ID |
| POST | `/api/v1/courses` | Create a course |
| PUT | `/api/v1/courses/:id` | Update a course |
| DELETE | `/api/v1/courses/:id` | Soft delete a course |

### Query Parameters (GET /courses)

| Param | Type | Default | Description |
|---|---|---|---|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |

---

## Request / Response Examples

### Create Course

```http
POST /api/v1/courses
Content-Type: application/json

{
  "title": "Introduction to TypeScript",
  "description": "Learn TypeScript from scratch",
  "status": "Pending",
  "is_premium": false
}
```

**Response 201:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Introduction to TypeScript",
  "description": "Learn TypeScript from scratch",
  "status": "Pending",
  "is_premium": false,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "title", "message": "Title is required" },
      { "field": "status", "message": "Status must be one of: Published, Pending" }
    ]
  }
}
```

---

## Running Tests

```bash
# All tests
npm test

# Unit tests only (no DB required)
npm run test:unit

# Integration tests (requires running Docker containers)
npm run test:integration
```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | Deleted (no content) |
| 400 | Validation error |
| 404 | Not found |
| 422 | Business rule violation |
| 500 | Unexpected server error |

---

## Notes

- **Soft delete**: `DELETE` sets `deleted_at` timestamp instead of removing the record. Deleted courses are excluded from all queries.
- **Pagination**: All list responses include a `pagination` object with `total`, `page`, `limit`, and `pages`.
- **Swagger**: Full interactive documentation available at `/api-docs` when the server is running.
