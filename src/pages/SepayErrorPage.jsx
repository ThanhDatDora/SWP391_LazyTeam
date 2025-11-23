/**
 * SePay Payment Error Page
 * Trang hiển thị khi thanh toán SePay thất bại
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/useToast';

export default function SepayErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { error: showError } = useToast();

  useEffect(() => {
    showError('Thanh toán thất bại. Vui lòng thử lại.');
  }, []);

  const orderId = searchParams.get('order_id');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mt-2">
              {errorMessage || 'Đã có lỗi xảy ra trong quá trình thanh toán'}
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

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                Lý do có thể:
              </p>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Số dư tài khoản không đủ</li>
                <li>Thông tin thanh toán không chính xác</li>
                <li>Giao dịch bị từ chối bởi ngân hàng</li>
                <li>Kết nối bị gián đoạn</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => navigate('/checkout')}
                className="w-full"
              >
                Thử lại
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/cart')}
                className="w-full"
              >
                Quay lại giỏ hàng
              </Button>
              <Button
                variant="ghost"
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
