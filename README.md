# Course CRUD API

A RESTful API for managing courses, built with Node.js, TypeScript, Express, and PostgreSQL. It supports full CRUD operations with soft delete, input validation, pagination, and Swagger documentation.

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** PostgreSQL
- **Validation:** express-validator
- **API Docs:** Swagger / OpenAPI 3.0
- **Testing:** Jest + Supertest

---

## Project Structure

```
├── app.ts                              # Express app setup (middleware, routes)
├── server.ts                           # Entry point
├── migrate.ts                          # Migration runner
├── database/
│   └── migrations/
│       └── 001_create_courses_table.sql
└── src/
    ├── config/database.ts              # PostgreSQL connection pool
    ├── controllers/                    # HTTP request/response handling
    ├── docs/swagger.ts                 # OpenAPI specification
    ├── dto/                            # Request and response shapes
    ├── exceptions/                     # Custom HTTP exceptions
    ├── middleware/                     # Error handler, validation middleware
    ├── models/                         # TypeScript interfaces
    ├── repositories/                   # Database queries
    ├── routes/                         # Express route definitions
    ├── services/                       # Business logic
    └── validators/                     # Validation rule sets
```

---

## Prerequisites

Before running the project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) version 18 or higher
- [PostgreSQL](https://www.postgresql.org/download/) version 14 or higher

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PolihronisVarvaris/crud-project.git
cd crud-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a PostgreSQL database

Open psql or any PostgreSQL client and run:

```sql
CREATE DATABASE courses_db;
CREATE DATABASE courses_test_db;
```

If you are using psql from the terminal:

```bash
psql -U postgres -c "CREATE DATABASE courses_db;"
psql -U postgres -c "CREATE DATABASE courses_test_db;"
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open the `.env` file and update the values to match your local PostgreSQL setup:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=courses_db
DB_USER=postgres
DB_PASSWORD=your_password

TEST_DB_NAME=courses_test_db
```

### 5. Run migrations

```bash
npm run migrate
```

This will create the `courses` table in your database.

### 6. Start the server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`.
The Swagger UI will be available at `http://localhost:3000/api-docs`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/courses` | List courses (paginated) |
| GET | `/api/v1/courses/:id` | Get a course by ID |
| POST | `/api/v1/courses` | Create a new course |
| PUT | `/api/v1/courses/:id` | Update an existing course |
| DELETE | `/api/v1/courses/:id` | Soft delete a course |

### Pagination (GET /courses)

| Parameter | Type | Default | Description |
|---|---|---|---|
| page | integer | 1 | Page number |
| limit | integer | 20 | Results per page, max 100 |

---

## Request and Response Examples

### Create a course

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

Response:
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

### Validation error

When a request fails validation, the API returns a structured error with details about each invalid field:

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

Make sure both `courses_db` and `courses_test_db` exist and your `.env` is configured before running tests.

```bash
# Run all tests
npm test

# Unit tests only (no database required)
npm run test:unit

# Integration tests (requires a running PostgreSQL instance)
npm run test:integration
```

---

## HTTP Status Codes

| Code | When it is returned |
|---|---|
| 200 | Successful GET or PUT |
| 201 | Course successfully created |
| 204 | Course successfully deleted |
| 400 | Request failed validation |
| 404 | Course not found |
| 422 | Request is valid but violates a business rule |
| 500 | Unexpected server error |

---

## Design Notes

**Soft delete** — calling DELETE on a course sets its `deleted_at` timestamp rather than removing the record from the database. Soft-deleted courses are excluded from all queries, including GET by ID.

**Pagination** — all list responses include a `pagination` object containing `total`, `page`, `limit`, and `pages` so clients can navigate through results without guessing.

**Error consistency** — every error response follows the same shape with a `code`, a human-readable `message`, and an optional `details` array. This makes error handling predictable on the client side.
