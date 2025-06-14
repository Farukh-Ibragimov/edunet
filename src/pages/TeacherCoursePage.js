import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  Star,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Youtube,
  Github,
  ExternalLink,
  Save,
  AlertCircle,
  Video,
  Link,
  Radio
} from 'lucide-react';
import { useJsonAuth } from '../context/JsonAuthContext';
import { useUser } from '../context/UserContext';

const TeacherCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useJsonAuth();
  const { isTeacher } = useUser();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    broadcastUrl: '',
    duration: '',
    scheduledDate: '',
    scheduledTime: '',
    homeworkDescription: '',
    homeworkRequirements: [''],
    lessonType: 'recorded' // 'recorded' or 'live'
  });
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: ''
  });

  useEffect(() => {
    if (!isTeacher) {
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

        // Verify teacher owns this course
        if (courseData.teacher !== user.name) {
          throw new Error('You do not have permission to manage this course');
        }

        // Fetch lessons
        const lessonsResponse = await fetch(`http://localhost:3006/lessons?courseId=${id}`);
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData.sort((a, b) => a.order - b.order));

        // Fetch enrollments
        const enrollmentsResponse = await fetch(`http://localhost:3005/enrollments?courseId=${id}`);
        const enrollmentsData = await enrollmentsResponse.json();
        
        // Fetch user data for enrollments that don't have fullName
        const enrichedEnrollments = await Promise.all(
          enrollmentsData.map(async (enrollment) => {
            if (enrollment.fullName) {
              return enrollment;
            }
            
            // If no fullName, fetch user data
            if (enrollment.userId || enrollment.studentId) {
              const userId = enrollment.userId || enrollment.studentId;
              try {
                const userResponse = await fetch(`http://localhost:3004/users/${userId}`);
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  return {
                    ...enrollment,
                    fullName: userData.name || userData.fullName || 'Unknown Student',
                    phoneNumber: userData.phoneNumber || 'No phone'
                  };
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }
            }
            
            // Fallback for missing data
            return {
              ...enrollment,
              fullName: enrollment.fullName || 'Unknown Student',
              phoneNumber: enrollment.phoneNumber || 'No phone'
            };
          })
        );
        
        setEnrollments(enrichedEnrollments);

        // Fetch homework
        const homeworkResponse = await fetch(`http://localhost:3007/homework?courseId=${id}`);
        const homeworkData = await homeworkResponse.json();
        setHomework(homeworkData);

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

  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      description: '',
      videoUrl: '',
      broadcastUrl: '',
      duration: '',
      scheduledDate: '',
      scheduledTime: '',
      homeworkDescription: '',
      homeworkRequirements: [''],
      lessonType: 'recorded'
    });
    setEditingLesson(null);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    
    try {
      const lessonData = {
        courseId: parseInt(id),
        title: lessonForm.title,
        description: lessonForm.description,
        videoUrl: lessonForm.videoUrl,
        broadcastUrl: lessonForm.broadcastUrl,
        duration: lessonForm.duration,
        scheduledDate: lessonForm.scheduledDate,
        scheduledTime: lessonForm.scheduledTime,
        homeworkDescription: lessonForm.homeworkDescription,
        homeworkRequirements: lessonForm.homeworkRequirements.filter(req => req.trim() !== ''),
        lessonType: lessonForm.lessonType,
        order: lessons.length + 1,
        month: new Date().toLocaleDateString('en-US', { month: 'long' }),
        year: new Date().getFullYear(),
        createdAt: new Date().toISOString()
      };

      if (editingLesson) {
        // Update existing lesson
        const response = await fetch(`http://localhost:3006/lessons/${editingLesson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...lessonData, id: editingLesson.id }),
        });

        if (!response.ok) {
          throw new Error('Failed to update lesson');
        }
      } else {
        // Add new lesson - let JSON Server generate the ID
        const response = await fetch('http://localhost:3006/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lessonData),
        });

        if (!response.ok) {
          throw new Error('Failed to add lesson');
        }
      }

      // Refresh lessons
      const lessonsResponse = await fetch(`http://localhost:3006/lessons?courseId=${id}`);
      const lessonsData = await lessonsResponse.json();
      setLessons(lessonsData.sort((a, b) => a.order - b.order));

      // Reset form
      resetLessonForm();
      setShowLessonForm(false);

    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Failed to save lesson. Please try again.');
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl || '',
      broadcastUrl: lesson.broadcastUrl || '',
      duration: lesson.duration,
      scheduledDate: lesson.scheduledDate || '',
      scheduledTime: lesson.scheduledTime || '',
      homeworkDescription: lesson.homeworkDescription || '',
      homeworkRequirements: lesson.homeworkRequirements?.length > 0 ? lesson.homeworkRequirements : [''],
      lessonType: lesson.lessonType || 'recorded'
    });
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3006/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      // Refresh lessons
      const lessonsResponse = await fetch(`http://localhost:3006/lessons?courseId=${id}`);
      const lessonsData = await lessonsResponse.json();
      setLessons(lessonsData.sort((a, b) => a.order - b.order));

    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson. Please try again.');
    }
  };

  const handleGradeHomework = async (e) => {
    e.preventDefault();
    
    if (!selectedHomework) return;

    try {
      const updatedHomework = {
        ...selectedHomework,
        grade: parseInt(gradeForm.grade),
        feedback: gradeForm.feedback,
        status: 'graded',
        gradedBy: user.name,
        gradedAt: new Date().toISOString()
      };

      const response = await fetch(`http://localhost:3007/homework/${selectedHomework.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedHomework),
      });

      if (!response.ok) {
        throw new Error('Failed to grade homework');
      }

      // Refresh homework data
      const homeworkResponse = await fetch(`http://localhost:3007/homework?courseId=${id}`);
      const homeworkData = await homeworkResponse.json();
      setHomework(homeworkData);

      // Reset form
      setGradeForm({ grade: '', feedback: '' });
      setSelectedHomework(null);
      setShowGradeForm(false);

    } catch (error) {
      console.error('Error grading homework:', error);
      alert('Failed to grade homework. Please try again.');
    }
  };

  const addHomeworkRequirement = () => {
    setLessonForm(prev => ({
      ...prev,
      homeworkRequirements: [...prev.homeworkRequirements, '']
    }));
  };

  const removeHomeworkRequirement = (index) => {
    setLessonForm(prev => ({
      ...prev,
      homeworkRequirements: prev.homeworkRequirements.filter((_, i) => i !== index)
    }));
  };

  const updateHomeworkRequirement = (index, value) => {
    setLessonForm(prev => ({
      ...prev,
      homeworkRequirements: prev.homeworkRequirements.map((req, i) => i === index ? value : req)
    }));
  };

  const getStudentHomework = (studentId) => {
    return homework.filter(hw => hw.studentId === studentId);
  };

  const getStudentEnrollment = (studentId) => {
    return enrollments.find(enrollment => enrollment.studentId === studentId);
  };

  if (loading) return <div className="max-w-6xl mx-auto py-10 px-4">Loading...</div>;
  if (error) return <div className="max-w-6xl mx-auto py-10 px-4 text-red-600">{error}</div>;
  if (!course) return null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <img src={course.image} alt={course.title} className="w-20 h-20 object-cover rounded-lg" />
          <div>
            <h1 className="text-3xl font-bold text-text-dark">{course.title}</h1>
            <p className="text-text-gray">Teacher Dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary-purple">{enrollments.length}</div>
            <div className="text-sm text-text-gray">Enrolled Students</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{lessons.length}</div>
            <div className="text-sm text-text-gray">Total Lessons</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{homework.length}</div>
            <div className="text-sm text-text-gray">Homework Submissions</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {homework.filter(h => h.status === 'graded').length}
            </div>
            <div className="text-sm text-text-gray">Graded</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'students'
                ? 'border-b-2 border-primary-purple text-primary-purple'
                : 'text-text-gray hover:text-text-dark'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Students ({enrollments.length})
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'lessons'
                ? 'border-b-2 border-primary-purple text-primary-purple'
                : 'text-text-gray hover:text-text-dark'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Lessons ({lessons.length})
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'homework'
                ? 'border-b-2 border-primary-purple text-primary-purple'
                : 'text-text-gray hover:text-text-dark'
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Homework ({homework.filter(h => h.status === 'submitted').length})
          </button>
        </div>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Enrolled Students</h2>
          {enrollments.length === 0 ? (
            <div className="card p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Enrolled</h3>
              <p className="text-text-gray">Students will appear here once they enroll in your course.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map(enrollment => {
                const studentHomework = getStudentHomework(enrollment.studentId);
                const completedLessons = enrollment.completedLessons?.length || 0;
                const totalLessons = lessons.length;
                const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                
                return (
                  <div key={enrollment.id} className="card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary-purple rounded-full flex items-center justify-center text-white font-semibold">
                        {(enrollment.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{enrollment.fullName || 'Unknown Student'}</h3>
                        <p className="text-sm text-text-gray">{enrollment.phoneNumber || 'No phone'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-purple h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Lessons Completed</span>
                        <span>{completedLessons}/{totalLessons}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Homework Submitted</span>
                        <span>{studentHomework.length}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Average Grade</span>
                        <span>
                          {studentHomework.filter(h => h.grade).length > 0
                            ? Math.round(studentHomework.filter(h => h.grade).reduce((sum, h) => sum + h.grade, 0) / studentHomework.filter(h => h.grade).length)
                            : 0
                          }%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Course Lessons</h2>
            <button
              onClick={() => {
                resetLessonForm();
                setShowLessonForm(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Lesson
            </button>
          </div>
          
          {lessons.length === 0 ? (
            <div className="card p-8 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Lessons Yet</h3>
              <p className="text-text-gray">Add your first lesson to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary-purple text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{lesson.title}</h3>
                          {lesson.lessonType === 'live' && (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                              Live
                            </span>
                          )}
                          {lesson.lessonType === 'recorded' && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                              Recorded
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-gray mb-2">{lesson.description}</p>
                        <div className="flex items-center gap-4 text-xs text-text-gray">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {lesson.month} {lesson.year}
                          </span>
                          {lesson.scheduledDate && lesson.scheduledTime && (
                            <span className="flex items-center gap-1">
                              <Radio className="w-3 h-3" />
                              {new Date(lesson.scheduledDate + 'T' + lesson.scheduledTime).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {lesson.videoUrl && (
                        <a
                          href={lesson.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs flex items-center gap-1"
                          title="View Recorded Video"
                        >
                          <Video className="w-3 h-3" />
                          Video
                        </a>
                      )}
                      {lesson.broadcastUrl && (
                        <a
                          href={lesson.broadcastUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200"
                          title="Join Live Broadcast"
                        >
                          <Radio className="w-3 h-3" />
                          Live
                        </a>
                      )}
                      <button
                        onClick={() => handleEditLesson(lesson)}
                        className="btn-secondary text-xs flex items-center gap-1"
                        title="Edit Lesson"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="btn-secondary text-xs flex items-center gap-1 text-red-600 hover:bg-red-50"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Homework Info */}
                  {lesson.homeworkDescription && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-text-gray mb-1">Homework Assignment</h4>
                      <p className="text-xs text-text-gray mb-2">{lesson.homeworkDescription}</p>
                      {lesson.homeworkRequirements && lesson.homeworkRequirements.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-text-gray mb-1">Requirements:</h5>
                          <ul className="text-xs text-text-gray space-y-1">
                            {lesson.homeworkRequirements.map((req, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-primary-purple">•</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Homework Tab */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Homework Submissions</h2>
          
          {homework.length === 0 ? (
            <div className="card p-8 text-center">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Homework Submissions</h3>
              <p className="text-text-gray">Homework submissions will appear here once students submit their work.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {homework.map(submission => {
                const student = enrollments.find(e => e.studentId === submission.studentId);
                const lesson = lessons.find(l => l.id === submission.lessonId);
                
                return (
                  <div key={submission.id} className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{student?.fullName || 'Unknown Student'}</h3>
                        <p className="text-sm text-text-gray">{lesson?.title || 'Unknown Lesson'}</p>
                        <p className="text-xs text-text-gray">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {submission.status === 'graded' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Grade: {submission.grade}%</span>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-yellow-600">Pending</span>
                            <button
                              onClick={() => {
                                setSelectedHomework(submission);
                                setGradeForm({ grade: '', feedback: '' });
                                setShowGradeForm(true);
                              }}
                              className="btn-primary text-xs"
                            >
                              Grade
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      <a
                        href={submission.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-purple hover:underline flex items-center gap-1"
                      >
                        View on GitHub
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    {submission.feedback && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          <strong>Feedback:</strong> {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Lesson Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>
              <button
                onClick={() => {
                  setShowLessonForm(false);
                  resetLessonForm();
                }}
                className="text-text-gray hover:text-text-dark"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Lesson Title</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Description</label>
                <textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Lesson Type</label>
                <select
                  value={lessonForm.lessonType}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, lessonType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  required
                >
                  <option value="recorded">Recorded Video</option>
                  <option value="live">Live Broadcast</option>
                </select>
              </div>
              
              {lessonForm.lessonType === 'recorded' && (
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-1">YouTube Video URL</label>
                  <input
                    type="url"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
              )}
              
              {lessonForm.lessonType === 'live' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-gray mb-1">Live Broadcast URL</label>
                    <input
                      type="url"
                      value={lessonForm.broadcastUrl}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, broadcastUrl: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                      placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-gray mb-1">Scheduled Date</label>
                      <input
                        type="date"
                        value={lessonForm.scheduledDate}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-gray mb-1">Scheduled Time</label>
                      <input
                        type="time"
                        value={lessonForm.scheduledTime}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Duration</label>
                <input
                  type="text"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  placeholder="45 minutes"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Homework Description</label>
                <textarea
                  value={lessonForm.homeworkDescription}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, homeworkDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  placeholder="Describe the homework assignment for this lesson..."
                />
              </div>
              
              {lessonForm.homeworkDescription && (
                <div>
                  <label className="block text-sm font-medium text-text-gray mb-1">Homework Requirements</label>
                  <div className="space-y-2">
                    {lessonForm.homeworkRequirements.map((requirement, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => updateHomeworkRequirement(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                          placeholder="Enter requirement"
                        />
                        <button
                          type="button"
                          onClick={() => removeHomeworkRequirement(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addHomeworkRequirement}
                      className="btn-secondary text-sm"
                    >
                      Add Requirement
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLessonForm(false);
                    resetLessonForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-700"
                >
                  {editingLesson ? 'Update Lesson' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Homework Modal */}
      {showGradeForm && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Grade Homework</h3>
              <button
                onClick={() => setShowGradeForm(false)}
                className="text-text-gray hover:text-text-dark"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-text-gray">
                <strong>Student:</strong> {enrollments.find(e => e.studentId === selectedHomework.studentId)?.fullName || 'Unknown Student'}
              </p>
              <p className="text-sm text-text-gray">
                <strong>Lesson:</strong> {lessons.find(l => l.id === selectedHomework.lessonId)?.title || 'Unknown Lesson'}
              </p>
            </div>
            
            <form onSubmit={handleGradeHomework} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Grade (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-gray mb-1">Feedback</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                  placeholder="Provide constructive feedback..."
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGradeForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-700"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCoursePage; 