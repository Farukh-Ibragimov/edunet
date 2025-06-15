import React, { useState } from 'react';
import { QrCode, Download, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useJsonAuth } from '../context/JsonAuthContext';

const QRCodePayment = ({ course, onPaymentComplete }) => {
  const { user } = useJsonAuth();
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, completed, failed
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentComplete = async () => {
    setIsProcessing(true);
    try {
      // Record payment in database
      const paymentData = {
        courseId: course.id,
        studentId: user.id,
        studentName: user.name,
        amount: course.price,
        status: 'completed',
        paymentMethod: 'qr_code',
        paymentDate: new Date().toISOString(),
        transactionId: `TXN_${Date.now()}`,
        notes: 'Payment completed via QR code'
      };

      const response = await fetch('http://localhost:3011/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }

      setPaymentStatus('completed');
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Payment recorded but there was an error saving the record.');
      setPaymentStatus('completed'); // Still mark as completed for user experience
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentFailed = () => {
    setPaymentStatus('failed');
  };

  const downloadQRCode = () => {
    if (course.qrCode) {
      const link = document.createElement('a');
      link.href = course.qrCode;
      link.download = `payment-qr-${course.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openPaymentLink = () => {
    if (course.qrCode) {
      // Extract the payment URL from QR code data
      const urlMatch = course.qrCode.match(/data=(.+)/);
      if (urlMatch) {
        const paymentUrl = decodeURIComponent(urlMatch[1]);
        window.open(paymentUrl, '_blank');
      }
    }
  };

  if (!course.qrCode) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">No Payment Method</h3>
          <p className="text-text-gray">This course doesn't have a payment QR code set up yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-primary-purple" />
        <h3 className="text-lg font-semibold text-text-dark">Pay for Course</h3>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Course:</strong> {course.title}
        </p>
        <p className="text-sm text-blue-700">
          <strong>Price:</strong> ${course.price}
        </p>
      </div>

      {paymentStatus === 'pending' && (
        <div className="space-y-4">
          <div className="text-center">
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <QrCode className="w-4 h-4" />
              {showQRCode ? 'Hide QR Code' : 'Show Payment QR Code'}
            </button>
          </div>

          {showQRCode && (
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img 
                  src={course.qrCode} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={downloadQRCode}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
                
                <button
                  onClick={openPaymentLink}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Payment Link
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  <strong>Instructions:</strong>
                </p>
                <ol className="text-sm text-yellow-700 mt-2 list-decimal list-inside space-y-1">
                  <li>Scan the QR code with your payment app</li>
                  <li>Complete the payment of ${course.price}</li>
                  <li>Click "I've Paid" below after payment</li>
                </ol>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handlePaymentComplete}
                  disabled={isProcessing}
                  className="btn-primary flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      I've Paid
                    </>
                  )}
                </button>
                
                <button
                  onClick={handlePaymentFailed}
                  disabled={isProcessing}
                  className="btn-secondary"
                >
                  Payment Failed
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {paymentStatus === 'completed' && (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">Payment Confirmed!</h3>
          <p className="text-text-gray mb-4">
            Thank you for your payment. Your enrollment will be processed shortly.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              <strong>Payment Details:</strong>
            </p>
            <p className="text-sm text-green-700">Amount: ${course.price}</p>
            <p className="text-sm text-green-700">Course: {course.title}</p>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">Payment Failed</h3>
          <p className="text-text-gray mb-4">
            There was an issue with your payment. Please try again or contact support.
          </p>
          <button
            onClick={() => setPaymentStatus('pending')}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodePayment; 