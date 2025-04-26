import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

// Create a single axios instance pointing at your backend
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + '/api',
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);    // optional: show spinner while we check /me
  const navigate = useNavigate();

  // Set the token on our axios instance
  const setToken = token => {
    if (token) {
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem('report-it-token', token);
    } else {
      delete API.defaults.headers.common.Authorization;
      localStorage.removeItem('report-it-token');
    }
  };

  // On mount: load user + token from localStorage, validate with /me
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('report-it-user'));
    const savedToken = localStorage.getItem('report-it-token');
    if (savedUser && savedToken) {
      setToken(savedToken);
      API.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          // token expired or invalid
          setUser(null);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login: hit /auth/login, store user + token
// … inside AuthProvider …
const login = async (email, password) => {
  try {
    const { data } = await API.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('report-it-user', JSON.stringify(data.user));
    navigate('/dashboard');
  } catch (err) {
    // Grab the server‐sent msg (or default)
    const msg = err.response?.data?.msg || 'Login failed';
    throw new Error(msg);
  }
};


  // Signup: hit /auth/signup
  const signup = async info => {
    await API.post('/auth/signup', info);
    navigate('/login');
  };

  // Logout: hit /auth/logout, clear everything
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.warn('Logout failed:', err);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('report-it-user');
    navigate('/login');
  };

  // Expose context values
  const value = { user, login, signup, logout, loading };

  // While checking token on load, hold off rendering children
  if (loading) return <div className="flex items-center justify-center h-screen">Loading…</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Add this export at the bottom of AuthContext.jsx
export { API };
