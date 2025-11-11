import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, createMockUser, createMockCourse, mockApiCall } from '../test/testUtils';
import { AuthContext } from '../contexts/AuthContext';

// Mock the API
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', state: null })
  };
});

// Component imports
import CourseCard from '../components/course/CourseCard';
import AuthPage from '../pages/auth/AuthPage';
import { ToastProvider } from '../components/ui/Toast';

describe('CourseCard Component', () => {
  const mockCourse = createMockCourse({
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of JavaScript programming',
    price: 99.99,
    level: 'Beginner',
    instructor: 'John Doe',
    rating: 4.5,
    learners: 250
  });

  it('renders course information correctly', () => {
    renderWithRouter(<CourseCard course={mockCourse} />);

    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Learn the basics of JavaScript programming')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('250 learners')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    
    renderWithRouter(
      <CourseCard course={mockCourse} onClick={mockOnClick} />
    );

    const courseCard = screen.getByRole('button');
    await user.click(courseCard);

    expect(mockOnClick).toHaveBeenCalledWith(mockCourse);
  });

  it('displays enrollment status when user is enrolled', () => {
    renderWithRouter(
      <CourseCard course={mockCourse} isEnrolled />
    );

    expect(screen.getByText(/enrolled/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    renderWithRouter(<CourseCard course={mockCourse} isLoading />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

describe('AuthPage Component', () => {
  const mockAuthContext = {
    state: { user: null, isAuthenticated: false, isLoading: false },
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AuthPage />
      </AuthContext.Provider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to register form', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AuthPage />
      </AuthContext.Provider>
    );

    const registerLink = screen.getByText(/create account/i);
    await user.click(registerLink);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles login submission', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    
    renderWithRouter(
      <AuthContext.Provider value={{ ...mockAuthContext, login: mockLogin }}>
        <AuthPage />
      </AuthContext.Provider>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });

    renderWithRouter(
      <ToastProvider>
        <AuthContext.Provider value={{ ...mockAuthContext, login: mockLogin }}>
          <AuthPage />
        </AuthContext.Provider>
      </ToastProvider>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during authentication', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    const mockLogin = vi.fn(() => new Promise(resolve => {
      resolveLogin = resolve;
    }));

    renderWithRouter(
      <AuthContext.Provider value={{ ...mockAuthContext, login: mockLogin }}>
        <AuthPage />
      </AuthContext.Provider>
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();

    // Resolve the promise
    resolveLogin({ success: true });
  });
});

describe('API Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles successful API responses', async () => {
    const mockApiResponse = { success: true, data: { id: 1, name: 'Test' } };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    });
    
    global.fetch = mockFetch;

    const { default: api } = await import('../services/api');
    const result = await api.get('/test');

    expect(result).toEqual(mockApiResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('handles API errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;

    const { default: api } = await import('../services/api');
    
    await expect(api.get('/test')).rejects.toThrow('Network error');
  });
});

describe('Performance Tests', () => {
  it('renders components within acceptable time limits', async () => {
    const start = performance.now();
    
    renderWithRouter(<CourseCard course={createMockCourse()} />);
    
    const end = performance.now();
    const renderTime = end - start;

    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('handles large lists efficiently', async () => {
    const largeCourseList = Array.from({ length: 100 }, (_, i) => 
      createMockCourse({ id: i, title: `Course ${i}` })
    );

    const start = performance.now();
    
    render(
      <div>
        {largeCourseList.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
    
    const end = performance.now();
    const renderTime = end - start;

    // Should render 100 components in less than 500ms
    expect(renderTime).toBeLessThan(500);
  });
});

describe('Accessibility Tests', () => {
  it('has proper ARIA attributes', () => {
    renderWithRouter(<CourseCard course={createMockCourse()} />);

    const courseCard = screen.getByRole('button');
    expect(courseCard).toHaveAttribute('aria-label');
    expect(courseCard).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    
    renderWithRouter(
      <CourseCard course={createMockCourse()} onClick={mockOnClick} />
    );

    const courseCard = screen.getByRole('button');
    courseCard.focus();
    
    expect(courseCard).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('provides proper alt text for images', () => {
    const courseWithImage = createMockCourse({
      image: 'course-image.jpg',
      title: 'React Course'
    });
    
    renderWithRouter(<CourseCard course={courseWithImage} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', expect.stringContaining('React Course'));
  });
});

describe('Error Boundary Tests', () => {
  const ThrowError = ({ shouldThrow }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  it('catches and displays errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <div>
        <ThrowError shouldThrow />
      </div>
    );

    // Check if error boundary fallback is shown
    // This would need an actual ErrorBoundary component wrapping
    
    consoleSpy.mockRestore();
  });
});

describe('Hook Tests', () => {
  it('useLocalStorage hook works correctly', async () => {
    const { renderHook, act } = await import('@testing-library/react');
    const { default: useLocalStorage } = await import('../hooks/useLocalStorage');

    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    // Initial value
    expect(result.current[0]).toBe('defaultValue');

    // Update value
    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem('testKey')).toBe('"newValue"');
  });
});