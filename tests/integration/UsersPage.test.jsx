import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UsersPage from '../../src/pages/admin/UsersPage';

// Mock useOutletContext
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({
      theme: 'light',
      currentColors: {
        background: '#ffffff',
        card: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        primary: '#3b82f6'
      }
    })
  };
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock data
const mockUsers = [
  {
    user_id: 1,
    username: 'admin',
    email: 'admin@example.com',
    fullname: 'Admin User',
    role_id: 1,
    is_locked: false,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    user_id: 2,
    username: 'teacher',
    email: 'teacher@example.com',
    fullname: 'Teacher User',
    role_id: 2,
    is_locked: false,
    created_at: '2024-01-02T00:00:00.000Z'
  },
  {
    user_id: 3,
    username: 'student',
    email: 'student@example.com',
    fullname: 'Student User',
    role_id: 3,
    is_locked: true,
    created_at: '2024-01-03T00:00:00.000Z'
  }
];

const mockStats = {
  success: true,
  data: {
    totalUsers: 2,
    activeUsers: 2,
    lockedUsers: 1
  }
};

// Helper to render component with required context
const renderUsersPage = () => {
  return render(
    <BrowserRouter>
      <UsersPage />
    </BrowserRouter>
  );
};

describe('UsersPage - Lock/Unlock Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default fetch mock responses
    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users') && !url.includes('lock') && !url.includes('unlock')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: mockUsers
          })
        });
      }
      if (url.includes('/admin/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStats)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('TC-USERS-001: Load Users List', () => {
    it('should load and display users on mount', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/admin/users'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token'
            })
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();
        expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
        expect(screen.getByText('student@example.com')).toBeInTheDocument();
      });
    });

    it('should normalize lock status correctly', async () => {
      const usersWithMixedStatus = [
        { user_id: 1, username: 'user1', email: 'user1@test.com', is_locked: '0', role_id: 3 },
        { user_id: 2, username: 'user2', email: 'user2@test.com', is_locked: '1', role_id: 3 },
        { user_id: 3, username: 'user3', email: 'user3@test.com', is_locked: true, role_id: 3 },
        { user_id: 4, username: 'user4', email: 'user4@test.com', is_locked: false, role_id: 3 }
      ];

      fetch.mockImplementationOnce((url) => {
        if (url.includes('/admin/users')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: usersWithMixedStatus
            })
          });
        }
      });

      renderUsersPage();

      await waitFor(() => {
        const lockButtons = screen.getAllByRole('button', { name: /khóa|mở khóa/i });
        expect(lockButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('TC-USERS-002: Lock User', () => {
    it('should show confirmation modal when clicking lock button', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
      });

      // Find and click lock button for active user (teacher)
      const lockButtons = screen.getAllByRole('button', { name: /khóa/i });
      fireEvent.click(lockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/xác nhận khóa/i)).toBeInTheDocument();
      });
    });

    it('should lock user successfully after confirmation', async () => {
      fetch.mockImplementation((url) => {
        if (url.includes('/lock')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              message: 'User locked successfully'
            })
          });
        }
        if (url.includes('/admin/users')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockUsers.map(u => u.user_id === 2 ? { ...u, is_locked: true } : u)
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
      });

      const lockButtons = screen.getAllByRole('button', { name: /khóa/i });
      fireEvent.click(lockButtons[0]);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/lock'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token'
            })
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/khóa thành công/i)).toBeInTheDocument();
      });
    });

    it('should handle lock error gracefully', async () => {
      fetch.mockImplementation((url) => {
        if (url.includes('/lock')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({
              success: false,
              error: { message: 'Database error' }
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

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
      });

      const lockButtons = screen.getAllByRole('button', { name: /khóa/i });
      fireEvent.click(lockButtons[0]);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/database error/i)).toBeInTheDocument();
      });
    });
  });

  describe('TC-USERS-003: Unlock User', () => {
    it('should show confirmation modal when clicking unlock button', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('student@example.com')).toBeInTheDocument();
      });

      // Find and click unlock button for locked user (student)
      const unlockButtons = screen.getAllByRole('button', { name: /mở khóa/i });
      fireEvent.click(unlockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/xác nhận mở khóa/i)).toBeInTheDocument();
      });
    });

    it('should unlock user successfully after confirmation', async () => {
      fetch.mockImplementation((url) => {
        if (url.includes('/unlock')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              message: 'User unlocked successfully'
            })
          });
        }
        if (url.includes('/admin/users')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockUsers.map(u => u.user_id === 3 ? { ...u, is_locked: false } : u)
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('student@example.com')).toBeInTheDocument();
      });

      const unlockButtons = screen.getAllByRole('button', { name: /mở khóa/i });
      fireEvent.click(unlockButtons[0]);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/unlock'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token'
            })
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/mở khóa thành công/i)).toBeInTheDocument();
      });
    });

    it('should handle unlock error gracefully', async () => {
      fetch.mockImplementation((url) => {
        if (url.includes('/unlock')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({
              success: false,
              error: { message: 'Permission denied' }
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

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('student@example.com')).toBeInTheDocument();
      });

      const unlockButtons = screen.getAllByRole('button', { name: /mở khóa/i });
      fireEvent.click(unlockButtons[0]);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
      });
    });
  });

  describe('TC-USERS-004: Cancel Operations', () => {
    it('should close lock confirmation modal when clicking cancel', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
      });

      const lockButtons = screen.getAllByRole('button', { name: /khóa/i });
      fireEvent.click(lockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/xác nhận khóa/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /hủy/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/xác nhận khóa/i)).not.toBeInTheDocument();
      });
    });

    it('should close unlock confirmation modal when clicking cancel', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('student@example.com')).toBeInTheDocument();
      });

      const unlockButtons = screen.getAllByRole('button', { name: /mở khóa/i });
      fireEvent.click(unlockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/xác nhận mở khóa/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /hủy/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/xác nhận mở khóa/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('TC-USERS-005: Stats Update', () => {
    it('should update stats after locking user', async () => {
      let callCount = 0;
      fetch.mockImplementation((url) => {
        if (url.includes('/lock')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          });
        }
        if (url.includes('/admin/users')) {
          callCount++;
          const updatedUsers = callCount > 1
            ? mockUsers.map(u => u.user_id === 2 ? { ...u, is_locked: true } : u)
            : mockUsers;
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

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
      });

      const lockButtons = screen.getAllByRole('button', { name: /khóa/i });
      fireEvent.click(lockButtons[0]);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/admin/users'),
          expect.anything()
        );
      }, { timeout: 3000 });
    });
  });

  describe('TC-USERS-006: Authorization', () => {
    it('should include authorization token in lock request', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
      });

      const lockButtons = screen.getAllByRole('button', { name: /khóa/i });
      fireEvent.click(lockButtons[0]);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        const lockCall = fetch.mock.calls.find(call => call[0].includes('/lock'));
        expect(lockCall).toBeDefined();
        expect(lockCall[1].headers.Authorization).toBe('Bearer mock-token');
      });
    });

    it('should include authorization token in unlock request', async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText('student@example.com')).toBeInTheDocument();
      });

      const unlockButtons = screen.getAllByRole('button', { name: /mở khóa/i });
      fireEvent.click(unlockButtons[0]);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        const unlockCall = fetch.mock.calls.find(call => call[0].includes('/unlock'));
        expect(unlockCall).toBeDefined();
        expect(unlockCall[1].headers.Authorization).toBe('Bearer mock-token');
      });
    });
  });
});
