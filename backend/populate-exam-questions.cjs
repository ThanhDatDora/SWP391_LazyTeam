const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Question banks by course topic
const questionBanks = {
  // Course 3: Python for Data Science
  3: [
    {
      stem: 'Python được tạo ra bởi ai?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Guido van Rossum', is_correct: true },
        { label: 'B', content: 'James Gosling', is_correct: false },
        { label: 'C', content: 'Dennis Ritchie', is_correct: false },
        { label: 'D', content: 'Bjarne Stroustrup', is_correct: false }
      ]
    },
    {
      stem: 'Thư viện nào được sử dụng phổ biến nhất cho Data Science trong Python?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'NumPy', is_correct: true },
        { label: 'B', content: 'React', is_correct: false },
        { label: 'C', content: 'jQuery', is_correct: false },
        { label: 'D', content: 'Angular', is_correct: false }
      ]
    },
    {
      stem: 'Pandas DataFrame có mấy chiều (dimensions)?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: '1 chiều', is_correct: false },
        { label: 'B', content: '2 chiều', is_correct: true },
        { label: 'C', content: '3 chiều', is_correct: false },
        { label: 'D', content: 'Không giới hạn chiều', is_correct: false }
      ]
    },
    {
      stem: 'Hàm nào dùng để đọc file CSV trong Pandas?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'pd.read_csv()', is_correct: true },
        { label: 'B', content: 'pd.load_csv()', is_correct: false },
        { label: 'C', content: 'pd.import_csv()', is_correct: false },
        { label: 'D', content: 'pd.open_csv()', is_correct: false }
      ]
    },
    {
      stem: 'NumPy array khác Python list ở điểm nào?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'NumPy array nhanh hơn và tiết kiệm bộ nhớ', is_correct: true },
        { label: 'B', content: 'NumPy array chậm hơn', is_correct: false },
        { label: 'C', content: 'Không có sự khác biệt', is_correct: false },
        { label: 'D', content: 'NumPy array chỉ lưu được số', is_correct: false }
      ]
    },
    {
      stem: 'Matplotlib là thư viện dùng để làm gì?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Vẽ đồ thị và visualization', is_correct: true },
        { label: 'B', content: 'Machine Learning', is_correct: false },
        { label: 'C', content: 'Web Development', is_correct: false },
        { label: 'D', content: 'Database Management', is_correct: false }
      ]
    },
    {
      stem: 'Seaborn được xây dựng dựa trên thư viện nào?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Matplotlib', is_correct: true },
        { label: 'B', content: 'Plotly', is_correct: false },
        { label: 'C', content: 'Bokeh', is_correct: false },
        { label: 'D', content: 'D3.js', is_correct: false }
      ]
    },
    {
      stem: 'Hàm nào dùng để xem thông tin tổng quan về DataFrame?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'df.info()', is_correct: true },
        { label: 'B', content: 'df.summary()', is_correct: false },
        { label: 'C', content: 'df.details()', is_correct: false },
        { label: 'D', content: 'df.overview()', is_correct: false }
      ]
    },
    {
      stem: 'Missing values trong Pandas được biểu diễn bằng gì?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'NaN (Not a Number)', is_correct: true },
        { label: 'B', content: 'NULL', is_correct: false },
        { label: 'C', content: 'undefined', is_correct: false },
        { label: 'D', content: 'None', is_correct: false }
      ]
    },
    {
      stem: 'Phương thức nào dùng để gộp (merge) hai DataFrame?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'pd.merge()', is_correct: true },
        { label: 'B', content: 'pd.join()', is_correct: false },
        { label: 'C', content: 'pd.combine()', is_correct: false },
        { label: 'D', content: 'pd.concat_merge()', is_correct: false }
      ]
    }
  ],
  
  // Course 4: Flutter Mobile App Development
  4: [
    {
      stem: 'Flutter được phát triển bởi công ty nào?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Google', is_correct: true },
        { label: 'B', content: 'Facebook', is_correct: false },
        { label: 'C', content: 'Microsoft', is_correct: false },
        { label: 'D', content: 'Apple', is_correct: false }
      ]
    },
    {
      stem: 'Ngôn ngữ lập trình nào được sử dụng trong Flutter?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Dart', is_correct: true },
        { label: 'B', content: 'JavaScript', is_correct: false },
        { label: 'C', content: 'Kotlin', is_correct: false },
        { label: 'D', content: 'Swift', is_correct: false }
      ]
    },
    {
      stem: 'Widget nào là immutable (không thay đổi) trong Flutter?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'StatelessWidget', is_correct: true },
        { label: 'B', content: 'StatefulWidget', is_correct: false },
        { label: 'C', content: 'InheritedWidget', is_correct: false },
        { label: 'D', content: 'Tất cả đều mutable', is_correct: false }
      ]
    },
    {
      stem: 'Hot Reload trong Flutter có tác dụng gì?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Cập nhật UI ngay lập tức mà không mất state', is_correct: true },
        { label: 'B', content: 'Restart toàn bộ app', is_correct: false },
        { label: 'C', content: 'Xóa cache', is_correct: false },
        { label: 'D', content: 'Build lại app từ đầu', is_correct: false }
      ]
    },
    {
      stem: 'MaterialApp là gì trong Flutter?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Widget gốc cho Material Design app', is_correct: true },
        { label: 'B', content: 'Database library', is_correct: false },
        { label: 'C', content: 'Networking package', is_correct: false },
        { label: 'D', content: 'Animation controller', is_correct: false }
      ]
    },
    {
      stem: 'setState() được sử dụng trong widget nào?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'StatefulWidget', is_correct: true },
        { label: 'B', content: 'StatelessWidget', is_correct: false },
        { label: 'C', content: 'InheritedWidget', is_correct: false },
        { label: 'D', content: 'Tất cả các widget', is_correct: false }
      ]
    },
    {
      stem: 'Package manager của Flutter là gì?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'pub', is_correct: true },
        { label: 'B', content: 'npm', is_correct: false },
        { label: 'C', content: 'yarn', is_correct: false },
        { label: 'D', content: 'gradle', is_correct: false }
      ]
    },
    {
      stem: 'Widget nào dùng để hiển thị danh sách cuộn được?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'ListView', is_correct: true },
        { label: 'B', content: 'Container', is_correct: false },
        { label: 'C', content: 'Column', is_correct: false },
        { label: 'D', content: 'Row', is_correct: false }
      ]
    },
    {
      stem: 'BuildContext trong Flutter là gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Handle để tham chiếu vị trí widget trong widget tree', is_correct: true },
        { label: 'B', content: 'Class để build UI', is_correct: false },
        { label: 'C', content: 'Database connection', is_correct: false },
        { label: 'D', content: 'Animation controller', is_correct: false }
      ]
    },
    {
      stem: 'Provider pattern trong Flutter dùng để làm gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'State management', is_correct: true },
        { label: 'B', content: 'Routing', is_correct: false },
        { label: 'C', content: 'Animation', is_correct: false },
        { label: 'D', content: 'Networking', is_correct: false }
      ]
    }
  ],
  
  // Course 5: Machine Learning Fundamentals
  5: [
    {
      stem: 'Machine Learning là gì?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Khả năng máy tính học từ dữ liệu mà không cần lập trình rõ ràng', is_correct: true },
        { label: 'B', content: 'Cách lập trình máy tính', is_correct: false },
        { label: 'C', content: 'Một ngôn ngữ lập trình', is_correct: false },
        { label: 'D', content: 'Phần mềm quản lý database', is_correct: false }
      ]
    },
    {
      stem: 'Supervised Learning là gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Học có giám sát với dữ liệu được gán nhãn', is_correct: true },
        { label: 'B', content: 'Học không giám sát', is_correct: false },
        { label: 'C', content: 'Học tăng cường', is_correct: false },
        { label: 'D', content: 'Học sâu', is_correct: false }
      ]
    },
    {
      stem: 'Thuật toán nào sau đây là Supervised Learning?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Linear Regression', is_correct: true },
        { label: 'B', content: 'K-Means Clustering', is_correct: false },
        { label: 'C', content: 'PCA', is_correct: false },
        { label: 'D', content: 'DBSCAN', is_correct: false }
      ]
    },
    {
      stem: 'Overfitting xảy ra khi nào?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Model học quá khớp với training data nhưng kém trên test data', is_correct: true },
        { label: 'B', content: 'Model quá đơn giản', is_correct: false },
        { label: 'C', content: 'Có quá ít dữ liệu', is_correct: false },
        { label: 'D', content: 'Learning rate quá cao', is_correct: false }
      ]
    },
    {
      stem: 'Cross-validation dùng để làm gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Đánh giá hiệu suất model một cách đáng tin cậy', is_correct: true },
        { label: 'B', content: 'Train model nhanh hơn', is_correct: false },
        { label: 'C', content: 'Tăng accuracy', is_correct: false },
        { label: 'D', content: 'Giảm overfitting', is_correct: false }
      ]
    },
    {
      stem: 'Confusion Matrix được sử dụng cho loại bài toán nào?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Classification', is_correct: true },
        { label: 'B', content: 'Regression', is_correct: false },
        { label: 'C', content: 'Clustering', is_correct: false },
        { label: 'D', content: 'Dimensionality Reduction', is_correct: false }
      ]
    },
    {
      stem: 'Gradient Descent là gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Thuật toán tối ưu hóa để tìm minimum của hàm loss', is_correct: true },
        { label: 'B', content: 'Thuật toán classification', is_correct: false },
        { label: 'C', content: 'Thuật toán clustering', is_correct: false },
        { label: 'D', content: 'Metric đánh giá model', is_correct: false }
      ]
    },
    {
      stem: 'Precision và Recall đo lường gì?',
      qtype: 'mcq',
      difficulty: 'hard',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Hiệu suất của classification model', is_correct: true },
        { label: 'B', content: 'Tốc độ training', is_correct: false },
        { label: 'C', content: 'Kích thước model', is_correct: false },
        { label: 'D', content: 'Số lượng parameters', is_correct: false }
      ]
    },
    {
      stem: 'Feature Engineering là gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Quá trình tạo features mới từ dữ liệu thô', is_correct: true },
        { label: 'B', content: 'Training model', is_correct: false },
        { label: 'C', content: 'Đánh giá model', is_correct: false },
        { label: 'D', content: 'Deploy model', is_correct: false }
      ]
    },
    {
      stem: 'Bias-Variance Tradeoff là gì?',
      qtype: 'mcq',
      difficulty: 'hard',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Sự đánh đổi giữa underfitting và overfitting', is_correct: true },
        { label: 'B', content: 'Sự đánh đổi giữa tốc độ và accuracy', is_correct: false },
        { label: 'C', content: 'Sự đánh đổi giữa precision và recall', is_correct: false },
        { label: 'D', content: 'Sự đánh đổi giữa training time và inference time', is_correct: false }
      ]
    }
  ],
  
  // Course 6: Digital Marketing Mastery
  6: [
    {
      stem: 'SEO là viết tắt của gì?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Search Engine Optimization', is_correct: true },
        { label: 'B', content: 'Social Engine Optimization', is_correct: false },
        { label: 'C', content: 'Search Engine Operation', is_correct: false },
        { label: 'D', content: 'Social Engine Operation', is_correct: false }
      ]
    },
    {
      stem: 'CTR trong Digital Marketing là gì?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Click-Through Rate', is_correct: true },
        { label: 'B', content: 'Cost To Revenue', is_correct: false },
        { label: 'C', content: 'Customer Transaction Rate', is_correct: false },
        { label: 'D', content: 'Conversion Tracking Report', is_correct: false }
      ]
    },
    {
      stem: 'Google Ads hoạt động theo mô hình nào?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'PPC (Pay-Per-Click)', is_correct: true },
        { label: 'B', content: 'CPM (Cost-Per-Mile)', is_correct: false },
        { label: 'C', content: 'CPA (Cost-Per-Action)', is_correct: false },
        { label: 'D', content: 'Tất cả các mô hình trên', is_correct: false }
      ]
    },
    {
      stem: 'Content Marketing tập trung vào điều gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Tạo và phân phối nội dung giá trị để thu hút khách hàng', is_correct: true },
        { label: 'B', content: 'Chỉ quảng cáo trả phí', is_correct: false },
        { label: 'C', content: 'Spam email', is_correct: false },
        { label: 'D', content: 'Mua followers', is_correct: false }
      ]
    },
    {
      stem: 'KPI là viết tắt của gì?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Key Performance Indicator', is_correct: true },
        { label: 'B', content: 'Key Product Information', is_correct: false },
        { label: 'C', content: 'Knowledge Process Indicator', is_correct: false },
        { label: 'D', content: 'Key Process Improvement', is_correct: false }
      ]
    },
    {
      stem: 'Social Media Marketing hiệu quả khi nào?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Có chiến lược rõ ràng và tương tác với audience', is_correct: true },
        { label: 'B', content: 'Post nhiều nhất có thể', is_correct: false },
        { label: 'C', content: 'Chỉ quảng cáo sản phẩm', is_correct: false },
        { label: 'D', content: 'Copy nội dung của đối thủ', is_correct: false }
      ]
    },
    {
      stem: 'Email Marketing ROI cao nhất khi nào?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Segmentation và personalization', is_correct: true },
        { label: 'B', content: 'Gửi mass email', is_correct: false },
        { label: 'C', content: 'Mua email list', is_correct: false },
        { label: 'D', content: 'Gửi mỗi ngày', is_correct: false }
      ]
    },
    {
      stem: 'Google Analytics đo lường gì?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Traffic và hành vi người dùng trên website', is_correct: true },
        { label: 'B', content: 'Chỉ số lượng visitors', is_correct: false },
        { label: 'C', content: 'Social media engagement', is_correct: false },
        { label: 'D', content: 'Email open rate', is_correct: false }
      ]
    },
    {
      stem: 'Conversion Rate Optimization (CRO) là gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Tối ưu hóa tỷ lệ chuyển đổi visitors thành customers', is_correct: true },
        { label: 'B', content: 'Tăng traffic', is_correct: false },
        { label: 'C', content: 'Giảm bounce rate', is_correct: false },
        { label: 'D', content: 'Tăng page views', is_correct: false }
      ]
    },
    {
      stem: 'Influencer Marketing hiệu quả với target audience nào?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Gen Z và Millennials', is_correct: true },
        { label: 'B', content: 'Chỉ Gen X', is_correct: false },
        { label: 'C', content: 'Chỉ Baby Boomers', is_correct: false },
        { label: 'D', content: 'Không hiệu quả với audience nào', is_correct: false }
      ]
    }
  ],
  
  // Course 8: JavaScript ES6+ Modern Development
  8: [
    {
      stem: 'ES6 được ra mắt năm nào?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: '2015', is_correct: true },
        { label: 'B', content: '2010', is_correct: false },
        { label: 'C', content: '2020', is_correct: false },
        { label: 'D', content: '2005', is_correct: false }
      ]
    },
    {
      stem: 'Sự khác biệt chính giữa let và var là gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'let có block scope, var có function scope', is_correct: true },
        { label: 'B', content: 'let nhanh hơn var', is_correct: false },
        { label: 'C', content: 'var mới hơn let', is_correct: false },
        { label: 'D', content: 'Không có sự khác biệt', is_correct: false }
      ]
    },
    {
      stem: 'Arrow function khác function thông thường ở điểm nào?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Arrow function không có this riêng', is_correct: true },
        { label: 'B', content: 'Arrow function chậm hơn', is_correct: false },
        { label: 'C', content: 'Arrow function không thể có parameters', is_correct: false },
        { label: 'D', content: 'Không có sự khác biệt', is_correct: false }
      ]
    },
    {
      stem: 'Template literals sử dụng ký tự nào?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Backticks (`)', is_correct: true },
        { label: 'B', content: 'Single quotes (\')', is_correct: false },
        { label: 'C', content: 'Double quotes (")', is_correct: false },
        { label: 'D', content: 'Forward slash (/)', is_correct: false }
      ]
    },
    {
      stem: 'Destructuring assignment dùng để làm gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Unpack values từ arrays hoặc properties từ objects', is_correct: true },
        { label: 'B', content: 'Delete variables', is_correct: false },
        { label: 'C', content: 'Create objects', is_correct: false },
        { label: 'D', content: 'Merge arrays', is_correct: false }
      ]
    },
    {
      stem: 'Spread operator (...) được sử dụng để làm gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Expand iterable thành individual elements', is_correct: true },
        { label: 'B', content: 'Concatenate strings', is_correct: false },
        { label: 'C', content: 'Comment code', is_correct: false },
        { label: 'D', content: 'Import modules', is_correct: false }
      ]
    },
    {
      stem: 'Promise được sử dụng cho mục đích gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Xử lý asynchronous operations', is_correct: true },
        { label: 'B', content: 'Create objects', is_correct: false },
        { label: 'C', content: 'Loop through arrays', is_correct: false },
        { label: 'D', content: 'Define classes', is_correct: false }
      ]
    },
    {
      stem: 'async/await được built trên top của gì?',
      qtype: 'mcq',
      difficulty: 'medium',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Promises', is_correct: true },
        { label: 'B', content: 'Callbacks', is_correct: false },
        { label: 'C', content: 'Generators', is_correct: false },
        { label: 'D', content: 'Observables', is_correct: false }
      ]
    },
    {
      stem: 'Module trong ES6 được import như thế nào?',
      qtype: 'mcq',
      difficulty: 'easy',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'import { name } from \'module\'', is_correct: true },
        { label: 'B', content: 'require(\'module\')', is_correct: false },
        { label: 'C', content: 'include(\'module\')', is_correct: false },
        { label: 'D', content: 'load(\'module\')', is_correct: false }
      ]
    },
    {
      stem: 'Map và Set khác Array ở điểm nào?',
      qtype: 'mcq',
      difficulty: 'hard',
      max_score: 1.0,
      options: [
        { label: 'A', content: 'Map lưu key-value pairs, Set lưu unique values', is_correct: true },
        { label: 'B', content: 'Map và Set chậm hơn Array', is_correct: false },
        { label: 'C', content: 'Map và Set không thể iterate', is_correct: false },
        { label: 'D', content: 'Không có sự khác biệt', is_correct: false }
      ]
    }
  ]
};

async function populateQuestions() {
  try {
    console.log('🔄 Starting question population...\n');
    
    const pool = await sql.connect(config);
    
    // Get mooc_id for each course
    const moocs = await pool.request().query(`
      SELECT m.mooc_id, m.course_id, c.title as course_title
      FROM moocs m
      JOIN courses c ON m.course_id = c.course_id
      WHERE m.course_id IN (3, 4, 5, 6, 8)
      ORDER BY m.course_id
    `);
    
    console.log('📚 Found MOOCs:');
    moocs.recordset.forEach(m => {
      console.log(`  Course ${m.course_id}: ${m.course_title} (MOOC ID: ${m.mooc_id})`);
    });
    console.log('');
    
    let totalInserted = 0;
    
    for (const mooc of moocs.recordset) {
      const courseId = mooc.course_id;
      const moocId = mooc.mooc_id;
      const questions = questionBanks[courseId];
      
      if (!questions) {
        console.log(`⚠️  No questions defined for course ${courseId}`);
        continue;
      }
      
      console.log(`📝 Inserting ${questions.length} questions for ${mooc.course_title}...`);
      
      for (const q of questions) {
        // Insert question
        const result = await pool.request()
          .input('mooc_id', sql.BigInt, moocId)
          .input('stem', sql.NVarChar(sql.MAX), q.stem)
          .input('qtype', sql.NVarChar(50), q.qtype)
          .input('difficulty', sql.NVarChar(20), q.difficulty)
          .input('max_score', sql.Decimal(5, 2), q.max_score)
          .input('created_by', sql.BigInt, 2) // Instructor
          .query(`
            INSERT INTO questions (mooc_id, stem, qtype, difficulty, max_score, created_by, created_at)
            OUTPUT INSERTED.question_id
            VALUES (@mooc_id, @stem, @qtype, @difficulty, @max_score, @created_by, GETDATE())
          `);
        
        const questionId = result.recordset[0].question_id;
        
        // Insert options
        for (const opt of q.options) {
          await pool.request()
            .input('question_id', sql.BigInt, questionId)
            .input('label', sql.NVarChar(10), opt.label)
            .input('content', sql.NVarChar(sql.MAX), opt.content)
            .input('is_correct', sql.Bit, opt.is_correct)
            .query(`
              INSERT INTO question_options (question_id, label, content, is_correct)
              VALUES (@question_id, @label, @content, @is_correct)
            `);
        }
        
        totalInserted++;
      }
      
      console.log(`✅ Inserted ${questions.length} questions for ${mooc.course_title}\n`);
    }
    
    await sql.close();
    console.log(`\n🎉 Done! Total ${totalInserted} questions inserted!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

populateQuestions();
