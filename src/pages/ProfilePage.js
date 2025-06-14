import React, { useState } from 'react';
import { User, Edit, Award, BookOpen, TrendingUp, Trophy, Briefcase, GraduationCap } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useJsonAuth } from '../context/JsonAuthContext';

const ProfilePage = () => {
  const [tab, setTab] = useState('courses');
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);
  const { isTeacher } = useUser();
  const { user, loading } = useJsonAuth();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="animate-pulse">
          <div className="flex items-center gap-8 mb-10">
            <div className="w-28 h-28 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-dark mb-4">Please log in to view your profile</h1>
          <p className="text-text-gray">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  // Provide default values for missing properties
  const userWithDefaults = {
    ...user,
    specialization: user.specialization || 'General Education',
    activity: user.activity || [],
    courses: user.courses || [],
    achievements: user.achievements || [],
    level: user.level || 'Beginner',
    xp: user.xp || 0,
    growth: user.growth || { progress: 0, current: 'Beginner', next: 'Intermediate' },
    workExperience: user.workExperience || [],
    education: user.education || []
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Top section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        <div className="flex-shrink-0">
          <div className="w-28 h-28 bg-gradient-to-r from-primary-purple to-primary-pink rounded-full flex items-center justify-center text-white text-4xl font-bold">
            <User className="w-16 h-16" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-text-dark">{userWithDefaults.name}</h1>
            <span className="text-primary-purple text-lg capitalize">({userWithDefaults.role})</span>
          </div>
          {isTeacher && (
            <p className="text-text-gray mb-2">{userWithDefaults.specialization}</p>
          )}
          <div className="flex items-center gap-2 mb-2">
            {editing ? (
              <input
                className="border rounded px-2 py-1 text-text-dark"
                value={bio}
                onChange={e => setBio(e.target.value)}
                onBlur={() => setEditing(false)}
                autoFocus
              />
            ) : (
              <span className="text-text-gray">{bio}</span>
            )}
            <button onClick={() => setEditing(true)} className="ml-2 p-1 hover:bg-gray-100 rounded-full">
              <Edit className="w-4 h-4 text-primary-purple" />
            </button>
          </div>
        </div>
      </div>

      {/* Activity Calendar (Student only) - GitHub Style */}
      {!isTeacher && userWithDefaults.activity.length > 0 && (
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="font-semibold text-lg mb-4 text-text-dark">Learning Activity</h2>
          
          {/* Activity Grid */}
          <div className="flex gap-1 mb-4">
            {userWithDefaults.activity.map((day, idx) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${day.count === 0 ? 'bg-gray-100' : day.count === 1 ? 'bg-green-200' : day.count === 2 ? 'bg-green-300' : day.count === 3 ? 'bg-green-400' : 'bg-green-500'} transition-colors duration-200 hover:scale-110 cursor-pointer`}
                title={`${new Date(day.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}: ${day.count} lessons completed`}
              />
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm text-text-gray">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
              <div className="w-3 h-3 rounded-sm bg-green-200"></div>
              <div className="w-3 h-3 rounded-sm bg-green-300"></div>
              <div className="w-3 h-3 rounded-sm bg-green-400"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500"></div>
            </div>
            <span>More</span>
          </div>
          
          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold text-text-dark">
                  {userWithDefaults.activity.filter(day => day.count > 0).length}
                </span>
                <span className="text-text-gray ml-1">days with activity</span>
              </div>
              <div>
                <span className="font-semibold text-text-dark">
                  {userWithDefaults.activity.reduce((sum, day) => sum + day.count, 0)}
                </span>
                <span className="text-text-gray ml-1">total lessons completed</span>
              </div>
              <div>
                <span className="font-semibold text-text-dark">
                  {Math.max(...userWithDefaults.activity.map(day => day.count))}
                </span>
                <span className="text-text-gray ml-1">most lessons in a day</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('courses')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'courses' ? 'bg-primary-purple text-white' : 'bg-gray-100 text-text-dark'}`}>
          {isTeacher ? 'My Teaching' : 'Courses'}
        </button>
        <button onClick={() => setTab('achievements')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'achievements' ? 'bg-primary-purple text-white' : 'bg-gray-100 text-text-dark'}`}>Achievements</button>
        {!isTeacher && (
          <button onClick={() => setTab('growth')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'growth' ? 'bg-primary-purple text-white' : 'bg-gray-100 text-text-dark'}`}>Growth Path</button>
        )}
        {isTeacher && (
          <>
            <button onClick={() => setTab('experience')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'experience' ? 'bg-primary-purple text-white' : 'bg-gray-100 text-text-dark'}`}>Experience</button>
            <button onClick={() => setTab('education')} className={`px-4 py-2 rounded-lg font-medium ${tab === 'education' ? 'bg-primary-purple text-white' : 'bg-gray-100 text-text-dark'}`}>Education</button>
          </>
        )}
      </div>

      {/* Tab Content */}
      {tab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userWithDefaults.courses.length > 0 ? (
            userWithDefaults.courses.map(course => (
              <div key={course.id} className="card flex items-center gap-4 p-4">
                <img src={course.image} alt={course.name} className="w-20 h-16 object-cover rounded-lg" />
                <div>
                  <div className="font-semibold">{course.name}</div>
                  <button className="btn-primary mt-2 text-xs">Open</button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-text-gray">No courses yet. Start learning to see your progress here!</p>
            </div>
          )}
        </div>
      )}
      {tab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userWithDefaults.achievements.length > 0 ? (
            userWithDefaults.achievements.map(cert => (
              <div key={cert.id} className="card flex items-center gap-4 p-4">
                <Award className="w-10 h-10 text-primary-purple" />
                <div>
                  <div className="font-semibold">{cert.title}</div>
                  <button className="btn-secondary mt-2 text-xs">View Certificate</button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-text-gray">No achievements yet. Complete courses to earn certificates!</p>
            </div>
          )}
        </div>
      )}
      {tab === 'growth' && !isTeacher && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-8 h-8 text-primary-purple" />
            <div>
              <div className="font-semibold">Current Level: {userWithDefaults.level}</div>
              <div className="text-text-gray">XP: {userWithDefaults.xp}</div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
            <div className="bg-primary-purple h-4 rounded-full" style={{ width: `${userWithDefaults.growth.progress}%` }}></div>
          </div>
          <div className="text-sm text-text-gray">
            {userWithDefaults.growth.current} → {userWithDefaults.growth.next}
          </div>
        </div>
      )}
      {tab === 'experience' && isTeacher && (
        <div className="space-y-4">
          {userWithDefaults.workExperience.length > 0 ? (
            userWithDefaults.workExperience.map((exp, idx) => (
              <div key={idx} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text-dark">{exp.title}</h3>
                    <p className="text-primary-purple">{exp.company}</p>
                    <p className="text-text-gray text-sm">{exp.duration}</p>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-text-gray">
                    {exp.format}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-text-gray">No work experience added yet.</p>
            </div>
          )}
        </div>
      )}
      {tab === 'education' && isTeacher && (
        <div className="space-y-4">
          {userWithDefaults.education.length > 0 ? (
            userWithDefaults.education.map((edu, idx) => (
              <div key={idx} className="card p-4">
                <div className="flex items-start gap-4">
                  <GraduationCap className="w-8 h-8 text-primary-purple mt-1" />
                  <div>
                    <h3 className="font-semibold text-text-dark">{edu.degree}</h3>
                    <p className="text-primary-purple">{edu.institution}</p>
                    <p className="text-text-gray text-sm">{edu.duration}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-text-gray">No education information added yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 