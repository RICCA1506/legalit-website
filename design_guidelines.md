# Design Guidelines for Legalit Law Firm Website

## Design Approach

**Selected Approach:** Design System (Professional Services)
**Rationale:** Law firm requiring credibility, trust, and clear information hierarchy. Drawing from professional service standards with inspiration from firms like Baker McKenzie, Deloitte Legal, and modern legal platforms.

**Core Principles:**
- Professional credibility through refined typography and structured layouts
- Trust-building through clarity and accessibility
- Efficient information discovery across practice areas and services

---

## Typography

**Font Stack:**
- Primary: "Inter" or "Source Sans Pro" (body text, navigation, general content)
- Headings: "Playfair Display" or "Merriweather" (elegant serif for authority)
- Accent: Primary font in medium/semibold weights

**Hierarchy:**
- H1: 3xl to 5xl (hero headlines, page titles)
- H2: 2xl to 3xl (section headers)
- H3: xl to 2xl (subsection titles, practice area categories)
- Body: base to lg (readable 16-18px equivalent)
- Small: sm (metadata, footer links)

---

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Container margins: mx-auto with max-w-7xl
- Grid gaps: gap-6 to gap-8

**Grid Strategy:**
- Practice areas: 2-column on tablet, 4-column on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Professional profiles: 3-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Office locations: 2-column layout with map integration
- News articles: 3-column card grid

---

## Component Library

### Navigation
- Fixed header with logo left, navigation center/right
- Main nav items: Attività, Professionisti, Sedi, News, Contatti
- Mobile: Hamburger menu with slide-out drawer
- Sticky on scroll with subtle shadow

### Homepage Components
- **Hero Section:** Full-width with overlay treatment, headline "I tuoi diritti, il nostro impegno", dual CTAs ("aree di attività" and "contattaci")
- **Quick Links Grid:** 5-column grid showcasing main sections (Attività, Professionisti, Sedi, News, Contatti) with icons and labels
- **Values Sections:** Two-column alternating layout for "Qualità ed Efficienza" and "Trasparenza" with generous text spacing
- **News Preview:** 3-column card grid showing latest articles with "leggi TUTTE LE NEWS" CTA

### Practice Areas Page (Attività)
- Grid layout with 4 main categories as cards:
  - Diritto civile e commerciale
  - Diritto Penale  
  - Diritto del lavoro
  - Diritto Amministrativo
- Each card expandable or linking to detail view with bulleted sub-categories
- Clean list formatting with proper spacing between items

### Professionals Page
- Grid of lawyer profile cards with photo placeholder, name, title, specialization
- Filter/sort options by office location or practice area
- Individual profile modals or detail pages with bio, credentials, contact

### Office Locations Page (Sedi)
- Cards for each office: Roma, Milano, Venezia, Napoli, Palermo
- Include address, phone, email per location
- Embedded map or map integration for each office
- 2-column layout on desktop (location info + map)

### News Section
- Article cards with image placeholder, date, title, excerpt
- Date-based filtering or category tags
- "Nessun risultato" empty state with helpful navigation suggestions
- Pagination or load more functionality

### Contact Page (Contatti)
- Two-column split: Contact form (left) + Contact info/office quick links (right)
- Form fields: Name, Email, Phone, Subject, Message
- Display: Mail (info@legalit.it), Phone (06 3213911)
- Quick links to all office locations

### Footer
- Three-column layout:
  - Column 1: Contatti (email, phone, "contattaci" link)
  - Column 2: Sedi (all office city links)
  - Column 3: Social media icons (Facebook, X/Twitter, LinkedIn)
- Logo placement above or integrated
- Copyright and legal links at bottom

---

## Images

**Hero Section:** 
Professional legal imagery - modern office setting, scales of justice, or architectural elements conveying authority and trust. Full-width background with subtle overlay for text readability.

**Additional Images:**
- News article thumbnails (legal/business stock imagery)
- Office location photos (building exteriors or office interiors)
- Professional headshots for lawyer profiles (placeholder silhouettes acceptable)

**Image Treatment:**
- Hero: Full-width with 40-50% dark overlay for text contrast
- Cards: Aspect ratio 16:9 or 4:3 with subtle hover scale
- Profiles: Circular or rounded square headshots

---

## Animations

**Minimal Motion:**
- Navigation: Subtle underline on hover (0.2s ease)
- Cards: Gentle lift effect on hover (translateY(-4px), 0.3s ease)
- Buttons: Standard state transitions
- NO scroll-triggered animations or complex transitions

---

## Accessibility & Forms

- Form inputs: Consistent border styling, clear labels above fields, visible focus states
- Semantic HTML structure throughout
- ARIA labels for navigation and interactive elements
- Keyboard navigation support for all interactive components
- High contrast text (minimum WCAG AA compliance)

---

## Multi-Page Consistency

- Maintain identical header/footer across all pages
- Page title hierarchy: H1 for page name, followed by introduction paragraph
- Consistent container widths and spacing rhythm
- Unified card styling across News, Professionals, and Practice Areas
- Breadcrumb navigation where appropriate (especially for nested content)