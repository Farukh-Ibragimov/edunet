import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Mail, Phone } from 'lucide-react';

const CourseApplicationsManager = ({ courseId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [courseId]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`http://localhost:3010/courseApplications?courseId=${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId, action, response = '') => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      const updatedApplication = {
        ...application,
        status: action,
        reviewedAt: new Date().toISOString(),
        teacherResponse: response
      };

      // Update application status
      const updateResponse = await fetch(`http://localhost:3010/courseApplications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedApplication),
      });

      if (!updateResponse.ok) throw new Error('Failed to update application');

      // If approved, create enrollment
      if (action === 'approved') {
        const enrollmentData = {
          courseId: application.courseId,
          studentId: application.studentId,
          fullName: application.studentName,
          phoneNumber: application.phoneNumber,
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: 'active',
          progress: 0,
          completedLessons: [],
          homeworkSubmissions: []
        };

        const enrollmentResponse = await fetch('http://localhost:3005/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(enrollmentData),
        });

        if (!enrollmentResponse.ok) throw new Error('Failed to create enrollment');

        // Update course student count
        const courseResponse = await fetch(`http://localhost:3003/courses/${courseId}`);
        const course = await courseResponse.json();
        
        await fetch(`http://localhost:3003/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...course,
            students: course.students + 1
          }),
        });
      }

      // Refresh applications list
      fetchApplications();
    } catch (error) {
      console.error('Error handling application:', error);
      alert('Failed to process application. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple mx-auto"></div>
          <p className="mt-2 text-text-gray">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">No Applications</h3>
          <p className="text-text-gray">No students have applied to this course yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary-purple" />
        <h3 className="text-lg font-semibold text-text-dark">Course Applications ({applications.length})</h3>
      </div>

      {applications.map((application) => (
        <div key={application.id} className="card p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-text-dark">{application.studentName}</h4>
              <div className="flex items-center gap-4 text-sm text-text-gray mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {application.studentEmail}
                </span>
                {application.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {application.phoneNumber}
                  </span>
                )}
              </div>
            </div>
            {getStatusBadge(application.status)}
          </div>

          <div className="mb-3">
            <p className="text-sm text-text-gray mb-2">
              <strong>Applied:</strong> {new Date(application.appliedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-text-dark">{application.message}</p>
          </div>

          {application.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleApplicationAction(application.id, 'approved')}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => {
                  const response = prompt('Please provide a reason for rejection (optional):');
                  handleApplicationAction(application.id, 'rejected', response);
                }}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <XCircle className="w-3 h-3" />
                Reject
              </button>
            </div>
          )}

          {application.status === 'rejected' && application.teacherResponse && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">
                <strong>Rejection reason:</strong> {application.teacherResponse}
              </p>
            </div>
          )}

          {application.status === 'approved' && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700">
                <strong>Approved on:</strong> {new Date(application.reviewedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CourseApplicationsManager; 