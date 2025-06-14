import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useJsonAuth } from '../context/JsonAuthContext';

const EnrollmentForm = ({ course, onClose, onEnrollmentSuccess }) => {
  const navigate = useNavigate();
  const { user } = useJsonAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkExistingEnrollment = async () => {
    try {
      const response = await fetch(`http://localhost:3005/enrollments?courseId=${course.id}&studentId=${user.id}`);
      const enrollments = await response.json();
      return enrollments.length > 0;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if already enrolled
      const alreadyEnrolled = await checkExistingEnrollment();
      if (alreadyEnrolled) {
        setErrors({ general: 'You are already enrolled in this course' });
        setIsSubmitting(false);
        return;
      }

      // Create enrollment
      const enrollmentData = {
        courseId: course.id,
        studentId: user.id,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        progress: 0,
        completedLessons: [],
        homeworkSubmissions: []
      };

      const response = await fetch('http://localhost:3005/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in course');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onEnrollmentSuccess && onEnrollmentSuccess();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Enrollment error:', error);
      setErrors({ general: 'Failed to enroll in course. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-dark mb-2">Enrollment Successful!</h2>
          <p className="text-text-gray mb-4">You have been successfully enrolled in "{course.title}"</p>
          <p className="text-sm text-text-gray">Redirecting to your course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-dark">Enroll in Course</h2>
          <button
            onClick={onClose}
            className="text-text-gray hover:text-text-dark"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-dark mb-2">{course.title}</h3>
          <p className="text-text-gray text-sm">{course.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-lg font-bold text-primary-purple">${course.price}</span>
            <span className="text-sm text-text-gray">{course.duration}</span>
          </div>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-gray mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-gray" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple ${
                  errors.fullName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-gray mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-gray" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple ${
                  errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Enrolling...' : 'Enroll Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentForm; 