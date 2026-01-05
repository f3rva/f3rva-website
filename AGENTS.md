# Agent Instructions for F3 RVA Website

This file contains instructions for AI agents (and human developers) working on this repository.

## Project Overview
This is a React 19 application built with TypeScript and Vite. It serves as the static website for F3 RVA (Fitness, Fellowship, Faith - Richmond, VA).

## Tech Stack
- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Testing:** Vitest, React Testing Library
- **Routing:** React Router 7
- **Styling:** CSS
- **Linting:** ESLint

## Development Guidelines

### Code Style
- **TypeScript:** Use strict typing. Avoid `any` whenever possible. Define interfaces for props and state.
- **Components:** Use functional components with Hooks.
- **Naming:** Use descriptive, narrative variable and component names (e.g., `userAuthenticationStatus` instead of `auth`).
- **Comments:** Comment on the *intent* of complex logic, not just what the code does.

### Testing
- **Framework:** Use `vitest` and `@testing-library/react`.
- **Approach:** Follow Test-Driven Development (TDD) where possible.
- **Running Tests:** `npm test` runs tests in watch mode.
- **Test Location:** Co-located with components or in `__tests__` directories.

### Directory Structure
- `src/components`: Reusable UI components.
- `src/pages`: Top-level page components.
- `src/data`: Static data files.
- `src/config`: Configuration files.
- `src/types`: Shared TypeScript type definitions.
- `src/utils`: Utility functions.
- `public/`: Static assets and robots.txt templates.
- `scripts/`: Build and utility scripts.

### Build & Deployment
- **Dev Server:** `npm run dev` (automatically sets up development robots.txt).
- **Build:** `npm run build` (runs TypeScript compiler then Vite build).
- **Environment:**
  - `dev`: Blocks search crawlers.
  - `prod`: Allows search crawlers.

### Robots.txt Handling
**IMPORTANT:** Do not edit `public/robots.txt` directly. It is auto-generated.
- To modify development rules: Edit `public/robots-dev.txt`.
- To modify production rules: Edit `public/robots-prod.txt`.
- The build process and `scripts/setup-robots.js` handle the generation.

## Common Tasks

### Adding a New Page
1. Create the component in `src/pages`.
2. Add the route in `src/App.tsx`.
3. Add a test file for the new page.

### Modifying Global Styles
- Check `src/index.css` or `src/App.css` for global styles.
- Use component-specific CSS or CSS modules for scoped styling if available.

## Legacy Notes
- Ignore instructions in `CLAUDE.md` regarding AWS boto3 or Jupyter notebooks; these are not present in this repository.
