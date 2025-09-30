import React from 'react';
import { Users, Target, Heart, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import GuestHeader from '@/components/layout/GuestHeader';
import Footer from '@/components/layout/Footer';

const AboutPage = () => {
  const values = [
    {
      icon: Target,
      title: 'Chất lượng',
      description: 'Cam kết mang đến những khóa học chất lượng cao với nội dung cập nhật và thực tiễn.'
    },
    {
      icon: Heart,
      title: 'Tận tâm',
      description: 'Đồng hành cùng học viên trong suốt quá trình học tập và phát triển sự nghiệp.'
    },
    {
      icon: Users,
      title: 'Cộng đồng',
      description: 'Xây dựng cộng đồng học tập mạnh mẽ, hỗ trợ lẫn nhau cùng tiến bộ.'
    },
    {
      icon: Award,
      title: 'Thành tựu',
      description: 'Ghi nhận và vinh danh những nỗ lực học tập, khuyến khích tinh thần cầu tiến.'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Văn A',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: '10+ năm kinh nghiệm trong lĩnh vực giáo dục trực tuyến'
    },
    {
      name: 'Trần Thị B',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      description: 'Chuyên gia công nghệ với nhiều năm kinh nghiệm phát triển platform'
    },
    {
      name: 'Lê Văn C',
      role: 'Head of Education',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: 'Chuyên gia giáo dục, thiết kế chương trình đào tạo hiệu quả'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestHeader />
      
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Về <span className="text-teal-600">Mini‑Coursera</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chúng tôi là nền tảng học trực tuyến hàng đầu, cam kết mang đến những khóa học 
            chất lượng cao và cơ hội phát triển tốt nhất cho mọi người.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid lg:grid-cols-2 gap-12">
          <Card className="p-8">
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Sứ mệnh</h2>
              <p className="text-gray-600 leading-relaxed">
                Chúng tôi tin rằng giáo dục là chìa khóa mở ra những cơ hội vô hạn. 
                Sứ mệnh của Mini‑Coursera là democratize education - làm cho giáo dục 
                chất lượng cao trở nên dễ tiếp cận với mọi người, mọi nơi.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Chúng tôi nỗ lực không ngừng để xây dựng một nền tảng học trực tuyến 
                hiện đại, nơi mọi người có thể học hỏi, phát triển kỹ năng và thực 
                hiện ước mơ của mình.
              </p>
            </CardContent>
          </Card>

          <Card className="p-8">
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Tầm nhìn</h2>
              <p className="text-gray-600 leading-relaxed">
                Trở thành nền tảng học trực tuyến số 1 Việt Nam và khu vực Đông Nam Á, 
                nơi hàng triệu người học có thể tiếp cận được những khóa học chất lượng 
                cao từ các chuyên gia hàng đầu.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Chúng tôi hướng tới một tương lai nơi việc học không còn bị giới hạn 
                bởi địa lý, thời gian hay hoàn cảnh kinh tế, mà mọi người đều có cơ 
                hội bình đẳng để phát triển bản thân.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Giá trị cốt lõi
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-teal-100 rounded-full flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Đội ngũ lãnh đạo
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 mx-auto rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-teal-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white rounded-2xl p-8 lg:p-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Thành tựu của chúng tôi
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">15,000+</div>
              <div className="text-gray-600">Học viên</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">350+</div>
              <div className="text-gray-600">Khóa học</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">95%</div>
              <div className="text-gray-600">Tỷ lệ hài lòng</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 mb-2">50+</div>
              <div className="text-gray-600">Giảng viên</div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;