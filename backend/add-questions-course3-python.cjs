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

// Course 3: Python for Data Science
const allQuestions = [
  // MOOC 4: Giới thiệu và khởi đầu
  {
    mooc_id: 4,
    questions: [
      {
        stem: 'Python được tạo ra bởi ai?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Guido van Rossum', is_correct: true },
          { label: 'B', content: 'Dennis Ritchie', is_correct: false },
          { label: 'C', content: 'James Gosling', is_correct: false },
          { label: 'D', content: 'Bjarne Stroustrup', is_correct: false }
        ]
      },
      {
        stem: 'Python là ngôn ngữ lập trình thuộc loại nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Interpreted, high-level, dynamically typed', is_correct: true },
          { label: 'B', content: 'Compiled, low-level, statically typed', is_correct: false },
          { label: 'C', content: 'Assembly language', is_correct: false },
          { label: 'D', content: 'Markup language', is_correct: false }
        ]
      },
      {
        stem: 'PEP 8 là gì trong Python?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Style guide for Python code', is_correct: true },
          { label: 'B', content: 'Python Enhancement Proposal về async/await', is_correct: false },
          { label: 'C', content: 'Một thư viện data science', is_correct: false },
          { label: 'D', content: 'Phiên bản Python 8', is_correct: false }
        ]
      },
      {
        stem: 'Indentation trong Python có ý nghĩa gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Định nghĩa code block, bắt buộc và là phần cú pháp', is_correct: true },
          { label: 'B', content: 'Chỉ để cho code đẹp, không bắt buộc', is_correct: false },
          { label: 'C', content: 'Chỉ áp dụng cho functions', is_correct: false },
          { label: 'D', content: 'Không có ý nghĩa gì', is_correct: false }
        ]
      },
      {
        stem: 'pip là gì trong Python?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Package installer for Python', is_correct: true },
          { label: 'B', content: 'Python Interactive Prompt', is_correct: false },
          { label: 'C', content: 'Python IDE', is_correct: false },
          { label: 'D', content: 'Python compiler', is_correct: false }
        ]
      },
      {
        stem: 'Virtual environment trong Python dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Tạo môi trường Python độc lập cho từng project', is_correct: true },
          { label: 'B', content: 'Chạy Python trên máy ảo', is_correct: false },
          { label: 'C', content: 'Mô phỏng môi trường sản xuất', is_correct: false },
          { label: 'D', content: 'Tạo GUI cho ứng dụng', is_correct: false }
        ]
      },
      {
        stem: 'Jupyter Notebook là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Môi trường interactive để viết và chạy Python code với visualization', is_correct: true },
          { label: 'B', content: 'Một text editor', is_correct: false },
          { label: 'C', content: 'Một database tool', is_correct: false },
          { label: 'D', content: 'Một web framework', is_correct: false }
        ]
      },
      {
        stem: 'Anaconda trong Python ecosystem là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Distribution chứa Python và nhiều packages cho data science', is_correct: true },
          { label: 'B', content: 'Một con rắn lớn', is_correct: false },
          { label: 'C', content: 'Một framework web', is_correct: false },
          { label: 'D', content: 'Một testing tool', is_correct: false }
        ]
      },
      {
        stem: 'print() trong Python có kiểu dữ liệu trả về là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'None', is_correct: true },
          { label: 'B', content: 'String', is_correct: false },
          { label: 'C', content: 'Integer', is_correct: false },
          { label: 'D', content: 'Boolean', is_correct: false }
        ]
      },
      {
        stem: 'Comment trong Python được viết bằng ký tự nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: '#', is_correct: true },
          { label: 'B', content: '//', is_correct: false },
          { label: 'C', content: '/* */', is_correct: false },
          { label: 'D', content: '--', is_correct: false }
        ]
      },
      {
        stem: 'Python có hỗ trợ multiple inheritance không?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Có, Python hỗ trợ multiple inheritance', is_correct: true },
          { label: 'B', content: 'Không, chỉ single inheritance', is_correct: false },
          { label: 'C', content: 'Chỉ hỗ trợ trong Python 3', is_correct: false },
          { label: 'D', content: 'Python không hỗ trợ OOP', is_correct: false }
        ]
      },
      {
        stem: 'Docstring trong Python là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'String literal đầu tiên của function/class dùng để documentation', is_correct: true },
          { label: 'B', content: 'Comment nhiều dòng', is_correct: false },
          { label: 'C', content: 'Biến string trong document', is_correct: false },
          { label: 'D', content: 'Import statement cho docs', is_correct: false }
        ]
      },
      {
        stem: '__init__.py có vai trò gì trong Python package?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Đánh dấu directory là một Python package', is_correct: true },
          { label: 'B', content: 'File khởi tạo program', is_correct: false },
          { label: 'C', content: 'File cấu hình initialization', is_correct: false },
          { label: 'D', content: 'File test đầu tiên', is_correct: false }
        ]
      },
      {
        stem: 'Python 2 và Python 3 khác nhau lớn nhất ở điểm nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'print là statement trong Py2, là function trong Py3', is_correct: true },
          { label: 'B', content: 'Python 3 nhanh hơn gấp đôi', is_correct: false },
          { label: 'C', content: 'Python 3 không hỗ trợ OOP', is_correct: false },
          { label: 'D', content: 'Không có sự khác biệt', is_correct: false }
        ]
      },
      {
        stem: 'REPL trong Python là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Read-Eval-Print Loop - interactive Python shell', is_correct: true },
          { label: 'B', content: 'Real-time Error Propagation Loop', is_correct: false },
          { label: 'C', content: 'Remote Execution Programming Language', is_correct: false },
          { label: 'D', content: 'Repeat Execute Print Line', is_correct: false }
        ]
      }
    ]
  },

  // MOOC 5: Kiến thức nền tảng
  {
    mooc_id: 5,
    questions: [
      {
        stem: 'List và Tuple trong Python khác nhau như thế nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'List là mutable (có thể thay đổi), Tuple là immutable (không thay đổi)', is_correct: true },
          { label: 'B', content: 'Tuple nhanh hơn List', is_correct: false },
          { label: 'C', content: 'List chỉ chứa numbers, Tuple chứa strings', is_correct: false },
          { label: 'D', content: 'Không có sự khác biệt', is_correct: false }
        ]
      },
      {
        stem: 'Dictionary trong Python lưu trữ dữ liệu theo cấu trúc nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Key-value pairs', is_correct: true },
          { label: 'B', content: 'Array indexed', is_correct: false },
          { label: 'C', content: 'Linked list', is_correct: false },
          { label: 'D', content: 'Binary tree', is_correct: false }
        ]
      },
      {
        stem: 'Set trong Python có đặc điểm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Unordered, không chứa phần tử trùng lặp', is_correct: true },
          { label: 'B', content: 'Ordered, có thể trùng lặp', is_correct: false },
          { label: 'C', content: 'Chỉ chứa numbers', is_correct: false },
          { label: 'D', content: 'Giống như List', is_correct: false }
        ]
      },
      {
        stem: 'List comprehension trong Python là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Cách viết ngắn gọn để tạo list mới từ iterable', is_correct: true },
          { label: 'B', content: 'Một function để nén list', is_correct: false },
          { label: 'C', content: 'Thuật toán sắp xếp list', is_correct: false },
          { label: 'D', content: 'Module để đọc list từ file', is_correct: false }
        ]
      },
      {
        stem: 'Lambda function trong Python là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Anonymous function (hàm vô danh) được định nghĩa inline', is_correct: true },
          { label: 'B', content: 'Function chạy song song', is_correct: false },
          { label: 'C', content: 'Function trong AWS Lambda', is_correct: false },
          { label: 'D', content: 'Function được compile trước', is_correct: false }
        ]
      },
      {
        stem: '*args và **kwargs trong Python dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: '*args cho variable positional arguments, **kwargs cho variable keyword arguments', is_correct: true },
          { label: 'B', content: 'Chỉ để decoration, không có chức năng', is_correct: false },
          { label: 'C', content: '*args cho strings, **kwargs cho numbers', is_correct: false },
          { label: 'D', content: 'Tạo pointer như C/C++', is_correct: false }
        ]
      },
      {
        stem: 'Generator trong Python là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Function sử dụng yield để return iterator một cách lazy', is_correct: true },
          { label: 'B', content: 'Tool để generate random numbers', is_correct: false },
          { label: 'C', content: 'Function tạo object tự động', is_correct: false },
          { label: 'D', content: 'Decorator đặc biệt', is_correct: false }
        ]
      },
      {
        stem: 'Decorator trong Python dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Modify hoặc enhance function/class mà không thay đổi code gốc', is_correct: true },
          { label: 'B', content: 'Trang trí output cho đẹp', is_correct: false },
          { label: 'C', content: 'Comment function', is_correct: false },
          { label: 'D', content: 'Import module', is_correct: false }
        ]
      },
      {
        stem: 'Exception handling trong Python dùng cú pháp nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'try-except-finally', is_correct: true },
          { label: 'B', content: 'try-catch-finally', is_correct: false },
          { label: 'C', content: 'begin-rescue-end', is_correct: false },
          { label: 'D', content: 'error-handle-done', is_correct: false }
        ]
      },
      {
        stem: 'Context manager (with statement) trong Python dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Quản lý resources tự động (auto cleanup) như file, connection', is_correct: true },
          { label: 'B', content: 'Tạo biến global', is_correct: false },
          { label: 'C', content: 'Multi-threading', is_correct: false },
          { label: 'D', content: 'Debugging tool', is_correct: false }
        ]
      },
      {
        stem: 'enumerate() trong Python làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Trả về iterator với index và value của iterable', is_correct: true },
          { label: 'B', content: 'Đếm số phần tử trong list', is_correct: false },
          { label: 'C', content: 'Sắp xếp list theo thứ tự', is_correct: false },
          { label: 'D', content: 'Tạo enum type', is_correct: false }
        ]
      },
      {
        stem: 'zip() function trong Python làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Combine multiple iterables thành iterator of tuples', is_correct: true },
          { label: 'B', content: 'Nén file thành zip', is_correct: false },
          { label: 'C', content: 'Tăng tốc độ chạy code', is_correct: false },
          { label: 'D', content: 'Sort list nhanh', is_correct: false }
        ]
      },
      {
        stem: 'map() function trong Python làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Apply function lên từng phần tử của iterable', is_correct: true },
          { label: 'B', content: 'Tạo dictionary từ list', is_correct: false },
          { label: 'C', content: 'Tạo bản đồ dữ liệu', is_correct: false },
          { label: 'D', content: 'Map memory cho process', is_correct: false }
        ]
      },
      {
        stem: 'filter() function trong Python làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Lọc elements của iterable dựa trên function điều kiện', is_correct: true },
          { label: 'B', content: 'Lọc noise trong data', is_correct: false },
          { label: 'C', content: 'Remove duplicates', is_correct: false },
          { label: 'D', content: 'Sort elements', is_correct: false }
        ]
      },
      {
        stem: 'Slice notation list[start:stop:step] trong Python hoạt động như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Trích xuất sublist từ index start đến stop-1 với bước nhảy step', is_correct: true },
          { label: 'B', content: 'Xóa elements từ start đến stop', is_correct: false },
          { label: 'C', content: 'Đảo ngược list', is_correct: false },
          { label: 'D', content: 'Sort list từ start đến stop', is_correct: false }
        ]
      }
    ]
  },

  // MOOC 6: Thực hành cơ bản
  {
    mooc_id: 6,
    questions: [
      {
        stem: 'NumPy là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Thư viện Python cho scientific computing với n-dimensional arrays', is_correct: true },
          { label: 'B', content: 'Framework web development', is_correct: false },
          { label: 'C', content: 'Database management system', is_correct: false },
          { label: 'D', content: 'Testing framework', is_correct: false }
        ]
      },
      {
        stem: 'Pandas DataFrame là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: '2D labeled data structure giống như spreadsheet hoặc SQL table', is_correct: true },
          { label: 'B', content: 'Một loài gấu trúc', is_correct: false },
          { label: 'C', content: 'Animation framework', is_correct: false },
          { label: 'D', content: 'Video processing library', is_correct: false }
        ]
      },
      {
        stem: 'Matplotlib dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Visualization library để tạo plots, charts, graphs', is_correct: true },
          { label: 'B', content: 'Machine learning framework', is_correct: false },
          { label: 'C', content: 'Math calculation library', is_correct: false },
          { label: 'D', content: 'Matrix operations tool', is_correct: false }
        ]
      },
      {
        stem: 'CSV file là gì và Python đọc CSV bằng cách nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Comma-Separated Values file, đọc bằng pandas.read_csv() hoặc csv module', is_correct: true },
          { label: 'B', content: 'Compressed Save file, đọc bằng zip module', is_correct: false },
          { label: 'C', content: 'Computer System Variables, đọc bằng os module', is_correct: false },
          { label: 'D', content: 'Cannot be read by Python', is_correct: false }
        ]
      },
      {
        stem: 'JSON trong Python được xử lý bằng module nào?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'json module (built-in)', is_correct: true },
          { label: 'B', content: 'pandas', is_correct: false },
          { label: 'C', content: 'requests', is_correct: false },
          { label: 'D', content: 'xmltodict', is_correct: false }
        ]
      },
      {
        stem: 'Trong Pandas, .loc và .iloc khác nhau như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: '.loc dùng label-based indexing, .iloc dùng integer-based indexing', is_correct: true },
          { label: 'B', content: '.loc cho rows, .iloc cho columns', is_correct: false },
          { label: 'C', content: 'Không có sự khác biệt', is_correct: false },
          { label: 'D', content: '.loc nhanh hơn .iloc', is_correct: false }
        ]
      },
      {
        stem: 'Missing data (NaN) trong Pandas được xử lý bằng method nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'dropna(), fillna(), interpolate()', is_correct: true },
          { label: 'B', content: 'remove_nan(), replace_nan()', is_correct: false },
          { label: 'C', content: 'delete_empty(), fill_empty()', is_correct: false },
          { label: 'D', content: 'Pandas không xử lý được NaN', is_correct: false }
        ]
      },
      {
        stem: 'GroupBy trong Pandas dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Nhóm data theo một hoặc nhiều columns và apply aggregate functions', is_correct: true },
          { label: 'B', content: 'Sort data theo groups', is_correct: false },
          { label: 'C', content: 'Merge multiple DataFrames', is_correct: false },
          { label: 'D', content: 'Filter data', is_correct: false }
        ]
      },
      {
        stem: 'Merge và Join trong Pandas khác nhau như thế nào?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'merge() join on columns/indexes, join() mainly on indexes', is_correct: true },
          { label: 'B', content: 'merge() cho SQL, join() cho DataFrame', is_correct: false },
          { label: 'C', content: 'Không có sự khác biệt', is_correct: false },
          { label: 'D', content: 'merge() nhanh hơn join()', is_correct: false }
        ]
      },
      {
        stem: 'Pivot table trong Pandas là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Reshape data với rows là index, columns là keys, values là aggregated', is_correct: true },
          { label: 'B', content: 'Rotate DataFrame 90 degrees', is_correct: false },
          { label: 'C', content: 'Sort table by pivot column', is_correct: false },
          { label: 'D', content: 'Create table from scratch', is_correct: false }
        ]
      },
      {
        stem: 'NumPy array và Python list khác nhau quan trọng nhất ở đâu?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'NumPy array nhanh hơn và hỗ trợ vectorized operations', is_correct: true },
          { label: 'B', content: 'List chỉ chứa numbers, array chứa mọi type', is_correct: false },
          { label: 'C', content: 'Array không thể thay đổi size', is_correct: false },
          { label: 'D', content: 'Không có sự khác biệt', is_correct: false }
        ]
      },
      {
        stem: 'Broadcasting trong NumPy là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Quy tắc để thực hiện operations trên arrays có shape khác nhau', is_correct: true },
          { label: 'B', content: 'Gửi data qua network', is_correct: false },
          { label: 'C', content: 'Tạo copies của array', is_correct: false },
          { label: 'D', content: 'Parallel processing', is_correct: false }
        ]
      },
      {
        stem: 'Seaborn khác Matplotlib như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Seaborn built on top of Matplotlib, có default styles đẹp hơn và statistical plots', is_correct: true },
          { label: 'B', content: 'Seaborn nhanh hơn Matplotlib', is_correct: false },
          { label: 'C', content: 'Seaborn chỉ dùng cho 3D plots', is_correct: false },
          { label: 'D', content: 'Matplotlib bị deprecated, dùng Seaborn thay thế', is_correct: false }
        ]
      },
      {
        stem: 'Trong data cleaning, outliers là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Data points xa bất thường so với phần còn lại của dataset', is_correct: true },
          { label: 'B', content: 'Data nằm ngoài file', is_correct: false },
          { label: 'C', content: 'Data bị duplicate', is_correct: false },
          { label: 'D', content: 'Data có type sai', is_correct: false }
        ]
      },
      {
        stem: 'Feature engineering trong data science là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Tạo features mới từ raw data để improve model performance', is_correct: true },
          { label: 'B', content: 'Remove features không cần thiết', is_correct: false },
          { label: 'C', content: 'Engineering department features', is_correct: false },
          { label: 'D', content: 'Feature requests từ users', is_correct: false }
        ]
      }
    ]
  },

  // MOOC 7: Kỹ thuật nâng cao
  {
    mooc_id: 7,
    questions: [
      {
        stem: 'Scikit-learn là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Machine learning library cho Python với nhiều algorithms', is_correct: true },
          { label: 'B', content: 'Scientific calculator', is_correct: false },
          { label: 'C', content: 'Data visualization tool', is_correct: false },
          { label: 'D', content: 'Web scraping library', is_correct: false }
        ]
      },
      {
        stem: 'Supervised learning khác Unsupervised learning như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Supervised có labeled data, Unsupervised không có labels', is_correct: true },
          { label: 'B', content: 'Supervised chậm hơn Unsupervised', is_correct: false },
          { label: 'C', content: 'Supervised chỉ dùng cho images', is_correct: false },
          { label: 'D', content: 'Không có sự khác biệt', is_correct: false }
        ]
      },
      {
        stem: 'Train-test split trong machine learning dùng để làm gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Chia data thành training set và test set để evaluate model', is_correct: true },
          { label: 'B', content: 'Tách data thành 2 files', is_correct: false },
          { label: 'C', content: 'Split features và labels', is_correct: false },
          { label: 'D', content: 'Chia team thành train và test', is_correct: false }
        ]
      },
      {
        stem: 'Overfitting trong machine learning là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Model học quá fit với training data, perform kém trên new data', is_correct: true },
          { label: 'B', content: 'Model quá đơn giản', is_correct: false },
          { label: 'C', content: 'Training time quá lâu', is_correct: false },
          { label: 'D', content: 'Data quá nhiều', is_correct: false }
        ]
      },
      {
        stem: 'Cross-validation trong ML dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Đánh giá model performance bằng cách split data thành k folds', is_correct: true },
          { label: 'B', content: 'Validate user input', is_correct: false },
          { label: 'C', content: 'Check data có đúng format không', is_correct: false },
          { label: 'D', content: 'Cross-reference với data khác', is_correct: false }
        ]
      },
      {
        stem: 'Feature scaling (normalization/standardization) tại sao quan trọng?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Đưa features về cùng scale để algorithms hoạt động tốt hơn', is_correct: true },
          { label: 'B', content: 'Giảm số lượng features', is_correct: false },
          { label: 'C', content: 'Tăng accuracy 100%', is_correct: false },
          { label: 'D', content: 'Không quan trọng', is_correct: false }
        ]
      },
      {
        stem: 'Confusion matrix trong classification là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Bảng thể hiện True Positives, False Positives, True Negatives, False Negatives', is_correct: true },
          { label: 'B', content: 'Ma trận gây confusion cho model', is_correct: false },
          { label: 'C', content: 'Error log matrix', is_correct: false },
          { label: 'D', content: 'Input data matrix', is_correct: false }
        ]
      },
      {
        stem: 'Precision và Recall khác nhau như thế nào?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Precision = TP/(TP+FP), Recall = TP/(TP+FN)', is_correct: true },
          { label: 'B', content: 'Precision đo tốc độ, Recall đo accuracy', is_correct: false },
          { label: 'C', content: 'Precision cho regression, Recall cho classification', is_correct: false },
          { label: 'D', content: 'Không có sự khác biệt', is_correct: false }
        ]
      },
      {
        stem: 'ROC curve và AUC dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Đánh giá classification model với True Positive Rate vs False Positive Rate', is_correct: true },
          { label: 'B', content: 'Visualize training process', is_correct: false },
          { label: 'C', content: 'Plot feature importance', is_correct: false },
          { label: 'D', content: 'Show data distribution', is_correct: false }
        ]
      },
      {
        stem: 'Bias-variance tradeoff là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Balance giữa underfitting (high bias) và overfitting (high variance)', is_correct: true },
          { label: 'B', content: 'Tradeoff giữa speed và accuracy', is_correct: false },
          { label: 'C', content: 'Tradeoff giữa data size và model size', is_correct: false },
          { label: 'D', content: 'Personal bias của developer', is_correct: false }
        ]
      },
      {
        stem: 'Regularization (L1, L2) trong ML dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Prevent overfitting bằng cách penalize large coefficients', is_correct: true },
          { label: 'B', content: 'Normalize input data', is_correct: false },
          { label: 'C', content: 'Regular maintenance của model', is_correct: false },
          { label: 'D', content: 'Tạo regular patterns trong data', is_correct: false }
        ]
      },
      {
        stem: 'Ensemble learning là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Kết hợp multiple models để improve prediction performance', is_correct: true },
          { label: 'B', content: 'Training ensemble of data scientists', is_correct: false },
          { label: 'C', content: 'Music ensemble analysis', is_correct: false },
          { label: 'D', content: 'Learning từ ensemble cast', is_correct: false }
        ]
      },
      {
        stem: 'Random Forest là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Ensemble method dùng multiple decision trees', is_correct: true },
          { label: 'B', content: 'Random sampling từ data', is_correct: false },
          { label: 'C', content: 'Algorithm tạo random forests', is_correct: false },
          { label: 'D', content: 'Visualization technique', is_correct: false }
        ]
      },
      {
        stem: 'Gradient Descent là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Optimization algorithm để minimize loss function bằng cách update weights', is_correct: true },
          { label: 'B', content: 'Descent từ gradient cao xuống thấp', is_correct: false },
          { label: 'C', content: 'Feature selection method', is_correct: false },
          { label: 'D', content: 'Data cleaning technique', is_correct: false }
        ]
      },
      {
        stem: 'Hyperparameter tuning là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Tìm best hyperparameters cho model bằng grid search, random search,...', is_correct: true },
          { label: 'B', content: 'Tune parameters của data', is_correct: false },
          { label: 'C', content: 'Tuning âm thanh của model', is_correct: false },
          { label: 'D', content: 'Parameter optimization trong runtime', is_correct: false }
        ]
      }
    ]
  },

  // MOOC 8: Dự án thực tế
  {
    mooc_id: 8,
    questions: [
      {
        stem: 'Exploratory Data Analysis (EDA) là bước gì trong data science workflow?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Phân tích và visualize data để hiểu patterns, trends, anomalies', is_correct: true },
          { label: 'B', content: 'Deploy model lên production', is_correct: false },
          { label: 'C', content: 'Collect data từ users', is_correct: false },
          { label: 'D', content: 'Write documentation', is_correct: false }
        ]
      },
      {
        stem: 'Data pipeline là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Series of data processing steps từ raw data đến final output', is_correct: true },
          { label: 'B', content: 'Pipeline vật lý để transport data', is_correct: false },
          { label: 'C', content: 'Chỉ áp dụng cho oil & gas data', is_correct: false },
          { label: 'D', content: 'Database connection string', is_correct: false }
        ]
      },
      {
        stem: 'A/B testing trong data science là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'So sánh hai versions (A và B) để xem cái nào perform tốt hơn', is_correct: true },
          { label: 'B', content: 'Testing hai types of data', is_correct: false },
          { label: 'C', content: 'Alphabet testing từ A đến B', is_correct: false },
          { label: 'D', content: 'Testing phase A rồi phase B', is_correct: false }
        ]
      },
      {
        stem: 'Model deployment là gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Đưa trained model lên production để serve predictions cho users', is_correct: true },
          { label: 'B', content: 'Deploy source code lên GitHub', is_correct: false },
          { label: 'C', content: 'Deploy data lên cloud', is_correct: false },
          { label: 'D', content: 'Deploy team members', is_correct: false }
        ]
      },
      {
        stem: 'API trong context of ML deployment thường trả về gì?',
        difficulty: 'easy',
        options: [
          { label: 'A', content: 'Predictions/results từ model dựa trên input data', is_correct: true },
          { label: 'B', content: 'Toàn bộ model weights', is_correct: false },
          { label: 'C', content: 'Training data', is_correct: false },
          { label: 'D', content: 'Source code của model', is_correct: false }
        ]
      },
      {
        stem: 'Model monitoring sau deployment cần track metrics nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Accuracy, latency, data drift, concept drift', is_correct: true },
          { label: 'B', content: 'Chỉ cần track uptime', is_correct: false },
          { label: 'C', content: 'Chỉ track số lượng requests', is_correct: false },
          { label: 'D', content: 'Không cần monitor', is_correct: false }
        ]
      },
      {
        stem: 'Data versioning tại sao quan trọng trong ML projects?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Track changes trong data để reproduce experiments và debug issues', is_correct: true },
          { label: 'B', content: 'Tạo versions của model', is_correct: false },
          { label: 'C', content: 'Version control cho code', is_correct: false },
          { label: 'D', content: 'Không quan trọng', is_correct: false }
        ]
      },
      {
        stem: 'Feature store là gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Centralized repository để store, manage, và serve features cho ML', is_correct: true },
          { label: 'B', content: 'Cửa hàng bán features', is_correct: false },
          { label: 'C', content: 'Database lưu raw data', is_correct: false },
          { label: 'D', content: 'Git repository cho features', is_correct: false }
        ]
      },
      {
        stem: 'MLOps là gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Practices để deploy và maintain ML models in production reliably', is_correct: true },
          { label: 'B', content: 'Machine Learning Operations team', is_correct: false },
          { label: 'C', content: 'ML without operations', is_correct: false },
          { label: 'D', content: 'Chỉ là buzzword không có ý nghĩa', is_correct: false }
        ]
      },
      {
        stem: 'Docker trong ML projects dùng để làm gì?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Containerize application để deploy consistent across environments', is_correct: true },
          { label: 'B', content: 'Document code', is_correct: false },
          { label: 'C', content: 'Docker whale mascot cho team', is_correct: false },
          { label: 'D', content: 'Database tool', is_correct: false }
        ]
      },
      {
        stem: 'Real-time inference khác batch inference như thế nào?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Real-time predict ngay lập tức, Batch process nhiều predictions cùng lúc', is_correct: true },
          { label: 'B', content: 'Real-time chậm hơn Batch', is_correct: false },
          { label: 'C', content: 'Không có sự khác biệt', is_correct: false },
          { label: 'D', content: 'Real-time chỉ dùng cho games', is_correct: false }
        ]
      },
      {
        stem: 'Model interpretability/explainability tại sao quan trọng?',
        difficulty: 'medium',
        options: [
          { label: 'A', content: 'Hiểu model đưa ra quyết định như thế nào, build trust, debug issues', is_correct: true },
          { label: 'B', content: 'Không quan trọng, chỉ cần accuracy cao', is_correct: false },
          { label: 'C', content: 'Chỉ để viết báo cáo', is_correct: false },
          { label: 'D', content: 'Chỉ áp dụng cho deep learning', is_correct: false }
        ]
      },
      {
        stem: 'SHAP values dùng để làm gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Explain contribution của từng feature đến prediction của model', is_correct: true },
          { label: 'B', content: 'Shape data into different formats', is_correct: false },
          { label: 'C', content: 'Reshape model architecture', is_correct: false },
          { label: 'D', content: 'Sharp accuracy improvement technique', is_correct: false }
        ]
      },
      {
        stem: 'Data leakage trong ML là gì và tại sao nguy hiểm?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Training data chứa thông tin về test data, làm model perform ảo tưởng', is_correct: true },
          { label: 'B', content: 'Data bị leak ra ngoài internet', is_correct: false },
          { label: 'C', content: 'Memory leak trong code', is_correct: false },
          { label: 'D', content: 'Disk space leakage', is_correct: false }
        ]
      },
      {
        stem: 'CI/CD trong ML projects bao gồm những gì?',
        difficulty: 'hard',
        options: [
          { label: 'A', content: 'Continuous Integration và Continuous Deployment/Delivery cho ML pipelines', is_correct: true },
          { label: 'B', content: 'Code Integration and Code Deployment', is_correct: false },
          { label: 'C', content: 'Customer Intelligence và Customer Data', is_correct: false },
          { label: 'D', content: 'Chỉ áp dụng cho software, không phải ML', is_correct: false }
        ]
      }
    ]
  }
];

async function addAllQuestions() {
  try {
    const pool = await sql.connect(config);

    console.log(`\n🚀 Adding questions for Course 3: Python for Data Science`);
    console.log(`📚 Total MOOCs: ${allQuestions.length}\n`);

    let totalAdded = 0;

    for (const moocData of allQuestions) {
      const mooc = await pool.request().query(`
        SELECT title FROM moocs WHERE mooc_id = ${moocData.mooc_id}
      `);

      console.log(`\n📝 MOOC ${moocData.mooc_id}: ${mooc.recordset[0].title}`);
      console.log(`   Adding ${moocData.questions.length} questions...`);

      for (const q of moocData.questions) {
        // Insert question
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

        // Insert options
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

    console.log(`\n✨ Successfully added ${totalAdded} questions to Course 3!`);

    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addAllQuestions();
