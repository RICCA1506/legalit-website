# Legalit Law Firm Website

## Overview

Legalit is a professional law firm website designed for an Italian legal practice formed from the integration of independent law offices. This full-stack TypeScript project utilizes React for the frontend and Express for the backend, with a PostgreSQL database managed via Drizzle ORM. The platform serves as a comprehensive digital presence, showcasing practice areas, professional profiles, office locations, and legal news, while also facilitating contact and consultation requests.

Key capabilities include a News CMS where authenticated partners can manage articles, a secure invite-only authentication system for firm partners, and features like professional team directories with filtering and vCard downloads, and interactive office location maps. The project aims to establish a strong, credible online identity for Legalit, streamlining internal content management and enhancing client engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 and TypeScript, using Vite for development and bundling. Wouter provides lightweight client-side routing, and TailwindCSS, combined with custom design tokens, ensures a utility-first styling approach. The UI system leverages Radix UI primitives for accessibility and shadcn/ui (New York variant) for component styling. Animations are handled by Framer Motion for interactive elements and CSS-based scroll animations with Intersection Observer. A Three.js WebGL topographic background provides a dynamic visual experience with mouse interaction, complemented by Lenis for smooth site-wide scrolling. State management relies on TanStack React Query for server state and data fetching, React Hook Form with Zod for form validation, and custom React hooks for local and authentication state. The design system emphasizes a professional aesthetic with a custom color palette (deep blue and light blue) and DM Sans typography, implemented with a mobile-first responsive grid. Key pages include Home, Practice Areas, Professionals (with filtering and vCard download), Offices (with Google Maps integration), News (with modal detail views), Contact, and an Admin panel for content management.

### Backend Architecture

The backend utilizes Express.js with TypeScript, running on Node.js. It integrates custom email/password authentication using bcrypt for password hashing and PostgreSQL for session management. An invite-only registration system is implemented for new partners, with protected routes managed by an `isAuthenticated` middleware. The API is RESTful, with public routes for viewing content and protected routes for managing news, professionals, and invitations. Image uploads are handled via Replit Object Storage using presigned URLs. Static assets are served efficiently with caching strategies. An AI Chatbot powered by Google Gemini 2.0 Flash is integrated via a dedicated API endpoint, supporting conversation history and rate limiting. Transactional emails for contact forms, password resets, and invitations are sent via Brevo's API. The storage layer uses a `DatabaseStorage` class for CRUD operations on users, news articles, and professional profiles.

### Database Architecture

Drizzle ORM is used for type-safe database queries against a PostgreSQL database. The schema-first approach infers TypeScript types from Drizzle schema definitions, with Zod integration for runtime validation. Key tables include `sessions` for authentication, `users` for partner accounts, and `news_articles` for CMS content. Database connections use the Node-postgres driver with pooling and environment-based configuration via `DATABASE_URL`.

### Data Synchronization (DB ↔ dev_data.json)

The project uses a bidirectional data sync mechanism between the PostgreSQL database and `server/dev_data.json`:

- **Dev → dev_data.json (auto-export):** In development, every admin CRUD operation on professionals, news articles, and categories automatically exports the full DB state to `dev_data.json` via `exportDbToDevData()`. This also runs on server startup in dev mode. This ensures dev_data.json is always up-to-date with the latest admin changes (order, photos, bios, titles, etc.).

- **dev_data.json → Production DB (auto-import):** On every production deploy/startup, `seedAdminUser()` calls `syncDevDataToCurrentDb()` which upserts all data from dev_data.json into the production DB. The upsert uses `ON CONFLICT DO UPDATE` for all important fields (professionals: bio, image, order, title, role, etc.; news: all content fields; categories: all fields).

- **Important:** `dev_data.json` is the bridge between dev and production. Never edit it manually — it's auto-generated from the dev DB. Users array is preserved (contains hashed passwords).

### Module Structure

The project is organized into `client/` (UI components, pages, utilities, hooks), `server/` (Express app, routes, storage, authentication, database connection), `shared/` (database schema definitions, type exports), and `script/` (build orchestration).

### Security Features

The application incorporates rate limiting for login, registration, and invite verification. Invite tokens are securely hashed and have a 48-hour expiration. Password policies enforce strong requirements with bcrypt hashing. Session security includes httpOnly, sameSite, and secure cookies, server-side inactivity timeouts, client-side auto-logout, Helmet middleware with CSP, HSTS, and referrer policies. Audit logging tracks security-sensitive actions, and an obscured admin path (`/area-riservata`) enhances security through obscurity.

A site-wide password gate (`SITE_PASSWORD` env var) protects the entire site from public access. When set, all visitors see a password prompt page (`server/site-gate.html`) and must enter the correct password to access the site. The gate uses session-based access tracking. To disable the gate and make the site public, remove the `SITE_PASSWORD` environment variable.

## External Dependencies

**Core Runtime:** Node.js, TypeScript.
**Authentication:** `openid-client`, `passport`, `express-session`, `connect-pg-simple`, `memoizee`, `bcrypt`, `otplib`.
**UI & Styling:** TailwindCSS, PostCSS, Radix UI, Framer Motion, React Icons, Lucide React, `clsx`, `tailwind-merge`, `class-variance-authority`.
**Data & Forms:** TanStack React Query, React Hook Form, Zod, `@hookform/resolvers`.
**Database:** `pg` (node-postgres), Drizzle ORM, Drizzle Kit.
**Development Tools:** Vite, `tsx`, `esbuild`.
**Utilities:** `date-fns`.
**External Services:** Google Gemini 2.0 Flash (AI Chatbot), Brevo (Email Service), Replit Object Storage.
**Localization:** Italian localization for all content.