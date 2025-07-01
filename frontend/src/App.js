

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Login from './Components/wholesaler/Login';
import WholesalerRegister from './Components/wholesaler/register';
import WholesalerDashboard from './Components/wholesaler/WholeSalerDashboard';

export default function App() {
  const [user, setUser] = useState(null);

  // On app load, check localStorage for token and set user accordingly
  useEffect(() => {
    const token = localStorage.getItem('accesstoken');
    if (token) {
      // Optionally, verify token validity here with backend or decode JWT if used
      setUser({ token }); // minimal user info stored
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/register"
          element={
            <WholesalerRegister
              onRegisterSuccess={() => window.location.href = '/login'}
            />
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/wholesalerdashboard" />
            ) : (
              <LoginWrapper setUser={setUser} />
            )
          }
        />
        <Route
          path="/wholesalerdashboard"
          element={
            user ? (
              <WholesalerDashboard user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}

// A wrapper to use useNavigate inside Login component's callback
function LoginWrapper({ setUser }) {
  const navigate = useNavigate();

  return (
    <Login
      onLoginSuccess={(userData) => {
        console.log("User data received:", userData);
        localStorage.setItem('access_token', userData.access_token);
        setUser(userData);
        navigate('/wholesalerdashboard');
      }}
      onSwitchToRegister={() => navigate('/register')}
    />
  );
}
