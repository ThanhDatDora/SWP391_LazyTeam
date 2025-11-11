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

// Course 4: Flutter Mobile App Development
const allQuestions = [
  // MOOC 9: Giới thiệu và khởi đầu
  {
    mooc_id: 9,
    questions: [
      {
        stem: 'Flutter là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Framework UI của Google để build cross-platform mobile apps', is_correct: true },
          { label: 'B', content: 'Một ngôn ngữ lập trình mới', is_correct: false },
          { label: 'C', content: 'Một IDE cho mobile development', is_correct: false },
          { label: 'D', content: 'Một database cho mobile', is_correct: false }
        ]
      },
      {
        stem: 'Flutter sử dụng ngôn ngữ lập trình nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Dart', is_correct: true },
          { label: 'B', content: 'Java', is_correct: false },
          { label: 'C', content: 'Swift', is_correct: false },
          { label: 'D', content: 'Kotlin', is_correct: false }
        ]
      },
      {
        stem: 'Flutter có thể build apps cho platform nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'iOS, Android, Web, Desktop (Windows, macOS, Linux)', is_correct: true },
          { label: 'B', content: 'Chỉ iOS và Android', is_correct: false },
          { label: 'C', content: 'Chỉ Android', is_correct: false },
          { label: 'D', content: 'Chỉ Web apps', is_correct: false }
        ]
      },
      {
        stem: 'Hot Reload trong Flutter là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Tính năng update UI ngay lập tức khi thay đổi code mà không mất state', is_correct: true },
          { label: 'B', content: 'Reload toàn bộ app', is_correct: false },
          { label: 'C', content: 'Làm nóng điện thoại', is_correct: false },
          { label: 'D', content: 'Auto restart app', is_correct: false }
        ]
      },
      {
        stem: 'Widget trong Flutter là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Building block cơ bản của Flutter UI', is_correct: true },
          { label: 'B', content: 'Một plugin', is_correct: false },
          { label: 'C', content: 'Một animation', is_correct: false },
          { label: 'D', content: 'Một database table', is_correct: false }
        ]
      },
      {
        stem: 'Flutter SDK bao gồm những gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Dart SDK, Flutter framework, Flutter engine, Command-line tools', is_correct: true },
          { label: 'B', content: 'Chỉ có Flutter framework', is_correct: false },
          { label: 'C', content: 'Chỉ có Dart SDK', is_correct: false },
          { label: 'D', content: 'Chỉ có CLI tools', is_correct: false }
        ]
      },
      {
        stem: 'pubspec.yaml trong Flutter project dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Quản lý dependencies, assets, và metadata của project', is_correct: true },
          { label: 'B', content: 'Chứa source code chính', is_correct: false },
          { label: 'C', content: 'Cấu hình database', is_correct: false },
          { label: 'D', content: 'File test configuration', is_correct: false }
        ]
      },
      {
        stem: 'Stateless Widget khác Stateful Widget như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Stateless không có state thay đổi, Stateful có state có thể thay đổi', is_correct: true },
          { label: 'B', content: 'Stateless nhanh hơn Stateful', is_correct: false },
          { label: 'C', content: 'Không có sự khác biệt', is_correct: false },
          { label: 'D', content: 'Stateless chỉ dùng cho text', is_correct: false }
        ]
      },
      {
        stem: 'Material Design trong Flutter là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Design system của Google với widgets và guidelines sẵn có', is_correct: true },
          { label: 'B', content: 'Một loại vật liệu xây dựng', is_correct: false },
          { label: 'C', content: 'Framework riêng biệt', is_correct: false },
          { label: 'D', content: 'CSS framework', is_correct: false }
        ]
      },
      {
        stem: 'Cupertino widgets trong Flutter dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Tạo iOS-style UI theo Apple design guidelines', is_correct: true },
          { label: 'B', content: 'Widgets cho Android', is_correct: false },
          { label: 'C', content: 'Widgets cho web', is_correct: false },
          { label: 'D', content: 'Custom widgets library', is_correct: false }
        ]
      },
      {
        stem: 'flutter doctor command làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Check Flutter installation và dependencies', is_correct: true },
          { label: 'B', content: 'Sửa lỗi tự động', is_correct: false },
          { label: 'C', content: 'Update Flutter version', is_correct: false },
          { label: 'D', content: 'Deploy app lên store', is_correct: false }
        ]
      },
      {
        stem: 'Flutter framework render UI như thế nào?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Sử dụng Skia graphics engine để render trực tiếp, không qua native widgets', is_correct: true },
          { label: 'B', content: 'Dùng WebView', is_correct: false },
          { label: 'C', content: 'Convert sang native widgets', is_correct: false },
          { label: 'D', content: 'Dùng JavaScript bridge', is_correct: false }
        ]
      },
      {
        stem: 'Android Studio và VS Code, IDE nào tốt hơn cho Flutter?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Cả hai đều tốt, tùy preference (Android Studio đầy đủ, VS Code nhẹ)', is_correct: true },
          { label: 'B', content: 'Chỉ có thể dùng Android Studio', is_correct: false },
          { label: 'C', content: 'Chỉ có thể dùng VS Code', is_correct: false },
          { label: 'D', content: 'Phải dùng Xcode', is_correct: false }
        ]
      },
      {
        stem: 'Flutter Inspector là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Tool để visualize và debug widget tree', is_correct: true },
          { label: 'B', content: 'Code analyzer', is_correct: false },
          { label: 'C', content: 'Performance profiler', is_correct: false },
          { label: 'D', content: 'Security scanner', is_correct: false }
        ]
      },
      {
        stem: 'main() function trong Flutter app làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Entry point của app, gọi runApp() để start app', is_correct: true },
          { label: 'B', content: 'Main screen của app', is_correct: false },
          { label: 'C', content: 'Main layout widget', is_correct: false },
          { label: 'D', content: 'Main database connection', is_correct: false }
        ]
      }
    ]
  },

  // MOOC 10: Kiến thức nền tảng
  {
    mooc_id: 10,
    questions: [
      {
        stem: 'BuildContext trong Flutter là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Handle đến location của widget trong widget tree', is_correct: true },
          { label: 'B', content: 'Build configuration settings', is_correct: false },
          { label: 'C', content: 'Context cho async operations', is_correct: false },
          { label: 'D', content: 'Database context', is_correct: false }
        ]
      },
      {
        stem: 'setState() trong Stateful Widget làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Trigger rebuild widget khi state thay đổi', is_correct: true },
          { label: 'B', content: 'Set state cho toàn bộ app', is_correct: false },
          { label: 'C', content: 'Save state vào database', is_correct: false },
          { label: 'D', content: 'Reset state về initial', is_correct: false }
        ]
      },
      {
        stem: 'Scaffold widget trong Flutter cung cấp gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Structure cơ bản của screen với appBar, body, floatingActionButton,...', is_correct: true },
          { label: 'B', content: 'Scaffolding cho code', is_correct: false },
          { label: 'C', content: 'Database schema', is_correct: false },
          { label: 'D', content: 'Animation framework', is_correct: false }
        ]
      },
      {
        stem: 'Container widget trong Flutter là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Convenience widget kết hợp painting, positioning, và sizing', is_correct: true },
          { label: 'B', content: 'Docker container', is_correct: false },
          { label: 'C', content: 'Data container', is_correct: false },
          { label: 'D', content: 'Storage container', is_correct: false }
        ]
      },
      {
        stem: 'Column và Row widgets trong Flutter dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Layout widgets theo vertical (Column) và horizontal (Row)', is_correct: true },
          { label: 'B', content: 'Tạo table với rows và columns', is_correct: false },
          { label: 'C', content: 'Database columns và rows', is_correct: false },
          { label: 'D', content: 'Grid layout only', is_correct: false }
        ]
      },
      {
        stem: 'ListView trong Flutter dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Hiển thị danh sách scrollable items', is_correct: true },
          { label: 'B', content: 'View data list từ database', is_correct: false },
          { label: 'C', content: 'List view modes', is_correct: false },
          { label: 'D', content: 'Chỉ hiển thị text lists', is_correct: false }
        ]
      },
      {
        stem: 'Stack widget trong Flutter hoạt động như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Xếp chồng widgets lên nhau theo z-axis', is_correct: true },
          { label: 'B', content: 'Stack data structure', is_correct: false },
          { label: 'C', content: 'Vertical stacking only', is_correct: false },
          { label: 'D', content: 'Memory stack management', is_correct: false }
        ]
      },
      {
        stem: 'Padding và Margin trong Flutter khác nhau như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Padding là space bên trong widget, Margin là space bên ngoài (sử dụng Container)', is_correct: true },
          { label: 'B', content: 'Không có sự khác biệt', is_correct: false },
          { label: 'C', content: 'Padding cho text, Margin cho images', is_correct: false },
          { label: 'D', content: 'Margin không tồn tại trong Flutter', is_correct: false }
        ]
      },
      {
        stem: 'Expanded widget trong Flutter làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Mở rộng child để fill available space trong Row/Column', is_correct: true },
          { label: 'B', content: 'Expand widget size permanently', is_correct: false },
          { label: 'C', content: 'Animation expand/collapse', is_correct: false },
          { label: 'D', content: 'Expand text to full width', is_correct: false }
        ]
      },
      {
        stem: 'SizedBox widget dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Tạo box với size cố định hoặc spacing giữa widgets', is_correct: true },
          { label: 'B', content: 'Resize images', is_correct: false },
          { label: 'C', content: 'Calculate widget size', is_correct: false },
          { label: 'D', content: 'Size detection tool', is_correct: false }
        ]
      },
      {
        stem: 'GestureDetector trong Flutter làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Detect gestures như tap, long press, swipe trên widget', is_correct: true },
          { label: 'B', content: 'Detect device gestures', is_correct: false },
          { label: 'C', content: 'Gesture animations', is_correct: false },
          { label: 'D', content: 'AI gesture recognition', is_correct: false }
        ]
      },
      {
        stem: 'InkWell khác GestureDetector như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'InkWell có Material ripple effect khi tap, GestureDetector không', is_correct: true },
          { label: 'B', content: 'InkWell nhanh hơn', is_correct: false },
          { label: 'C', content: 'GestureDetector deprecated', is_correct: false },
          { label: 'D', content: 'Không có sự khác biệt', is_correct: false }
        ]
      },
      {
        stem: 'MediaQuery trong Flutter dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Lấy thông tin về device screen size, orientation, padding,...', is_correct: true },
          { label: 'B', content: 'Query media files', is_correct: false },
          { label: 'C', content: 'CSS media queries', is_correct: false },
          { label: 'D', content: 'Database queries', is_correct: false }
        ]
      },
      {
        stem: 'Key trong Flutter widgets dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Identify widgets uniquely để preserve state khi rebuild', is_correct: true },
          { label: 'B', content: 'Keyboard keys', is_correct: false },
          { label: 'C', content: 'API keys', is_correct: false },
          { label: 'D', content: 'Encryption keys', is_correct: false }
        ]
      },
      {
        stem: 'Theme trong Flutter là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Centralized styling cho toàn bộ app (colors, fonts, shapes,...)', is_correct: true },
          { label: 'B', content: 'UI theme templates', is_correct: false },
          { label: 'C', content: 'Dark/Light mode only', is_correct: false },
          { label: 'D', content: 'App icon theme', is_correct: false }
        ]
      }
    ]
  },

  // MOOC 11: Thực hành cơ bản
  {
    mooc_id: 11,
    questions: [
      {
        stem: 'Navigator trong Flutter dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Quản lý navigation giữa các screens (push, pop routes)', is_correct: true },
          { label: 'B', content: 'GPS navigation', is_correct: false },
          { label: 'C', content: 'Navigation drawer only', is_correct: false },
          { label: 'D', content: 'Tab navigation only', is_correct: false }
        ]
      },
      {
        stem: 'Named routes trong Flutter là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Routes được định nghĩa với string name để navigate dễ dàng', is_correct: true },
          { label: 'B', content: 'Routes có tên hay', is_correct: false },
          { label: 'C', content: 'API route names', is_correct: false },
          { label: 'D', content: 'File path names', is_correct: false }
        ]
      },
      {
        stem: 'Form validation trong Flutter thực hiện như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Sử dụng Form widget với GlobalKey và validator functions', is_correct: true },
          { label: 'B', content: 'Chỉ validate ở backend', is_correct: false },
          { label: 'C', content: 'Không có form validation', is_correct: false },
          { label: 'D', content: 'Dùng JavaScript validation', is_correct: false }
        ]
      },
      {
        stem: 'TextEditingController trong Flutter làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Control và lấy giá trị từ TextField', is_correct: true },
          { label: 'B', content: 'Edit text files', is_correct: false },
          { label: 'C', content: 'Text formatting controller', is_correct: false },
          { label: 'D', content: 'Rich text editor', is_correct: false }
        ]
      },
      {
        stem: 'FutureBuilder trong Flutter dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Build widget based on Future result (async operations)', is_correct: true },
          { label: 'B', content: 'Build future UI screens', is_correct: false },
          { label: 'C', content: 'Time-based widget builder', is_correct: false },
          { label: 'D', content: 'Predict future builds', is_correct: false }
        ]
      },
      {
        stem: 'StreamBuilder trong Flutter khác FutureBuilder như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'StreamBuilder handle continuous data stream, FutureBuilder handle one-time async result', is_correct: true },
          { label: 'B', content: 'StreamBuilder nhanh hơn', is_correct: false },
          { label: 'C', content: 'Không có sự khác biệt', is_correct: false },
          { label: 'D', content: 'StreamBuilder chỉ cho video', is_correct: false }
        ]
      },
      {
        stem: 'Provider package trong Flutter dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'State management solution để share data across widget tree', is_correct: true },
          { label: 'B', content: 'API provider', is_correct: false },
          { label: 'C', content: 'Service provider', is_correct: false },
          { label: 'D', content: 'Data provider từ backend', is_correct: false }
        ]
      },
      {
        stem: 'http package trong Flutter dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Make HTTP requests (GET, POST, PUT, DELETE) to APIs', is_correct: true },
          { label: 'B', content: 'HTTP server', is_correct: false },
          { label: 'C', content: 'HTTPS certificate', is_correct: false },
          { label: 'D', content: 'HTTP protocol implementation', is_correct: false }
        ]
      },
      {
        stem: 'shared_preferences package trong Flutter làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Persist simple key-value data locally', is_correct: true },
          { label: 'B', content: 'Share preferences giữa users', is_correct: false },
          { label: 'C', content: 'User preference UI', is_correct: false },
          { label: 'D', content: 'Cloud preferences sync', is_correct: false }
        ]
      },
      {
        stem: 'sqflite package trong Flutter dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'SQLite database cho local storage', is_correct: true },
          { label: 'B', content: 'SQL query formatter', is_correct: false },
          { label: 'C', content: 'Cloud database', is_correct: false },
          { label: 'D', content: 'SQL learning tool', is_correct: false }
        ]
      },
      {
        stem: 'Image.network() trong Flutter làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Load và hiển thị image từ URL', is_correct: true },
          { label: 'B', content: 'Tạo image network', is_correct: false },
          { label: 'C', content: 'Share image qua network', is_correct: false },
          { label: 'D', content: 'Compress image for network', is_correct: false }
        ]
      },
      {
        stem: 'image_picker package dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Pick images từ gallery hoặc camera', is_correct: true },
          { label: 'B', content: 'Pick colors for image', is_correct: false },
          { label: 'C', content: 'Image editing tool', is_correct: false },
          { label: 'D', content: 'Random image picker', is_correct: false }
        ]
      },
      {
        stem: 'CircularProgressIndicator trong Flutter dùng khi nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Hiển thị loading state cho async operations', is_correct: true },
          { label: 'B', content: 'Show circular progress value', is_correct: false },
          { label: 'C', content: 'Circular menu indicator', is_correct: false },
          { label: 'D', content: 'Circle drawing tool', is_correct: false }
        ]
      },
      {
        stem: 'SnackBar trong Flutter dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Hiển thị brief message ở bottom screen (toast-like)', is_correct: true },
          { label: 'B', content: 'Snack menu bar', is_correct: false },
          { label: 'C', content: 'Top notification bar', is_correct: false },
          { label: 'D', content: 'Sidebar menu', is_correct: false }
        ]
      },
      {
        stem: 'AlertDialog trong Flutter dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Show modal dialog để notify user hoặc get confirmation', is_correct: true },
          { label: 'B', content: 'Alert sound system', is_correct: false },
          { label: 'C', content: 'Security alert', is_correct: false },
          { label: 'D', content: 'Error logging dialog', is_correct: false }
        ]
      }
    ]
  },

  // MOOC 12: Kỹ thuật nâng cao
  {
    mooc_id: 12,
    questions: [
      {
        stem: 'Animation trong Flutter được tạo bằng cách nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Sử dụng AnimationController, Tween, và AnimatedWidget/AnimatedBuilder', is_correct: true },
          { label: 'B', content: 'Chỉ dùng CSS animations', is_correct: false },
          { label: 'C', content: 'Không hỗ trợ animations', is_correct: false },
          { label: 'D', content: 'Chỉ có pre-built animations', is_correct: false }
        ]
      },
      {
        stem: 'Hero animation trong Flutter là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Shared element transition animation giữa screens', is_correct: true },
          { label: 'B', content: 'Superhero character animation', is_correct: false },
          { label: 'C', content: 'Main character animation', is_correct: false },
          { label: 'D', content: 'Epic animation effect', is_correct: false }
        ]
      },
      {
        stem: 'CustomPaint widget trong Flutter dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Vẽ custom graphics sử dụng Canvas API', is_correct: true },
          { label: 'B', content: 'Custom color picker', is_correct: false },
          { label: 'C', content: 'Paint brush tool', is_correct: false },
          { label: 'D', content: 'Custom theme painter', is_correct: false }
        ]
      },
      {
        stem: 'Isolate trong Dart/Flutter là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Independent worker với own memory heap để run concurrent code', is_correct: true },
          { label: 'B', content: 'Isolated widget', is_correct: false },
          { label: 'C', content: 'Isolated test environment', is_correct: false },
          { label: 'D', content: 'Isolation mode', is_correct: false }
        ]
      },
      {
        stem: 'Platform channels trong Flutter dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Communication giữa Flutter và native platform code (iOS/Android)', is_correct: true },
          { label: 'B', content: 'TV platform channels', is_correct: false },
          { label: 'C', content: 'Social media channels', is_correct: false },
          { label: 'D', content: 'Communication channels UI', is_correct: false }
        ]
      },
      {
        stem: 'MethodChannel trong Flutter là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Type of platform channel để call methods giữa Flutter và native', is_correct: true },
          { label: 'B', content: 'Method routing channel', is_correct: false },
          { label: 'C', content: 'HTTP method channel', is_correct: false },
          { label: 'D', content: 'Class method channel', is_correct: false }
        ]
      },
      {
        stem: 'BLoC pattern trong Flutter là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Business Logic Component - architecture pattern dùng Streams', is_correct: true },
          { label: 'B', content: 'Block pattern', is_correct: false },
          { label: 'C', content: 'Build Logic Component', is_correct: false },
          { label: 'D', content: 'Backend Logic Controller', is_correct: false }
        ]
      },
      {
        stem: 'GetX package trong Flutter cung cấp gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'State management, dependency injection, và route management', is_correct: true },
          { label: 'B', content: 'Get X coordinate', is_correct: false },
          { label: 'C', content: 'HTTP GET requests only', is_correct: false },
          { label: 'D', content: 'Getter functions', is_correct: false }
        ]
      },
      {
        stem: 'Riverpod khác Provider như thế nào?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Riverpod là compile-safe và không depend on BuildContext', is_correct: true },
          { label: 'B', content: 'Riverpod là river data provider', is_correct: false },
          { label: 'C', content: 'Không có sự khác biệt', is_correct: false },
          { label: 'D', content: 'Riverpod chỉ cho iOS', is_correct: false }
        ]
      },
      {
        stem: 'InheritedWidget trong Flutter là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Base class để propagate data down widget tree efficiently', is_correct: true },
          { label: 'B', content: 'Widget được inherit từ parent', is_correct: false },
          { label: 'C', content: 'OOP inheritance widget', is_correct: false },
          { label: 'D', content: 'Legacy widget type', is_correct: false }
        ]
      },
      {
        stem: 'ValueNotifier trong Flutter dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Simple way để notify listeners khi value changes', is_correct: true },
          { label: 'B', content: 'Notify value validation', is_correct: false },
          { label: 'C', content: 'Value converter notifier', is_correct: false },
          { label: 'D', content: 'Important value highlighter', is_correct: false }
        ]
      },
      {
        stem: 'ChangeNotifier trong Flutter là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Class cung cấp change notification mechanism cho listeners', is_correct: true },
          { label: 'B', content: 'Change detection tool', is_correct: false },
          { label: 'C', content: 'File change notifier', is_correct: false },
          { label: 'D', content: 'UI change logger', is_correct: false }
        ]
      },
      {
        stem: 'Sliver widgets trong Flutter dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Create advanced scrollable areas với custom scroll effects', is_correct: true },
          { label: 'B', content: 'Silver colored widgets', is_correct: false },
          { label: 'C', content: 'Smalliver widgets', is_correct: false },
          { label: 'D', content: 'Slide over widgets', is_correct: false }
        ]
      },
      {
        stem: 'CustomScrollView trong Flutter là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'ScrollView sử dụng slivers để create custom scroll effects', is_correct: true },
          { label: 'B', content: 'Custom styled scroll bar', is_correct: false },
          { label: 'C', content: 'Custom scroll speed', is_correct: false },
          { label: 'D', content: 'Custom scroll direction only', is_correct: false }
        ]
      },
      {
        stem: 'Flutter Web và Flutter Desktop có limitations gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Some packages chỉ support mobile, performance khác mobile apps', is_correct: true },
          { label: 'B', content: 'Không có limitations', is_correct: false },
          { label: 'C', content: 'Hoàn toàn không hoạt động', is_correct: false },
          { label: 'D', content: 'Chỉ là beta feature', is_correct: false }
        ]
      }
    ]
  },

  // MOOC 13: Dự án thực tế
  {
    mooc_id: 13,
    questions: [
      {
        stem: 'Firebase integration trong Flutter dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Backend services: authentication, database, storage, analytics,...', is_correct: true },
          { label: 'B', content: 'Fire animation base', is_correct: false },
          { label: 'C', content: 'Fire safety features', is_correct: false },
          { label: 'D', content: 'Chỉ cho push notifications', is_correct: false }
        ]
      },
      {
        stem: 'firebase_auth package dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'User authentication (email, Google, Facebook, phone,...)', is_correct: true },
          { label: 'B', content: 'Firebase authorization only', is_correct: false },
          { label: 'C', content: 'Auth token generator', is_correct: false },
          { label: 'D', content: 'Authentication UI only', is_correct: false }
        ]
      },
      {
        stem: 'cloud_firestore package trong Flutter là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'NoSQL cloud database với real-time sync', is_correct: true },
          { label: 'B', content: 'Cloud file storage', is_correct: false },
          { label: 'C', content: 'Weather cloud data', is_correct: false },
          { label: 'D', content: 'Cloud computing service', is_correct: false }
        ]
      },
      {
        stem: 'firebase_storage package dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Upload và download files (images, videos, documents)', is_correct: true },
          { label: 'B', content: 'Local storage only', is_correct: false },
          { label: 'C', content: 'Firebase configuration storage', is_correct: false },
          { label: 'D', content: 'State storage', is_correct: false }
        ]
      },
      {
        stem: 'Push notifications trong Flutter implement như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Sử dụng firebase_messaging package với FCM', is_correct: true },
          { label: 'B', content: 'Local notifications only', is_correct: false },
          { label: 'C', content: 'Push API từ browser', is_correct: false },
          { label: 'D', content: 'Flutter không hỗ trợ push notifications', is_correct: false }
        ]
      },
      {
        stem: 'Google Maps integration trong Flutter dùng package nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'google_maps_flutter', is_correct: true },
          { label: 'B', content: 'maps_google', is_correct: false },
          { label: 'C', content: 'flutter_maps', is_correct: false },
          { label: 'D', content: 'google_flutter_maps', is_correct: false }
        ]
      },
      {
        stem: 'Geolocation trong Flutter lấy bằng package nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'geolocator hoặc location package', is_correct: true },
          { label: 'B', content: 'google_maps', is_correct: false },
          { label: 'C', content: 'gps_location', is_correct: false },
          { label: 'D', content: 'flutter_location_service', is_correct: false }
        ]
      },
      {
        stem: 'Camera access trong Flutter dùng package nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'camera package', is_correct: true },
          { label: 'B', content: 'flutter_camera', is_correct: false },
          { label: 'C', content: 'image_picker (chỉ pick, không live camera)', is_correct: false },
          { label: 'D', content: 'video_camera', is_correct: false }
        ]
      },
      {
        stem: 'In-app purchases trong Flutter implement như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Sử dụng in_app_purchase package', is_correct: true },
          { label: 'B', content: 'Direct payment gateway', is_correct: false },
          { label: 'C', content: 'Flutter không support IAP', is_correct: false },
          { label: 'D', content: 'Chỉ có thể dùng native code', is_correct: false }
        ]
      },
      {
        stem: 'Flutter app build cho production như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'flutter build apk/appbundle (Android), flutter build ios (iOS)', is_correct: true },
          { label: 'B', content: 'flutter deploy', is_correct: false },
          { label: 'C', content: 'flutter release', is_correct: false },
          { label: 'D', content: 'Không thể build production', is_correct: false }
        ]
      },
      {
        stem: 'App signing cho Android trong Flutter như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Tạo keystore file và configure trong android/app/build.gradle', is_correct: true },
          { label: 'B', content: 'Automatic signing', is_correct: false },
          { label: 'C', content: 'Google tự động sign', is_correct: false },
          { label: 'D', content: 'Không cần signing', is_correct: false }
        ]
      },
      {
        stem: 'App Store deployment cho iOS app yêu cầu gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Apple Developer account ($99/year), Xcode, và proper provisioning', is_correct: true },
          { label: 'B', content: 'Chỉ cần Flutter SDK', is_correct: false },
          { label: 'C', content: 'Free submission', is_correct: false },
          { label: 'D', content: 'Không cần gì đặc biệt', is_correct: false }
        ]
      },
      {
        stem: 'flutter_launcher_icons package dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Generate app launcher icons cho các platforms', is_correct: true },
          { label: 'B', content: 'Launch apps', is_correct: false },
          { label: 'C', content: 'Icon picker', is_correct: false },
          { label: 'D', content: 'Icon animation', is_correct: false }
        ]
      },
      {
        stem: 'Crashlytics trong Flutter dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Track và report app crashes real-time', is_correct: true },
          { label: 'B', content: 'Crash test tool', is_correct: false },
          { label: 'C', content: 'Crash recovery system', is_correct: false },
          { label: 'D', content: 'Crash animation effects', is_correct: false }
        ]
      },
      {
        stem: 'Code obfuscation trong Flutter build là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Make code harder to reverse engineer bằng flag --obfuscate', is_correct: true },
          { label: 'B', content: 'Code compression', is_correct: false },
          { label: 'C', content: 'Code encryption', is_correct: false },
          { label: 'D', content: 'Code optimization', is_correct: false }
        ]
      }
    ]
  },

  // MOOC 14: Tổng kết và đánh giá
  {
    mooc_id: 14,
    questions: [
      {
        stem: 'Flutter performance optimization techniques bao gồm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'const constructors, ListView.builder, image caching, minimize rebuilds', is_correct: true },
          { label: 'B', content: 'Chỉ cần minify code', is_correct: false },
          { label: 'C', content: 'Increase device RAM', is_correct: false },
          { label: 'D', content: 'Flutter tự động optimize', is_correct: false }
        ]
      },
      {
        stem: 'const keyword trong Flutter widgets quan trọng như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Create compile-time constants, tránh unnecessary rebuilds', is_correct: true },
          { label: 'B', content: 'Chỉ để code đẹp', is_correct: false },
          { label: 'C', content: 'Bắt buộc cho tất cả widgets', is_correct: false },
          { label: 'D', content: 'Không có impact gì', is_correct: false }
        ]
      },
      {
        stem: 'ListView.builder() khác ListView() như thế nào về performance?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'builder() lazy load items (better memory), ListView() load all items', is_correct: true },
          { label: 'B', content: 'Không có sự khác biệt', is_correct: false },
          { label: 'C', content: 'ListView() nhanh hơn', is_correct: false },
          { label: 'D', content: 'builder() deprecated', is_correct: false }
        ]
      },
      {
        stem: 'Flutter DevTools cung cấp features gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Widget inspector, performance profiler, memory profiler, network monitor', is_correct: true },
          { label: 'B', content: 'Chỉ có widget inspector', is_correct: false },
          { label: 'C', content: 'Chỉ code editor', is_correct: false },
          { label: 'D', content: 'Chỉ debugging logs', is_correct: false }
        ]
      },
      {
        stem: 'Memory leaks trong Flutter thường xảy ra khi nào?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Forget dispose controllers/listeners, retain references unnecessarily', is_correct: true },
          { label: 'B', content: 'Use too many widgets', is_correct: false },
          { label: 'C', content: 'Flutter không có memory leaks', is_correct: false },
          { label: 'D', content: 'Chỉ khi build for web', is_correct: false }
        ]
      },
      {
        stem: 'dispose() method trong StatefulWidget dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Cleanup resources như controllers, listeners khi widget removed', is_correct: true },
          { label: 'B', content: 'Dispose widget permanently', is_correct: false },
          { label: 'C', content: 'Delete widget code', is_correct: false },
          { label: 'D', content: 'Optional method, không quan trọng', is_correct: false }
        ]
      },
      {
        stem: 'Testing trong Flutter có những loại nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Unit tests, Widget tests, Integration tests', is_correct: true },
          { label: 'B', content: 'Chỉ có manual testing', is_correct: false },
          { label: 'C', content: 'Chỉ có unit tests', is_correct: false },
          { label: 'D', content: 'Flutter không support testing', is_correct: false }
        ]
      },
      {
        stem: 'mockito package trong Flutter dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Create mock objects cho unit testing', is_correct: true },
          { label: 'B', content: 'Mock UI designs', is_correct: false },
          { label: 'C', content: 'Mock API data visually', is_correct: false },
          { label: 'D', content: 'Mockup tool', is_correct: false }
        ]
      },
      {
        stem: 'Integration tests trong Flutter chạy ở đâu?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Trên actual device hoặc emulator với integration_test package', is_correct: true },
          { label: 'B', content: 'Chỉ trên computer', is_correct: false },
          { label: 'C', content: 'Trên cloud only', is_correct: false },
          { label: 'D', content: 'Không thể chạy integration tests', is_correct: false }
        ]
      },
      {
        stem: 'Continuous Integration (CI/CD) cho Flutter apps dùng tools nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'GitHub Actions, Codemagic, Bitrise, CircleCI, Jenkins', is_correct: true },
          { label: 'B', content: 'Chỉ có GitHub Actions', is_correct: false },
          { label: 'C', content: 'Flutter không support CI/CD', is_correct: false },
          { label: 'D', content: 'Manual deployment only', is_correct: false }
        ]
      },
      {
        stem: 'Responsive design trong Flutter implement như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'MediaQuery, LayoutBuilder, FractionallySizedBox, flexible layouts', is_correct: true },
          { label: 'B', content: 'CSS media queries', is_correct: false },
          { label: 'C', content: 'Separate apps cho mỗi screen size', is_correct: false },
          { label: 'D', content: 'Flutter tự động responsive', is_correct: false }
        ]
      },
      {
        stem: 'Accessibility trong Flutter apps cần implement gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Semantics widgets, labels, proper contrast, screen reader support', is_correct: true },
          { label: 'B', content: 'Chỉ cần font size lớn', is_correct: false },
          { label: 'C', content: 'Flutter tự động accessible', is_correct: false },
          { label: 'D', content: 'Không cần thiết', is_correct: false }
        ]
      },
      {
        stem: 'Internationalization (i18n) trong Flutter dùng package nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'flutter_localizations và intl package', is_correct: true },
          { label: 'B', content: 'translation package', is_correct: false },
          { label: 'C', content: 'i18n package', is_correct: false },
          { label: 'D', content: 'Flutter không support multiple languages', is_correct: false }
        ]
      },
      {
        stem: 'App size optimization trong Flutter có thể làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Remove unused resources, split ABIs, use ProGuard, compress assets', is_correct: true },
          { label: 'B', content: 'Không thể optimize', is_correct: false },
          { label: 'C', content: 'Chỉ cần minify code', is_correct: false },
          { label: 'D', content: 'Delete features', is_correct: false }
        ]
      },
      {
        stem: 'Flutter future roadmap và ecosystem như thế nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Growing rapidly, strong community, Google support, expanding platforms', is_correct: true },
          { label: 'B', content: 'Being deprecated', is_correct: false },
          { label: 'C', content: 'No future updates', is_correct: false },
          { label: 'D', content: 'Uncertain future', is_correct: false }
        ]
      }
    ]
  }
];

async function addAllQuestions() {
  try {
    const pool = await sql.connect(config);

    console.log(`\n🚀 Adding questions for Course 4: Flutter Mobile App Development`);
    console.log(`📚 Total MOOCs: ${allQuestions.length}\n`);

    let totalAdded = 0;

    for (const moocData of allQuestions) {
      const mooc = await pool.request().query(`
        SELECT title FROM moocs WHERE mooc_id = ${moocData.mooc_id}
      `);

      console.log(`\n📝 MOOC ${moocData.mooc_id}: ${mooc.recordset[0].title}`);
      console.log(`   Adding ${moocData.questions.length} questions...`);

      for (const q of moocData.questions) {
        const questionResult = await pool.request()
          .input('mooc_id', sql.BigInt, moocData.mooc_id)
          .input('stem', sql.NVarChar, q.stem)
          .input('qtype', sql.NVarChar, 'mcq')
          .input('difficulty', sql.NVarChar, q.difficulty)
          .input('max_score', sql.Decimal(5, 2), 1.00)
          .query(`
            INSERT INTO questions (mooc_id, stem, qtype, difficulty, max_score, created_at)
            OUTPUT INSERTED.question_id
            VALUES (@mooc_id, @stem, @qtype, @difficulty, @max_score, GETDATE())
          `);

        const questionId = questionResult.recordset[0].question_id;

        for (const opt of q.options) {
          await pool.request()
            .input('question_id', sql.BigInt, questionId)
            .input('label', sql.NVarChar, opt.label)
            .input('content', sql.NVarChar, opt.content)
            .input('is_correct', sql.Bit, opt.is_correct ? 1 : 0)
            .query(`
              INSERT INTO question_options (question_id, label, content, is_correct)
              VALUES (@question_id, @label, @content, @is_correct)
            `);
        }

        totalAdded++;
      }

      console.log(`   ✅ Completed ${moocData.questions.length} questions`);
    }

    console.log(`\n✨ Successfully added ${totalAdded} questions to Course 4!`);

    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addAllQuestions();
