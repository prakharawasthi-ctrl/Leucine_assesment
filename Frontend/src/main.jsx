import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/login';
import Register from './pages/register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/ManagerDashboard" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
