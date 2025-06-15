import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Users, Clock, ArrowRight, Heart, BookOpen, TrendingUp, Award, Users as UsersIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useJsonAuth } from '../context/JsonAuthContext';
import useJsonServer from '../hooks/useJsonServer';
import StarRating from '../components/StarRating';

const MainPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  const { isTeacher } = useUser();
  const { user, getFavorites, addToFavorites, removeFromFavorites, enrollInCourse, getEnrollments, checkEnrollment } = useJsonAuth();

  // Fetch courses from JSON Server
  const { data: jsonCourses, isPending: coursesLoading, error: coursesError } = useJsonServer('http://localhost:3003/courses');

  // Calculate category counts from server data
  const getCategoryCounts = () => {
    if (!jsonCourses) return {};
    
    const counts = {};
    jsonCourses.forEach(course => {
      const category = course.category;
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  const categories = [
    { name: 'Technology', emoji: '💻', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { name: 'Design', emoji: '🎨', color: 'bg-pink-500', bgColor: 'bg-pink-50' },
    { name: 'Languages', emoji: '🌍', color: 'bg-green-500', bgColor: 'bg-green-50' },
    { name: 'Business', emoji: '📊', color: 'bg-orange-500', bgColor: 'bg-orange-50' },
    { name: 'Creativity', emoji: '🎭', color: 'bg-purple-500', bgColor: 'bg-purple-50' },
    { name: 'Professions', emoji: '🔧', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
  ];

  // Add dynamic course counts to categories
  const categoriesWithCounts = categories.map(category => ({
    ...category,
    courses: categoryCounts[category.name] || 0
  }));

  // Load user's favorites and enrollments
  useEffect(() => {
    if (user && !isTeacher) {
      loadUserData();
    }
  }, [user, isTeacher]);

  const loadUserData = async () => {
    setLoading(true);
    
    // Load favorites
    const favoritesResult = await getFavorites();
    if (favoritesResult.success) {
      setFavorites(favoritesResult.data);
    }

    // Load enrollments
    const enrollmentsResult = await getEnrollments();
    if (enrollmentsResult.success) {
      setEnrollments(enrollmentsResult.data);
    }

    setLoading(false);
  };

  const handleToggleFavorite = async (courseId, e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    const isFavorite = favorites.includes(courseId);
    
    if (isFavorite) {
      const result = await removeFromFavorites(courseId);
      if (result.success) {
        setFavorites(favorites.filter(id => id !== courseId));
      }
    } else {
      const result = await addToFavorites(courseId);
      if (result.success) {
        setFavorites([...favorites, courseId]);
      }
    }
  };

  const handleEnroll = async (courseId, e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (isTeacher) {
      // Teachers can't enroll in courses
      return;
    }

    // Check if already enrolled
    const enrollmentResult = await checkEnrollment(courseId);
    if (enrollmentResult.success && enrollmentResult.isEnrolled) {
      // Already enrolled, navigate to course
      navigate(`/course/${courseId}`);
      return;
    }

    // Enroll in course
    const result = await enrollInCourse(courseId);
    if (result.success) {
      // Reload enrollments
      const enrollmentsResult = await getEnrollments();
      if (enrollmentsResult.success) {
        setEnrollments(enrollmentsResult.data);
      }
      // Navigate to course
      navigate(`/course/${courseId}`);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/search?category=${encodeURIComponent(category.name)}`);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // Use JSON Server courses - all courses are now stored on the server
  const trendingCourses = jsonCourses || [];

  // Helper for status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'not-started': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'not-started': return 'Not Started';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-purple-pink text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Learn something new, achieve more
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-white/90"
          >
            Find the perfect course among thousands of options from the best instructors
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="flex items-center px-4">
                <Search className="w-5 h-5 text-text-gray" />
              </div>
              <input
                type="text"
                placeholder="What do you want to learn?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-4 text-text-dark placeholder-text-gray focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="bg-primary-purple hover:bg-primary-purple/90 text-white px-6 py-4 transition-colors"
              >
                Find
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-background-gray">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-text-dark"
          >
            Learn what interests you
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesWithCounts.map((category) => (
              <div
                key={category.name}
                onClick={() => handleCategoryClick(category)}
                className={`${category.bgColor} p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
              >
                <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  {category.emoji}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.courses} courses</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Courses Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text-dark mb-2">Trending Courses</h2>
              <p className="text-text-gray">Discover the most popular courses</p>
            </div>
            
            {/* Category Filter Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                if (e.target.value === 'All') {
                  setSelectedCategory('All');
                } else {
                  navigate(`/search?category=${encodeURIComponent(e.target.value)}`);
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent bg-white"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name} ({categoryCounts[category.name] || 0})
                </option>
              ))}
            </select>
          </div>
          
          {/* Loading State */}
          {coursesLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto"></div>
              <p className="mt-4 text-text-gray">Loading courses...</p>
            </div>
          )}

          {/* Error State */}
          {coursesError && (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading courses: {coursesError}</p>
            </div>
          )}

          {/* Course Grid */}
          {!coursesLoading && !coursesError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingCourses.map((course, index) => {
                // Check if user is enrolled in this course
                const isEnrolled = enrollments.some(e => e.courseId === course.id);
                const enrollment = enrollments.find(e => e.courseId === course.id);
                
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => handleCourseClick(course.id)}
                    className="card overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="relative">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${
                          course.status === 'not-started'
                            ? 'bg-green-100 text-green-700'
                            : course.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {course.status === 'completed'
                            ? 'Finished'
                            : course.status === 'in-progress'
                            ? 'In Progress'
                            : 'Not Started'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/90 text-text-dark px-2 py-1 rounded-lg text-xs font-medium flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.duration}
                        </span>
                      </div>
                      
                      {/* Favorite button for students */}
                      {!isTeacher && (
                        <button
                          onClick={(e) => handleToggleFavorite(course.id, e)}
                          className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${
                            favorites.includes(course.id)
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                          }`}
                          title={favorites.includes(course.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(course.id) ? 'fill-current' : ''}`} />
                        </button>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-text-dark mb-2">{course.title}</h3>
                      <p 
                        className="text-text-gray text-sm mb-3 hover:text-primary-purple transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/teacher/${course.teacherId || 1}`);
                        }}
                      >
                        By {course.teacher}
                      </p>
                      
                      {/* Progress bar for enrolled courses */}
                      {!isTeacher && isEnrolled && enrollment && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-text-gray mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-purple h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <StarRating rating={course.rating} reviews={course.reviews} />
                        <div className="flex items-center space-x-1 text-text-gray">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{course.students}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-purple">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </span>
                        {!isTeacher ? (
                          <button 
                            onClick={(e) => handleEnroll(course.id, e)}
                            className={`text-sm py-2 px-4 rounded-lg font-medium transition-colors ${
                              isEnrolled 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-primary-purple text-white hover:bg-primary-purple/90'
                            }`}
                          >
                            {isEnrolled ? (
                              <>
                                <BookOpen className="w-4 h-4 inline mr-1" />
                                Continue
                              </>
                            ) : (
                              'Enroll'
                            )}
                          </button>
                        ) : (
                          <button className="btn-primary text-sm py-2 px-4">
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Promo Section */}
      <section className="gradient-coral-pink text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Smart learning, smart savings
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Get up to 30% off on selected courses. Start your learning journey today and unlock your potential with our expert-led courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-primary-coral font-medium py-3 px-6 rounded-2xl hover:bg-gray-100 transition-colors">
                  Start Learning
                </button>
                <button className="border-2 border-white text-white font-medium py-3 px-6 rounded-2xl hover:bg-white hover:text-primary-coral transition-colors">
                  Learn More
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-8xl md:text-9xl font-bold text-white/20">
                30%
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage; 