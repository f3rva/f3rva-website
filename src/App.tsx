import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import MainSiteLayout from './components/Layout';
import GoogleAnalytics from './components/GoogleAnalytics';
import CookieConsent from './components/CookieConsent';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';

import HomePage from './pages/Home/home';
import AboutPage from './pages/About/about';
import SchedulePage from './pages/Schedule/schedule';
import NewGuyPage from './pages/NewGuy/newGuy';
import Archives from './pages/Archives/Archives';
import YearArchives from './pages/Archives/YearArchives';
import MonthArchives from './pages/Archives/MonthArchives';
import DayArchives from './pages/Archives/DayArchives';
import ArchivePost from './pages/Archives/ArchivePost';
import AOArchives from './pages/Archives/AOArchives';
import NotFoundPage from './pages/NotFound/notFound';

import BigDataHub from './pages/BigData/BigDataHub';
import AttendanceLeaderboard from './pages/BigData/Attendance/AttendanceLeaderboard';
import DayOfWeekReport from './pages/BigData/Reports/DayOfWeekReport';
import AOReport from './pages/BigData/AO/AOReport';
import AODetail from './pages/BigData/AO/AODetail';
import MemberDetail from './pages/BigData/Pax/MemberDetail';
import WorkoutDetail from './pages/BigData/Workouts/WorkoutDetail';
import ClaimAlias from './pages/BigData/SelfService/ClaimAlias';
import AdminLogin from './pages/BigData/Admin/AdminLogin';
import AdminAliasRequests from './pages/BigData/Admin/AdminAliasRequests';
import AdminManagePax from './pages/BigData/Admin/AdminManagePax';

import './App.css';

/**
 * Route parameter redirect helper for legacy / shorthand URLs
 */
const PaxRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/bigdata/pax/${id}`} replace />;
};

const AoRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/bigdata/ao/${id}`} replace />;
};

/**
 * Main application component for F3 RVA website
 * Serves as the primary entry point and routing container
 * Orchestrates the overall application structure, auth context, and navigation
 */
const App: React.FC = () => {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <GoogleAnalytics />
          <CookieConsent />
          <MainSiteLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/new-guy" element={<NewGuyPage />} />
              <Route path="/archives" element={<Archives />} />
              <Route path="/archives/ao/:ao" element={<AOArchives />} />

              {/* Big Data Public Routes */}
              <Route path="/bigdata" element={<BigDataHub />} />
              <Route path="/bigdata/workouts" element={<Navigate to="/bigdata" replace />} />
              <Route path="/bigdata/attendance" element={<AttendanceLeaderboard />} />
              <Route path="/bigdata/day-of-week" element={<DayOfWeekReport />} />
              <Route path="/bigdata/ao" element={<AOReport />} />
              <Route path="/bigdata/ao/:id" element={<AODetail />} />
              <Route path="/bigdata/pax/:id" element={<MemberDetail />} />
              <Route path="/bigdata/workout/:id" element={<WorkoutDetail />} />
              <Route path="/bigdata/claim-alias" element={<ClaimAlias />} />


              {/* Shorthand / Direct Entity Links */}
              <Route path="/pax/:id" element={<PaxRedirect />} />
              <Route path="/member/:id" element={<PaxRedirect />} />
              <Route path="/ao/:id" element={<AoRedirect />} />

              {/* Big Data Admin Routes */}
              <Route path="/bigdata/admin/login" element={<AdminLogin />} />
              <Route
                path="/bigdata/admin"
                element={
                  <AdminRoute>
                    <AdminAliasRequests />
                  </AdminRoute>
                }
              />
              <Route
                path="/bigdata/admin/alias-requests"
                element={
                  <AdminRoute>
                    <AdminAliasRequests />
                  </AdminRoute>
                }
              />
              <Route
                path="/bigdata/admin/manage-pax"
                element={
                  <AdminRoute>
                    <AdminManagePax />
                  </AdminRoute>
                }
              />

              {/* Archive Date Hierarchy */}
              <Route path="/:year" element={<YearArchives />} />
              <Route path="/:year/:month" element={<MonthArchives />} />
              <Route path="/:year/:month/:day" element={<DayArchives />} />
              <Route path="/:year/:month/:day/:slug" element={<ArchivePost />} />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MainSiteLayout>
        </Router>
      </AuthProvider>
    </div>
  );
};

export default App;
