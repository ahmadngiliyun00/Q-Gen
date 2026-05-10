import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { user, isGuest } = useAuth();
  
  const isAuthenticated = user || isGuest;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-gray-900 font-sans selection:bg-[var(--color-accent)] selection:text-white">
      <Routes>
        <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}
