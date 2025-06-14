import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Heart, MapPin, Star, Users, Clock, Calendar, ChevronDown, List, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { useJsonAuth } from '../context/JsonAuthContext';
import useJsonServer from '../hooks/useJsonServer';
import StarRating from '../components/StarRating';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'completed', 'in-progress', 'not-started'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [favorites, setFavorites] = useState(new Set());
  const { user, getFavorites, addToFavorites, removeFromFavorites } = useJsonAuth();

  // Fetch courses from JSON Server
  const { data: jsonCourses, isPending: coursesLoading, error: coursesError } = useJsonServer('http://localhost:3003/courses');

  const categories = [
    'All Categories',
    'Technology',
    'Design',
    'Languages',
    'Business',
    'Creativity',
    'Professions'
  ];

  // Load user's favorites and handle URL parameters
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
    
    // Handle category parameter from URL
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [user, searchParams]);

  const loadFavorites = async () => {
    const result = await getFavorites();
    if (result.success) {
      setFavorites(new Set(result.data));
    }
  };

  const handleToggleFavorite = async (courseId, e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    const isFavorite = favorites.has(courseId);
    
    if (isFavorite) {
      const result = await removeFromFavorites(courseId);
      if (result.success) {
        const newFavorites = new Set(favorites);
        newFavorites.delete(courseId);
        setFavorites(newFavorites);
      }
    } else {
      const result = await addToFavorites(courseId);
      if (result.success) {
        const newFavorites = new Set(favorites);
        newFavorites.add(courseId);
        setFavorites(newFavorites);
      }
    }
  };

  // Use server courses instead of mock courses
  const courses = jsonCourses || [];

  const filteredCourses = courses.filter(course => {
    const matchesQuery = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        course.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesTab = selectedTab === 'all' || course.status === selectedTab;
    
    return matchesQuery && matchesCategory && matchesTab;
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            {selectedCategory === 'all' ? 'Search Courses' : `${selectedCategory} Courses`}
          </h1>
          <p className="text-text-gray">
            {selectedCategory === 'all' 
              ? 'Find the perfect course for your learning journey' 
              : `Browse all ${selectedCategory} courses available`
            }
          </p>
        </div>

        {/* Search Block */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Category Dropdown */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category === 'All Categories' ? 'all' : category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-primary-purple hover:bg-primary-purple/90 text-white px-6 py-3 rounded-r-lg transition-colors flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Results Block */}
        <div className="space-y-6">
          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-text-gray">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-purple text-white' 
                      : 'text-text-gray hover:text-text-dark'
                  }`}
                >
                  <List className="w-4 h-4 inline mr-1" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-primary-purple text-white' 
                      : 'text-text-gray hover:text-text-dark'
                  }`}
                >
                  <Map className="w-4 h-4 inline mr-1" />
                  Map
                </button>
              </div>
            </div>

            <div className="text-sm text-text-gray">
              {filteredCourses.length} courses found
            </div>
          </div>

          {/* Tabs (only for list view) */}
          {viewMode === 'list' && (
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'completed', label: 'Completed' },
                { key: 'in-progress', label: 'In Progress' },
                { key: 'not-started', label: 'Not Started' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === tab.key
                      ? 'bg-white text-primary-purple shadow-sm'
                      : 'text-text-gray hover:text-text-dark'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="relative">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <button
                      onClick={(e) => handleToggleFavorite(course.id, e)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          favorites.has(course.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </button>
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
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-text-dark mb-2">{course.title}</h3>
                    <p className="text-text-gray text-sm mb-3">By {course.teacher}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <StarRating rating={course.rating} reviews={course.reviews} />
                      <div className="flex items-center space-x-1 text-text-gray">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{course.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1 text-text-gray">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{course.address}</span>
                      </div>
                      <span className="text-lg font-bold text-primary-purple">${course.price}</span>
                    </div>
                    
                    {(course.status === 'in-progress' || course.status === 'not-started') && (
                      <div className="flex items-center space-x-1 text-text-gray text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{course.startDate} - {course.endDate}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Map View */
            <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-gray mb-2">Map View</h3>
                <p className="text-text-gray">Interactive map with course markers will be displayed here.</p>
                <p className="text-sm text-text-gray mt-2">
                  Red markers: Completed courses<br/>
                  Yellow markers: In progress courses<br/>
                  Green markers: Not started courses
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 