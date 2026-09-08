import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ProjectForm from './pages/ProjectForm';
import Analytics from './pages/Analytics';
import CashFlow from './pages/CashFlow';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';

// Main App Layout for Protected Routes
const AppLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      
      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
        />

        <main
          className={`flex-1 transition-all duration-300 ease-in-out p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected App Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Projects />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            {/* Create Route */}
            <Route
              path="/projects/new"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <ProjectForm />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            {/* Dynamic Details Route */}
            <Route
              path="/projects/:id"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <ProjectDetails />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            {/* Dynamic Edit Route */}
            <Route
              path="/projects/:id/edit"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <ProjectForm />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Analytics />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cashflow"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <CashFlow />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Transactions />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Feedback />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            {/* Default Catch-All Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;