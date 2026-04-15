import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const SESSION_KEY = 'agrismart_session';
const API_URL = 'http://localhost:5000/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  });

  const login = async (phone, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { phone, password });
      const sessionData = { ...res.data.user, token: res.data.token };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      setUser(sessionData);
      return sessionData;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed.');
    }
  };

  const register = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/register`, data);
      return res.data; // returns { message, otp }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const verifyOtp = async (phone, otp) => {
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { phone, otp });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'OTP verification failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  // Mocked for demo since no backend reset password endpoint was created yet
  const resetPassword = async (phone, newPassword) => {
    console.warn("Reset Password functionality on backend is not yet fully linked in the college project. Simulating success...");
    return true; 
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyOtp, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
