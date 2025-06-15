import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';

const PaymentManager = ({ teacherId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, pending, failed

  useEffect(() => {
    fetchPayments();
  }, [teacherId]);

  const fetchPayments = async () => {
    try {
      // First get all courses by this teacher
      const coursesResponse = await fetch(`http://localhost:3000/courses?teacherId=${teacherId}`);
      const courses = await coursesResponse.json();
      const courseIds = courses.map(course => course.id);

      // Then get all payments for these courses
      const paymentsResponse = await fetch('http://localhost:3011/payments');
      const allPayments = await paymentsResponse.json();
      
      // Filter payments for teacher's courses
      const teacherPayments = allPayments.filter(payment => 
        courseIds.includes(payment.courseId)
      );

      setPayments(teacherPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const totalRevenue = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-text-gray">Total Revenue</p>
              <p className="text-xl font-bold text-text-dark">${totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-text-gray">Completed Payments</p>
              <p className="text-xl font-bold text-text-dark">
                {payments.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-text-gray">Pending Payments</p>
              <p className="text-xl font-bold text-text-dark">{pendingPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-text-gray" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
          >
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-dark mb-4">Payment Records</h3>
        
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-text-gray">No payments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-text-gray">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-text-gray">Course ID</th>
                  <th className="text-left py-3 px-4 font-medium text-text-gray">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-text-gray">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-text-gray">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-text-gray">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-text-dark">{payment.studentName}</p>
                        <p className="text-sm text-text-gray">ID: {payment.studentId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-dark">{payment.courseId}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-green-600">${payment.amount}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-gray">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-gray font-mono">
                      {payment.transactionId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManager; 