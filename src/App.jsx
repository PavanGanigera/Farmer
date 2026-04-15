import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CropPrices from './pages/CropPrices';
import PricePrediction from './pages/PricePrediction';
import FinanceTracker from './pages/FinanceTracker';
import Weather from './pages/Weather';
import LoansInsurance from './pages/LoansInsurance';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import DiseaseScanner from './pages/DiseaseScanner';

// Auth gate — shows login/register if not authenticated
function AuthGate() {
  // 'login' | 'register' | 'forgot'
  const [screen, setScreen] = useState('login');
  const { user } = useAuth();

  if (user) {
    // Authenticated — render the full app
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="prices" element={<CropPrices />} />
            <Route path="prediction" element={<PricePrediction />} />
            <Route path="finance" element={<FinanceTracker />} />
            <Route path="weather" element={<Weather />} />
            <Route path="finance-services" element={<LoansInsurance />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="scanner" element={<DiseaseScanner />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }

  // Not authenticated — render auth screens
  if (screen === 'register') return <Register onSwitch={() => setScreen('login')} />;
  if (screen === 'forgot')   return <ForgotPassword onBack={() => setScreen('login')} />;
  return <Login onSwitch={() => setScreen('register')} onForgot={() => setScreen('forgot')} />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Toaster position="top-right" />
        <AuthGate />
      </AuthProvider>
    </LanguageProvider>
  );
}
