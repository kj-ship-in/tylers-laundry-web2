# Tyler's Laundry API - Copilot Instructions

## Architecture Overview

This is a **TypeScript Express.js API** for a laundry service platform with a **layered architecture**:

- `controllers/` - HTTP request handlers
- `services/` - Business logic layer
- `routes/` - Express router definitions with middleware
- `validators/` - Zod schemas for request validation
- `middlewares/` - Auth, validation, error handling, security
- `lib/` - Database connection and utilities

## Database & Models

**Prisma ORM** with PostgreSQL, custom output path: `src/prisma/generated/prisma`

- Import from: `import { PrismaClient, UserType } from '../prisma/generated/prisma'`
- Singleton instance: `import prisma from '../lib/prisma'`
- Key entities: User, Service, Booking, Payment, Invoice, Receipt
- User roles: `USER`, `ADMIN`, `STAFF` (enum UserType)
- **Optimized indexes** for performance on frequently queried fields
- **Database service** at `services/database.service.ts` for complex queries

## Authentication Patterns

**JWT-based auth** with refresh tokens and enhanced security:

```typescript
// Controllers always follow this pattern
export const someController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const validatedData = SomeSchema.parse(req.body);
    // ... business logic
    return res.status(200).json({ data });
  } catch (error) {
    next(error); // Always use next(error) for error handling
  }
};
```

**Middleware usage:**

- `authMiddleware` - JWT verification, adds `req.user`
- `requireAdmin` - Admin-only routes
- `requireStaffOrAdmin` - Staff or Admin access
- `validateBody(schema)` - Request body validation
- `validateQuery(schema)` - Query parameter validation
- `validateParams(schema)` - URL parameter validation

## Route Structure

Routes use consistent RESTful patterns with comprehensive middleware:

```typescript
const router = Router();
router.use(authMiddleware); // Apply auth to all routes in file
router.post('/endpoint', validateBody(Schema), controller);
```

**API prefix:** All routes mount under `/api/v1/`

## Security & Validation

**Enhanced security middleware stack:**

- Input sanitization and XSS protection
- SQL injection detection
- Rate limiting (100 req/15min)
- Security headers with CSP
- Compression for performance

**Zod schemas** in `validators/` directory:

- Always parse request data: `Schema.parse(req.body)`
- Export schemas with descriptive names: `RegisterUserSchema`
- Use validation middleware for different input types

## Error Handling & Logging

**Custom error classes:**

- `ValidationError` - Input validation failures
- `AuthenticationError` - Auth failures
- `AuthorizationError` - Permission denied
- `NotFoundError` - Resource not found
- `ConflictError` - Duplicate resources

**Winston logging:**

- Structured logging to files and console
- Request/response logging in development
- Error context with user and request information

## Development Workflow

**Key Commands:**

```bash
yarn dev                 # Development with nodemon + tsx
yarn db:generate         # Regenerate Prisma client after schema changes
yarn db:migrate          # Run database migrations
yarn db:seed            # Seed database with sample data
yarn db:studio          # Open Prisma Studio
yarn lint:fix           # Fix ESLint issues
```

**Database workflow:** Always run `yarn db:generate` after schema changes before starting dev server.

## Configuration Management

**Environment validation** with Zod schemas in `config/env.ts`:

- Required variables validated at startup
- Type-safe configuration access
- Development vs production settings

## File Naming Conventions

- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Routes: `*.route.ts`
- Validators: `*.schema.ts`
- Middleware: `*.middleware.ts`

## PostgreSQL Optimizations

- **Indexes**: Strategic indexing on frequently queried fields
- **Data types**: Proper PostgreSQL types (VarChar, Text, Decimal)
- **Constraints**: Foreign key constraints with cascade options
- **Relationships**: Optimized with proper deletion cascades
- **Pagination**: Built-in pagination support in database service

## Health & Monitoring

- Enhanced `/health` endpoint with system information
- Structured logging for monitoring and debugging
- Database health checks and connection monitoring

When adding new features, follow the established controller → service → database pattern with comprehensive validation, error handling, and security considerations.
