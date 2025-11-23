const fs = require('fs');
const path = require('path');

// Simple character mappings
const fixes = [
  ['Tiáº¿p tá»¥c há»c táº­p', 'Tiếp tục học tập'],
  ['Loáº¡i ná»™i dung khÃ´ng Ä'Æ°á»£c há»— trá»£', 'Loại nội dung không được hỗ trợ'],
  ['Äang táº£i khÃ³a há»c', 'Đang tải khóa học'],
  ['KhÃ´ng thá»ƒ táº£i khÃ³a há»c', 'Không thể tải khóa học'],
  ['Quay láº¡i', 'Quay lại'],
  ['KhÃ³a há»c Ä'ang cáº­p nháº­t', 'Khóa học đang cập nhật'],
  ['Ná»™i dung bÃ i há»c cho khÃ³a há»c nÃ y Ä'ang Ä'Æ°á»£c chuáº©n bá»‹', 'Nội dung bài học cho khóa học này đang được chuẩn bị'],
  ['Vui lÃ²ng quay láº¡i sau hoáº·c chá»n khÃ³a há»c khÃ¡c', 'Vui lòng quay lại sau hoặc chọn khóa học khác'],
  ['Xem khÃ³a há»c khÃ¡c', 'Xem khóa học khác'],
  ['Ná»™i dung khÃ³a há»c', 'Nội dung khóa học'],
  ['bÃ i há»c', 'bài học'],
  ['âœ… ÄÃ£ Ä'áº¡t', '✅ Đã đạt'],
  ['Äiá»ƒm Ä'áº¡t', 'Điểm đạt'],
  ['Lá»—i khi báº¯t Ä'áº§u exam', 'Lỗi khi bắt đầu exam'],
  ['BÃ i thi cuá»'i khÃ³a', 'Bài thi cuối khóa'],
  ['Xem káº¿t quáº£', 'Xem kết quả'],
  ['Báº¯t Ä'áº§u thi', 'Bắt đầu thi'],
  ['Giá» hÃ ng cá»§a báº¡n', 'Giỏ hàng của bạn'],
  ['khÃ³a há»c trong giá» hÃ ng', 'khóa học trong giỏ hàng'],
  ['Giá» hÃ ng cá»§a báº¡n Ä'ang trá»'ng', 'Giỏ hàng của bạn đang trống'],
  ['KhÃ¡m phÃ¡ cÃ¡c khÃ³a há»c vÃ  thÃªm vÃ o giá» hÃ ng Ä'á»ƒ báº¯t Ä'áº§u há»c', 'Khám phá các khóa học và thêm vào giỏ hàng để bắt đầu học'],
  ['KhÃ¡m phÃ¡ khÃ³a há»c', 'Khám phá khóa học'],
  ['XÃ³a khá»i giá» hÃ ng', 'Xóa khỏi giỏ hàng'],
  ['Giáº£ng viÃªn', 'Giảng viên'],
  ['TÃ³m táº¯t Ä'Æ¡n hÃ ng', 'Tóm tắt đơn hàng'],
  ['Táº¡m tÃ­nh', 'Tạm tính'],
  ['Tá»•ng cá»™ng', 'Tổng cộng'],
  ['Tiáº¿n hÃ nh thanh toÃ¡n', 'Tiến hành thanh toán'],
  ['Tiáº¿p tá»¥c mua sáº¯m', 'Tiếp tục mua sắm'],
  ['Äáº£m báº£o hoÃ n tiá»n 30 ngÃ y', 'Đảm bảo hoàn tiền 30 ngày'],
  ['Truy cáº­p trá»n Ä'á»i', 'Truy cập trọn đời'],
  ['Chá»©ng chá»‰ hoÃ n thÃ nh', 'Chứng chỉ hoàn thành'],
  ['ÄÄƒng nháº­p tháº¥t báº¡i', 'Đăng nhập thất bại'],
  ['Lá»—i há»‡ thá»'ng', 'Lỗi hệ thống'],
  ['ÄÄƒng kÃ½ tháº¥t báº¡i', 'Đăng ký thất bại'],
  ['KhÃ´ng thá»ƒ káº¿t ná»'i vá»›i Google OAuth', 'Không thể kết nối với Google OAuth'],
  ['Lá»—i káº¿t ná»'i Ä'áº¿n server', 'Lỗi kết nối đến server'],
  ['Vui lÃ²ng kiá»ƒm tra xem backend cÃ³ Ä'ang cháº¡y khÃ´ng', 'Vui lòng kiểm tra xem backend có đang chạy không'],
  ['Vui lÃ²ng nháº­p', 'Vui lòng nhập'],
  ['há» vÃ  tÃªn', 'họ và tên'],
  ['máº­t kháº©u', 'mật khẩu'],
  ['vai trÃ²', 'vai trò'],
  ['tiÃªu Ä'á» chuyÃªn mÃ´n', 'tiêu đề chuyên môn'],
  ['tiá»ƒu sá»­', 'tiểu sử'],
  ['báº±ng cáº¥p vÃ  chá»©ng chá»‰', 'bằng cấp và chứng chỉ'],
  ['kinh nghiá»‡m lÃ m viá»‡c', 'kinh nghiệm làm việc'],
  ['MÃ£ OTP Ä'Ã£ Ä'Æ°á»£c gá»­i Ä'áº¿n email cá»§a báº¡n', 'Mã OTP đã được gửi đến email của bạn'],
  ['KhÃ´ng thá»ƒ gá»­i OTP', 'Không thể gửi OTP'],
  ['MÃ£ OTP má»›i Ä'Ã£ Ä'Æ°á»£c gá»­i', 'Mã OTP mới đã được gửi'],
  ['KhÃ´ng thá»ƒ gá»­i láº¡i OTP', 'Không thể gửi lại OTP'],
  ['KhÃ¡m phÃ¡ khÃ³a há»c', 'Khám phá khóa học'],
  ['Há»c viÃªn', 'Học viên'],
  ['Cáº¥p Ä'á»™', 'Cấp độ'],
  ['khÃ³a hoÃ n thÃ nh', 'khóa hoàn thành'],
  ['KhÃ³a há»c hoÃ n thÃ nh', 'Khóa học hoàn thành'],
  ['BÃ i há»c hoÃ n thÃ nh', 'Bài học hoàn thành'],
  ['BÃ i thi Ä'áº¡t yÃªu cáº§u', 'Bài thi đạt yêu cầu'],
  ['Tá»•ng thá»i gian há»c', 'Tổng thời gian học'],
  ['Tiáº¿n Ä'á»™ tá»•ng quan', 'Tiến độ tổng quan'],
  ['Tiáº¿n Ä'á»™ hoÃ n thÃ nh', 'Tiến độ hoàn thành'],
  ['Thá»i gian há»c', 'Thời gian học'],
  ['Chi tiáº¿t khÃ³a há»c', 'Chi tiết khóa học'],
  ['Hoáº¡t Ä'á»™ng cuá»'i', 'Hoạt động cuối'],
  ['Tiáº¿n Ä'á»™ khÃ³a há»c', 'Tiến độ khóa học'],
  ['Tiáº¿n Ä'á»™ bÃ i há»c', 'Tiến độ bài học'],
  ['Káº¿t quáº£ thi', 'Kết quả thi'],
  ['bÃ i', 'bài'],
  ['Äiá»ƒm trung bÃ¬nh', 'Điểm trung bình'],
  ['Má»¥c tiÃªu', 'Mục tiêu'],
  ['chÆ°Æ¡ng', 'chương'],
  ['Tiáº¿p tá»¥c há»c', 'Tiếp tục học'],
  ['Báº¯t Ä'áº§u há»c', 'Bắt đầu học'],
  ['ChÆ°a tham gia khÃ³a há»c nÃ o', 'Chưa tham gia khóa học nào'],
  ['Báº¯t Ä'áº§u hÃ nh trÃ¬nh há»c táº­p cá»§a báº¡n báº±ng cÃ¡ch tham gia má»™t khÃ³a há»c', 'Bắt đầu hành trình học tập của bạn bằng cách tham gia một khóa học']
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    fixes.forEach(([old, correct]) => {
      if (content.includes(old)) {
        content = content.replaceAll(old, correct);
        changed = true;
        console.log(`Fixed: ${old} → ${correct}`);
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error: ${filePath}`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let totalFixed = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      totalFixed += processDirectory(fullPath);
    } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      if (fixFile(fullPath)) {
        totalFixed++;
      }
    }
  }
  return totalFixed;
}

console.log('🔤 Starting UTF-8 fix...');
const srcPath = path.join(__dirname, 'src');
const fixed = processDirectory(srcPath);
console.log(`\n🎉 Complete! Fixed ${fixed} files`);
console.log('💡 Now clear browser cache: Ctrl+Shift+R');