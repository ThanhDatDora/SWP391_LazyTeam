/**
 * SePay Payment Success Page
 * Trang hiển thị khi thanh toán SePay thành công
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/useToast';

export default function SepaySuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success: showSuccess } = useToast();

  useEffect(() => {
    // Show success message
    showSuccess('Thanh toán thành công! Bạn đã được ghi danh vào các khóa học.');
  }, []);

  const orderId = searchParams.get('order_id');
  const transactionId = searchParams.get('transaction_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 mt-2">
              Đơn hàng của bạn đã được xử lý thành công
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {orderId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="font-mono text-sm font-semibold">{orderId}</p>
              </div>
            )}

            {transactionId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Mã giao dịch</p>
                <p className="font-mono text-sm font-semibold">{transactionId}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                ✓ Bạn đã được ghi danh vào các khóa học
              </p>
              <p className="text-sm text-blue-800 mt-1">
                ✓ Thông báo đã được gửi đến email của bạn
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => navigate('/my-learning')}
                className="w-full"
              >
                Đến khóa học của tôi
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
