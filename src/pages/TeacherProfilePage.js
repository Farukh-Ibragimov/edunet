import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Plus, 
  X, 
  Linkedin, 
  Github, 
  Twitter, 
  Globe,
  User,
  Mail,
  GraduationCap,
  Award,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useJsonAuth } from '../context/JsonAuthContext';
import { useUser } from '../context/UserContext';

const TeacherProfilePage = () => {
  const { user } = useJsonAuth();
  const { isTeacher } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    teacherName: '',
    email: '',
    avatar: '',
    bio: '',
    expertise: [''],
    experience: '',
    education: '',
    certifications: [''],
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      website: ''
    }
  });

  useEffect(() => {
    if (!isTeacher) {
      setError('Only teachers can access this page');
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user, isTeacher]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3009/teacherProfiles?teacherId=${user.id}`);
      if (response.ok) {
        const profiles = await response.json();
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setFormData({
            teacherName: profiles[0].teacherName || user.name,
            email: profiles[0].email || user.email,
            avatar: profiles[0].avatar || '',
            bio: profiles[0].bio || '',
            expertise: profiles[0].expertise || [''],
            experience: profiles[0].experience || '',
            education: profiles[0].education || '',
            certifications: profiles[0].certifications || [''],
            socialLinks: {
              linkedin: profiles[0].socialLinks?.linkedin || '',
              github: profiles[0].socialLinks?.github || '',
              twitter: profiles[0].socialLinks?.twitter || '',
              website: profiles[0].socialLinks?.website || ''
            }
          });
        } else {
          // Initialize with user data for new profile
          setFormData(prev => ({
            ...prev,
            teacherName: user.name,
            email: user.email
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const profileData = {
        teacherId: parseInt(user.id),
        teacherName: formData.teacherName,
        email: formData.email,
        avatar: formData.avatar,
        bio: formData.bio,
        expertise: formData.expertise.filter(item => item.trim() !== ''),
        experience: formData.experience,
        education: formData.education,
        certifications: formData.certifications.filter(item => item.trim() !== ''),
        socialLinks: formData.socialLinks,
        coursesTaught: profile?.coursesTaught || 0,
        totalStudents: profile?.totalStudents || 0,
        averageRating: profile?.averageRating || 0,
        totalReviews: profile?.totalReviews || 0,
        updatedAt: new Date().toISOString()
      };

      let response;
      if (profile) {
        // Update existing profile
        response = await fetch(`http://localhost:3009/teacherProfiles/${profile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...profile,
            ...profileData
          }),
        });
      } else {
        // Create new profile
        profileData.createdAt = new Date().toISOString();
        response = await fetch('http://localhost:3009/teacherProfiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const savedProfile = await response.json();
      setProfile(savedProfile);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isTeacher) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-text-gray">Only teachers can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto"></div>
          <p className="mt-4 text-text-gray">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">Teacher Profile</h1>
        <p className="text-text-gray">Create and manage your teaching profile</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-1">Name</label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => handleInputChange('teacherName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-text-gray mb-1">Profile Picture URL</label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-text-gray mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              placeholder="Tell students about yourself, your teaching style, and what makes you unique..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple resize-none"
              required
            />
          </div>
        </div>

        {/* Expertise */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Areas of Expertise
          </h2>
          
          <div className="space-y-3">
            {formData.expertise.map((skill, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayChange('expertise', index, e.target.value)}
                  placeholder="e.g., React, JavaScript, Python"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                />
                {formData.expertise.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('expertise', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('expertise')}
              className="flex items-center gap-2 text-primary-purple hover:text-primary-purple/80"
            >
              <Plus className="w-4 h-4" />
              Add Expertise
            </button>
          </div>
        </div>

        {/* Experience & Education */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Experience & Education
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-1">Years of Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="e.g., 5+ years"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-1">Education</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="e.g., Master's in Computer Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
              />
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certifications
          </h2>
          
          <div className="space-y-3">
            {formData.certifications.map((cert, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => handleArrayChange('certifications', index, e.target.value)}
                  placeholder="e.g., AWS Certified Developer"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                />
                {formData.certifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('certifications', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('certifications')}
              className="flex items-center gap-2 text-primary-purple hover:text-primary-purple/80"
            >
              <Plus className="w-4 h-4" />
              Add Certification
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Social Links
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-1 flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-1 flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub
              </label>
              <input
                type="url"
                value={formData.socialLinks.github}
                onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                placeholder="https://github.com/yourusername"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-1 flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourusername"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-gray mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                value={formData.socialLinks.website}
                onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherProfilePage; 