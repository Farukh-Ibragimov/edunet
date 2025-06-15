import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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
  GraduationCap
} from 'lucide-react';
import StarRating from './StarRating';

const TeacherProfile = ({ teacherId, teacherName, onProfileClick, compact = false }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeacherProfile();
  }, [teacherId]);

  const fetchTeacherProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3009/teacherProfiles?teacherId=${teacherId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch teacher profile');
      }
      const profiles = await response.json();
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick(profile);
    } else {
      // Navigate to teacher profile page
      navigate(`/teacher/${teacherId}`, { 
        state: { 
          teacherProfile: profile,
          teacherName: teacherName 
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <p className="text-red-600">Error loading teacher profile: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-text-dark">{teacherName}</h3>
            <p className="text-sm text-text-gray">Teacher profile not available</p>
          </div>
        </div>
      </div>
    );
  }

  // Compact version for course cards
  if (compact) {
    return (
      <div 
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={handleProfileClick}
      >
        <img 
          src={profile?.avatar || `https://ui-avatars.com/api/?name=${teacherName}&background=6366f1&color=fff`} 
          alt={profile?.teacherName || teacherName}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-text-dark hover:text-primary-purple transition-colors">
            {profile?.teacherName || teacherName}
          </h4>
          <div className="flex items-center gap-2 text-sm text-text-gray">
            {profile ? (
              <>
                <StarRating rating={profile.averageRating} reviews={profile.totalReviews} showReviews={false} />
                <span>•</span>
                <span>{profile.coursesTaught} courses</span>
              </>
            ) : (
              <span>Teacher profile not available</span>
            )}
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-text-gray" />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-start gap-4 mb-6">
        <img 
          src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.teacherName}&background=6366f1&color=fff`} 
          alt={profile.teacherName}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-text-dark mb-1">{profile.teacherName}</h3>
          <p className="text-text-gray mb-2">{profile.bio}</p>
          
          <div className="flex items-center gap-4 text-sm text-text-gray mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <StarRating rating={profile.averageRating} reviews={profile.totalReviews} />
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{profile.totalStudents} students</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{profile.coursesTaught} courses</span>
            </div>
          </div>

          {/* Expertise Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.expertise.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-primary-purple/10 text-primary-purple rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-primary-purple">{profile.coursesTaught}</div>
          <div className="text-xs text-text-gray">Courses</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{profile.totalStudents}</div>
          <div className="text-xs text-text-gray">Students</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{profile.averageRating}</div>
          <div className="text-xs text-text-gray">Rating</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{profile.experience}</div>
          <div className="text-xs text-text-gray">Experience</div>
        </div>
      </div>

      {/* Education & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="font-semibold text-text-dark mb-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Education
          </h4>
          <p className="text-sm text-text-gray">{profile.education}</p>
        </div>
        <div>
          <h4 className="font-semibold text-text-dark mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </h4>
          <div className="space-y-1">
            {profile.certifications.length > 0 ? (
              profile.certifications.map((cert, index) => (
                <p key={index} className="text-sm text-text-gray">• {cert}</p>
              ))
            ) : (
              <p className="text-sm text-text-gray">No certifications listed</p>
            )}
          </div>
        </div>
      </div>

      {/* Social Links */}
      {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
        <div className="mb-4">
          <h4 className="font-semibold text-text-dark mb-3">Connect</h4>
          <div className="flex gap-3">
            {profile.socialLinks.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {profile.socialLinks.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {profile.socialLinks.twitter && (
              <a
                href={profile.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {profile.socialLinks.website && (
              <a
                href={profile.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Contact Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleProfileClick();
        }}
        className="w-full btn-primary flex items-center justify-center gap-2 hover:bg-primary-purple/90 transition-colors"
        type="button"
      >
        <Mail className="w-4 h-4" />
        View Full Profile
      </button>
    </div>
  );
};

export default TeacherProfile; 