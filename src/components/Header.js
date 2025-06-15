import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, BookOpen, Award, LogIn, UserPlus, Users, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useJsonAuth } from '../context/JsonAuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isTeacher, toggleUserType } = useUser();
  const { user, logout, loading } = useJsonAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target.closest('.menu-container')) return;
    closeMenu();
  };

  const handleToggleUserType = () => {
    toggleUserType();
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMenu();
  };

  if (loading) {
    return (
      <header className="bg-background-main border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-purple to-primary-pink rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-text-dark">EduNet</span>
            </Link>
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background-main border-b border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-purple to-primary-pink rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-text-dark">EduNet</span>
          </Link>

          {/* Right side - Auth buttons or Burger menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="menu-container relative">
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6 text-text-dark" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={handleOutsideClick}
                      />
                      
                      {/* Slide-out menu */}
                      <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 p-6"
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-lg font-semibold text-text-dark">Menu</h2>
                          <button
                            onClick={closeMenu}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Profile section */}
                        <div className="mb-6 pb-6 border-b border-border-light">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary-purple to-primary-pink rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-text-dark">{user.name}</p>
                              <p className="text-sm text-text-gray capitalize">{user.role}</p>
                            </div>
                          </div>
                        </div>

                        {/* User Type Toggle (only if user is a teacher) */}
                        {user.role === 'teacher' && (
                          <div className="mb-6 pb-6 border-b border-border-light">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-text-gray">View as:</span>
                              <button
                                onClick={handleToggleUserType}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  isTeacher 
                                    ? 'bg-primary-purple text-white' 
                                    : 'bg-gray-100 text-text-dark'
                                }`}
                              >
                                {isTeacher ? 'Teacher' : 'Student'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Menu items */}
                        <nav className="space-y-2">
                          <button
                            onClick={() => handleNavigation('/my-courses')}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-text-dark text-left"
                          >
                            <BookOpen className="w-5 h-5" />
                            <span>{isTeacher ? 'My Teaching' : 'My Courses'}</span>
                          </button>
                          
                          {/* Teacher Profile Link (only for teachers) */}
                          {user.role === 'teacher' && (
                            <button
                              onClick={() => handleNavigation('/teacher-profile')}
                              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-text-dark text-left"
                            >
                              <User className="w-5 h-5" />
                              <span>Teacher Profile</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleNavigation('/profile')}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-text-dark text-left"
                          >
                            <Award className="w-5 h-5" />
                            <span>Profile</span>
                          </button>

                          {/* Admin Panel Link */}
                          <button
                            onClick={() => handleNavigation('/admin')}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-text-dark text-left"
                          >
                            <Users className="w-5 h-5" />
                            <span>Admin Panel</span>
                          </button>
                        </nav>

                        {/* Logout */}
                        <div className="mt-6 pt-6 border-t border-border-light">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-text-dark"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="btn-primary flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 