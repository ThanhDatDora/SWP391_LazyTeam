/**
 * SePay Payment Cancel Page
 * Trang hiển thị khi người dùng hủy thanh toán SePay
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/useToast';

export default function SepayCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { info } = useToast();

  useEffect(() => {
    if (info) {
      info('Bạn đã hủy thanh toán');
    }
  }, []);

  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đã hủy thanh toán
            </h1>
            <p className="text-gray-600 mt-2">
              Bạn đã hủy giao dịch thanh toán
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

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Đơn hàng vẫn còn trong giỏ hàng của bạn. Bạn có thể quay lại và thanh toán bất cứ lúc nào.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => navigate('/checkout')}
                className="w-full"
              >
                Tiếp tục thanh toán
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
