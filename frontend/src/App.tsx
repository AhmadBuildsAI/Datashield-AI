import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Scan from './components/Scan';
import DetectionResults from './components/DetectionResults';
import ScanHistory from './components/ScanHistory';
import Analytics from './components/Analytics';

const App: React.FC = () => (
  <BrowserRouter>
    <Toaster position="top-right" />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="scan" element={<Scan />} />
        <Route path="scan/:id" element={<DetectionResults />} />
        <Route path="history" element={<ScanHistory />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
