import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Github, 
  Upload, 
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award
} from 'lucide-react';
import { useJsonAuth } from '../context/JsonAuthContext';
import { useUser } from '../context/UserContext';
import CourseFeedback from '../components/CourseFeedback';
import CourseReviews from '../components/CourseReviews';

const StudentCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useJsonAuth();
  const { isTeacher } = useUser();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({ githubLink: '' });
  const [expandedMonths, setExpandedMonths] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setError('User not found. Please log in again.');
      return;
    }

    if (isTeacher) {
      navigate('/my-courses');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course
        const courseResponse = await fetch(`http://localhost:3003/courses/${id}`);
        if (!courseResponse.ok) throw new Error('Course not found');
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch lessons
        const lessonsResponse = await fetch(`http://localhost:3006/lessons?courseId=${id}`);
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData.sort((a, b) => a.order - b.order));

        // Fetch enrollment
        const enrollmentResponse = await fetch(`http://localhost:3005/enrollments?courseId=${id}&studentId=${user.id}`);
        const enrollmentData = await enrollmentResponse.json();
        if (enrollmentData.length > 0) {
          const enrollment = enrollmentData[0];
          setEnrollment(enrollment);
          
          // Fetch homework submissions after enrollment is available
          const homeworkResponse = await fetch(`http://localhost:3007/homework?enrollmentId=${enrollment.id}`);
          if (homeworkResponse.ok) {
            const homeworkSubmissions = await homeworkResponse.json();
            setHomework(homeworkSubmissions);
          } else {
            console.warn('Failed to fetch homework submissions');
            setHomework([]);
          }
        } else {
          throw new Error('You are not enrolled in this course');
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, user, isTeacher, navigate]);

  const toggleMonth = (month) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  const getLessonsByMonth = () => {
    // Get unique months in the order they appear in lessons
    const uniqueMonths = [];
    lessons.forEach(lesson => {
      if (!uniqueMonths.includes(lesson.month)) {
        uniqueMonths.push(lesson.month);
      }
    });
    // Group lessons by their month index
    const grouped = {};
    uniqueMonths.forEach((month, idx) => {
      grouped[`${idx + 1} месяц`] = lessons.filter(lesson => lesson.month === month);
    });
    return grouped;
  };

  const isLessonCompleted = (lessonId) => {
    return enrollment?.completedLessons?.includes(lessonId) || false;
  };

  const getHomeworkForLesson = (lessonId) => {
    return homework.find(hw => hw.lessonId === lessonId);
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();
    
    if (!homeworkForm.githubLink.trim()) {
      alert('Please enter a GitHub link');
      return;
    }

    if (!enrollment || !selectedLesson || !user) {
      alert('Missing required data. Please refresh the page and try again.');
      return;
    }

    try {
      // Check if homework already exists
      const existingHomework = homework.find(hw => hw.lessonId === selectedLesson.id);
      
      const homeworkData = {
        enrollmentId: enrollment.id,
        lessonId: selectedLesson.id,
        courseId: parseInt(id),
        studentId: user.id,
        githubLink: homeworkForm.githubLink.trim(),
        submittedAt: new Date().toISOString(),
        grade: null,
        feedback: null,
        status: 'submitted',
        gradedBy: null,
        gradedAt: null
      };

      const method = existingHomework ? 'PUT' : 'POST';
      const url = existingHomework 
        ? `http://localhost:3007/homework/${existingHomework.id}`
        : 'http://localhost:3007/homework';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(homeworkData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit homework');
      }

      // Refresh homework data
      const homeworkResponse = await fetch(`http://localhost:3007/homework?enrollmentId=${enrollment.id}`);
      if (homeworkResponse.ok) {
        const homeworkSubmissions = await homeworkResponse.json();
        setHomework(homeworkSubmissions);
      } else {
        throw new Error('Failed to refresh homework data');
      }

      setHomeworkForm({ githubLink: '' });
      setShowHomeworkForm(false);
      alert('Homework submitted successfully!');

    } catch (error) {
      console.error('Error submitting homework:', error);
      alert('Failed to submit homework. Please try again.');
    }
  };

  const markLessonComplete = async (lessonId) => {
    if (!enrollment) {
      alert('Enrollment data not available. Please refresh the page and try again.');
      return;
    }

    try {
      const updatedCompletedLessons = isLessonCompleted(lessonId)
        ? enrollment.completedLessons.filter(id => id !== lessonId)
        : [...(enrollment.completedLessons || []), lessonId];

      const progress = Math.round((updatedCompletedLessons.length / lessons.length) * 100);

      const updatedEnrollment = {
        ...enrollment,
        completedLessons: updatedCompletedLessons,
        progress
      };

      const response = await fetch(`http://localhost:3005/enrollments/${enrollment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEnrollment),
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson progress');
      }

      setEnrollment(updatedEnrollment);

    } catch (error) {
      console.error('Error updating lesson progress:', error);
      alert('Failed to update lesson progress. Please try again.');
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto py-10 px-4">Loading...</div>;
  if (error) return <div className="max-w-6xl mx-auto py-10 px-4 text-red-600">{error}</div>;
  if (!course || !enrollment) return null;

  const lessonsByMonth = getLessonsByMonth();

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <img src={course.image} alt={course.title} className="w-20 h-20 object-cover rounded-lg" />
          <div>
            <h1 className="text-3xl font-bold text-text-dark">{course.title}</h1>
            <p className="text-text-gray">by {course.teacher}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-text-gray">Course Progress</span>
            <span className="text-sm font-medium text-text-dark">{enrollment.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${enrollment.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary-purple">{lessons.length}</div>
            <div className="text-sm text-text-gray">Total Lessons</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{enrollment.completedLessons?.length || 0}</div>
            <div className="text-sm text-text-gray">Completed</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{homework.length}</div>
            <div className="text-sm text-text-gray">Homework Submitted</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {homework.filter(h => h.grade).length > 0 
                ? Math.round(homework.filter(h => h.grade).reduce((sum, h) => sum + h.grade, 0) / homework.filter(h => h.grade).length)
                : 0
              }%
            </div>
            <div className="text-sm text-text-gray">Average Grade</div>
          </div>
        </div>
      </div>

      {/* Feedback and Reviews Section (only for students) */}
      {!isTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <CourseFeedback courseId={course.id} />
          <CourseReviews courseId={course.id} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Video Player */}
        <div className="lg:col-span-2">
          {selectedLesson ? (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">{selectedLesson.title}</h2>
              
              {/* Video Player */}
              <div className="mb-6">
                <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={selectedLesson.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Lesson Info */}
              <div className="mb-6">
                <p className="text-text-gray mb-4">{selectedLesson.description}</p>
                <div className="flex items-center gap-4 text-sm text-text-gray">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedLesson.duration}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {selectedLesson.month} {selectedLesson.year}</span>
                </div>
              </div>

              {/* Homework Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Homework Assignment</h3>
                <p className="text-text-gray mb-4">{selectedLesson.homeworkDescription}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside text-sm text-text-gray space-y-1">
                    {selectedLesson.homeworkRequirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Homework Submission */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Submit Your Homework</h4>
                  
                  {getHomeworkForLesson(selectedLesson.id) ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        <a 
                          href={getHomeworkForLesson(selectedLesson.id).githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-purple hover:underline flex items-center gap-1"
                        >
                          View on GitHub
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      
                      {getHomeworkForLesson(selectedLesson.id).grade && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">Grade: {getHomeworkForLesson(selectedLesson.id).grade}%</span>
                        </div>
                      )}
                      
                      {getHomeworkForLesson(selectedLesson.id).feedback && (
                        <div className="text-sm text-text-gray">
                          <strong>Feedback:</strong> {getHomeworkForLesson(selectedLesson.id).feedback}
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setHomeworkForm({ githubLink: getHomeworkForLesson(selectedLesson.id).githubLink });
                          setShowHomeworkForm(true);
                        }}
                        className="btn-secondary text-sm"
                      >
                        Update Submission
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowHomeworkForm(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Submit Homework
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Lesson</h3>
              <p className="text-text-gray">Choose a lesson from the curriculum to start learning</p>
            </div>
          )}
        </div>

        {/* Sidebar - Curriculum */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Curriculum</h2>
            
            <div className="space-y-4">
              {Object.entries(lessonsByMonth).map(([month, monthLessons]) => (
                <div key={month} className="border rounded-lg">
                  <button
                    onClick={() => toggleMonth(month)}
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="font-medium">{month}</span>
                    {expandedMonths.has(month) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  {expandedMonths.has(month) && (
                    <div className="border-t">
                      {monthLessons.map(lesson => (
                        <div
                          key={lesson.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                            selectedLesson?.id === lesson.id ? 'bg-primary-purple/10' : ''
                          }`}
                          onClick={() => handleLessonClick(lesson)}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markLessonComplete(lesson.id);
                              }}
                              className="flex-shrink-0"
                            >
                              {isLessonCompleted(lesson.id) ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{lesson.title}</div>
                              <div className="text-xs text-text-gray">{lesson.duration}</div>
                            </div>
                            {getHomeworkForLesson(lesson.id) && (
                              <div className="flex-shrink-0">
                                {getHomeworkForLesson(lesson.id).grade ? (
                                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    {getHomeworkForLesson(lesson.id).grade}%
                                  </div>
                                ) : (
                                  <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                    Submitted
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Homework Submission Modal */}
      {showHomeworkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Submit Homework</h3>
              <button
                onClick={() => setShowHomeworkForm(false)}
                className="text-text-gray hover:text-text-dark"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleHomeworkSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">
                  GitHub Repository Link
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-gray" />
                  <input
                    type="url"
                    value={homeworkForm.githubLink}
                    onChange={(e) => setHomeworkForm({ githubLink: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    placeholder="https://github.com/username/repository"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowHomeworkForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCoursePage; 