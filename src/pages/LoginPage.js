import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJsonAuth } from '../context/JsonAuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useJsonAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(form.email, form.password);

    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-main">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 card">
        <h1 className="text-2xl font-bold mb-6 text-text-dark">Login</h1>
        
        <div className="mb-4">
          <label className="block mb-1 text-text-gray">Email</label>
          <input 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple" 
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 text-text-gray">Password</label>
          <input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple" 
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="mt-4 text-center text-text-gray">
          Don't have an account?{' '}
          <a href="/register" className="text-primary-purple hover:underline">
            Register here
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage; 