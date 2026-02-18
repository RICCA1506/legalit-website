# Legalit Law Firm Website

## Overview

This is a professional law firm website for Legalit, an Italian legal practice formed from the integration of independent law offices. The application is built as a full-stack TypeScript project using React for the frontend and Express for the backend, with a PostgreSQL database managed through Drizzle ORM.

The website serves as a digital presence for the firm, showcasing their practice areas, professional team, office locations, and legal news while providing contact and consultation request functionality.

**News CMS**: Partners can log in with email/password to create, edit, and delete news articles. Regular visitors can only view published content.

**Authentication**: Invite-only email/password system for law firm partners. The first admin account is seeded with email `admin@legalit.it` and password `LEG2026!`. Partners can invite other partners from the Admin panel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TailwindCSS for utility-first styling with custom design tokens

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York variant) with custom theming
- Framer Motion for header/menu animations and RevealText component (entrance + color sweep)
- Three.js WebGL topographic background (TopographicBackground.tsx) with GLSL shaders, mouse ripple interaction, and graceful fallback
- Lenis for smooth scrolling site-wide (pauses during hero intro, resumes after)
- CSS-based scroll animations using Intersection Observer (AnimatedElement component)
- Hero parallax effect using Framer Motion useScroll/useTransform (background moves slower on scroll)

**State Management**
- TanStack React Query for server state management and data fetching
- React Hook Form with Zod for form validation and type safety
- Local component state using React hooks
- useAuth hook for authentication state

**Design System**
- Professional services aesthetic targeting trust and credibility
- Custom color palette: Primary (#08396B - deep blue), Accent (#7eb8e5 - light blue)
- Typography: DM Sans for body text, with professional hierarchy
- Spacing based on Tailwind's scale (4, 6, 8, 12, 16, 20, 24)
- Responsive grid layouts: mobile-first approach with breakpoints at md and lg

**Key Pages & Components**
- Home: Hero section, stats counter, values showcase, professional previews, news
- Attività (Practice Areas): Legal service categories with expandable details
- Professionisti (Professionals): Team directory with advanced filtering by role, office, practice area, and name search. Includes vCard download functionality for each professional.
- Sedi (Offices): Office locations with embedded Google Maps
- News: Article listing with modal detail views (fetches from database)
- Contatti (Contact): Contact form with office information
- Admin (/area-riservata): Protected page for partners to manage news articles (obscured URL for security)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for HTTP server
- Node.js HTTP server for basic web serving
- Development mode uses Vite middleware for hot module replacement
- Production mode serves static files from dist/public

**Authentication**
- Custom email/password authentication (auth.ts) with browser saved password support (autocomplete attributes)
- bcrypt for secure password hashing
- Session management with PostgreSQL session store (connect-pg-simple)
- Invite-only registration for new partners (email invites required)
- Protected routes use isAuthenticated middleware
- Two-factor authentication (2FA) with TOTP support via otplib
- Password reset via email (forgot password flow with token-based reset)

**API Design**
- RESTful API structure (prefix: /api)
- Public routes: GET /api/news, GET /api/professionals, GET /objects/:objectPath
- Protected routes: POST/PATCH/DELETE /api/news, /api/professionals, /api/invites, /api/professionals/seed, /api/upload (require authentication)
- Auth routes: POST /api/auth/login, POST /api/auth/register, POST /api/auth/logout, GET /api/auth/user, GET /api/auth/verify-invite/:token, POST /api/auth/forgot-password, GET /api/auth/verify-reset/:token, POST /api/auth/reset-password

**Image Upload**
- Uses Replit Object Storage with presigned URLs
- POST /api/upload returns presigned upload URL and object path
- Images served via /objects/:objectPath route
- Frontend uses drag-and-drop ImageUpload component

**AI Chatbot (Gemini)**
- POST /api/chat endpoint using Google Gemini 2.0 Flash
- @google/generative-ai SDK, temperature 0.3, maxOutputTokens 1024
- Empty systemInstruction variable ready for custom training prompt
- Conversation history maintained client-side and sent with each request
- Rate limited: 20 messages per minute per IP
- Frontend: ChatWidget.tsx floating button (bottom-right), slide-up chat window
- GEMINI_API_KEY stored as Replit secret

**Email Service (Brevo)**
- Transactional email delivery via Brevo REST API (server/email.ts)
- Contact form emails routed by subject: info@legalit.it (default), amministrazione@legalit.it (admin queries), recruitment@legalit.it (job applications)
- Job application emails sent to recruitment@legalit.it
- Sender: noreply@legalit.it via Brevo SMTP relay
- BREVO_API_KEY stored as Replit secret
- 300 emails/day on Brevo free tier

**Storage Layer**
- DatabaseStorage class implementing IStorage interface
- User operations for Replit Auth (getUser, upsertUser)
- News article CRUD operations
- Professional CRUD operations with seed functionality

**Build System**
- esbuild for server bundling with dependency allowlisting
- Bundled dependencies reduce filesystem syscalls for faster cold starts
- Separate client and server build processes
- TypeScript compilation checking via tsc

**Automatic Schema Sync**
- server/migrate.ts runs ensureSchema() at server startup (before seed and routes)
- Creates all tables with CREATE TABLE IF NOT EXISTS
- Adds missing columns with ALTER TABLE ADD COLUMN IF NOT EXISTS pattern
- Ensures production database schema matches development automatically on every deploy
- No manual db:push needed for production schema updates

### Database Architecture

**ORM & Schema Management**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the target database (via pg package)
- Schema-first approach with TypeScript types inferred from Drizzle schema
- Zod integration for runtime validation via drizzle-zod

**Database Schema**
- sessions: sid, sess (jsonb), expire - for Replit Auth sessions
- users: id (varchar), email, firstName, lastName, profileImageUrl, createdAt, updatedAt
- news_articles: id (serial), title, content, excerpt, category, imageUrl, readTime, authorId, authorName, createdAt, updatedAt

**Connection Strategy**
- Node-postgres (pg) driver with connection pooling
- Environment-based configuration via DATABASE_URL

### Module Structure

**Client Directory** (`client/`)
- `/src/components`: Reusable UI components and composite sections
- `/src/pages`: Route-level page components (Home, News, Admin, etc.)
- `/src/lib`: Utilities, data fixtures, animation configs, query client
- `/src/hooks`: Custom React hooks (useAuth, use-toast, etc.)
- `index.html`: SPA entry point with Italian language and metadata

**Server Directory** (`server/`)
- `index.ts`: Express application setup and middleware
- `routes.ts`: API route registration with auth and news endpoints
- `storage.ts`: Database storage class with CRUD operations
- `replitAuth.ts`: Replit Auth configuration and middleware
- `db.ts`: Drizzle ORM database connection
- `static.ts`: Static file serving for production
- `vite.ts`: Vite development middleware integration

**Shared Directory** (`shared/`)
- `schema.ts`: Database schema definitions (users, sessions, newsArticles)
- Type exports for cross-boundary data contracts

**Build Scripts** (`script/`)
- `build.ts`: Production build orchestration for both client and server

## External Dependencies

**Core Runtime**
- Node.js runtime with ES modules
- TypeScript for static typing across the entire stack

**Authentication**
- openid-client for OIDC integration
- passport for authentication middleware
- express-session for session management
- connect-pg-simple for PostgreSQL session store
- memoizee for OIDC config caching

**UI & Styling**
- TailwindCSS with PostCSS for CSS processing
- Radix UI component primitives (20+ component packages)
- Framer Motion for animations
- React Icons (Simple Icons) for social media icons
- Lucide React for general iconography

**Data & Forms**
- TanStack React Query v5 for data fetching and caching
- React Hook Form for form state management
- Zod for schema validation
- @hookform/resolvers for Zod integration

**Database**
- pg (node-postgres) for PostgreSQL connections
- Drizzle ORM v0.39+ for database access
- Drizzle Kit for migrations and schema management

**Development Tools**
- Vite plugins: Replit runtime error overlay, cartographer, dev banner
- tsx for TypeScript execution in development
- esbuild for production bundling

**Utilities**
- date-fns for date manipulation
- clsx and tailwind-merge for className composition
- class-variance-authority for component variant management

**Asset Management**
- Branding configurations stored as JSON in attached_assets/
- Design templates and animation configurations in attached_assets/
- Static images referenced from attached_assets/ directory
- Vite alias (@assets) for asset imports

**Italian Localization**
- All content in Italian language
- Italian date/time formatting considerations
- Meta tags optimized for Italian search engines

## Authentication Flow

1. User clicks "Accedi" in header
2. Redirect to /login page with email/password form
3. User enters credentials and submits
4. POST to /api/auth/login validates credentials and creates session
5. useAuth hook fetches /api/auth/user to get current user
6. Protected pages (Admin) check isAuthenticated before rendering
7. Logout via /api/auth/logout clears session and redirects to home

## Partner Invitation Flow

1. Admin/Partner logs in and navigates to /area-riservata
2. Click "Invita Partner" tab in admin panel
3. Enter new partner's email and click "Invita"
4. Copy invite URL and share with new partner
5. New partner visits invite URL (/registrazione?token=xxx)
6. Partner fills registration form (name, password)
7. POST to /api/auth/register validates token and creates account

## News CMS Workflow

1. Partner logs in via header "Accedi" button
2. Navigate to /area-riservata or click "Gestisci News" button on News page
3. Create new article: click "Nuovo Articolo", fill form, publish
4. Edit article: click "Modifica" on article card
5. Delete article: click "Elimina" and confirm
6. Articles appear immediately on public /news page

## Security Features

**Rate Limiting**
- Login: 5 attempts per 15 minutes per IP
- Registration: 5 attempts per 15 minutes per IP
- Invite verification: 20 attempts per 15 minutes per IP

**Token Security**
- Invite tokens hashed with SHA-256 before storage (token_hash column)
- Plaintext token only sent in invite URL, never stored
- hashToken() utility in server/storage.ts
- Invite tokens expire after 48 hours

**Password Policy**
- Minimum 12 characters, must include uppercase, lowercase, number, and special character
- bcrypt cost factor 12 (BCRYPT_ROUNDS constant in auth.ts)
- Frontend validation in Registrazione.tsx matches backend requirements

**Session Security**
- Cookie name: "legalit.sid" (httpOnly, sameSite=lax, secure in production)
- Server-side 30-minute inactivity timeout (checks lastActivity timestamp)
- Client-side 30-minute inactivity auto-logout (useAuth hook monitors mouse/key/scroll/touch events)
- Helmet middleware with full CSP in production (scripts, styles, fonts, images, connect, frames whitelisted)
- HSTS enabled in production (1 year max-age)
- API responses always set no-store/no-cache headers
- Referrer-Policy: strict-origin-when-cross-origin
- X-Frame-Options: SAMEORIGIN in both dev and prod

**LinkedIn Sharing**
- News articles have Open Graph meta tags served to crawlers via server-side route
- Admin panel has "Copia Link" and "LinkedIn" share buttons on each article
- Articles support optional linkedinSummary field for pre-drafted LinkedIn post text
- Deep-linking: /news?article=ID auto-opens the article modal

**Audit Logging**
- audit_logs table tracks: login_success, login_failed, registration_success, registration_failed, invite_created
- Logs include: actor_id, actor_email, target_email, ip_address, user_agent, details, success flag
- Security alert logged when >10 failed login attempts per email within 1 hour

**Shared Access Model**
- All authenticated partners can manage all content (news, professionals)
- No ownership restrictions - collaborative content management
- Author information (authorId, authorName) is immutable after article creation

**Route Obscurity**
- Admin panel at /area-riservata instead of obvious /admin path
- Unauthenticated access silently redirects to /login

**Data Centralization**
- Office locations (Roma, Milano, Palermo, Napoli, Latina) centralized in client/src/lib/data.ts
- Venezia office has been removed
- Latina office added: Viale Le Corbusier scala A, Tel. 0773.621157, latina@legalit.it
- Consistent across Admin, Footer, Professionisti, and Sedi pages
