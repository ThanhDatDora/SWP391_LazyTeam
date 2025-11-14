import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import UsersPage from '../UsersPage';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'fake-jwt-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = mockLocalStorage;

// Test data
const mockUsers = [
  {
    user_id: 1,
    full_name: 'Admin User',
    email: 'admin@test.com',
    role_id: 1,
    is_locked: false,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    user_id: 2,
    full_name: 'Instructor User',
    email: 'instructor@test.com',
    role_id: 2,
    is_locked: false,
    created_at: '2024-01-02T00:00:00.000Z'
  },
  {
    user_id: 3,
    full_name: 'Student User',
    email: 'student@test.com',
    role_id: 3,
    is_locked: false,
    created_at: '2024-01-03T00:00:00.000Z'
  },
  {
    user_id: 4,
    full_name: 'Locked Student',
    email: 'locked@test.com',
    role_id: 3,
    is_locked: true,
    created_at: '2024-01-04T00:00:00.000Z'
  }
];

const mockStats = {
  totalUsers: 15,
  activeUsers: 12,
  lockedUsers: 3
};

// Mock OutletContext provider
const MockOutletContextProvider = ({ children }) => {
  const mockContext = {
    theme: 'light',
    currentColors: {
      primary: '#3b82f6',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      card: '#ffffff',
      background: '#f9fafb'
    }
  };
  
  return (
    <BrowserRouter>
      <div data-testid="outlet-context">
        {children}
      </div>
    </BrowserRouter>
  );
};

// Mock useOutletContext hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({
      theme: 'light',
      currentColors: {
        primary: '#3b82f6',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        card: '#ffffff',
        background: '#f9fafb'
      }
    })
  };
});

describe('UsersPage - Lock/Unlock Functionality', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockFetch.mockClear();
    
    // Setup default successful responses
    mockFetch.mockImplementation((url) => {
      if (url.includes('/admin/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: mockStats
          })
        });
      }
      
      if (url.includes('/admin/users') && !url.includes('lock') && !url.includes('unlock')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: mockUsers
          })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('TC01: Hiển thị danh sách người dùng', () => {
    it('should load and display users list correctly', async () => {
      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify API was called with correct headers
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/users'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-jwt-token',
            'Content-Type': 'application/json'
          })
        })
      );

      // Verify users are displayed
      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Instructor User')).toBeInTheDocument();
        expect(screen.getByText('Student User')).toBeInTheDocument();
        expect(screen.getByText('Locked Student')).toBeInTheDocument();
      });
    });
  });

  describe('TC02: Hiển thị trạng thái khóa/mở khóa', () => {
    it('should display "Hoạt động" badge for unlocked users', async () => {
      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        const activeBadges = screen.getAllByText('Hoạt động');
        expect(activeBadges.length).toBeGreaterThan(0);
      });
    });

    it('should display "Bị khóa" badge for locked users', async () => {
      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Bị khóa')).toBeInTheDocument();
      });
    });
  });

  describe('TC03: Khóa người dùng', () => {
    it('should show confirmation modal when clicking lock button', async () => {
      const user = userEvent.setup();
      
      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('Student User')).toBeInTheDocument();
      });

      // Find lock button for Student User (role_id=3, not locked)
      const lockButtons = screen.getAllByTitle('Khóa tài khoản');
      await user.click(lockButtons[0]);

      // Verify confirmation modal appears
      await waitFor(() => {
        expect(screen.getByText('Xác nhận khóa tài khoản')).toBeInTheDocument();
        expect(screen.getByText(/Bạn có chắc chắn muốn khóa tài khoản này/i)).toBeInTheDocument();
      });
    });

    it('should lock user successfully when confirmed', async () => {
      const user = userEvent.setup();
      
      // Mock successful lock API response
      mockFetch.mockImplementation((url, options) => {
        if (url.includes('/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockStats
            })
          });
        }
        
        if (url.includes('/lock') && options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              message: 'User locked successfully'
            })
          });
        }
        
        if (url.includes('/admin/users')) {
          // Return updated users list with locked user
          const updatedUsers = mockUsers.map(u => 
            u.user_id === 2 ? { ...u, is_locked: true } : u
          );
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: updatedUsers
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('Instructor User')).toBeInTheDocument();
      });

      // Click lock button
      const lockButtons = screen.getAllByTitle('Khóa tài khoản');
      await user.click(lockButtons[0]);

      // Confirm lock action
      await waitFor(() => {
        expect(screen.getByText('Xác nhận khóa tài khoản')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      await user.click(confirmButton);

      // Verify lock API was called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/lock'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-jwt-token'
            })
          })
        );
      });

      // Verify success toast appears
      await waitFor(() => {
        expect(screen.getByText('Tài khoản đã bị khóa thành công')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show error message when lock fails', async () => {
      const user = userEvent.setup();
      
      // Mock failed lock API response
      mockFetch.mockImplementation((url, options) => {
        if (url.includes('/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockStats
            })
          });
        }
        
        if (url.includes('/lock') && options?.method === 'PUT') {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({
              success: false,
              error: { message: 'Không có quyền khóa tài khoản này' }
            })
          });
        }
        
        if (url.includes('/admin/users')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockUsers
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Student User')).toBeInTheDocument();
      });

      // Click lock button
      const lockButtons = screen.getAllByTitle('Khóa tài khoản');
      await user.click(lockButtons[0]);

      // Confirm lock action
      await waitFor(() => {
        expect(screen.getByText('Xác nhận khóa tài khoản')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      await user.click(confirmButton);

      // Verify error toast appears
      await waitFor(() => {
        expect(screen.getByText('Không có quyền khóa tài khoản này')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should close modal when clicking cancel button', async () => {
      const user = userEvent.setup();
      
      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Student User')).toBeInTheDocument();
      });

      // Click lock button
      const lockButtons = screen.getAllByTitle('Khóa tài khoản');
      await user.click(lockButtons[0]);

      // Verify modal appears
      await waitFor(() => {
        expect(screen.getByText('Xác nhận khóa tài khoản')).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /hủy/i });
      await user.click(cancelButton);

      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByText('Xác nhận khóa tài khoản')).not.toBeInTheDocument();
      });
    });
  });

  describe('TC04: Mở khóa người dùng', () => {
    it('should show confirmation modal when clicking unlock button', async () => {
      const user = userEvent.setup();
      
      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('Locked Student')).toBeInTheDocument();
      });

      // Find unlock button for Locked Student
      const unlockButton = screen.getByTitle('Mở khóa tài khoản');
      await user.click(unlockButton);

      // Verify confirmation modal appears
      await waitFor(() => {
        expect(screen.getByText('Xác nhận mở khóa tài khoản')).toBeInTheDocument();
        expect(screen.getByText(/Bạn có chắc chắn muốn mở khóa tài khoản này/i)).toBeInTheDocument();
      });
    });

    it('should unlock user successfully when confirmed', async () => {
      const user = userEvent.setup();
      
      // Mock successful unlock API response
      mockFetch.mockImplementation((url, options) => {
        if (url.includes('/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockStats
            })
          });
        }
        
        if (url.includes('/unlock') && options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              message: 'User unlocked successfully'
            })
          });
        }
        
        if (url.includes('/admin/users')) {
          // Return updated users list with unlocked user
          const updatedUsers = mockUsers.map(u => 
            u.user_id === 4 ? { ...u, is_locked: false } : u
          );
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: updatedUsers
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('Locked Student')).toBeInTheDocument();
      });

      // Click unlock button
      const unlockButton = screen.getByTitle('Mở khóa tài khoản');
      await user.click(unlockButton);

      // Confirm unlock action
      await waitFor(() => {
        expect(screen.getByText('Xác nhận mở khóa tài khoản')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      await user.click(confirmButton);

      // Verify unlock API was called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/unlock'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer fake-jwt-token'
            })
          })
        );
      });

      // Verify success toast appears
      await waitFor(() => {
        expect(screen.getByText('Tài khoản đã mở khóa thành công')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show error message when unlock fails', async () => {
      const user = userEvent.setup();
      
      // Mock failed unlock API response
      mockFetch.mockImplementation((url, options) => {
        if (url.includes('/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockStats
            })
          });
        }
        
        if (url.includes('/unlock') && options?.method === 'PUT') {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({
              success: false,
              error: { message: 'Không thể mở khóa tài khoản' }
            })
          });
        }
        
        if (url.includes('/admin/users')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockUsers
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Locked Student')).toBeInTheDocument();
      });

      // Click unlock button
      const unlockButton = screen.getByTitle('Mở khóa tài khoản');
      await user.click(unlockButton);

      // Confirm unlock action
      await waitFor(() => {
        expect(screen.getByText('Xác nhận mở khóa tài khoản')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      await user.click(confirmButton);

      // Verify error toast appears
      await waitFor(() => {
        expect(screen.getByText('Không thể mở khóa tài khoản')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('TC05: Quyền hạn khóa/mở khóa', () => {
    it('should not show lock/unlock buttons for Admin users', async () => {
      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument();
      });

      // Find Admin User row
      const adminRow = screen.getByText('Admin User').closest('tr');
      
      // Verify no lock/unlock buttons in Admin row
      const lockButton = within(adminRow).queryByTitle('Khóa tài khoản');
      const unlockButton = within(adminRow).queryByTitle('Mở khóa tài khoản');
      
      expect(lockButton).not.toBeInTheDocument();
      expect(unlockButton).not.toBeInTheDocument();
    });

    it('should show lock button for non-Admin unlocked users', async () => {
      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Instructor User')).toBeInTheDocument();
      });

      // Find Instructor User row
      const instructorRow = screen.getByText('Instructor User').closest('tr');
      
      // Verify lock button exists
      const lockButton = within(instructorRow).queryByTitle('Khóa tài khoản');
      expect(lockButton).toBeInTheDocument();
    });

    it('should show unlock button for locked users', async () => {
      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Locked Student')).toBeInTheDocument();
      });

      // Find Locked Student row
      const lockedRow = screen.getByText('Locked Student').closest('tr');
      
      // Verify unlock button exists
      const unlockButton = within(lockedRow).queryByTitle('Mở khóa tài khoản');
      expect(unlockButton).toBeInTheDocument();
    });
  });

  describe('TC06: Reload dữ liệu sau thao tác', () => {
    it('should reload users list after successful lock', async () => {
      const user = userEvent.setup();
      let callCount = 0;
      
      mockFetch.mockImplementation((url, options) => {
        if (url.includes('/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockStats
            })
          });
        }
        
        if (url.includes('/lock') && options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          });
        }
        
        if (url.includes('/admin/users')) {
          callCount++;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockUsers
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Student User')).toBeInTheDocument();
      });

      const initialCallCount = callCount;

      // Click lock button and confirm
      const lockButtons = screen.getAllByTitle('Khóa tài khoản');
      await user.click(lockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Xác nhận khóa tài khoản')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      await user.click(confirmButton);

      // Verify users list was reloaded (API called again)
      await waitFor(() => {
        expect(callCount).toBeGreaterThan(initialCallCount);
      });
    });
  });

  describe('TC07: Xử lý lỗi mạng', () => {
    it('should handle network error gracefully when locking user', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockImplementation((url, options) => {
        if (url.includes('/admin/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockStats
            })
          });
        }
        
        if (url.includes('/lock') && options?.method === 'PUT') {
          return Promise.reject(new Error('Network error'));
        }
        
        if (url.includes('/admin/users')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockUsers
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      render(
        <MockOutletContextProvider>
          <UsersPage />
        </MockOutletContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Student User')).toBeInTheDocument();
      });

      // Click lock button and confirm
      const lockButtons = screen.getAllByTitle('Khóa tài khoản');
      await user.click(lockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Xác nhận khóa tài khoản')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      await user.click(confirmButton);

      // Verify error message appears
      await waitFor(() => {
        expect(screen.getByText(/Lỗi khi khóa tài khoản/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
