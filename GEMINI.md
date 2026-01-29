# Gemini Agent Instructions for F3 RVA Website

This document provides comprehensive instructions, architectural context, and best practices for the F3 RVA website project.

## 1. Project Overview

**F3 RVA Website** is a static web application built to serve the F3 RVA community (Fitness, Fellowship, Faith - Richmond, VA). It provides information about workouts, schedules, and community events.

## 2. Technology Stack

- **Core Framework:** React 19.x
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router 7.x
- **Testing:** Vitest, React Testing Library
- **Styling:** Standard CSS (Component-scoped files preferred)
- **Linting:** ESLint

## 3. Project Structure

```text
src/
├── components/          # Reusable UI components (buttons, layout, etc.)
├── pages/               # Top-level route components (Home, About, Schedule, etc.)
├── data/                # Static data files (e.g., workout schedules, archive data)
├── config/              # Configuration files
├── types/               # TypeScript type definitions
├── utils/               # Helper functions and utilities
├── App.tsx              # Main application component and routing setup
├── index.tsx            # Application entry point
public/                  # Static assets (images, manifests)
scripts/                 # Build and maintenance scripts (sitemap, robots.txt)
```

## 4. Development Workflow

### Commands
- **Start Development Server:** `npm run dev` (Runs on localhost, auto-configures dev robots.txt)
- **Run Tests:** `npm test` (Runs Vitest in watch mode)
- **Run Tests (Once):** `npm run test:run` (or `vitest run`)
- **Build for Production:** `npm run build:prod` (Type-checks and builds optimized assets)
- **Lint Code:** `npm run lint`

### Critical Workflow Rules

1.  **Robots.txt Management:**
    *   **NEVER** edit `public/robots.txt` directly.
    *   Edit `public/robots-dev.txt` for development/staging rules.
    *   Edit `public/robots-prod.txt` for production rules.
    *   The build scripts automatically copy the correct file to `robots.txt`.

2.  **Strict TypeScript:**
    *   Maintain strict typing. Avoid `any`.
    *   Define interfaces/types in `src/types/` or co-located with components if highly specific.

3.  **Testing Standards:**
    *   Write tests for all new components and logic.
    *   Use `screen` from `@testing-library/react` for querying elements.
    *   Prioritize user-centric tests (e.g., finding elements by role or text).

## 5. Coding Conventions

- **Component Style:** Functional components with React Hooks.
- **Naming:**
    - Components: PascalCase (e.g., `WorkoutCard.tsx`).
    - Functions/Variables: camelCase.
    - **Descriptive Naming:** Use narrative names that describe *what* the variable represents (e.g., `isMenuOpen` vs `open`).
- **File Organization:**
    - Co-locate styles and tests with the component (e.g., `Header.tsx`, `Header.css`, `Header.test.tsx` in the same folder).
- **Comments:** Focus on *intent* ("Why are we doing this?") rather than implementation details ("What is this code doing?").

## 6. Key Configuration Files

- `vite.config.ts`: Vite build configuration.
- `tsconfig.json`: TypeScript compiler options.
- `eslint.config.js`: Linting rules.
- `.env.*`: Environment variables (API endpoints, feature flags).

## 7. Common Tasks

### Adding a New Page
1.  Create a new folder in `src/pages/` (e.g., `src/pages/Events/`).
2.  Create the component file (e.g., `Events.tsx`) and its CSS/Test files.
3.  Register the new route in `src/App.tsx`.
4.  Add a navigation link in `src/components/Header.tsx` if needed.

### Updating Workout Data
1.  Navigate to `src/data/` or `src/pages/Schedule/workoutData.json`.
2.  Update the static JSON/TS structure.
3.  Verify changes on the Schedule page.
