import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJsonAuth } from '../context/JsonAuthContext';

const RegistrationPage = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'student',
    notify: false 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useJsonAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role
    });

    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Image Block */}
      <div className="flex-1 bg-gradient-to-br from-primary-purple to-primary-pink flex items-center justify-center">
        <img src="https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&h=800&fit=crop" alt="Education" className="object-cover w-full h-full max-h-[600px] rounded-2xl shadow-soft m-8" />
      </div>
      {/* Form Block */}
      <div className="flex-1 flex items-center justify-center bg-white min-h-[100vh]">
        <form onSubmit={handleSubmit} className="w-full max-w-md p-8 card">
          <h1 className="text-2xl font-bold mb-6 text-text-dark">Registration</h1>
          
          <div className="mb-4">
            <label className="block mb-1 text-text-gray">Full Name</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple" 
            />
          </div>
          
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
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple" 
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-text-gray">Role</label>
            <select 
              name="role" 
              value={form.role} 
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          
          <div className="mb-6 flex items-center">
            <input 
              name="notify" 
              type="checkbox" 
              checked={form.notify} 
              onChange={handleChange} 
              className="mr-2" 
            />
            <span className="text-text-gray">Send me notifications</span>
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
            {loading ? 'Registering...' : 'Register'}
          </button>
          
          <div className="mt-4 text-center text-text-gray">
            Already have an account?{' '}
            <a href="/login" className="text-primary-purple hover:underline">
              Login here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage; 