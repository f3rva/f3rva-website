import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainSiteLayout from './components/Layout';
import GoogleAnalytics from './components/GoogleAnalytics';
import CookieConsent from './components/CookieConsent';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
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

// Lazy-loaded Big Data & Admin Route Components
const BigDataHub = lazy(() => import('./pages/BigData/BigDataHub'));
const AttendanceLeaderboard = lazy(() => import('./pages/BigData/Attendance/AttendanceLeaderboard'));
const DayOfWeekReport = lazy(() => import('./pages/BigData/Reports/DayOfWeekReport'));
const AOReport = lazy(() => import('./pages/BigData/AO/AOReport'));
const AODetail = lazy(() => import('./pages/BigData/AO/AODetail'));
const MemberDetail = lazy(() => import('./pages/BigData/Pax/MemberDetail'));
const WorkoutDetail = lazy(() => import('./pages/BigData/Workouts/WorkoutDetail'));
const ClaimAlias = lazy(() => import('./pages/BigData/SelfService/ClaimAlias'));
const AdminLogin = lazy(() => import('./pages/BigData/Admin/AdminLogin'));
const AdminAliasRequests = lazy(() => import('./pages/BigData/Admin/AdminAliasRequests'));
const AdminManagePax = lazy(() => import('./pages/BigData/Admin/AdminManagePax'));

import {
  PaxParamRedirect,
  AoParamRedirect,
  WorkoutParamRedirect,
  LegacyMemberQueryRedirect,
  LegacyAoQueryRedirect,
  LegacyWorkoutQueryRedirect,
} from './components/LegacyRedirects';

import './App.css';

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
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner message="Loading..." />
                  </div>
                }
              >
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


                {/* Shorthand / Direct Entity Parameter Links */}
                <Route path="/pax/:id" element={<PaxParamRedirect />} />
                <Route path="/member/:id" element={<PaxParamRedirect />} />
                <Route path="/ao/:id" element={<AoParamRedirect />} />
                <Route path="/workout/:id" element={<WorkoutParamRedirect />} />

                {/* Legacy PHP Query-Param Redirects (?id=123) */}
                <Route path="/member/detail.php" element={<LegacyMemberQueryRedirect />} />
                <Route path="/member/detail" element={<LegacyMemberQueryRedirect />} />
                <Route path="/bigdata/member/detail.php" element={<LegacyMemberQueryRedirect />} />
                <Route path="/bigdata/member/detail" element={<LegacyMemberQueryRedirect />} />

                <Route path="/ao/detail.php" element={<LegacyAoQueryRedirect />} />
                <Route path="/ao/detail" element={<LegacyAoQueryRedirect />} />
                <Route path="/bigdata/ao/detail.php" element={<LegacyAoQueryRedirect />} />
                <Route path="/bigdata/ao/detail" element={<LegacyAoQueryRedirect />} />

                <Route path="/workout/detail.php" element={<LegacyWorkoutQueryRedirect />} />
                <Route path="/workout/detail" element={<LegacyWorkoutQueryRedirect />} />
                <Route path="/bigdata/workout/detail.php" element={<LegacyWorkoutQueryRedirect />} />
                <Route path="/bigdata/workout/detail" element={<LegacyWorkoutQueryRedirect />} />

                {/* Legacy Report & Self-Service Page Redirects */}
                <Route path="/report/attendance.php" element={<Navigate to="/bigdata/attendance" replace />} />
                <Route path="/report/attendance" element={<Navigate to="/bigdata/attendance" replace />} />
                <Route path="/bigdata/report/attendance.php" element={<Navigate to="/bigdata/attendance" replace />} />
                <Route path="/bigdata/report/attendance" element={<Navigate to="/bigdata/attendance" replace />} />

                <Route path="/report/ao.php" element={<Navigate to="/bigdata/ao" replace />} />
                <Route path="/report/ao" element={<Navigate to="/bigdata/ao" replace />} />
                <Route path="/bigdata/report/ao.php" element={<Navigate to="/bigdata/ao" replace />} />
                <Route path="/bigdata/report/ao" element={<Navigate to="/bigdata/ao" replace />} />

                <Route path="/report/dayOfWeek.php" element={<Navigate to="/bigdata/day-of-week" replace />} />
                <Route path="/report/dayofweek.php" element={<Navigate to="/bigdata/day-of-week" replace />} />
                <Route path="/report/dayOfWeek" element={<Navigate to="/bigdata/day-of-week" replace />} />
                <Route path="/report/dayofweek" element={<Navigate to="/bigdata/day-of-week" replace />} />
                <Route path="/bigdata/report/dayOfWeek.php" element={<Navigate to="/bigdata/day-of-week" replace />} />
                <Route path="/bigdata/report/dayofweek.php" element={<Navigate to="/bigdata/day-of-week" replace />} />
                <Route path="/bigdata/report/dayOfWeek" element={<Navigate to="/bigdata/day-of-week" replace />} />
                <Route path="/bigdata/report/dayofweek" element={<Navigate to="/bigdata/day-of-week" replace />} />

                <Route path="/self-service/alias.php" element={<Navigate to="/bigdata/claim-alias" replace />} />
                <Route path="/self-service/alias" element={<Navigate to="/bigdata/claim-alias" replace />} />
                <Route path="/self-service" element={<Navigate to="/bigdata/claim-alias" replace />} />
                <Route path="/bigdata/self-service/alias.php" element={<Navigate to="/bigdata/claim-alias" replace />} />
                <Route path="/bigdata/self-service/alias" element={<Navigate to="/bigdata/claim-alias" replace />} />
                <Route path="/bigdata/self-service" element={<Navigate to="/bigdata/claim-alias" replace />} />
                <Route path="/bigdata/alias" element={<Navigate to="/bigdata/claim-alias" replace />} />
                <Route path="/claim-alias" element={<Navigate to="/bigdata/claim-alias" replace />} />

                {/* Legacy Admin & Auth Redirects */}
                <Route path="/admin/aliasRequests.php" element={<Navigate to="/bigdata/admin/alias-requests" replace />} />
                <Route path="/admin/aliasRequests" element={<Navigate to="/bigdata/admin/alias-requests" replace />} />
                <Route path="/admin/aliasrequests.php" element={<Navigate to="/bigdata/admin/alias-requests" replace />} />
                <Route path="/admin/aliasrequests" element={<Navigate to="/bigdata/admin/alias-requests" replace />} />
                <Route path="/admin/alias-requests" element={<Navigate to="/bigdata/admin/alias-requests" replace />} />
                <Route path="/bigdata/admin/aliasRequests.php" element={<Navigate to="/bigdata/admin/alias-requests" replace />} />
                <Route path="/bigdata/admin/aliasRequests" element={<Navigate to="/bigdata/admin/alias-requests" replace />} />

                <Route path="/admin/managePax.php" element={<Navigate to="/bigdata/admin/manage-pax" replace />} />
                <Route path="/admin/managePax" element={<Navigate to="/bigdata/admin/manage-pax" replace />} />
                <Route path="/admin/managepax.php" element={<Navigate to="/bigdata/admin/manage-pax" replace />} />
                <Route path="/admin/managepax" element={<Navigate to="/bigdata/admin/manage-pax" replace />} />
                <Route path="/admin/manage-pax" element={<Navigate to="/bigdata/admin/manage-pax" replace />} />
                <Route path="/bigdata/admin/managePax.php" element={<Navigate to="/bigdata/admin/manage-pax" replace />} />
                <Route path="/bigdata/admin/managePax" element={<Navigate to="/bigdata/admin/manage-pax" replace />} />

                <Route path="/login.php" element={<Navigate to="/bigdata/admin/login" replace />} />
                <Route path="/login" element={<Navigate to="/bigdata/admin/login" replace />} />
                <Route path="/admin/login.php" element={<Navigate to="/bigdata/admin/login" replace />} />
                <Route path="/logout.php" element={<Navigate to="/bigdata/admin/login" replace />} />
                <Route path="/logout" element={<Navigate to="/bigdata/admin/login" replace />} />

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
              </Suspense>
            </ErrorBoundary>
          </MainSiteLayout>
        </Router>
      </AuthProvider>
    </div>
  );
};

export default App;
