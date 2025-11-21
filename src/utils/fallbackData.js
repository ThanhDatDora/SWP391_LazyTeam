/**
 * Fallback data and utilities for offline/backend unavailable mode
 */

export const MOCK_COURSES = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    description: "Master web development from scratch with HTML, CSS, JavaScript, React, Node.js and more",
    price: 99.99,
    originalPrice: 199.99,
    instructor: "John Smith",
    rating: 4.8,
    studentsCount: 15234,
    duration: "40 hours",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    videoUrl: "https://example.com/preview.mp4",
    lastUpdated: "2024-10",
    language: "English",
    includes: [
      "40 hours on-demand video",
      "15 articles",
      "Full lifetime access",
      "Certificate of completion"
    ],
    curriculum: [
      {
        id: 1,
        title: "Introduction to Web Development",
        lessons: [
          { id: 1, title: "Course Overview", duration: "10:00", type: "video" },
          { id: 2, title: "Setting Up Your Environment", duration: "15:00", type: "video" }
        ]
      }
    ],
    requirements: [
      "No programming experience needed",
      "A computer with internet connection",
      "Willingness to learn"
    ],
    whatYouLearn: [
      "Build real-world websites and web apps",
      "Master HTML, CSS, and JavaScript",
      "Learn React and modern frontend development",
      "Understand backend with Node.js"
    ]
  },
  {
    id: 2,
    title: "Python for Data Science",
    description: "Learn Python programming and data analysis with pandas, numpy, and matplotlib",
    price: 89.99,
    originalPrice: 179.99,
    instructor: "Sarah Johnson",
    rating: 4.7,
    studentsCount: 12500,
    duration: "35 hours",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800"
  }
];

export const MOCK_REVIEWS = [
  {
    id: 1,
    userName: "Michael Chen",
    rating: 5,
    comment: "Excellent course! Very comprehensive and easy to follow.",
    date: "2024-10-15",
    helpful: 124
  },
  {
    id: 2,
    userName: "Emily Davis",
    rating: 4,
    comment: "Great content but could use more practical examples.",
    date: "2024-10-10",
    helpful: 89
  }
];

export const MOCK_INSTRUCTORS = [
  {
    id: 1,
    name: "John Smith",
    title: "Senior Web Developer",
    bio: "15+ years of experience in web development, teaching thousands of students worldwide",
    rating: 4.8,
    students: 50000,
    courses: 12,
    avatar: "https://ui-avatars.com/api/?name=John+Smith"
  }
];

/**
 * Get mock course by ID
 */
export const getMockCourse = (courseId) => {
  const id = parseInt(courseId);
  return MOCK_COURSES.find(c => c.id === id) || MOCK_COURSES[0];
};

/**
 * Get mock courses list
 */
export const getMockCourses = (params = {}) => {
  const { limit = 10, category, search } = params;
  let courses = [...MOCK_COURSES];
  
  if (search) {
    courses = courses.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  return courses.slice(0, limit);
};

/**
 * Get mock reviews for a course
 */
export const getMockReviews = (courseId) => {
  return MOCK_REVIEWS;
};

/**
 * Get mock instructor
 */
export const getMockInstructor = (instructorId) => {
  return MOCK_INSTRUCTORS[0];
};

/**
 * Check if backend is available
 */
export const checkBackendAvailability = async (apiBaseUrl) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${apiBaseUrl}/health`, {
      signal: controller.signal,
      method: 'GET'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Backend unavailable, using fallback data:', error.message);
    return false;
  }
};

/**
 * Graceful API wrapper with fallback
 */
export const apiWithFallback = async (apiFn, fallbackFn, options = {}) => {
  const { timeout = 5000, useFallback = true } = options;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const result = await Promise.race([
      apiFn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
    
    clearTimeout(timeoutId);
    
    if (result && result.success) {
      return result;
    } else {
      throw new Error(result?.error || 'API request failed');
    }
  } catch (error) {
    console.warn('⚠️ API failed, using fallback:', error.message);
    
    if (useFallback && fallbackFn) {
      const fallbackData = fallbackFn();
      return {
        success: true,
        ...fallbackData,  // Spread fallback data directly instead of nesting
        fromCache: true,
        offline: true
      };
    }
    
    return {
      success: false,
      error: error.message,
      offline: true
    };
  }
};

/**
 * Create offline indicator component data
 */
export const getOfflineStatus = () => {
  return {
    isOffline: !navigator.onLine,
    message: navigator.onLine 
      ? 'Using cached data' 
      : 'You are offline. Displaying cached content.'
  };
};
