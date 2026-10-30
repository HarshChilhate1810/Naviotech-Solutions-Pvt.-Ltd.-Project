import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import { RootLayout } from './layouts/RootLayout';
import { AuthLayout } from './layouts/AuthLayout';

import { DashboardPage } from './pages/DashboardPage';
import { MoviesPage } from './pages/MoviesPage';
import { BooksPage } from './pages/BooksPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-navy-950">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route Guard (redirects already logged-in users away from login/register)
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-navy-950">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            
            {/* Authenticated Protected Routes with RootLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <RootLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/books" element={<BooksPage />} />
            </Route>

            {/* Public Authentication Routes with AuthLayout */}
            <Route
              element={
                <PublicOnlyRoute>
                  <AuthLayout />
                </PublicOnlyRoute>
              }
            >
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
