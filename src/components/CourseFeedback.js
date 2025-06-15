import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Send, MessageSquare } from 'lucide-react';
import { useJsonAuth } from '../context/JsonAuthContext';
import { useUser } from '../context/UserContext';
import TeacherProfile from './TeacherProfile';

const CourseFeedback = ({ courseId, onReviewSubmitted }) => {
  const navigate = useNavigate();
  const { user } = useJsonAuth();
  const { isTeacher } = useUser();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [course, setCourse] = useState(null);

  // Check if user has already reviewed this course
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!user || isTeacher) return;
      
      try {
        const response = await fetch(`http://localhost:3008/courseReviews?courseId=${courseId}&studentId=${user.id}`);
        const reviews = await response.json();
        if (reviews.length > 0) {
          setExistingReview(reviews[0]);
          setRating(reviews[0].rating);
          setReview(reviews[0].review);
        }
      } catch (error) {
        console.error('Error checking existing review:', error);
      }
    };

    checkExistingReview();
  }, [user, courseId, isTeacher]);

  // Fetch course data to get teacher information
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:3003/courses/${courseId}`);
        if (response.ok) {
          const courseData = await response.json();
          setCourse(courseData);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue) => {
    setHoverRating(starValue);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || !review.trim()) {
      alert('Please provide both a rating and a review.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        courseId: parseInt(courseId),
        studentId: parseInt(user.id),
        studentName: user.name,
        rating: rating,
        review: review.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let response;
      if (existingReview) {
        // Update existing review
        response = await fetch(`http://localhost:3008/courseReviews/${existingReview.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...existingReview,
            rating: rating,
            review: review.trim(),
            updatedAt: new Date().toISOString()
          }),
        });
      } else {
        // Create new review
        response = await fetch('http://localhost:3008/courseReviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reviewData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const savedReview = await response.json();
      setExistingReview(savedReview);
      setShowForm(false);
      
      // Update course rating
      await updateCourseRating();
      
      if (onReviewSubmitted) {
        onReviewSubmitted(savedReview);
      }

      alert(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCourseRating = async () => {
    try {
      // Get all reviews for this course
      const response = await fetch(`http://localhost:3008/courseReviews?courseId=${courseId}`);
      const reviews = await response.json();
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        // Update course rating and review count
        const courseResponse = await fetch(`http://localhost:3003/courses/${courseId}`);
        const course = await courseResponse.json();
        
        await fetch(`http://localhost:3003/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...course,
            rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            reviews: reviews.length
          }),
        });
      }
    } catch (error) {
      console.error('Error updating course rating:', error);
    }
  };

  const handleEditReview = () => {
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReview(existingReview.review);
    } else {
      setRating(0);
      setReview('');
    }
    setShowForm(false);
  };

  // Don't show feedback component for teachers
  if (isTeacher) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Teacher Profile Section */}
      {course && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">About the Instructor</h3>
          <TeacherProfile 
            teacherId={course.teacherId || 1} 
            teacherName={course.teacher}
            onProfileClick={(profile) => {
              // Navigate to teacher profile page
              navigate(`/teacher/${course.teacherId || 1}`, {
                state: {
                  teacherProfile: profile,
                  teacherName: course.teacher
                }
              });
            }}
          />
        </div>
      )}

      {/* Feedback Form */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary-purple" />
          <h3 className="text-lg font-semibold text-text-dark">Course Feedback</h3>
        </div>

        {existingReview && !showForm ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-5 h-5 ${
                      index < existingReview.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-text-gray">
                {existingReview.rating}/5 stars
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-text-dark">{existingReview.review}</p>
              <p className="text-xs text-text-gray mt-2">
                Reviewed on {new Date(existingReview.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <button
              onClick={handleEditReview}
              className="btn-secondary text-sm"
            >
              Edit Review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">
                Rate this course
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-text-gray">
                  {rating > 0 ? `${rating}/5 stars` : 'Click to rate'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">
                Write your review
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple resize-none"
                placeholder="Share your experience with this course..."
                required
              />
              <p className="text-xs text-text-gray mt-1">
                {review.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !rating || !review.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
              </button>
              
              {existingReview && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CourseFeedback; 