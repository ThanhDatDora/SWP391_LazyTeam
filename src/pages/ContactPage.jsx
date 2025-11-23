import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import GuestHeader from '../components/layout/GuestHeader';
import Footer from '../components/layout/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Here you would typically send the data to your backend
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Điện thoại',
      details: ['Hotline: 1800-6666', 'Support: 028-1234-5678'],
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['support@minicousera.com', 'contact@minicousera.com'],
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: MapPin,
      title: 'Địa chỉ',
      details: ['123 Đường ABC, Quận 1', 'TP. Hồ Chí Minh, Việt Nam'],
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Clock,
      title: 'Giờ làm việc',
      details: ['Thứ 2 - Thứ 6: 8:00 - 18:00', 'Thứ 7: 8:00 - 12:00'],
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const officeLocations = [
    {
      city: 'Hồ Chí Minh',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '028-1234-5678',
      isPrimary: true
    },
    {
      city: 'Hà Nội',
      address: '456 Đường XYZ, Quận Ba Đình, Hà Nội',
      phone: '024-1234-5678',
      isPrimary: false
    },
    {
      city: 'Đà Nẵng',
      address: '789 Đường DEF, Quận Hải Châu, Đà Nẵng',
      phone: '0236-1234-567',
      isPrimary: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestHeader />
      
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Liên hệ với <span className="text-teal-600">chúng tôi</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin 
            và chúng tôi sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </section>

        {/* Contact Info Cards */}
        <section>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${info.color}`}>
                    <info.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-gray-600 text-sm">{detail}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="p-8">
            <CardContent>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ tên *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nhập họ tên của bạn"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Nhập địa chỉ email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Nhập tiêu đề tin nhắn"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                  <Send className="w-4 h-4 mr-2" />
                  Gửi tin nhắn
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Map & Office Locations */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <Card className="p-6">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Vị trí của chúng tôi</h3>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>Google Maps Integration</p>
                    <p className="text-sm">(Sẽ được tích hợp trong phiên bản production)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Office Locations */}
            <Card className="p-6">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Văn phòng của chúng tôi</h3>
                <div className="space-y-4">
                  {officeLocations.map((office, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${office.isPrimary ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{office.city}</h4>
                        {office.isPrimary && (
                          <span className="px-2 py-1 bg-teal-600 text-white text-xs rounded-full">
                            Trụ sở chính
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{office.address}</p>
                      <p className="text-gray-600 text-sm">📞 {office.phone}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Câu hỏi thường gặp
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Làm thế nào để đăng ký khóa học?</h4>
                <p className="text-gray-600 text-sm">Bạn cần tạo tài khoản, chọn khóa học mong muốn và hoàn tất thanh toán.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tôi có thể hoàn tiền không?</h4>
                <p className="text-gray-600 text-sm">Chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu bạn chưa hoàn thành quá 20% khóa học.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Chứng chỉ có giá trị không?</h4>
                <p className="text-gray-600 text-sm">Chứng chỉ của chúng tôi được công nhận bởi nhiều doanh nghiệp và tổ chức giáo dục.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Thời gian học có giới hạn không?</h4>
                <p className="text-gray-600 text-sm">Sau khi đăng ký, bạn có thể truy cập khóa học trọn đời với tất cả cập nhật mới.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Có hỗ trợ kỹ thuật không?</h4>
                <p className="text-gray-600 text-sm">Đội ngũ hỗ trợ kỹ thuật 24/7 sẵn sàng giúp đỡ bạn qua email và chat.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Có thể học trên mobile không?</h4>
                <p className="text-gray-600 text-sm">Nền tảng được tối ưu cho mọi thiết bị, bạn có thể học mọi lúc mọi nơi.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;