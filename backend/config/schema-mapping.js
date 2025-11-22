// Database Schema Mapping for MiniCourseraFPTU1
// Map between expected schema and actual database structure

export const schemaMapping = {
  // Table mappings
  tables: {
    Users: 'users',
    Courses: 'courses', 
    Enrollments: 'enrollments',
    Lessons: 'lessons',
    Exams: 'exams',
    Questions: 'questions',
    Submissions: 'submissions',
    SubmissionAnswers: 'submission_answers',
    Roles: 'roles'
  },

  // Column mappings
  columns: {
    users: {
      user_id: 'user_id',
      email: 'email',
      full_name: 'full_name',
      password_hash: 'password_hash', // nvarchar in current DB
      role_id: 'role_id',
      status: 'status',
      created_at: 'created_at'
      // missing: updated_at
    },
    
    courses: {
      course_id: 'course_id',
      owner_id: 'owner_instructor_id', // Different name!
      title: 'title',
      description: 'description',
      language: 'language_code', // Different name!
      level: 'level',
      price_cents: 'price', // Different type! (decimal vs int)
      currency: null, // Missing in current DB
      status: 'status',
      created_at: 'start_at', // Using start_at as created_at
      updated_at: null // Missing
    },

    enrollments: {
      enrollment_id: 'enrollment_id',
      user_id: 'user_id', 
      course_id: 'course_id',
      status: 'status',
      enrolled_at: 'enrolled_at',
      completed_at: 'completed_at'
    },

    lessons: {
      lesson_id: 'lesson_id',
      module_id: 'mooc_id', // Different concept!
      title: 'title',
      content_type: 'content_type',
      content_url: 'content_url',
      duration_sec: null, // Missing
      position: 'order_no', // Different name!
      is_published: 'is_preview' // Different concept!
    }
  },

  // Missing tables that need to be created or simulated
  missingTables: [
    'instructors', // Could use users with role_id filter
    'modules',     // Current DB uses 'moocs'
    'progress',    // Need to create
    'payments',    // Current DB has 'invoices'
    'certificates',// Need to create
    'reviews'      // Need to create
  ],

  // Data type conversions needed
  typeConversions: {
    'courses.price': {
      from: 'decimal',
      to: 'int (price_cents)',
      conversion: 'multiply by 100'
    },
    'users.password_hash': {
      from: 'nvarchar(255)',
      to: 'varbinary(256)',
      conversion: 'hash function change needed'
    }
  }
};

// Helper functions for data conversion
export const convertPrice = {
  toCents: (price) => Math.round(price * 100),
  fromCents: (priceCents) => priceCents / 100
};

export const getTableName = (logicalTable) => {
  return schemaMapping.tables[logicalTable] || logicalTable.toLowerCase();
};

export const getColumnName = (table, logicalColumn) => {
  const tableMapping = schemaMapping.columns[table.toLowerCase()];
  return tableMapping?.[logicalColumn] || logicalColumn;
};

export default schemaMapping;