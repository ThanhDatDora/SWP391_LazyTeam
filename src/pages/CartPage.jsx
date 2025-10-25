import React from 'react';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import LearnerNavbar from '../components/layout/LearnerNavbar';
import Footer from '../components/layout/Footer';
import { useNavigation } from '../hooks/useNavigation';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const navigate = useNavigation();
  const { cartItems, removeFromCart, getTotalPrice, getItemCount } = useCart();

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.1; // VAT 10%
  const total = totalPrice + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerNavbar />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
          <p className="text-gray-600 mt-2">
            {getItemCount()} khóa học trong giỏ hàng
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-600 mb-6">Khám phá các khóa học và thêm vào giỏ hàng để bắt đầu học.</p>
            <Button onClick={() => navigate('/catalog')} className="bg-teal-500 hover:bg-teal-600">
              Khám phá khóa học
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                            {item.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Xóa khỏi giỏ hàng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">Giảng viên: {item.instructor || item.instructorName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>{item.duration || '10h 30m'}</span>
                          {item.rating && <span>⭐ {item.rating}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-teal-600">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>VAT (10%):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-teal-600">{formatCurrency(total)}</span>
                  </div>
                  <Button 
                    className="w-full bg-teal-500 hover:bg-teal-600" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Tiến hành thanh toán
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate('/catalog')}
                  >
                    Tiếp tục mua sắm
                  </Button>
                  <div className="space-y-2 text-sm text-gray-600 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>Đảm bảo hoàn tiền 30 ngày</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>Truy cập trọn đời</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>Chứng chỉ hoàn thành</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CartPage;