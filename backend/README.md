# Tyler's Laundry API

A RESTful API for Tyler's Laundry service management — bookings, payments, invoices, receipts, reporting, and role-based access control.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 5 |
| Database | MongoDB Atlas (Mongoose 9) |
| Auth | JWT (access + refresh tokens) |
| Validation | Zod |
| Email | Nodemailer (SMTP/Gmail) |
| PDF | Puppeteer |
| Reports | ExcelJS |
| Scheduling | node-cron |
| Logging | Winston |
| Package Manager | Yarn |

---

## Project Structure

```
src/
├── config/
│   └── env.ts                    # Zod-validated environment config
├── controllers/                  # Route handlers (one per domain)
├── lib/
│   └── mongoose.ts               # MongoDB connection + health check
├── middlewares/
│   ├── auth.middleware.ts         # JWT verification
│   ├── permission.middleware.ts   # Role/permission guard
│   ├── error.middleware.ts        # Global error handler
│   ├── request-logger.middleware.ts
│   └── security.middleware.ts    # XSS protection
├── models/                       # Mongoose models (11 collections)
│   ├── booking.model.ts
│   ├── email-verification.model.ts
│   ├── invoice.model.ts
│   ├── password-reset-token.model.ts
│   ├── payment.model.ts
│   ├── receipt.model.ts
│   ├── role.model.ts
│   ├── service.model.ts
│   ├── session.model.ts
│   ├── testimonial.model.ts
│   └── user.model.ts
├── routes/                       # Express routers (one per domain)
├── scripts/
│   ├── migrate.ts                # Sync MongoDB indexes
│   └── seed.ts                   # Seed initial data
├── services/                     # Business logic layer
├── types/
│   ├── enums.ts                  # All shared enums
│   ├── express.d.ts              # req.user type augmentation
│   ├── invoice.d.ts
│   └── receipt.d.ts
├── utils/
│   ├── hash.ts                   # bcrypt helpers
│   ├── jwt.ts                    # Token sign/verify
│   ├── logger.ts                 # Winston logger
│   ├── permissions.ts            # Permission helpers
│   ├── pdf-generator.ts
│   └── excel-generator.ts
├── validators/                   # Zod schemas per domain
├── app.ts                        # Express app setup
└── index.ts                      # Server entry point
```

---

## Environment Variables

All variables are validated at startup via Zod — the server exits with a clear error message if any required value is missing or invalid.

```env
# App
NODE_ENV=production           # development | production | test
PORT=5000

# MongoDB (required)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?appName=<app>

# JWT (required — minimum 32 characters each)
JWT_SECRET=<64-byte hex string>
JWT_REFRESH_SECRET=<64-byte hex string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
FRONTEND_URL=http://localhost:3000
ENABLE_CRON_JOBS=true         # false to disable scheduled tasks in dev

# Email — SMTP (optional, needed for email verification / password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=you@gmail.com
SMTP_FROM_NAME=Tyler's Laundry

# Cloudinary (optional, for profile image uploads)
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=

# Logging (optional)
LOG_LEVEL=info                # error | warn | info | http | debug
```

To generate new JWT secrets:
```bash
node -e "const c=require('crypto'); console.log(c.randomBytes(64).toString('hex'))"
```

---

## Getting Started

### 1. Install dependencies
```bash
yarn install
```

### 2. Configure environment
Fill in `MONGODB_URI` and `JWT_SECRET` / `JWT_REFRESH_SECRET` at minimum.

### 3. Sync indexes (run once, or after model changes)
```bash
yarn db:migrate
```

### 4. Seed initial data
```bash
yarn db:seed
```

> **Warning:** `db:seed` clears ALL existing data before inserting. Do not run in production unless intentional.

### 5. Start the server
```bash
yarn dev          # development — hot reload via nodemon
yarn build:start  # production — compile then run
```

---

## Scripts Reference

```bash
yarn dev          # Start with nodemon (hot reload)
yarn build        # Compile TypeScript to dist/
yarn build:start  # Build and run compiled output
yarn lint         # ESLint check
yarn lint:fix     # ESLint auto-fix
yarn format       # Prettier format
yarn clean        # Remove node_modules, dist, caches
yarn db:migrate   # Sync all Mongoose indexes to MongoDB
yarn db:seed      # Clear collections and insert seed data
```

---

## Database

### Collections (11 total)

| Collection | Description |
|---|---|
| `roles` | System and custom roles with permission arrays |
| `users` | User accounts with role reference and direct permissions |
| `services` | Laundry service types and pricing |
| `bookings` | Customer bookings linked to user + service |
| `payments` | Payment records linked to a booking |
| `invoices` | Invoice per payment with status tracking |
| `receipts` | Receipt per invoice confirming payment |
| `testimonials` | Customer reviews with approval workflow |
| `sessions` | Refresh token sessions (supports multiple devices) |
| `emailverifications` | Email verification codes (1 active per user) |
| `passwordresettokens` | Password reset tokens (1 active per user) |

### Document Relationships
```
Role ──< User ──< Booking ──── Payment ──── Invoice ──── Receipt
                        └──< Testimonial
User ──< Session
User ──── EmailVerification
User ──── PasswordResetToken
```

### Connection

The server calls `connectDB()` on startup (`src/index.ts`) and exits with a non-zero code if MongoDB is unreachable. The connection module (`src/lib/mongoose.ts`) exposes:

- `connectDB()` — connect with 5s timeout
- `disconnectDB()` — graceful disconnect
- `healthCheck()` — ping the cluster (used by health endpoint)

---

## Enums

Defined in `src/types/enums.ts` and used across models, services, validators, and controllers.

**BookingStatus**: `PENDING` | `IN_PROGRESS` | `COMPLETED` | `DELIVERED` | `CANCELLED`

**PaymentMethod**: `CASH` | `BANK` | `WAVE` | `APS` | `YONNA`

**PaymentStatus**: `PENDING` | `PAID` | `FAILED` | `REFUNDED`

**InvoiceStatus**: `UNPAID` | `PAID` | `CANCELLED` | `OVERDUE`

**UserType**: `USER` | `ADMIN` | `STAFF`

---

## Permissions

Permissions are stored as string arrays on both `Role` and `User` documents. Effective permissions = role permissions + any permissions assigned directly to the user.

| Group | Permissions |
|---|---|
| Users | `USER_VIEW/CREATE/UPDATE/DELETE`, `USER_CONFIRM_STAFF` |
| Profile | `PROFILE_VIEW_OWN`, `PROFILE_UPDATE_OWN` |
| Bookings | `BOOKING_VIEW_OWN/ALL`, `BOOKING_CREATE`, `BOOKING_CREATE_FOR_CLIENT`, `BOOKING_UPDATE/UPDATE_STATUS/DELETE` |
| Services | `SERVICE_VIEW/CREATE/UPDATE/DELETE` |
| Payments | `PAYMENT_VIEW_OWN/ALL`, `PAYMENT_CREATE/UPDATE/DELETE/PROCESS` |
| Invoices | `INVOICE_VIEW_OWN/ALL`, `INVOICE_CREATE/UPDATE/DELETE/GENERATE` |
| Receipts | `RECEIPT_VIEW_OWN/ALL`, `RECEIPT_CREATE/UPDATE/DELETE/GENERATE` |
| Testimonials | `TESTIMONIAL_VIEW/CREATE/UPDATE/DELETE/MANAGE` |
| Reports | `ANALYTICS_VIEW`, `REPORTS_VIEW/GENERATE/EXPORT` |
| PDF | `PDF_GENERATE_INVOICE/RECEIPT/REPORT` |
| Staff | `STAFF_MANAGE/VIEW/CREATE/UPDATE/DELETE` |
| Roles | `ROLE_VIEW/CREATE/UPDATE/DELETE`, `PERMISSION_ASSIGN` |
| Settings | `SETTINGS_UPDATE` |

---

## Seed Data

Running `yarn db:seed` creates the following data:

### Roles

| Name | Key Permissions |
|---|---|
| USER | Profile, own bookings, create booking, testimonials, view services |
| STAFF | All bookings, update status, view users, reports, PDF generation |
| ADMIN | All permissions |

### Users

| Name | Email | Password | Role |
|---|---|---|---|
| John Doe | john@example.com | Password123 | USER |
| Kiera Johnson | admin@tylers.com | Admin123 | ADMIN |
| Keoka Johnson | staff@tylers.com | Staff123 | STAFF |
| Awa Ceesay | awa@example.com | Password123 | USER |

### Services

| Name | Type | Price |
|---|---|---|
| Wash & Fold | wash-fold | D15.00 |
| Dry Cleaning | dry-clean | D25.00 |
| Ironing Service | ironing | D8.00 |
| Wash & Iron | wash-iron | D20.00 |

Also creates: 1 sample booking, 1 payment, 1 invoice, 1 receipt, and 3 testimonials.

---

## API Routes

All routes are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register customer account |
| POST | `/login` | Public | Login, returns access + refresh tokens |
| POST | `/logout` | Auth | Revoke current session |
| POST | `/refresh-token` | Public | Exchange refresh token |
| POST | `/verify-email` | Public | Verify email with code |
| POST | `/resend-verification` | Public | Resend verification email |
| POST | `/forgot-password` | Public | Request password reset |
| POST | `/reset-password` | Public | Reset password with token |
| GET | `/me` | Auth | Get current user profile |
| POST | `/register-admin` | Admin | Register admin account |
| POST | `/register-staff` | Admin | Register staff account |
| DELETE | `/soft-delete/:id` | Auth | Soft-delete account |
| PATCH | `/restore/:id` | Auth | Restore soft-deleted account |

### Bookings — `/api/bookings`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/schedule` | Auth | Customer schedules a pickup |
| GET | `/` | Admin/Staff | List all bookings |
| POST | `/` | Admin | Admin creates a booking |
| GET | `/my` | Auth | Customer's own bookings |
| GET | `/:id` | Auth | Get booking by ID |
| PATCH | `/:id` | Auth | Update booking |
| DELETE | `/:id` | Admin | Delete booking |
| PATCH | `/:id/status` | Staff/Admin | Update booking status |

### Services — `/api/services`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List all active services |
| POST | `/` | Admin | Create service |
| GET | `/:id` | Public | Get service |
| PATCH | `/:id` | Admin | Update service |
| DELETE | `/:id` | Admin | Delete service |

### Payments — `/api/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin/Staff | List all payments |
| POST | `/` | Auth | Create payment |
| GET | `/:id` | Auth | Get payment |
| PATCH | `/:id` | Admin | Update payment |
| DELETE | `/:id` | Admin | Delete payment |
| PATCH | `/:id/status` | Admin | Update payment status |

### Invoices — `/api/invoices`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin/Staff | List all invoices |
| POST | `/` | Admin | Create invoice |
| GET | `/overdue` | Admin/Staff | List overdue invoices |
| GET | `/stats` | Admin | Invoice statistics |
| GET | `/report` | Admin | Generate report (PDF/Excel) |
| GET | `/:id` | Auth | Get invoice |
| PATCH | `/:id` | Admin | Update invoice |
| DELETE | `/:id` | Admin | Delete invoice |
| GET | `/:id/pdf` | Auth | Generate invoice PDF |
| POST | `/:id/mark-paid` | Admin | Mark invoice as paid |

### Receipts — `/api/receipts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin/Staff | List all receipts |
| POST | `/` | Admin | Create receipt |
| GET | `/stats` | Admin | Receipt statistics |
| GET | `/report` | Admin | Generate report (PDF/Excel) |
| GET | `/:id` | Auth | Get receipt |
| PATCH | `/:id` | Admin | Update receipt |
| DELETE | `/:id` | Admin | Delete receipt |
| GET | `/:id/pdf` | Auth | Generate receipt PDF |

### Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List all users |
| GET | `/:id` | Admin | Get user |
| PATCH | `/:id` | Admin | Update user |
| DELETE | `/:id` | Admin | Delete user |
| PATCH | `/:id/role` | Admin | Update user role |

### Roles — `/api/roles`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List all roles |
| POST | `/` | Admin | Create role |
| GET | `/:id` | Admin | Get role |
| PATCH | `/:id` | Admin | Update role |
| DELETE | `/:id` | Admin | Delete role |
| POST | `/:id/permissions` | Admin | Assign permissions to role |
| POST | `/assign` | Admin | Assign role to user |
| GET | `/user/:userId/permissions` | Admin | Get user's effective permissions |
| POST | `/user/:userId/permissions` | Admin | Set user-level permissions |

### Admin — `/api/admin`

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List all users with filters |
| GET | `/staff` | List staff members |
| GET | `/customers` | List customers |
| GET | `/staff/:id` | Get staff member detail |
| GET | `/customers/:id` | Get customer detail |
| PATCH | `/users/:id/status` | Toggle user active status |
| DELETE | `/users/:id` | Delete user |

### Dashboards

| Prefix | Who | Description |
|---|---|---|
| `/api/dashboard/admin` | Admin | Platform-wide stats |
| `/api/dashboard/staff` | Staff | Operational stats |
| `/api/dashboard/customer` | Customer | Personal booking/invoice stats |

### Reporting — `/api/reports`

| Method | Path | Description |
|---|---|---|
| GET | `/overview` | Business overview stats |
| GET | `/bookings` | Booking analytics |
| GET | `/revenue` | Revenue analytics |
| GET | `/customers` | Customer analytics |

### Testimonials — `/api/testimonials`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List approved testimonials |
| POST | `/` | Auth | Create testimonial |
| GET | `/admin` | Admin | All testimonials (including unapproved) |
| GET | `/stats` | Admin | Testimonial statistics |
| GET | `/my` | Auth | Current user's testimonial |
| GET | `/:id` | Public | Get testimonial |
| PATCH | `/:id` | Auth | Update own testimonial |
| DELETE | `/:id` | Auth | Delete own testimonial |
| PATCH | `/:id/approve` | Admin | Approve testimonial |

### User Security — `/api/security`

| Method | Path | Description |
|---|---|---|
| POST | `/change-password` | Change own password |
| POST | `/setup-pin` | Set up PIN |
| POST | `/verify-pin` | Verify PIN |
| POST | `/enable-biometrics` | Enable biometric auth flag |

---

## Security

- **JWT**: Short-lived access tokens (15m) + long-lived refresh tokens (7d) stored in sessions collection
- **Rate Limiting**: Applied globally via express-rate-limit
- **Helmet**: Security headers on all responses
- **XSS Protection**: Custom middleware sanitizing request inputs
- **CORS**: Configured via `FRONTEND_URL` env variable
- **Password Hashing**: bcryptjs
- **Input Validation**: Zod schemas on all routes, validated before hitting business logic

---

## Deployment

1. Set all required environment variables (`MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`)
2. Set `NODE_ENV=production` and `ENABLE_CRON_JOBS=true`
3. Build and start:
```bash
yarn build
yarn build:start
```
