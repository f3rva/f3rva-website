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
├── components/          # Reusable React components
│   ├── Header.js       # Main navigation header
│   ├── Layout.js       # Site layout wrapper
│   └── *.css           # Component-specific styles
├── pages/              # Page-specific components
│   ├── Home.js         # Homepage content
│   └── *.css           # Page-specific styles
├── styles/             # Global styles and utilities
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Development Commands

### `npm start`
Runs the development server on [http://localhost:3000](http://localhost:3000).
The page will reload when you make changes.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
Creates an optimized build ready for deployment.

## Development Guidelines

This project follows the coding standards outlined in `CLAUDE.md`:
- Use descriptive, narrative variable and component names
- Provide adequate commenting to describe intent, not just implementation
- Follow React best practices and component patterns
- Use test-driven development approach when adding new features

## Technologies Used

- **React 19.1.1**: Frontend framework
- **Create React App**: Development toolchain
- **CSS3**: Styling with responsive design
- **React Testing Library**: Component testing

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the website

## Deployment

The application can be deployed to any static hosting service:
1. Build the production bundle: `npm run build`
2. Deploy the `build` folder contents to your hosting provider

## Contributing

When contributing to this project:
1. Follow the established component structure and naming conventions
2. Write tests for new components and features
3. Ensure responsive design across all device sizes
4. Use semantic HTML and accessibility best practices
