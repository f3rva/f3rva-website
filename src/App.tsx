import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainSiteLayout from './components/Layout';
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import SchedulePage from './pages/Schedule';
import FriendlyNewGuyPage from './pages/FriendlyNewGuy';
import NotFoundPage from './pages/NotFound';
import './App.css';

/**
 * Main application component for F3 RVA website
 * Serves as the primary entry point and routing container
 * Orchestrates the overall application structure and navigation
 */
const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <MainSiteLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/friendly-new-guy" element={<FriendlyNewGuyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainSiteLayout>
      </Router>
    </div>
  );
};

export default App;
