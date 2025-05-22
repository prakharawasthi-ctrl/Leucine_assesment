import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee'); // Default role
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || 'Registration failed');
        return;
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '40px auto',
        padding: 30,
        border: '1px solid #ddd',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: 24,
          color: '#333',
          fontWeight: '600',
        }}
      >
        User Access Management - Register
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="username" style={{ marginBottom: 6, fontWeight: '600', color: '#555' }}>
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            padding: '10px 12px',
            marginBottom: 20,
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: 16,
            outlineColor: '#3f51b5',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3f51b5')}
          onBlur={(e) => (e.target.style.borderColor = '#ccc')}
        />

        <label htmlFor="password" style={{ marginBottom: 6, fontWeight: '600', color: '#555' }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{
            padding: '10px 12px',
            marginBottom: 20,
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: 16,
            outlineColor: '#3f51b5',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3f51b5')}
          onBlur={(e) => (e.target.style.borderColor = '#ccc')}
        />

        <label htmlFor="role" style={{ marginBottom: 6, fontWeight: '600', color: '#555' }}>
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            padding: '10px 12px',
            marginBottom: 20,
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: 16,
            backgroundColor: '#fff',
            outlineColor: '#3f51b5',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3f51b5')}
          onBlur={(e) => (e.target.style.borderColor = '#ccc')}
        >
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>

        {error && (
          <div
            role="alert"
            style={{
              color: '#b00020',
              marginBottom: 20,
              fontWeight: '600',
              textAlign: 'center',
              backgroundColor: '#fddede',
              padding: 10,
              borderRadius: 4,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            role="alert"
            style={{
              color: '#2e7d32',
              marginBottom: 20,
              fontWeight: '600',
              textAlign: 'center',
              backgroundColor: '#d7f4d7',
              padding: 10,
              borderRadius: 4,
            }}
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px 0',
            fontSize: 18,
            fontWeight: '600',
            backgroundColor: '#3f51b5',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#303f9f')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#3f51b5')}
        >
          Register
        </button>
      </form>

      <p
        style={{
          marginTop: 28,
          textAlign: 'center',
          fontSize: 14,
          color: '#555',
        }}
      >
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#3f51b5', fontWeight: '600', textDecoration: 'none' }}>
          Login
        </Link>
      </p>
    </div>
  );
}
