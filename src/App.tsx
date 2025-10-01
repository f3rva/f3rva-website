import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainSiteLayout from './components/Layout';
import GoogleAnalytics from './components/GoogleAnalytics';
import HomePage from './pages/Home/home';
import AboutPage from './pages/About/about';
import SchedulePage from './pages/Schedule/schedule';
import NewGuyPage from './pages/NewGuy/newGuy';
import Archives from './pages/Archives/Archives';
import YearArchives from './pages/Archives/YearArchives';
import MonthArchives from './pages/Archives/MonthArchives';
import DayArchives from './pages/Archives/DayArchives';
import ArchivePost from './pages/Archives/ArchivePost';
import NotFoundPage from './pages/NotFound/notFound';
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
        <GoogleAnalytics />
        <MainSiteLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/new-guy" element={<NewGuyPage />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/:year" element={<YearArchives />} />
            <Route path="/:year/:month" element={<MonthArchives />} />
            <Route path="/:year/:month/:day" element={<DayArchives />} />
            <Route path="/:year/:month/:day/:slug" element={<ArchivePost />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainSiteLayout>
      </Router>
    </div>
  );
};

export default App;
