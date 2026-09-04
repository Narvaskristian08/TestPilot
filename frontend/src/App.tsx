import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { NoirDashboard } from './pages/NoirDashboard';
import { NoirTestRunPage } from './pages/NoirTestRunPage';
import { TestRunPage } from './pages/TestRunPage';
import { TestRunsPage } from './pages/TestRunsPage';
import { TestSuitesPage } from './pages/TestSuitesPage';
import { TestCasesPage } from './pages/TestCasesPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { EnvironmentsPage } from './pages/EnvironmentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ArtifactsPage } from './pages/ArtifactsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public entry point */}
          <Route path="/" element={<LandingPage />} />

          {/* NOIR Dashboard - Main Interface */}
          <Route path="/dashboard" element={<NoirDashboard />} />
          <Route path="/test/:id" element={<NoirTestRunPage />} />
          
          {/* NOIR Pages */}
          <Route path="/test-runs" element={<TestRunsPage />} />
          <Route path="/test-suites" element={<TestSuitesPage />} />
          <Route path="/test-cases" element={<TestCasesPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/environments" element={<EnvironmentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/artifacts" element={<ArtifactsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Classic Dashboard (Legacy) */}
          <Route path="/classic" element={<Dashboard />} />
          <Route path="/test-classic/:id" element={<TestRunPage />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
