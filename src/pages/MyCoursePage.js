import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Lock, User, BookOpen, Star } from 'lucide-react';
import StarRating from '../components/StarRating';

const MyCoursePage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(1);

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

  if (loading) return <div className="max-w-5xl mx-auto py-10 px-4">Loading...</div>;
  if (error) return <div className="max-w-5xl mx-auto py-10 px-4 text-red-600">{error}</div>;
  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-dark">МОЙ КУРС</h1>
        <button className="bg-primary-purple text-white rounded-full p-4 shadow-soft hover:bg-primary-purple/90 transition-all">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-3">
          <div className="card p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full md:w-64 h-48 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                <p className="text-text-gray mb-4">{course.description}</p>
                <div className="flex flex-wrap gap-4 mb-2">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <BookOpen className="w-4 h-4" /> {course.duration}
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <User className="w-4 h-4" /> {course.students} студентов
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <StarRating rating={course.rating} reviews={course.reviews} showReviews={false} />
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {course.lessons?.length || 0} уроков
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* What you'll learn */}
          <div className="card p-6 mb-6">
            <h3 className="font-semibold mb-2">Чему вы научитесь</h3>
            <ul className="list-disc pl-6 space-y-1">
              {course.lessons?.map((lesson, idx) => (
                <li key={idx}>{lesson.title}</li>
              ))}
            </ul>
          </div>
          {/* Lessons Progress */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Процесс</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {course.lessons?.map(lesson => (
                <button
                  key={lesson.id}
                  disabled={!lesson.unlocked}
                  onClick={() => lesson.unlocked && setCurrentLesson(lesson.id)}
                  className={`rounded-2xl p-4 flex flex-col items-center justify-center shadow-soft transition-all border-2 ${
                    lesson.unlocked
                      ? currentLesson === lesson.id
                        ? 'border-primary-purple bg-primary-purple/10'
                        : 'border-gray-200 bg-white hover:bg-primary-purple/5'
                      : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="font-semibold mb-2">{lesson.title}</span>
                  {!lesson.unlocked && <Lock className="w-5 h-5 text-gray-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="card p-6 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-purple to-primary-pink rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
            <User className="w-10 h-10" />
          </div>
          <div className="font-semibold text-lg mb-1">{course.teacher}</div>
          <div className="text-text-gray mb-4">Преподаватель</div>
        </div>
      </div>
    </div>
  );
};

export default MyCoursePage; 