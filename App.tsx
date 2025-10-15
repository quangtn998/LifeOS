import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LearnPage from './pages/LearnPage';
import LifeCompassPage from './pages/vision/LifeCompassPage';
import FutureSketchPage from './pages/vision/FutureSketchPage';
import QuarterlyQuestsPage from './pages/vision/QuarterlyQuestsPage';
import FocusTimerPage from './pages/action/FocusTimerPage';
import DailyPlanPage from './pages/action/DailyPlanPage';
import WeeklyPlanPage from './pages/action/WeeklyPlanPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const AppLayout: React.FC = () => (
  <div className="flex h-screen bg-gray-900 text-white">
    <Sidebar />
    <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/vision/life-compass" element={<LifeCompassPage />} />
              <Route path="/vision/future-sketch" element={<FutureSketchPage />} />
              <Route path="/vision/quarterly-quests" element={<QuarterlyQuestsPage />} />
              <Route path="/action/focus-timer" element={<FocusTimerPage />} />
              <Route path="/action/daily-plan" element={<DailyPlanPage />} />
              <Route path="/action/weekly-plan" element={<WeeklyPlanPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;