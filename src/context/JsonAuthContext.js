import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';

const JsonAuthContext = createContext();

export const useJsonAuth = () => {
  const context = useContext(JsonAuthContext);
  if (!context) {
    throw new Error('useJsonAuth must be used within a JsonAuthProvider');
  }
  return context;
};

const USERS_API = 'http://localhost:3004/users';
const FAVORITES_API = 'http://localhost:3008/favorites';
const ENROLLMENTS_API = 'http://localhost:3005/enrollments';

export const JsonAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('jsonUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      // Check if user already exists
      const existingUsers = await fetch(`${USERS_API}?email=${userData.email}`);
      const existingData = await existingUsers.json();
      
      if (existingData.length > 0) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create new user
      const response = await fetch(USERS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          createdAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        const userWithoutPassword = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        };
        
        setUser(userWithoutPassword);
        localStorage.setItem('jsonUser', JSON.stringify(userWithoutPassword));
        return { success: true, data: userWithoutPassword };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${USERS_API}?email=${email}`);
      const users = await response.json();

      if (users.length === 0) {
        return { success: false, error: 'Invalid credentials' };
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      setUser(userWithoutPassword);
      localStorage.setItem('jsonUser', JSON.stringify(userWithoutPassword));
      return { success: true, data: userWithoutPassword };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jsonUser');
  };

  const enrollInCourse = async (courseId) => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      // Check if already enrolled
      const existingEnrollments = await fetch(`${ENROLLMENTS_API}?userId=${user.id}&courseId=${courseId}`);
      const existingData = await existingEnrollments.json();

      if (existingData.length > 0) {
        return { success: false, error: 'Already enrolled in this course' };
      }

      const response = await fetch(ENROLLMENTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: courseId,
          enrolledAt: new Date().toISOString(),
          progress: 0,
          completedLessons: []
        }),
      });

      if (response.ok) {
        return { success: true, data: await response.json() };
      } else {
        return { success: false, error: 'Failed to enroll in course' };
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const getEnrollments = async () => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch(`${ENROLLMENTS_API}?userId=${user.id}`);
      const enrollments = await response.json();
      
      return { success: true, data: enrollments };
    } catch (error) {
      console.error('Get enrollments error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const checkEnrollment = async (courseId) => {
    try {
      if (!user) {
        return { success: false, isEnrolled: false };
      }

      const response = await fetch(`${ENROLLMENTS_API}?userId=${user.id}&courseId=${courseId}`);
      const enrollments = await response.json();
      
      return { success: true, isEnrolled: enrollments.length > 0 };
    } catch (error) {
      console.error('Check enrollment error:', error);
      return { success: false, isEnrolled: false };
    }
  };

  const addToFavorites = async (courseId) => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      // Check if already in favorites
      const existingFavorites = await fetch(`${FAVORITES_API}?userId=${user.id}&courseId=${courseId}`);
      const existingData = await existingFavorites.json();

      if (existingData.length > 0) {
        return { success: false, error: 'Course already in favorites' };
      }

      const response = await fetch(FAVORITES_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: courseId,
          addedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        return { success: true, data: await response.json() };
      } else {
        return { success: false, error: 'Failed to add to favorites' };
      }
    } catch (error) {
      console.error('Add to favorites error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const removeFromFavorites = async (courseId) => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      // Find the favorite entry
      const favoritesResponse = await fetch(`${FAVORITES_API}?userId=${user.id}&courseId=${courseId}`);
      const favorites = await favoritesResponse.json();

      if (favorites.length === 0) {
        return { success: false, error: 'Course not in favorites' };
      }

      const favoriteId = favorites[0].id;
      const response = await fetch(`${FAVORITES_API}/${favoriteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: 'Failed to remove from favorites' };
      }
    } catch (error) {
      console.error('Remove from favorites error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const getFavorites = async () => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch(`${FAVORITES_API}?userId=${user.id}`);
      const favorites = await response.json();
      
      const courseIds = favorites.map(fav => fav.courseId);
      return { success: true, data: courseIds };
    } catch (error) {
      console.error('Get favorites error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const checkFavorite = async (courseId) => {
    try {
      if (!user) {
        return { success: false, isFavorite: false };
      }

      const response = await fetch(`${FAVORITES_API}?userId=${user.id}&courseId=${courseId}`);
      const favorites = await response.json();
      
      return { success: true, isFavorite: favorites.length > 0 };
    } catch (error) {
      console.error('Check favorite error:', error);
      return { success: false, isFavorite: false };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    enrollInCourse,
    getEnrollments,
    checkEnrollment,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    checkFavorite,
  };

  return (
    <JsonAuthContext.Provider value={value}>
      {children}
    </JsonAuthContext.Provider>
  );
}; 