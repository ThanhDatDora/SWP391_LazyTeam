/**
 * SePay Payment Page
 * Trang thanh toán qua QR Code ngân hàng (SePay)
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/useToast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function SepayPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success: showSuccess, error: showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [countdown, setCountdown] = useState(900); // 15 minutes
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, completed, expired
  
  const checkIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Get cart data from location state
  const cartData = location.state?.cartData;

  useEffect(() => {
    if (!cartData) {
      showError('کhông tìm thấy thông tin đơn hàng');
      navigate('/cart');
      return;
    }

    createPayment();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (paymentData && paymentStatus === 'pending') {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            setPaymentStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownIntervalRef.current);
    }
  }, [paymentData, paymentStatus]);

  // Auto-check payment status
  useEffect(() => {
    if (paymentData && paymentStatus === 'pending') {
      // Check immediately
      checkPaymentStatus();

      // Then check every 5 seconds
      checkIntervalRef.current = setInterval(() => {
        checkPaymentStatus();
      }, 5000);

      return () => clearInterval(checkIntervalRef.current);
    }
  }, [paymentData, paymentStatus]);

  /**
   * Create SePay payment
   */
  const createPayment = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        showError('Vui lòng đăng nhập');
        navigate('/login');
        return;
      }

      console.log('📤 Creating SePay payment with:', {
        courses: cartData.courses,
        billingInfo: cartData.billingInfo
      });

      console.log('📋 Courses detail:', JSON.stringify(cartData.courses, null, 2));

      const response = await axios.post(
        `${API_URL}/payment/sepay/create`,
        {
          courses: cartData.courses, // Already in { courseId } format from Checkout
          billingInfo: cartData.billingInfo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ SePay create payment response:', response.data);

      if (response.data.success) {
        const data = response.data.data;
        setPaymentData(data);
        
        // If SDK provides checkoutUrl and formFields, submit form
        if (data.checkoutUrl && data.formFields) {
          // Create and submit form to SePay
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.checkoutUrl;
          
          // Add all form fields
          Object.keys(data.formFields).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data.formFields[key];
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
          return;
        }
        
        // If QR code is available (fallback method), show it
        if (data.qrCode && data.expiresAt) {
          const expiresAt = new Date(data.expiresAt);
          const now = new Date();
          const remainingSeconds = Math.floor((expiresAt - now) / 1000);
          setCountdown(remainingSeconds > 0 ? remainingSeconds : 900);
        } else {
          // Default countdown
          setCountdown(900);
        }
      } else {
        throw new Error(response.data.message || 'Không thể tạo đơn hàng');
      }
    } catch (error) {
      console.error('Create payment error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      showError(
        error.response?.data?.message || 'Không thể tạo đơn hàng'
      );
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check payment status
   */
  const checkPaymentStatus = async () => {
    if (!paymentData || checking) return;

    try {
      setChecking(true);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/payment/sepay/check-status`,
        {
          paymentId: paymentData.paymentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        if (response.data.paid) {
          // Payment completed!
          setPaymentStatus('completed');
          clearInterval(checkIntervalRef.current);
          clearInterval(countdownIntervalRef.current);
          
          showSuccess('Thanh toán thành công! 🎉');
          
          // Redirect to My Learning after 2 seconds
          setTimeout(() => {
            navigate('/my-learning', {
              state: { fromPayment: true }
            });
          }, 2000);
        } else if (response.data.status === 'expired') {
          setPaymentStatus('expired');
          clearInterval(checkIntervalRef.current);
          clearInterval(countdownIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Check payment status error:', error);
    } finally {
      setChecking(false);
    }
  };

  /**
   * Manual confirmation - User confirms they have transferred
   */
  const handleManualConfirm = async () => {
    if (!paymentData || checking) return;

    // Show confirmation dialog
    if (!window.confirm('Bạn đã chuyển khoản thành công chưa? Vui lòng chỉ xác nhận sau khi đã chuyển khoản đầy đủ số tiền.')) {
      return;
    }

    try {
      setChecking(true);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/payment/sepay/confirm`,
        {
          paymentId: paymentData.paymentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Payment confirmed!
        setPaymentStatus('completed');
        clearInterval(checkIntervalRef.current);
        clearInterval(countdownIntervalRef.current);
        
        showSuccess('Xác nhận thanh toán thành công! Bạn đã được ghi danh khóa học 🎉');
        
        // Redirect to My Learning after 2 seconds
        setTimeout(() => {
          navigate('/my-learning', {
            state: { fromPayment: true }
          });
        }, 2000);
      } else {
        showError(response.data.error || 'Không thể xác nhận thanh toán');
      }
    } catch (error) {
      console.error('Manual confirm error:', error);
      showError('Đã xảy ra lỗi khi xác nhận thanh toán');
    } finally {
      setChecking(false);
    }
  };

  /**
   * Format countdown time
   */
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Copy to clipboard
   */
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showSuccess(`Đã sao chép ${label}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tạo mã thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán qua QR Code
          </h1>
          <p className="text-gray-600">
            Quét mã QR hoặc chuyển khoản thủ công để hoàn tất thanh toán
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Quét mã QR để thanh toán</h2>
              
              {/* Timer */}
              <div className="mt-4">
                {paymentStatus === 'pending' && (
                  <div className={`text-center p-3 rounded-lg ${
                    countdown < 300 ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <div className="text-sm text-gray-600 mb-1">
                      Thời gian còn lại
                    </div>
                    <div className={`text-2xl font-bold ${
                      countdown < 300 ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {formatTime(countdown)}
                    </div>
                  </div>
                )}
                
                {paymentStatus === 'completed' && (
                  <div className="text-center p-3 rounded-lg bg-green-100">
                    <div className="text-green-600 font-semibold text-lg">
                      ✅ Thanh toán thành công!
                    </div>
                  </div>
                )}
                
                {paymentStatus === 'expired' && (
                  <div className="text-center p-3 rounded-lg bg-red-100">
                    <div className="text-red-600 font-semibold">
                      ⏰ Đơn hàng đã hết hạn
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {/* QR Code Image */}
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                {paymentData.qrCode ? (
                  <img 
                    src={paymentData.qrCode} 
                    alt="QR Code" 
                    className="w-full max-w-sm mx-auto"
                  />
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    Không thể tạo mã QR
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📱 Hướng dẫn thanh toán:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                  <li>Chọn chức năng quét mã QR</li>
                  <li>Quét mã QR phía trên</li>
                  <li>Xác nhận thông tin và chuyển khoản</li>
                  <li>Chờ hệ thống xác nhận (tự động)</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Bank Info Section */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Thông tin đơn hàng</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-mono font-semibold">
                    #{paymentData.paymentId}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Số khóa học:</span>
                  <span className="font-semibold">
                    {paymentData.courses.length}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {paymentData.amountFormatted}
                    </span>
                  </div>
                </div>

                {/* Course List */}
                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Khóa học:</h3>
                  <ul className="space-y-2">
                    {paymentData.courses.map((course, index) => (
                      <li key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">{course.title}</span>
                          <span className="font-semibold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(course.price)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Bank Transfer Info */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  Thông tin chuyển khoản thủ công
                </h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Ngân hàng:</label>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded mt-1">
                    <span className="font-semibold">
                      {paymentData.bankInfo.bankCode === 'OCB' ? 'Ngân hàng Phương Đông (OCB)' : paymentData.bankInfo.bankCode}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({paymentData.bankInfo.bankCode})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Số tài khoản:</label>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded mt-1">
                    <span className="font-mono font-semibold">
                      {paymentData.bankInfo.accountNo}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        paymentData.bankInfo.accountNo,
                        'số tài khoản'
                      )}
                    >
                      📋 Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Chủ tài khoản:</label>
                  <div className="bg-gray-50 p-3 rounded mt-1">
                    <span className="font-semibold">
                      {paymentData.bankInfo.accountName}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Số tiền:</label>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded mt-1">
                    <span className="text-xl font-bold text-blue-600">
                      {paymentData.amountFormatted}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        paymentData.amount.toString(),
                        'số tiền'
                      )}
                    >
                      📋 Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Nội dung chuyển khoản:
                  </label>
                  <div className="flex justify-between items-center bg-yellow-50 border border-yellow-300 p-3 rounded mt-1">
                    <span className="font-mono font-semibold text-yellow-900">
                      {paymentData.transactionRef}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        paymentData.transactionRef,
                        'nội dung'
                      )}
                    >
                      📋 Copy
                    </Button>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Vui lòng nhập chính xác nội dung này để hệ thống tự động xác nhận
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary: Manual Confirm Button */}
              <Button
                onClick={handleManualConfirm}
                disabled={checking || paymentStatus !== 'pending'}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg py-6"
              >
                {checking ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    ✅ Tôi đã chuyển khoản
                  </>
                )}
              </Button>

              {/* Secondary: Auto Check Button */}
              <Button
                onClick={checkPaymentStatus}
                disabled={checking || paymentStatus !== 'pending'}
                className="w-full bg-blue-600 hover:bg-blue-700"
                variant="outline"
              >
                {checking ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    🔄 Kiểm tra tự động
                  </>
                )}
              </Button>

              {paymentStatus === 'expired' && (
                <Button
                  onClick={() => navigate('/cart')}
                  className="w-full bg-gray-600 hover:bg-gray-700"
                >
                  Tạo đơn hàng mới
                </Button>
              )}

              <Button
                onClick={() => navigate('/my-learning')}
                variant="outline"
                className="w-full"
              >
                Quay lại trang chủ
              </Button>
            </div>
          </div>
        </div>

        {/* Auto-check indicator */}
        {paymentStatus === 'pending' && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700">
                Hệ thống tự động kiểm tra thanh toán mỗi 5 giây
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
