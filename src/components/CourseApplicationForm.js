import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useJsonAuth } from '../context/JsonAuthContext';

const CourseApplicationForm = ({ course, onApplicationSubmitted, onClose }) => {
  const { user } = useJsonAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Check if course has available spots
      const courseResponse = await fetch(`http://localhost:3003/courses/${course.id}`);
      const courseData = await courseResponse.json();
      
      if (courseData.maxStudents && courseData.students >= courseData.maxStudents) {
        setError('Sorry, this course is full. No more applications are being accepted.');
        return;
      }

      // Check if student already applied
      const existingApplicationResponse = await fetch(
        `http://localhost:3010/courseApplications?courseId=${course.id}&studentId=${user.id}`
      );
      const existingApplications = await existingApplicationResponse.json();
      
      if (existingApplications.length > 0) {
        setError('You have already applied to this course.');
        return;
      }

      // Submit application
      const applicationData = {
        courseId: course.id,
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        phoneNumber: user.phoneNumber || '',
        message: message.trim(),
        status: 'pending',
        appliedAt: new Date().toISOString(),
        reviewedAt: null,
        teacherResponse: null
      };

      const response = await fetch('http://localhost:3010/courseApplications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setSuccess(true);
      if (onApplicationSubmitted) {
        onApplicationSubmitted(applicationData);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-dark mb-2">Application Submitted!</h3>
          <p className="text-text-gray mb-4">
            Your application has been sent to the instructor. You will be notified when they review your application.
          </p>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Send className="w-5 h-5 text-primary-purple" />
        <h3 className="text-lg font-semibold text-text-dark">Apply for Course</h3>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Course:</strong> {course.title}
        </p>
        <p className="text-sm text-blue-700">
          <strong>Available spots:</strong> {course.maxStudents ? course.maxStudents - course.students : 'Unlimited'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-gray mb-2">
            Why do you want to join this course?
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple resize-none"
            placeholder="Tell the instructor about your background, goals, and why you're interested in this course..."
            required
          />
          <p className="text-xs text-text-gray mt-1">
            {message.length}/500 characters
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseApplicationForm; 