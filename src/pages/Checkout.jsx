import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, CreditCard, MapPin, User, Mail, Phone, Lock, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/useToast';
import CheckoutLayout from '../components/layout/CheckoutLayout';

// VERSION MARKER - Check console for this on page load
console.log('🔥 Checkout.jsx loaded - VERSION v3.0 - LATEST CODE');

const Checkout = () => {
  const navigate = useNavigation();
  const { state, user } = useAuth();
  const { cartItems, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { success: showSuccess, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1); // 1: Cart, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Check for enrollNow query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const enrollNow = searchParams.get('enrollNow') === 'true';
  const courseIdParam = searchParams.get('courseId');

  // Auto-fill billing info from logged-in user
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'VN',
    zipCode: ''
  });

  // Load user info automatically
  useEffect(() => {
    const loadUserInfo = async () => {
      if (user) {
        try {
          // Try to get full profile
          const profileResponse = await api.user.getProfile();
          const profile = profileResponse.data;
          
          // Split full_name into firstName and lastName
          const nameParts = (profile.full_name || user.full_name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          setBillingInfo({
            firstName: firstName,
            lastName: lastName,
            email: profile.email || user.email || '',
            phone: profile.phone || user.phone || '',
            address: profile.address || '',
            city: profile.city || 'Hồ Chí Minh',
            country: profile.country || 'VN',
            zipCode: profile.zipCode || '700000'
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to basic user info
          const nameParts = (user.full_name || '').split(' ');
          setBillingInfo({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phone || '',
            address: '',
            city: 'Hồ Chí Minh',
            country: 'VN',
            zipCode: '700000'
          });
        }
      }
    };
    
    loadUserInfo();
  }, [user]);

  useEffect(() => {
    // If enrollNow mode, skip to payment step
    if (enrollNow && courseIdParam) {
      setCurrentStep(2);
    }
  }, [enrollNow, courseIdParam]);

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'qr' // Default to QR code
  });

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + tax;
  
  // Convert USD to VND for QR payment (1 USD = ~24,000 VND)
  const totalVND = Math.round(total * 24000);

  // Verify payment status with backend
  const verifyPayment = async () => {
    if (!paymentId) return false;
    
    setCheckingPayment(true);
    try {
      const response = await api.checkout.verifyPaymentStatus({ paymentId });
      const verified = response.data?.verified || response.data?.status === 'completed';
      setPaymentVerified(verified);
      
      if (verified) {
        showSuccess('✅ Đã xác nhận thanh toán thành công!');
      } else {
        showError('⏳ Chưa nhận được thanh toán. Vui lòng thử lại sau 1-2 phút.');
      }
      
      return verified;
    } catch (error) {
      console.error('Payment verification error:', error);
      showError('Không thể kiểm tra thanh toán. Vui lòng thử lại.');
      return false;
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleCompleteQRPayment = async () => {
    if (!paymentId) {
      showError('Không tìm thấy thông tin thanh toán');
      return;
    }

    // First verify payment
    setLoading(true);
    try {
      const verified = await verifyPayment();
      
      if (!verified) {
        showError('Chưa nhận được thanh toán. Vui lòng chuyển khoản và thử lại sau 1-2 phút.');
        setLoading(false);
        return;
      }

      console.log('🔄 Step 1: Payment verified, calling completePayment API...');
      const apiPaymentResponse = await api.checkout.completePayment({
        paymentId: paymentId,
        paymentDetails: paymentInfo
      });
      
      console.log('📦 Step 2: API Response:', {
        hasResponse: !!apiPaymentResponse,
        success: apiPaymentResponse?.success,
        hasData: !!apiPaymentResponse?.data,
        fullResponse: apiPaymentResponse
      });
      
      if (!apiPaymentResponse || !apiPaymentResponse.success) {
        console.error('❌ API call failed:', apiPaymentResponse);
        throw new Error(apiPaymentResponse?.error || 'Payment API call failed');
      }
      
      // Backend can return in 2 formats (same as create-order)
      const paymentResponse = apiPaymentResponse.data;
      console.log('📦 Step 3: Payment response:', {
        hasResponse: !!paymentResponse,
        success: paymentResponse?.success,
        hasData: !!paymentResponse?.data,
        hasTransactionRef: !!paymentResponse?.transactionRef,
        fullResponse: paymentResponse
      });
      
      // Smart format detection
      let paymentData;
      if (paymentResponse?.success === true && paymentResponse?.data) {
        // Format 1: Wrapped { success: true, data: {...} }
        console.log('✅ Format 1: Wrapped format');
        paymentData = paymentResponse.data;
      } else if (paymentResponse?.transactionRef) {
        // Format 2: Direct { transactionRef, ... }
        console.log('✅ Format 2: Direct format');
        paymentData = paymentResponse;
      } else {
        // Error
        console.error('❌ Invalid response format:', paymentResponse);
        throw new Error(paymentResponse?.error || paymentResponse?.message || 'Payment completion failed');
      }
      
      console.log('📦 Step 4: Payment data extracted:', paymentData);
      
      setTransactionRef(paymentData.transactionRef);
      clearCart();
      showSuccess('Xác nhận thanh toán thành công!');
      // Force re-render to show success message
      setCurrentStep(4);
    } catch (error) {
      console.error('💥 Complete payment error:', error);
      console.error('💥 Error details:', {
        message: error?.message,
        stack: error?.stack,
        fullError: error
      });
      showError(error?.message || 'Xác nhận thanh toán thất bại. Vui lòng liên hệ hỗ trợ.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 handlePaymentSubmit called [v4.0] - current step:', currentStep);
    console.log('📋 Initial state:', {
      enrollNow,
      courseIdParam,
      cartItemsCount: cartItems.length,
      paymentMethod: paymentInfo.paymentMethod,
      billingInfo,
      user
    });
    
    // Validate user is logged in
    if (!user) {
      showError('Vui lòng đăng nhập để thanh toán');
      navigate('/auth');
      return;
    }

    // Validate billing info is filled (from auto-load)
    if (!billingInfo.email || !billingInfo.firstName) {
      showError('Thông tin thanh toán chưa đầy đủ. Vui lòng kiểm tra lại.');
      return;
    }
    
    setLoading(true);
    
    try {
      if (enrollNow && courseIdParam) {
        // Enroll Now flow - instant enrollment
        console.log('📝 Enroll Now flow');
        const response = await api.checkout.enrollNow({
          courseId: parseInt(courseIdParam),
          billingInfo,
          paymentMethod: paymentInfo.paymentMethod
        });
        setTransactionRef(response.data.transactionRef);
        showSuccess('Đăng ký khóa học thành công!');
        console.log('✅ Moving to step 3');
        setCurrentStep(3);
      } else {
        // Cart flow - multiple courses
        const courses = cartItems.map(item => ({ courseId: item.id }));
        
        console.log('🛒 Cart flow - Creating order with:', { 
          coursesCount: courses.length,
          courses,
          billingInfo, 
          paymentMethod: paymentInfo.paymentMethod 
        });
        
        console.log('🔄 Step 1: Calling api.checkout.createOrder...');
        const apiResponse = await api.checkout.createOrder({
          courses,
          billingInfo,
          paymentMethod: paymentInfo.paymentMethod
        });
        
        console.log('✅ Step 2: Received API Response:', {
          hasResponse: !!apiResponse,
          responseType: typeof apiResponse,
          success: apiResponse?.success,
          hasData: !!apiResponse?.data,
          fullResponse: apiResponse
        });
        
        // Check if API call succeeded
        if (!apiResponse) {
          console.error('❌ CRITICAL: apiResponse is null/undefined');
          throw new Error('Không nhận được phản hồi từ server');
        }
        
        if (!apiResponse.success) {
          console.error('❌ API call failed with:', apiResponse);
          throw new Error(apiResponse?.error || 'API trả về lỗi');
        }
        
        console.log('✅ Step 3: API call successful, unwrapping backend response...');
        // Backend response is wrapped inside apiResponse.data
        const orderResponse = apiResponse.data;
        console.log('📦 Backend orderResponse:', {
          hasOrderResponse: !!orderResponse,
          responseType: typeof orderResponse,
          success: orderResponse?.success,
          hasData: !!orderResponse?.data,
          hasPaymentId: !!orderResponse?.paymentId,
          message: orderResponse?.message,
          fullOrderResponse: orderResponse
        });
        
        // Check if backend returned data
        if (!orderResponse) {
          console.error('❌ CRITICAL: orderResponse is null/undefined');
          throw new Error('Backend không trả về dữ liệu');
        }
        
        // Backend can return in 2 formats:
        // Format 1: { success: true, data: { paymentId, invoiceIds, ... } }
        // Format 2: { paymentId, invoiceIds, totalAmount, ... } (direct data)
        let paymentData;
        if (orderResponse.success === true && orderResponse.data) {
          // Format 1: Wrapped format
          console.log('✅ Step 4a: Backend returned wrapped format');
          paymentData = orderResponse.data;
        } else if (orderResponse.paymentId) {
          // Format 2: Direct data format
          console.log('✅ Step 4b: Backend returned direct format');
          paymentData = orderResponse;
        } else {
          // Error format: { success: false, error: '...' }
          console.error('❌ Backend returned error:', orderResponse);
          throw new Error(orderResponse?.error || orderResponse?.message || 'Backend trả về lỗi');
        }
        
        console.log('✅ Step 5: Extracting payment ID...');
        if (!paymentData) {
          console.error('❌ CRITICAL: paymentData is null/undefined');
          throw new Error('Backend không trả về payment data');
        }
        
        const createdPaymentId = paymentData.paymentId;
        console.log('💳 Payment ID extracted:', {
          hasPaymentId: !!createdPaymentId,
          paymentId: createdPaymentId,
          paymentIdType: typeof createdPaymentId
        });
        
        if (!createdPaymentId) {
          console.error('❌ CRITICAL: paymentId is null/undefined in paymentData:', paymentData);
          throw new Error('Không tạo được mã thanh toán');
        }
        
        setPaymentId(createdPaymentId);
        console.log('✅ Step 5: Payment ID set successfully');
        
        console.log('💳 Payment info:', {
          paymentMethod: paymentInfo.paymentMethod,
          hasCardInfo: !!paymentInfo.cardNumber,
          fullPaymentInfo: paymentInfo
        });
        
        // For QR payment: show QR code and wait for user confirmation
        if (paymentInfo.paymentMethod === 'qr') {
          console.log('🔄 QR Payment path selected');
          try {
            showSuccess('Vui lòng quét mã QR để thanh toán!');
            console.log('✅ Toast displayed');
          } catch (toastError) {
            console.error('⚠️ Toast error (non-critical):', toastError);
          }
          console.log('🔄 Setting currentStep to 3 (QR display)...');
          setCurrentStep(3); // Show confirmation page with QR
          console.log('✅ Step changed to 3 successfully - QR code should display');
        } else {
          // For card payment: complete immediately
          console.log('💳 Card Payment path selected, completing payment immediately...');
          const apiPaymentResponse = await api.checkout.completePayment({
            paymentId: createdPaymentId,
            paymentDetails: paymentInfo
          });
          
          console.log('📦 Payment completion response:', apiPaymentResponse);
          
          if (!apiPaymentResponse || !apiPaymentResponse.success) {
            throw new Error(apiPaymentResponse?.error || 'Payment API call failed');
          }
          
          const paymentResponse = apiPaymentResponse.data;
          if (!paymentResponse || !paymentResponse.success) {
            throw new Error(paymentResponse?.error || 'Payment completion failed');
          }
          
          setTransactionRef(paymentResponse.data.transactionRef);
          clearCart();
          showSuccess('Thanh toán thành công!');
          console.log('✅ Card payment complete, moving to step 3');
          setCurrentStep(3);
        }
      }
    } catch (error) {
      console.error('💥 ============ PAYMENT ERROR ============');
      console.error('💥 Error object:', error);
      console.error('💥 Error message:', error?.message);
      console.error('💥 Error stack:', error?.stack);
      console.error('💥 Error name:', error?.name);
      console.error('💥 Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      console.error('💥 ========================================');
      
      const errorMessage = error?.message || 'Thanh toán thất bại. Vui lòng thử lại.';
      showError(errorMessage);
    } finally {
      console.log('🏁 handlePaymentSubmit finished, setting loading to false');
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: 'Giỏ hàng', icon: ShoppingCart },
    { id: 2, name: 'Thanh toán', icon: CreditCard },
    { id: 3, name: 'Hoàn tất', icon: Check }
  ];

  return (
    <CheckoutLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-teal-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 ml-4 ${
                      currentStep > step.id ? 'bg-teal-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Cart */}
              {currentStep === 1 && !enrollNow && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Giỏ hàng ({cartItems.length} khóa học)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
                        <Button onClick={() => navigate('/catalog')} className="bg-teal-500 hover:bg-teal-600">
                          Khám phá khóa học
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                            <img 
                              src={item.thumbnail || "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=150&auto=format&fit=crop"}
                              alt={item.title}
                              className="w-20 h-14 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-600">{item.instructor || item.instructorName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{item.level || 'All Levels'}</Badge>
                                {item.rating && <span className="text-sm text-gray-500">⭐ {item.rating}</span>}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-semibold text-lg text-gray-900">
                                {formatCurrency(item.price)}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 mt-1"
                                title="Xóa khỏi giỏ hàng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    
                        <div className="flex justify-between pt-4">
                          <Button variant="outline" onClick={() => navigate('/catalog')}>
                            Tiếp tục mua sắm
                          </Button>
                          <Button 
                            onClick={() => setCurrentStep(2)}
                            className="bg-teal-500 hover:bg-teal-600"
                          >
                            Tiến hành thanh toán
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment - Skip Billing, use auto-loaded user info */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Show auto-loaded user info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Thông tin thanh toán</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Họ tên:</span>{' '}
                          <span className="font-medium">{billingInfo.firstName} {billingInfo.lastName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>{' '}
                          <span className="font-medium">{billingInfo.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Điện thoại:</span>{' '}
                          <span className="font-medium">{billingInfo.phone || 'Chưa cập nhật'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Địa chỉ:</span>{' '}
                          <span className="font-medium">{billingInfo.city}, {billingInfo.country}</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      {/* Payment Method Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Phương thức thanh toán
                        </label>
                        <div className="grid md:grid-cols-2 gap-4">
                          {[
                            { id: 'qr', name: 'Chuyển khoản QR Code', icon: '�' },
                            { id: 'card', name: 'Thẻ tín dụng/Ghi nợ', icon: '💳' }
                          ].map(method => (
                            <div
                              key={method.id}
                              className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${
                                paymentInfo.paymentMethod === method.id
                                  ? 'border-teal-500 bg-teal-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setPaymentInfo(prev => ({...prev, paymentMethod: method.id}))}
                            >
                              <div className="text-2xl mb-2">{method.icon}</div>
                              <div className="font-medium">{method.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* QR Code Payment */}
                      {paymentInfo.paymentMethod === 'qr' && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                            {/* Header */}
                            <div className="text-center mb-4">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Quét mã QR để thanh toán
                              </h3>
                              <p className="text-sm text-gray-600">
                                Sử dụng ứng dụng ngân hàng để quét mã QR
                              </p>
                            </div>

                            {/* QR Code Card */}
                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                              {/* Bank Logo */}
                              <div className="flex items-center justify-center mb-4">
                                <img
                                  src="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-OCB-H.png"
                                  alt="OCB Bank"
                                  className="h-12"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'block';
                                  }}
                                />
                                <div style={{display: 'none'}} className="text-2xl font-bold text-green-700">
                                  OCB - Ngân Hàng Phương Đông
                                </div>
                              </div>

                              {/* Account Info */}
                              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-600" />
                                  <div>
                                    <div className="text-xs text-gray-500">Người nhận</div>
                                    <div className="font-semibold text-gray-900">NGUYEN DUC HUY</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-gray-600" />
                                  <div>
                                    <div className="text-xs text-gray-500">Số tài khoản</div>
                                    <div className="font-mono font-semibold text-gray-900">0933027148</div>
                                  </div>
                                </div>
                              </div>

                              {/* QR Code Image */}
                              <div className="flex justify-center mb-4">
                                <div className="bg-white p-4 rounded-lg shadow-inner">
                                  <img
                                    src={`https://img.vietqr.io/image/970448-0933027148-compact2.png?amount=${totalVND}&addInfo=MINICOURSE-${Date.now()}`}
                                    alt="QR Payment Code"
                                    className="w-64 h-64 object-contain"
                                    onError={(e) => {
                                      // Fallback to QR Server API
                                      e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=OCB-0933027148-${totalVND}`;
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Payment Amount */}
                              <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg p-4 text-center">
                                <div className="text-sm opacity-90 mb-1">Số tiền thanh toán</div>
                                <div className="text-3xl font-bold">{formatCurrency(total)}</div>
                                <div className="text-sm opacity-75 mt-1">≈ {totalVND.toLocaleString('vi-VN')} VND</div>
                              </div>

                              {/* Payment Apps */}
                              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
                                <span>Hỗ trợ:</span>
                                <div className="flex gap-2">
                                  <span className="px-2 py-1 bg-red-50 text-red-700 rounded font-medium">VietQR</span>
                                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">Napas 247</span>
                                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded font-medium">PayQo</span>
                                </div>
                              </div>
                            </div>

                            {/* Instructions */}
                            <div className="mt-6 bg-blue-50 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-blue-600">📝</span>
                                Hướng dẫn thanh toán:
                              </h4>
                              <ol className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                  <span className="font-bold text-blue-600">1.</span>
                                  <span>Mở ứng dụng ngân hàng (Mobile Banking) trên điện thoại</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="font-bold text-blue-600">2.</span>
                                  <span>Chọn chức năng <strong>Quét mã QR</strong> hoặc <strong>Chuyển khoản</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="font-bold text-blue-600">3.</span>
                                  <span>Quét mã QR phía trên hoặc nhập thông tin tài khoản</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="font-bold text-blue-600">4.</span>
                                  <span>Kiểm tra thông tin và <strong>xác nhận thanh toán</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="font-bold text-blue-600">5.</span>
                                  <span>Sau khi chuyển khoản thành công, nhấn nút <strong>"Hoàn tất đơn hàng"</strong> bên dưới</span>
                                </li>
                              </ol>
                            </div>

                            {/* Warning Note */}
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                              <strong>⚠️ Lưu ý:</strong> Vui lòng kiểm tra kỹ thông tin tài khoản trước khi chuyển khoản. 
                              Đơn hàng sẽ được xử lý sau khi nhận được thanh toán (thường trong vòng 5-10 phút).
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Payment Form */}
                      {paymentInfo.paymentMethod === 'card' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Số thẻ *
                            </label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                required
                                className="pl-10"
                                value={paymentInfo.cardNumber}
                                onChange={(e) => setPaymentInfo(prev => ({...prev, cardNumber: e.target.value}))}
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày hết hạn *
                              </label>
                              <Input
                                required
                                value={paymentInfo.expiryDate}
                                onChange={(e) => setPaymentInfo(prev => ({...prev, expiryDate: e.target.value}))}
                                placeholder="MM/YY"
                                maxLength="5"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                CVV *
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                  required
                                  className="pl-10"
                                  value={paymentInfo.cvv}
                                  onChange={(e) => setPaymentInfo(prev => ({...prev, cvv: e.target.value}))}
                                  placeholder="123"
                                  maxLength="4"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tên chủ thẻ *
                            </label>
                            <Input
                              required
                              value={paymentInfo.cardholderName}
                              onChange={(e) => setPaymentInfo(prev => ({...prev, cardholderName: e.target.value}))}
                              placeholder="NGUYEN VAN A"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-4">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => setCurrentStep(1)}
                          disabled={loading}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Quay lại giỏ hàng
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-teal-500 hover:bg-teal-600"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              {paymentInfo.paymentMethod === 'qr' ? 'Tạo mã QR thanh toán' : `Thanh toán ${formatCurrency(total)}`}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <Card>
                  <CardContent className="text-center p-8">
                    {transactionRef ? (
                      // Payment completed
                      <>
                        <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
                        <p className="text-gray-600 mb-6">
                          Cảm ơn bạn đã đăng ký. Các khóa học của bạn đã sẵn sàng trong tài khoản.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <div className="text-sm text-gray-600 mb-2">Mã giao dịch</div>
                          <div className="font-mono text-lg font-semibold text-teal-600">
                            {transactionRef}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button 
                            onClick={() => navigate('/my-learning')}
                            className="bg-teal-500 hover:bg-teal-600"
                          >
                            Bắt đầu học
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/catalog')}>
                            Tiếp tục khám phá
                          </Button>
                        </div>
                      </>
                    ) : (
                      // QR Payment - Waiting for confirmation
                      <>
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chờ xác nhận thanh toán</h2>
                        <p className="text-gray-600 mb-6">
                          Vui lòng quét mã QR và chuyển khoản, sau đó nhấn nút bên dưới để hoàn tất đơn hàng.
                        </p>
                        
                        {/* Show QR Code Again */}
                        <div className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200 mb-6">
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            {/* QR Code Image */}
                            <div className="flex justify-center mb-4">
                              <div className="bg-white p-4 rounded-lg shadow-inner">
                                <img
                                  src={`https://img.vietqr.io/image/970448-0933027148-compact2.png?amount=${totalVND}&addInfo=MINICOURSE-${Date.now()}`}
                                  alt="QR Payment Code"
                                  className="w-64 h-64 object-contain"
                                  onError={(e) => {
                                    e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=OCB-0933027148-${totalVND}`;
                                  }}
                                />
                              </div>
                            </div>

                            {/* Account Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-600" />
                                <div>
                                  <div className="text-xs text-gray-500">Người nhận</div>
                                  <div className="font-semibold text-gray-900">NGUYEN DUC HUY</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-600" />
                                <div>
                                  <div className="text-xs text-gray-500">Số tài khoản</div>
                                  <div className="font-mono font-semibold text-gray-900">0933027148</div>
                                </div>
                              </div>
                            </div>

                            {/* Payment Amount */}
                            <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg p-4 text-center">
                              <div className="text-sm opacity-90 mb-1">Số tiền thanh toán</div>
                              <div className="text-3xl font-bold">{formatCurrency(total)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
                          <strong>⚠️ Lưu ý:</strong> Sau khi chuyển khoản thành công, vui lòng đợi 1-2 phút 
                          để hệ thống xác nhận thanh toán. Nhấn nút <strong>"Xác nhận đã thanh toán"</strong> 
                          bên dưới để kiểm tra trạng thái.
                        </div>

                        {paymentVerified && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-sm text-green-800">
                            <strong>✅ Đã xác nhận thanh toán!</strong> Bạn có thể hoàn tất đơn hàng ngay bây giờ.
                          </div>
                        )}

                        <Button 
                          onClick={handleCompleteQRPayment}
                          className={`w-full sm:w-auto ${paymentVerified ? 'bg-green-500 hover:bg-green-600' : 'bg-teal-500 hover:bg-teal-600'}`}
                          disabled={loading || checkingPayment}
                        >
                          {checkingPayment ? (
                            <>
                              <span className="animate-spin mr-2">🔍</span>
                              Đang kiểm tra thanh toán...
                            </>
                          ) : loading ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Đang hoàn tất...
                            </>
                          ) : paymentVerified ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Hoàn tất đơn hàng
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Xác nhận đã thanh toán
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  {enrollNow && courseIdParam ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600">
                        Đăng ký nhanh - Chi tiết khóa học sẽ được hiển thị sau khi hoàn tất
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img 
                            src={item.thumbnail || "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=60&auto=format&fit=crop"}
                            alt={item.title}
                            className="w-12 h-8 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.title}
                            </h4>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>VAT (10%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2 text-teal-600">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="w-4 h-4" />
                      <span>Mã hóa SSL 256-bit an toàn</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
};

export default Checkout;