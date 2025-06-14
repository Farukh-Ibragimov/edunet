import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit, Star, Heart, BookOpen, RefreshCw, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useJsonAuth } from '../context/JsonAuthContext';
import useJsonServer from '../hooks/useJsonServer';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';

const categories = ['All', 'Technology', 'Design', 'Business', 'Creativity'];

const MyCoursesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' or 'favorites'
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, courseId: null, courseTitle: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const { isTeacher } = useUser();
  const { user, getFavorites, addToFavorites, removeFromFavorites, getEnrollments } = useJsonAuth();
  const navigate = useNavigate();

  // Fetch courses from JSON Server
  const { data: jsonCourses, isPending: coursesLoading, error: coursesError, refetch } = useJsonServer('http://localhost:3003/courses');

  // Use JSON Server courses only
  const allCourses = jsonCourses || [];

  // Load user's favorites and enrollments
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Refresh courses when page is focused (for new courses)
  useEffect(() => {
    const handleFocus = () => {
      if (user && isTeacher) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, isTeacher, refetch]);

  const loadUserData = async () => {
    setLoading(true);
    
    // Load favorites for students
    if (!isTeacher) {
      const favoritesResult = await getFavorites();
      if (favoritesResult.success) {
        setFavorites(favoritesResult.data);
      }
    }

    // Load enrollments for students
    if (!isTeacher) {
      const enrollmentsResult = await getEnrollments();
      if (enrollmentsResult.success) {
        setEnrollments(enrollmentsResult.data);
      }
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

  // Filter courses based on user role and selected options
  const getFilteredCourses = () => {
    if (isTeacher) {
      // Teachers see all courses they teach (filtered by teacher name)
      let filtered = allCourses.filter(course => course.teacher === user?.name);
      return selectedCategory === 'All' ? filtered : filtered.filter(c => c.category === selectedCategory);
    } else {
      // Students see only enrolled courses or favorites
      let filtered = [];
      
      if (activeTab === 'enrolled') {
        // Get enrolled course IDs
        const enrolledCourseIds = enrollments.map(enrollment => enrollment.courseId);
        filtered = allCourses.filter(course => enrolledCourseIds.includes(course.id));
      } else if (activeTab === 'favorites') {
        // Get favorite course IDs
        filtered = allCourses.filter(course => favorites.includes(course.id));
      }
      
      return selectedCategory === 'All' ? filtered : filtered.filter(c => c.category === selectedCategory);
    }
  };

  const filtered = getFilteredCourses();
  const coursesPerPage = 4;
  const totalPages = Math.ceil(filtered.length / coursesPerPage);
  const startIndex = currentPage * coursesPerPage;
  const visible = filtered.slice(startIndex, startIndex + coursesPerPage);

  const handleEditCourse = (courseId) => {
    console.log('Editing course with ID:', courseId);
    navigate(`/edit-course/${courseId}`);
  };

  const handleDeleteCourse = async (courseId, courseTitle, e) => {
    e.stopPropagation(); // Prevent card click
    
    setDeleteConfirm({ show: true, courseId, courseTitle });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3003/courses/${deleteConfirm.courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      console.log('Deleted course with ID:', deleteConfirm.courseId);
      // Refresh the course list
      refetch();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ show: false, courseId: null, courseTitle: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, courseId: null, courseTitle: '' });
  };

  const handleAddCourse = () => {
    navigate('/edit-course/new');
  };

  const handleCourseClick = (courseId) => {
    if (isTeacher) {
      // For teachers, navigate to teacher course management page
      navigate(`/teacher-course/${courseId}`);
    } else {
      // For students, check if enrolled and navigate accordingly
      const enrollment = enrollments.find(e => e.courseId === courseId);
      if (enrollment) {
        // If enrolled, go to student course learning page
        navigate(`/student-course/${courseId}`);
      } else {
        // If not enrolled, go to course information page
        navigate(`/course/${courseId}`);
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-dark mb-4">Please log in to view your courses</h1>
          <p className="text-text-gray">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-dark">
          {isTeacher ? 'Courses I Teach' : 'My Courses'}
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(0); }}
            className="border rounded px-2 py-1 text-text-dark"
          >
            {categories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
          {isTeacher && (
            <>
              <button 
                onClick={() => refetch()}
                disabled={coursesLoading}
                className="btn-secondary flex items-center gap-1 disabled:opacity-50"
                title="Refresh courses"
              >
                <RefreshCw className={`w-4 h-4 ${coursesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={handleAddCourse}
                className="btn-primary flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Course
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation for Students */}
      {!isTeacher && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('enrolled'); setCurrentPage(0); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'enrolled' 
                ? 'bg-primary-purple text-white' 
                : 'bg-gray-100 text-text-dark hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Enrolled Courses ({enrollments.length})
          </button>
          <button
            onClick={() => { setActiveTab('favorites'); setCurrentPage(0); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'favorites' 
                ? 'bg-primary-purple text-white' 
                : 'bg-gray-100 text-text-dark hover:bg-gray-200'
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            My Favorites ({favorites.length})
          </button>
        </div>
      )}

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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {visible.map(course => {
              // Get enrollment info for this course
              const enrollment = enrollments.find(e => e.courseId === course.id);
              
              return (
                <div 
                  key={course.id} 
                  className={`card relative ${isTeacher ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                  onClick={() => handleCourseClick(course.id)}
                >
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
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
                  
                  {/* Favorite button for students */}
                  {!isTeacher && (
                    <button
                      onClick={(e) => handleToggleFavorite(course.id, e)}
                      className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                        favorites.includes(course.id)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                      }`}
                      title={favorites.includes(course.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(course.id) ? 'fill-current' : ''}`} />
                    </button>
                  )}
                  
                  <div className="p-4">
                    <div className="font-bold text-lg mb-1 truncate" title={course.title}>{course.title}</div>
                    <div className="text-sm text-text-gray truncate" title={course.teacher || 'Instructor'}>By {course.teacher || 'Instructor'}</div>
                    
                    {/* Progress bar for enrolled courses */}
                    {!isTeacher && enrollment && (
                      <div className="mt-2">
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
                    
                    <div className="flex items-center gap-1 mt-2">
                      <StarRating rating={course.rating} reviews={course.reviews} />
                    </div>
                    <div className="mt-2 font-bold text-primary-purple text-lg">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </div>
                    
                    {/* Edit button only for teachers */}
                    {isTeacher && (
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleEditCourse(course.id);
                          }}
                          className="p-2 bg-primary-purple text-white rounded-full hover:bg-primary-purple/90 transition-colors"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteCourse(course.id, course.title, e)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {visible.length === 0 && (
            <div className="text-center py-12">
              {activeTab === 'favorites' ? (
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              ) : (
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-semibold text-text-dark mb-2">
                {isTeacher 
                  ? 'No courses found' 
                  : activeTab === 'favorites' 
                    ? 'No favorite courses yet' 
                    : 'No enrolled courses yet'
                }
              </h3>
              <p className="text-text-gray">
                {isTeacher 
                  ? 'Try adjusting your filters or create your first course.' 
                  : activeTab === 'favorites' 
                    ? 'Start exploring courses and add them to your favorites!' 
                    : 'Browse available courses and enroll to start learning!'
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === i 
                        ? 'bg-primary-purple text-white' 
                        : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Delete Course</h2>
            <p className="mb-6">Are you sure you want to delete the course "{deleteConfirm.courseTitle}"?</p>
            <p className="text-sm text-red-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage; 