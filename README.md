# Qwik E-commerce Backend API

Backend API server for the Qwik e-commerce platform.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Zod

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Supabase connection pooling URL
- `DIRECT_URL` - Supabase direct connection URL
- `FRONTEND_URL` - Your frontend URL for CORS

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### Products

- `GET /api/products` - List products (with pagination, filtering, sorting)
  - Query params: `page`, `limit`, `status`, `featured`, `category`, `collection`, `sortBy`
- `GET /api/products/:slug` - Get single product by slug
- `GET /api/products/search/index` - Get search index for Orama

### Categories

- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category with products

### Collections

- `GET /api/collections` - List all collections
- `GET /api/collections/:slug` - Get collection with products

### Health Check

- `GET /health` - Health check endpoint

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link project:
```bash
vercel link
```

3. Set environment variables:
```bash
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add FRONTEND_URL_PRODUCTION
```

4. Deploy:
```bash
vercel --prod
```

### Railway

1. Create new project on Railway
2. Connect GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

### Environment Variables for Production

Required:
- `DATABASE_URL` - Supabase connection pooling URL
- `DIRECT_URL` - Supabase direct connection URL
- `FRONTEND_URL_PRODUCTION` - Your production frontend URL
- `NODE_ENV=production`

Optional:
- `PORT` - Server port (default: 3001)
- `API_SECRET_KEY` - Secret key for API operations
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)

## Project Structure

```
qwik-backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── middleware/
│   │   └── security.ts        # Security middleware (CORS, helmet, rate limiting)
│   ├── routes/
│   │   ├── products.ts        # Product endpoints
│   │   ├── categories.ts      # Category endpoints
│   │   └── collections.ts     # Collection endpoints
│   ├── database.ts            # Prisma client instance
│   └── index.ts               # Express server
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── vercel.json                # Vercel deployment config
```

## Security Features

- **CORS:** Configured to only allow requests from specified frontend URLs
- **Rate Limiting:** Limits requests per IP to prevent abuse
- **Helmet:** Sets security headers
- **Input Validation:** All inputs validated with Zod schemas
- **Error Handling:** Centralized error handling with sanitized responses

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Notes

- All Decimal fields (prices, weights) are converted to numbers in API responses
- Products are filtered by status: DRAFT, PUBLISHED, ARCHIVED
- Pagination defaults: page=1, limit=20
- All timestamps are in ISO 8601 format
