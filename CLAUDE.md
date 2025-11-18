# CLAUDE.md - Backend API

This file provides guidance to Claude Code when working with the backend API codebase.

## Project Overview

This is the **backend API server** for the Qwik e-commerce platform, separated from the frontend for better scalability, security, and deployment flexibility.

### Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Zod

## Architecture Principles

### 1. Separation of Concerns

This backend is **completely separate** from the frontend Qwik application:
- Frontend makes HTTP requests to backend API
- Backend handles all database operations
- No shared code between frontend and backend (except types can be shared)
- Independent deployment and scaling

### 2. RESTful API Design

Follow REST conventions:
- **GET** for reading data
- **POST** for creating resources
- **PUT/PATCH** for updating resources
- **DELETE** for removing resources
- Use proper HTTP status codes (200, 201, 400, 404, 500, etc.)
- Return consistent JSON response format

### 3. Security First

**ALWAYS implement:**
- CORS whitelist (only allow configured frontend URLs)
- Rate limiting per IP
- Helmet security headers
- Input validation with Zod
- SQL injection prevention (Prisma handles this)
- Error message sanitization (don't expose internal errors)

### 4. Type Safety

- Use TypeScript strict mode
- Validate all inputs with Zod schemas
- Define interfaces for all API responses
- Convert Prisma Decimal types to numbers for JSON responses

## Project Structure

```
qwik-backend/
├── src/
│   ├── index.ts              # Express server entry point
│   ├── database.ts           # Prisma client singleton
│   ├── middleware/
│   │   └── security.ts       # CORS, helmet, rate limiting, error handling
│   └── routes/
│       ├── products.ts       # Product endpoints
│       ├── categories.ts     # Category endpoints
│       └── collections.ts    # Collection endpoints
├── prisma/
│   └── schema.prisma         # Database schema (source of truth)
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example              # Environment variable template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vercel.json               # Deployment configuration
└── README.md                 # Project documentation
```

## Development Workflow

### Environment Variables

**Required variables** (see `.env.example`):
```bash
DATABASE_URL="postgresql://..."      # Supabase connection pooling URL (port 6543)
DIRECT_URL="postgresql://..."        # Supabase direct connection URL (port 5432)
PORT=3001                            # Server port
NODE_ENV=development                 # Environment
FRONTEND_URL="http://localhost:5173" # Development frontend URL
FRONTEND_URL_PRODUCTION="https://..." # Production frontend URL
API_SECRET_KEY="..."                 # Secret key for API operations
```

**IMPORTANT:**
- Use `DATABASE_URL` for Prisma queries (connection pooling)
- Use `DIRECT_URL` for Prisma migrations
- Never commit `.env` file
- Update CORS settings when frontend URL changes

### Running the Server

```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

### Database Migrations

When modifying `prisma/schema.prisma`:

1. Update the schema
2. Generate Prisma Client: `npm run prisma:generate`
3. Create migration: `npm run prisma:migrate`
4. Commit both schema and migration files

**NEVER:**
- Modify migration files manually
- Delete migration history
- Run migrations in production without testing

## API Conventions

### Response Format

**Success Response:**
```typescript
{
  data: T,              // The actual data
  pagination?: {        // Optional pagination info
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Error Response:**
```typescript
{
  error: string         // User-friendly error message
}
```

### Decimal to Number Conversion

Prisma uses `Decimal` type for precise numbers (prices, weights). **ALWAYS** convert to JavaScript `number` for JSON responses:

```typescript
const productsJSON = products.map((p) => ({
  ...p,
  basePrice: Number(p.basePrice),
  compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
}));
```

### Query Parameter Validation

**ALWAYS** validate query parameters with Zod:

```typescript
const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 20)),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

const params = querySchema.parse(req.query);
```

### Error Handling

**Pattern for all routes:**

```typescript
router.get("/endpoint", async (req: Request, res: Response) => {
  try {
    // Validate input
    const params = schema.parse(req.query);

    // Perform operation
    const data = await prisma.model.findMany({ ... });

    // Transform data
    const dataJSON = transformData(data);

    // Return success
    res.json({ data: dataJSON });
  } catch (error) {
    console.error("Error description:", error);
    res.status(500).json({ error: "User-friendly message" });
  }
});
```

## Security Best Practices

### 1. CORS Configuration

Update `src/middleware/security.ts` when adding new frontend URLs:

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  process.env.FRONTEND_URL_PRODUCTION,
  "http://localhost:4173", // Preview
].filter(Boolean);
```

### 2. Rate Limiting

Current limits:
- **Window:** 15 minutes (900000ms)
- **Max Requests:** 100 per IP

Adjust in `src/middleware/security.ts` or via environment variables.

### 3. Input Validation

**NEVER trust user input:**
- Validate all query parameters
- Validate all request bodies
- Use Zod schemas for type safety
- Check for SQL injection attempts (Prisma helps, but validate inputs)

### 4. Error Messages

**DO NOT expose:**
- Database structure
- Internal error details
- Stack traces
- Environment variables

**DO expose:**
- User-friendly error messages
- Validation error details (sanitized)
- HTTP status codes

## Adding New Features

### Adding a New Endpoint

1. **Define Zod schema for validation** (if needed)
2. **Create route handler:**
   - Validate input
   - Query database with Prisma
   - Transform data (Decimal to number, etc.)
   - Return consistent response format
   - Handle errors properly

3. **Update CORS if needed** (new origins)

4. **Test the endpoint:**
   - Valid requests
   - Invalid requests
   - Edge cases
   - Error scenarios

5. **Document in README.md**

### Adding a New Model

1. **Update `prisma/schema.prisma`:**
   - Define model
   - Add relations
   - Add indexes for performance

2. **Generate and migrate:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

3. **Create route file** in `src/routes/`

4. **Register routes** in `src/index.ts`

5. **Test all CRUD operations**

## Performance Optimization

### Database Queries

**DO:**
- Use `select` to fetch only needed fields
- Add indexes for frequently queried fields
- Use connection pooling (DATABASE_URL with pgbouncer)
- Limit results with `take` and pagination
- Use `include` judiciously (avoid N+1 queries)

**DON'T:**
- Fetch entire tables without pagination
- Perform heavy calculations in JavaScript (use database)
- Skip indexes on foreign keys

### Caching Strategy

Consider adding caching for:
- Product listings (change infrequently)
- Categories and collections (mostly static)
- Search indexes

Use Redis or in-memory cache for better performance.

## Deployment

### Vercel Deployment

**Requirements:**
- Prisma migrations run before deployment
- Environment variables configured
- `vercel.json` configured correctly

**Deploy:**
```bash
vercel --prod
```

**Environment Variables on Vercel:**
- Set all variables from `.env.example`
- Use Supabase connection pooling URL for `DATABASE_URL`
- Set `NODE_ENV=production`

### Railway Deployment

Alternative to Vercel:
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

## Monitoring and Logging

### Current Logging

- Request logging middleware
- Error logging to console
- Prisma query logging (development only)

### Production Logging

Consider adding:
- Structured logging (Winston, Pino)
- Log aggregation (Datadog, Loggly)
- Performance monitoring (New Relic, Sentry)
- Database query performance tracking

## Common Tasks

### Adding Admin Endpoints

Currently only READ endpoints exist. To add CREATE/UPDATE/DELETE:

1. **Add authentication middleware** (verify admin role)
2. **Create POST/PUT/DELETE routes**
3. **Validate request bodies with Zod**
4. **Perform database operations**
5. **Return appropriate status codes:**
   - 201 for created
   - 200 for updated
   - 204 for deleted

### Supporting File Uploads

For product images:
1. **Use multer middleware** for file handling
2. **Upload to Supabase Storage**
3. **Store URL in database**
4. **Return image URL in response**

### Adding Full-Text Search

Enhance product search:
1. **Add full-text search index** in Prisma schema
2. **Use PostgreSQL full-text search**
3. **Or integrate Elasticsearch/Algolia**

## Testing

### Manual Testing

Use curl or Postman:
```bash
# Health check
curl http://localhost:3001/health

# Get products
curl http://localhost:3001/api/products?page=1&limit=10

# Get single product
curl http://localhost:3001/api/products/product-slug

# Test filtering
curl "http://localhost:3001/api/products?status=PUBLISHED&sortBy=price-asc"
```

### Automated Testing

Consider adding:
- Unit tests (Jest, Vitest)
- Integration tests (Supertest)
- E2E tests (Playwright)

## Troubleshooting

### Database Connection Issues

**Check:**
- DATABASE_URL format is correct
- Supabase database is running
- Firewall allows connections
- Password is correct (no brackets or special chars)

**Test connection:**
```bash
npx prisma db pull
```

### CORS Errors

**Solution:**
- Add frontend URL to `allowedOrigins` in `src/middleware/security.ts`
- Ensure `credentials: true` if using cookies
- Check environment variables are loaded

### Rate Limit Errors

**Increase limits** in `src/middleware/security.ts` or environment variables:
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

## Related Documentation

- **Frontend:** `C:\Users\mihai\Desktop\qwik full\CLAUDE.md`
- **Migration Guide:** `C:\Users\mihai\Desktop\qwik full\FRONTEND_BACKEND_MIGRATION.md`
- **Prisma Docs:** https://www.prisma.io/docs
- **Express Docs:** https://expressjs.com
- **Supabase Docs:** https://supabase.com/docs
