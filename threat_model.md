# Threat Model

## Project Overview

Legalit is a full-stack TypeScript law-firm website with a React/Vite frontend and an Express 5 backend backed by PostgreSQL via Drizzle ORM. The public site serves firm content, practice areas, professionals, offices, news, contact forms, newsletter signup, and a Gemini-powered chatbot. Authenticated internal users access an invite-only partner/admin area with CMS capabilities for professionals, news, translations, invites, and selected account-management actions.

Production assumptions for this scan:
- `NODE_ENV=production` in deployed environments.
- TLS is provided by the deployment platform and is not a code-level concern here.
- Mockup/sandbox-only surfaces are out of scope unless production reachability is shown.
- Dev scaffolding, tests, and helper scripts are lower priority unless they materially affect production deploys or runtime behavior.

## Assets

- **User accounts and sessions** -- admin, superadmin, and partner accounts; password hashes; session cookies; 2FA secrets; email login codes; password-reset tokens. Compromise enables impersonation and CMS or account takeover.
- **Private internal content-management capabilities** -- invite creation, role management, password resets, contact-message access, newsletter subscriber access, translations, conversation review, and content publication. Abuse impacts both confidentiality and site integrity.
- **Public site content and brand integrity** -- professional bios, articles, linked documents, office/contact details, SEO pages, and chatbot responses. Tampering here can deface the public site, distribute malware, or mislead clients.
- **Personal data** -- contact form submissions, newsletter emails, conversation logs, audit logs, staff emails/phone numbers, and applicant data. Exposure has legal and reputational impact.
- **Uploaded files and media** -- attached assets and object-storage documents/images referenced by public and admin flows. Incorrect exposure or trust decisions can leak data or deliver untrusted content.
- **Application secrets and third-party credentials** -- session secret, database URL, Brevo key, Gemini credentials, and object-storage credentials. Leakage would enable deeper compromise.

## Trust Boundaries

- **Browser to Express API** -- all client input is untrusted, including public forms, chatbot messages, newsletter input, authentication flows, admin CMS submissions, and uploaded-file metadata.
- **Authenticated to admin/superadmin boundaries** -- partner, admin, and superadmin roles have materially different privileges; enforcement must happen server-side on every sensitive route.
- **Express to PostgreSQL** -- the backend has broad database access; injection or authorization flaws at the API layer can expose or alter all stored content and account data.
- **Express to external services** -- the server calls Brevo, Gemini, MyMemory translation, LinkedIn pages, and object storage. User-controlled inputs crossing these boundaries create SSRF, data-leakage, and availability risk.
- **Express to object storage / local static assets** -- uploaded documents and images cross from trusted server logic into externally retrievable file-serving paths. Access control and content handling must remain explicit.
- **Development content bridge to production content** -- `server/dev_data.json` is a deploy-time content source according to `replit.md`; it is not a runtime public endpoint, but production content can inherit mistakes from that artifact.

## Scan Anchors

- **Production entry points:** `server/index.ts`, `server/auth.ts`, `server/routes.ts`, `server/static.ts`.
- **Highest-risk code areas:** auth/session/account recovery in `server/auth.ts`; public/admin REST endpoints in `server/routes.ts`; storage/file serving in `server/objectStorage.ts` and `server/objectAcl.ts`; outbound email in `server/email.ts`; client rich-content rendering in `client/src/components/ProfessionalModal.tsx` and related content components.
- **Public surfaces:** `/api/contact`, `/api/news*`, `/api/professionals*`, `/api/newsletter/*`, `/api/auto-translate`, `/api/chat`, SSR/SEO public pages, and object-serving routes.
- **Authenticated/admin surfaces:** invite management, professional/news/category CRUD, newsletter/contact/conversation admin views, upload endpoints, LinkedIn scrape endpoint, translation management, user management, password reset administration.
- **Usually ignore unless proven production-relevant:** `tests/`, `scripts/`, most one-off migration helpers, and false-positive “secret” hits in `server/dev_data.json` UUID content.

## Threat Categories

### Spoofing

This project relies on session cookies, invite tokens, password-reset tokens, email login codes, and optional TOTP-based 2FA. The system must ensure that only legitimate users can establish or continue authenticated sessions, and that recovery flows cannot be redirected, replayed, or poisoned. Account recovery and role-sensitive actions are especially important because admin users can alter public content and internal user access.

Required guarantees:
- Session cookies must remain unpredictable, server-validated, and bound to trustworthy origins.
- Password-reset and invite flows must generate absolute URLs from trusted configuration, not untrusted request headers.
- 2FA secrets, reset tokens, invite URLs, and other one-time credentials must not leak through logs or unnecessary API responses.

### Tampering

The public website is content-driven: professionals, articles, translations, and linked documents are all managed through admin-facing forms and then rendered to visitors. Any stored input accepted by the CMS can become a site-wide tampering vector if it is later rendered as HTML or used to steer downstream systems.

Required guarantees:
- Admin-managed rich text must be sanitized or rendered through a safe markdown/text pipeline before reaching the browser.
- Security controls such as CSRF protection must cover state-changing routes so an external site cannot coerce authenticated users into unwanted updates.
- The server must treat all client-supplied fields, including content metadata and file references, as untrusted until validated.

### Information Disclosure

The application stores and processes PII, privileged staff information, uploaded documents, chat transcripts, audit data, and internal account-management data. Disclosure can happen through missing authorization, overbroad logging, or public file-serving paths that bypass intended visibility controls.

Required guarantees:
- Object/file downloads must enforce any intended privacy policy before streaming content.
- API responses and logs must exclude secrets, one-time tokens, and unnecessary personal data.
- Admin-only data stores such as contacts, newsletter subscribers, audit trails, and conversations must remain server-side protected.

### Denial of Service

Several public endpoints perform work beyond simple CRUD, including chatbot prompts, translation requests, and email-sending flows; admin flows also trigger external fetches and uploads. Unbounded or weakly constrained requests could create third-party cost spikes or service degradation.

Required guarantees:
- Public and authentication endpoints must stay rate-limited and time-bounded.
- External fetches must use strict validation, timeouts, and bounded concurrency.
- Upload and content-processing routes must enforce size/type limits and avoid unbounded resource use.

### Elevation of Privilege

The core privilege boundaries are public visitor → authenticated partner → admin → superadmin. Regular admins can already change public content, so any flaw that lets a lower-privileged user execute actions in an admin or superadmin context, or lets a public attacker exploit an admin browser session, has high impact.

Required guarantees:
- Every state-changing or sensitive route must verify both authentication and the correct role server-side.
- Cross-origin requests must not be able to perform authenticated actions just because the browser carries a valid session cookie.
- Stored content, outbound fetches, and file access paths must not give attackers a bridge from public input to admin-only actions or internal resources.
- Password policy enforcement must be consistent across registration, reset, and administrative reset flows so weaker recovery paths cannot bypass the intended account-strength policy.

## Current Scan Calibration Notes

- Treat `/attached_assets` as a real production-facing file-serving surface, not a dev-only media folder. Anything committed there is internet-reachable when the directory exists at deploy time.
- Do not report `server/objectAcl.ts` or object-storage ACL scaffolding by itself unless a concrete production path proves private objects are actually exposed. In the current codebase, the confirmed disclosure issue is the public static `attached_assets` mount.
- Do not treat UUID-like values in `server/dev_data.json` as secret exposure by default; previous deterministic scans produced false positives there.
- Host-header-derived absolute URLs remain a sensitive review point anywhere the app sends password-reset or invite links, because the codebase otherwise already has a canonical `https://legalit.it` site URL for public links.
