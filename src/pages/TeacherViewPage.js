import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Users, 
  BookOpen, 
  Award, 
  Linkedin, 
  Github, 
  Twitter, 
  Globe,
  ExternalLink,
  Mail,
  Calendar,
  GraduationCap,
  MapPin
} from 'lucide-react';

const TeacherViewPage = () => {
  const { teacherId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [teacherProfile, setTeacherProfile] = useState(location.state?.teacherProfile || null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [loading, setLoading] = useState(!teacherProfile);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teacherProfile) {
      fetchTeacherProfile();
    }
    fetchTeacherCourses();
  }, [teacherId, teacherProfile]);

  const fetchTeacherProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3009/teacherProfiles?teacherId=${teacherId}`);
      if (response.ok) {
        const profiles = await response.json();
        if (profiles.length > 0) {
          setTeacherProfile(profiles[0]);
        }
      } else {
        setError('Failed to fetch teacher profile');
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      setError('Error loading teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherCourses = async () => {
    try {
      const response = await fetch('http://localhost:3003/courses');
      if (response.ok) {
        const allCourses = await response.json();
        const courses = allCourses.filter(course => course.teacherId === parseInt(teacherId));
        setTeacherCourses(courses);
      }
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto"></div>
          <p className="mt-4 text-text-gray">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-text-gray mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!teacherProfile) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Teacher Not Found</h1>
          <p className="text-text-gray mb-6">The teacher profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-gray hover:text-text-dark mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={teacherProfile.avatar || `https://ui-avatars.com/api/?name=${teacherProfile.teacherName}&background=6366f1&color=fff`} 
            alt={teacherProfile.teacherName}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
          />
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-2">{teacherProfile.teacherName}</h1>
            <p className="text-lg text-text-gray mb-3">{teacherProfile.bio}</p>
            
            <div className="flex items-center gap-6 text-sm text-text-gray">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-medium">{teacherProfile.averageRating}</span>
                <span>({teacherProfile.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{teacherProfile.totalStudents} students</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{teacherProfile.coursesTaught} courses</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{teacherProfile.experience} experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {teacherProfile.expertise && teacherProfile.expertise.map((skill, index) => (
            <span 
              key={index}
              className="px-4 py-2 bg-primary-purple/10 text-primary-purple rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-dark mb-4">About</h2>
            <p className="text-text-gray leading-relaxed mb-6">{teacherProfile.bio}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-text-dark mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </h3>
                <p className="text-text-gray">{teacherProfile.education}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-text-dark mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Certifications
                </h3>
                <div className="space-y-1">
                  {teacherProfile.certifications && teacherProfile.certifications.length > 0 ? (
                    teacherProfile.certifications.map((cert, index) => (
                      <p key={index} className="text-text-gray">• {cert}</p>
                    ))
                  ) : (
                    <p className="text-text-gray">No certifications listed</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Teacher's Courses */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Courses by {teacherProfile.teacherName}</h2>
            
            {teacherCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
                <p className="text-text-gray">This teacher hasn't published any courses yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacherCourses.map(course => (
                  <div 
                    key={course.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-text-dark mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-text-gray mb-2 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{course.rating}</span>
                        <span className="text-text-gray">({course.reviews})</span>
                      </div>
                      <span className="font-semibold text-primary-purple">${course.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact & Social */}
          <div className="card p-6">
            <h3 className="font-semibold text-text-dark mb-4">Contact & Social</h3>
            
            {teacherProfile.socialLinks && Object.values(teacherProfile.socialLinks).some(link => link) && (
              <div className="space-y-3">
                {teacherProfile.socialLinks.linkedin && (
                  <a
                    href={teacherProfile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}
                
                {teacherProfile.socialLinks.github && (
                  <a
                    href={teacherProfile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}
                
                {teacherProfile.socialLinks.twitter && (
                  <a
                    href={teacherProfile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}
                
                {teacherProfile.socialLinks.website && (
                  <a
                    href={teacherProfile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Website</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}
              </div>
            )}
            
            {!Object.values(teacherProfile.socialLinks || {}).some(link => link) && (
              <p className="text-text-gray text-sm">No social links available</p>
            )}
          </div>

          {/* Stats */}
          <div className="card p-6">
            <h3 className="font-semibold text-text-dark mb-4">Teaching Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-gray">Courses Taught</span>
                <span className="font-semibold text-primary-purple">{teacherProfile.coursesTaught}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-gray">Total Students</span>
                <span className="font-semibold text-green-600">{teacherProfile.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-gray">Average Rating</span>
                <span className="font-semibold text-yellow-600">{teacherProfile.averageRating}/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-gray">Total Reviews</span>
                <span className="font-semibold text-blue-600">{teacherProfile.totalReviews}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherViewPage; 