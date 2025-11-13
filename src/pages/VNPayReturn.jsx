import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, XCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get payment status from URL
    const urlStatus = searchParams.get('status');
    const paymentId = searchParams.get('paymentId');
    const responseCode = searchParams.get('code');

    console.log('🔵 VNPay Return:', { urlStatus, paymentId, responseCode });

    if (urlStatus === 'success') {
      setStatus('success');
      setMessage('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
    } else if (urlStatus === 'failed') {
      setStatus('failed');
      setMessage(getErrorMessage(responseCode));
    } else {
      setStatus('processing');
      setMessage('Đang xử lý thanh toán...');
    }
  }, [searchParams]);

  const getErrorMessage = (code) => {
    const errorMessages = {
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'Thẻ chưa đăng ký dịch vụ Internet Banking',
      '10': 'Thẻ hết hạn sử dụng',
      '11': 'Thẻ bị khóa',
      '12': 'Thẻ chưa được kích hoạt',
      '13': 'Nhập sai mật khẩu quá số lần quy định',
      '24': 'Hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng đang bảo trì',
      '79': 'Nhập sai mật khẩu quá số lần quy định (Internet Banking)',
      '99': 'Lỗi không xác định'
    };

    return errorMessages[code] || 'Thanh toán thất bại. Vui lòng thử lại.';
  };

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/my-learning');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center p-8">
          {status === 'processing' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đang xử lý...
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  ✅ Bạn đã đăng ký khóa học thành công. Hãy bắt đầu học ngay!
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/my-learning')}
                  className="w-full bg-teal-500 hover:bg-teal-600"
                >
                  Bắt đầu học
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/catalog')}
                  className="w-full"
                >
                  Khám phá thêm khóa học
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thất bại
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  ❌ Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-teal-500 hover:bg-teal-600"
                >
                  Thử lại
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/catalog')}
                  className="w-full"
                >
                  Quay lại trang chủ
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VNPayReturn;
