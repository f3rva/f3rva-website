# F3 RVA Website

A React-based website for F3 RVA (Fitness, Fellowship, Faith - Richmond, Virginia), 
built to serve the local F3 community with information about workouts, locations, 
and community events.

## About F3 RVA

F3 RVA is part of the national F3 movement, focused on building stronger men through:
- **Fitness**: Free, peer-led workouts held outdoors
- **Fellowship**: Building lasting relationships with like-minded men
- **Faith**: Growing spiritually and encouraging leadership development

## Project Structure

```
src/
├── components/          # Reusable React components (Header, Footer, ArchivePostCard, Pagination, etc.)
├── pages/               # Top-level route pages (Home, About, Schedule, Archives, NewGuy, NotFound)
├── hooks/               # Custom React hooks (useFetch, useWorkoutSchedule)
├── types/               # TypeScript interfaces and type definitions (WorkoutPost, etc.)
├── utils/               # Utility functions (dateUtils, postUtils, sanitizer, validation)
├── config/              # Application configuration
├── App.tsx              # Main application router and shell
└── index.tsx            # Application entry point
```

## Environment Configuration

The application connects to the **`f3rva-api`** backend service using Vite environment variables. See [`ENVIRONMENT.md`](./ENVIRONMENT.md) for full details.

### Available Variables
* **`VITE_API_BASE_URL`**: Base URL for all backend endpoints (schedule and archives).
  * **Local Dev Default**: `http://localhost:8000`
  * **Development / Staging**: `https://api.dev.f3rva.org`
  * **Production**: `https://api.f3rva.org`

### Local Development Overrides
To point your local dev server to a local API instance, create a `.env.development.local` file (ignored by Git):
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Development Commands

### `npm run dev` (or `npm start`)
Runs the Vite development server on [http://localhost:5173](http://localhost:5173).

### `npm test`
Runs the unit test suite once using Vitest.

### `npm run test:watch`
Launches the Vitest test runner in interactive watch mode.

### `npm run build:prod` (or `npm run build`)
Performs TypeScript type checking (`tsc`) and compiles an optimized production build to the `build` directory.

### `npm run lint`
Runs ESLint across the codebase.

## Development Guidelines

- Use strict TypeScript typing; avoid `any`.
- Use descriptive, narrative variable and component names.
- Provide comments that explain *intent* rather than obvious implementation details.
- Follow test-driven development (TDD) where possible using Vitest and React Testing Library.

## Technologies Used

- **React 19.x**: Frontend UI library
- **TypeScript**: Static typing
- **Vite 7.x**: Fast frontend build tool and dev server
- **React Router 7.x**: Client-side routing
- **Vitest & React Testing Library**: Component and unit testing
- **DOMPurify**: HTML sanitization for backblast content

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) to view the website

## Deployment

Automated CI/CD deployments are handled via GitHub Actions in `.github/workflows/deploy.yml`:
* Pushes to `main` deploy to the Development S3 / CloudFront environment (`https://dev.f3rva.org`).
* Published GitHub Releases deploy to Production (`https://f3rva.org`).

## Contributing

When contributing to this project:
1. Develop features in dedicated `feature/<feature-name>` branches and submit a PR for review.
2. Write unit tests for all new components and hooks.
3. Ensure all tests pass (`npm test`) and code passes linting (`npm run lint`).
4. Maintain responsive styling across desktop and mobile breakpoints.
