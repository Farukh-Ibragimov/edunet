import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Star, Calendar, BookOpen, CheckCircle, PlayCircle, ChevronDown, Award } from 'lucide-react';
import StarRating from '../components/StarRating';
import EnrollmentForm from '../components/EnrollmentForm';
import { useJsonAuth } from '../context/JsonAuthContext';
import { useUser } from '../context/UserContext';

const CourseInformationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useJsonAuth();
  const { isTeacher } = useUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3003/courses/${id}`);
        if (!response.ok) throw new Error('Course not found');
        const data = await response.json();
        setCourse(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || isTeacher) return;
      
      try {
        const response = await fetch(`http://localhost:3005/enrollments?courseId=${id}&studentId=${user.id}`);
        const enrollments = await response.json();
        if (enrollments.length > 0) {
          setIsEnrolled(true);
          setEnrollment(enrollments[0]);
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
      }
    };

    checkEnrollment();
  }, [user, id, isTeacher]);

  const handleEnrollClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (isTeacher) {
      // Teachers can't enroll in courses
      return;
    }

    if (isEnrolled) {
      // Navigate to student course page
      navigate(`/student-course/${id}`);
      return;
    }

    setShowEnrollmentForm(true);
  };

  const handleEnrollmentSuccess = () => {
    setIsEnrolled(true);
    // Refresh enrollment data
    const checkEnrollment = async () => {
      try {
        const response = await fetch(`http://localhost:3005/enrollments?courseId=${id}&studentId=${user.id}`);
        const enrollments = await response.json();
        if (enrollments.length > 0) {
          setEnrollment(enrollments[0]);
          // Navigate to student course page after successful enrollment
          setTimeout(() => {
            navigate(`/student-course/${id}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
      }
    };
    checkEnrollment();
  };

  if (loading) return <div className="max-w-5xl mx-auto py-10 px-4">Loading...</div>;
  if (error) return <div className="max-w-5xl mx-auto py-10 px-4 text-red-600">{error}</div>;
  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* General Info Block */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <img src={course.image} alt={course.title} className="w-full md:w-80 h-56 object-cover rounded-2xl" />
        <div className="flex-1 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-text-dark">{course.title}</h1>
          <p className="text-text-gray mb-2">{course.description}</p>
          <div className="flex items-center gap-4 font-semibold">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {course.teacher}</span>
            <StarRating rating={course.rating} reviews={course.reviews} />
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.duration}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {course.startDate} - {course.endDate}</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-lg font-bold text-primary-purple">${course.price}</span>
            {isEnrolled ? (
              <button 
                onClick={handleEnrollClick}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Continue Learning
              </button>
            ) : (
              <button 
                onClick={handleEnrollClick}
                className="btn-primary"
                disabled={isTeacher}
              >
                {isTeacher ? 'Teachers cannot enroll' : 'Enroll Now'}
              </button>
            )}
          </div>
          {isEnrolled && enrollment && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                <strong>Enrolled on:</strong> {enrollment.enrollmentDate} | 
                <strong> Progress:</strong> {enrollment.progress}%
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Learn Subjects Block */}
      {course.lessons && (
        <>
          <h2 className="text-xl font-bold mb-4">What you'll learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {course.lessons.map((lesson, idx) => (
              <div key={lesson.id} className="card p-6 relative overflow-hidden">
                <div className={`absolute top-3 left-3`}>
                  <span className="bg-white/90 text-text-dark px-2 py-1 rounded-lg text-xs font-medium">
                    {lesson.title}
                  </span>
                </div>
                <div className="absolute top-2 right-4 text-7xl font-bold text-primary-purple/10 select-none">{idx + 1}</div>
                <div className="font-semibold mb-1">{lesson.title}</div>
                <div className="text-text-gray mb-2">{lesson.duration}</div>
                <button className="btn-secondary text-xs">Course Content</button>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Curriculum Block (if available) */}
      {/* Certificate Block */}
      <div className="card p-6 bg-primary-purple text-white flex flex-col md:flex-row items-center gap-6 mt-8">
        <Award className="w-16 h-16" />
        <div className="flex-1">
          <div className="font-bold text-xl mb-2">Certificate</div>
          <div className="mb-2">Get a certificate after completing the course!</div>
          <button className="btn-secondary bg-white text-primary-purple mt-2">Get Certificate</button>
        </div>
      </div>

      {/* Enrollment Form Modal */}
      {showEnrollmentForm && (
        <EnrollmentForm
          course={course}
          onClose={() => setShowEnrollmentForm(false)}
          onEnrollmentSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
};

export default CourseInformationPage; 