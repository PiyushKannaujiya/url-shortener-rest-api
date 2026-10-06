# URL Shortener REST API

A Node.js, Express, MongoDB, and Mongoose API for authenticated creation and management of short URLs.

## Tech stack

- Node.js and Express
- MongoDB and Mongoose
- JWT authentication and bcryptjs password hashing

## Installation and configuration

```bash
npm install
copy .env.example .env
```

Set the following values in `.env` (never commit this file):

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | HTTP port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/url_shortener` |
| `JWT_SECRET` | Long, random signing secret | Generate a unique value |
| `BASE_URL` | Public base URL for generated links | `http://localhost:5000` |

Run the API:

```bash
npm run dev
# or
npm start
```

The server validates its required configuration and connects to MongoDB before accepting requests.
If this project has previously created the old `user_1` index, remove that redundant index manually after confirming the new `user_1_createdAt_-1` index exists.

## Authentication

Register or log in to receive a JWT. Send it on protected endpoints:

```http
Authorization: Bearer <token>
```

## API

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create a user |
| POST | `/api/auth/login` | No | Get a JWT |
| POST | `/api/url` | Yes | Create a short URL |
| GET | `/api/url/my?page=1&limit=5` | Yes | List the caller's URLs |
| GET | `/api/url/:shortCode/stats` | Yes | Get statistics for the caller's URL |
| PUT | `/api/url/:shortCode` | Yes | Update the caller's URL |
| DELETE | `/api/url/:shortCode` | Yes | Delete the caller's URL |
| GET | `/:shortCode` | No | Redirect and increment clicks |

### Examples

Register:

```json
POST /api/auth/register
{ "name": "Ada", "email": "ada@example.com", "password": "secure-password" }
```

Create a URL:

```json
POST /api/url
{ "originalUrl": "https://example.com/docs", "expiresAt": "2030-01-01T00:00:00.000Z" }
```

Update a URL. `expiresAt: null` clears an existing expiration:

```json
PUT /api/url/:shortCode
{ "originalUrl": "https://example.com/new-path", "expiresAt": null }
```

Successful creation returns `originalUrl`, `shortCode`, `shortUrl`, and `expiresAt`.

## Validation and pagination

Only `http:` and `https:` destinations are accepted. `javascript:`, `data:`, `ftp:`, credential-bearing URLs, malformed URLs, and invalid expiry dates are rejected.

For `/api/url/my`, `page` must be an integer of at least 1, and `limit` must be an integer from 1 to 100. Defaults are `page=1` and `limit=5`.

## Expiration and click tracking

Redirects atomically verify that a URL has not expired and increment its click counter. Expired URLs return `410 Gone` while their record remains. MongoDB's TTL index later removes expired records asynchronously; after removal they return `404 Not Found`. TTL cleanup is performed by MongoDB on an approximate schedule, not exactly at the expiration instant.

## Error responses

Responses use `{ "success": false, "message": "..." }`.

| Status | Meaning |
| --- | --- |
| 400 | Invalid input or malformed JSON |
| 401 | Missing, invalid, or expired JWT |
| 404 | Resource absent or not owned by caller |
| 409 | Duplicate email or unique record conflict |
| 410 | Expired short URL |
| 500 | Unexpected server error |
| 503 | Short-code generation retries exhausted |

## Project structure and architecture

```text
config/       database connection and environment validation
controllers/  HTTP request/response handling
middleware/   authentication and central error handling
models/       Mongoose schemas and indexes
routes/       endpoint definitions
services/     URL persistence and atomic operations
utils/        errors, validation, async wrapper, code generation
app.js        Express application assembly
server.js     validated database-first startup
```

Controllers validate input and shape HTTP responses. Services encapsulate URL database work. Middleware applies JWT authorization and converts unexpected errors into safe API responses.

## Tests

```bash
npm test
```

The included unit tests run without a database. Add endpoint integration tests against an isolated test database before deployment; never run destructive tests against a production connection string.
"# url-shortener-rest-api" 
