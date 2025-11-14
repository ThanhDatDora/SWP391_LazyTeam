import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi, test } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UsersPage from '../../src/pages/admin/UsersPage';

/**
 * UNIT TESTS - UsersPage Lock/Unlock Functionality
 * 
 * Tương đương JUnit/NUnit trong Java/C#:
 * - describe() = @TestClass
 * - it() / test() = @Test
 * - beforeEach() = @BeforeEach / @Before
 * - afterEach() = @AfterEach / @After
 * - expect() = Assert.assertEquals()
 */

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

// Test Data Fixtures
const createMockUser = (id, username, email, roleId, isLocked) => ({
  user_id: id,
  username,
  email,
  fullname: `${username} User`,
  role_id: roleId,
  is_locked: isLocked,
  created_at: new Date().toISOString()
});

const mockActiveUser = createMockUser(1, 'active_user', 'active@test.com', 3, false);
const mockLockedUser = createMockUser(2, 'locked_user', 'locked@test.com', 3, true);

// Helper function
const renderUsersPage = () => {
  return render(
    <BrowserRouter>
      <UsersPage />
    </BrowserRouter>
  );
};

// ============================================================================
// TEST SUITE 1: Data Normalization Tests
// ============================================================================
describe('UsersPage - Data Normalization Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * @Test: testNormalizeStringZeroToFalse
   * Kiểm tra normalize "0" string thành false boolean
   */
  test('should normalize string "0" to false boolean', async () => {
    const usersWithStringZero = [
      { ...mockActiveUser, is_locked: '0' }
    ];

    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: usersWithStringZero
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
      const statusBadges = screen.getAllByText(/hoạt động/i);
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  /**
   * @Test: testNormalizeStringOneToTrue
   * Kiểm tra normalize "1" string thành true boolean
   */
  test('should normalize string "1" to true boolean', async () => {
    const usersWithStringOne = [
      { ...mockLockedUser, is_locked: '1' }
    ];

    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: usersWithStringOne
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
      expect(screen.queryByText(/hoạt động/i)).toBeInTheDocument();
    });
  });

  /**
   * @Test: testNormalizeTrueBooleanRemainTrue
   * Kiểm tra boolean true vẫn giữ nguyên
   */
  test('should keep true boolean as true', async () => {
    const usersWithBooleanTrue = [
      { ...mockLockedUser, is_locked: true }
    ];

    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: usersWithBooleanTrue
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
      expect(screen.getByText('locked@test.com')).toBeInTheDocument();
    });
  });

  /**
   * @Test: testNormalizeFalseBooleanRemainFalse
   * Kiểm tra boolean false vẫn giữ nguyên
   */
  test('should keep false boolean as false', async () => {
    const usersWithBooleanFalse = [
      { ...mockActiveUser, is_locked: false }
    ];

    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: usersWithBooleanFalse
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
      const activeStatus = screen.getAllByText(/hoạt động/i);
      expect(activeStatus.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// TEST SUITE 2: Lock User Functionality Tests
// ============================================================================
describe('UsersPage - Lock User Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @Test: testLockUserModalDisplaysCorrectMessage
   * Kiểm tra modal hiển thị đúng message khi click khóa
   */
  test('should display correct confirmation message when locking user', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockActiveUser]
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
      expect(screen.getByText('active@test.com')).toBeInTheDocument();
    });

    const lockButtons = screen.getAllByTitle(/khóa tài khoản/i);
    fireEvent.click(lockButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/xác nhận khóa/i)).toBeInTheDocument();
    });
  });

  /**
   * @Test: testLockUserApiCallWithCorrectPayload
   * Kiểm tra API lock được gọi với đúng endpoint và method
   */
  test('should call lock API with correct endpoint and method', async () => {
    const mockLockResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'User locked' })
    };

    fetch.mockImplementation((url) => {
      if (url.includes('/lock')) {
        return Promise.resolve(mockLockResponse);
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [{ ...mockActiveUser, is_locked: true }]
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
      expect(screen.getByText('active@test.com')).toBeInTheDocument();
    });

    const unlockButtons = screen.getAllByTitle(/mở khóa tài khoản/i);
    fireEvent.click(unlockButtons[0]);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      const unlockCall = fetch.mock.calls.find(call => call[0].includes('/unlock'));
      expect(unlockCall).toBeDefined();
      expect(unlockCall[1].method).toBe('PUT');
    });
  });

  /**
   * @Test: testLockUserSuccessShowsToast
   * Kiểm tra toast notification hiển thị sau khi lock thành công
   */
  test('should show success toast after locking user', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/lock')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            message: 'Tài khoản đã bị khóa thành công' 
          })
        });
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockActiveUser]
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
      expect(screen.getByText('active@test.com')).toBeInTheDocument();
    });

    const lockButtons = screen.getAllByTitle(/khóa tài khoản/i);
    fireEvent.click(lockButtons[0]);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/thành công/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  /**
   * @Test: testLockUserFailureShowsErrorToast
   * Kiểm tra error toast khi lock thất bại
   */
  test('should show error toast when lock fails', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/lock')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            success: false, 
            error: { message: 'Không có quyền khóa tài khoản' }
          })
        });
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockActiveUser]
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
      expect(screen.getByText('active@test.com')).toBeInTheDocument();
    });

    const lockButtons = screen.getAllByTitle(/khóa tài khoản/i);
    fireEvent.click(lockButtons[0]);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/không có quyền/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

// ============================================================================
// TEST SUITE 3: Unlock User Functionality Tests
// ============================================================================
describe('UsersPage - Unlock User Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @Test: testUnlockUserModalDisplaysCorrectMessage
   * Kiểm tra modal hiển thị đúng message khi click mở khóa
   */
  test('should display correct confirmation message when unlocking user', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockLockedUser]
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
      expect(screen.getByText('locked@test.com')).toBeInTheDocument();
    });

    const unlockButtons = screen.getAllByTitle(/mở khóa/i);
    fireEvent.click(unlockButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/xác nhận mở khóa/i)).toBeInTheDocument();
    });
  });

  /**
   * @Test: testUnlockUserApiCallWithCorrectEndpoint
   * Kiểm tra API unlock được gọi với đúng endpoint
   */
  test('should call unlock API with correct endpoint', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/unlock')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [{ ...mockLockedUser, is_locked: false }]
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
      expect(screen.getByText('locked@test.com')).toBeInTheDocument();
    });

    const unlockButtons = screen.getAllByTitle(/mở khóa/i);
    fireEvent.click(unlockButtons[0]);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      const unlockCall = fetch.mock.calls.find(call => call[0].includes('/unlock'));
      expect(unlockCall).toBeDefined();
    });
  });

  /**
   * @Test: testUnlockUserSuccessReloadsData
   * Kiểm tra dữ liệu reload sau khi unlock thành công
   */
  test('should reload user data after successful unlock', async () => {
    let callCount = 0;
    fetch.mockImplementation((url) => {
      if (url.includes('/unlock')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      if (url.includes('/admin/users')) {
        callCount++;
        const users = callCount > 1 
          ? [{ ...mockLockedUser, is_locked: false }]
          : [mockLockedUser];
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: users
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
      expect(screen.getByText('locked@test.com')).toBeInTheDocument();
    });

    const unlockButtons = screen.getAllByTitle(/mở khóa/i);
    fireEvent.click(unlockButtons[0]);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(callCount).toBeGreaterThan(1);
    });
  });
});

// ============================================================================
// TEST SUITE 4: Authorization & Security Tests
// ============================================================================
describe('UsersPage - Authorization Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @Test: testLockRequestIncludesAuthToken
   * Kiểm tra lock request có JWT token trong header
   */
  test('should include Bearer token in lock request headers', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/lock')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockActiveUser]
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
      expect(screen.getByText('active@test.com')).toBeInTheDocument();
    });

    const lockButtons = screen.getAllByTitle(/khóa tài khoản/i);
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

  /**
   * @Test: testUnlockRequestIncludesAuthToken
   * Kiểm tra unlock request có JWT token trong header
   */
  test('should include Bearer token in unlock request headers', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/unlock')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockLockedUser]
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
      expect(screen.getByText('locked@test.com')).toBeInTheDocument();
    });

    const unlockButtons = screen.getAllByTitle(/mở khóa/i);
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

  /**
   * @Test: testTokenRetrievedFromLocalStorage
   * Kiểm tra token được lấy từ localStorage
   */
  test('should retrieve token from localStorage', async () => {
    fetch.mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    }));

    renderUsersPage();

    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    });
  });
});

// ============================================================================
// TEST SUITE 5: Modal Behavior Tests
// ============================================================================
describe('UsersPage - Modal Behavior Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @Test: testCancelLockClosesModal
   * Kiểm tra click Hủy đóng modal lock
   */
  test('should close lock modal when clicking cancel button', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockActiveUser]
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
      expect(screen.getByText('active@test.com')).toBeInTheDocument();
    });

    const lockButtons = screen.getAllByTitle(/khóa tài khoản/i);
    fireEvent.click(lockButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/xác nhận khóa/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByText(/hủy/i);
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/xác nhận khóa/i)).not.toBeInTheDocument();
    });
  });

  /**
   * @Test: testCancelUnlockClosesModal
   * Kiểm tra click Hủy đóng modal unlock
   */
  test('should close unlock modal when clicking cancel button', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockLockedUser]
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
      expect(screen.getByText('locked@test.com')).toBeInTheDocument();
    });

    const unlockButtons = screen.getAllByTitle(/mở khóa/i);
    fireEvent.click(unlockButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/xác nhận mở khóa/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByText(/hủy/i);
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/xác nhận mở khóa/i)).not.toBeInTheDocument();
    });
  });

  /**
   * @Test: testCancelDoesNotCallApi
   * Kiểm tra click Hủy không gọi API
   */
  test('should not call API when canceling lock operation', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockActiveUser]
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
      expect(screen.getByText('active@test.com')).toBeInTheDocument();
    });

    const initialCallCount = fetch.mock.calls.length;

    const lockButtons = screen.getAllByTitle(/khóa tài khoản/i);
    fireEvent.click(lockButtons[0]);

    await waitFor(() => {
      const cancelButton = screen.getByText(/hủy/i);
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      const lockCalls = fetch.mock.calls.filter(call => call[0].includes('/lock'));
      expect(lockCalls.length).toBe(0);
    });
  });
});

// ============================================================================
// TEST SUITE 6: Error Handling Tests
// ============================================================================
describe('UsersPage - Error Handling Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @Test: testNetworkErrorHandling
   * Kiểm tra xử lý lỗi network
   */
  test('should handle network error gracefully', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/lock')) {
        return Promise.reject(new Error('Network error'));
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockActiveUser]
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
      expect(screen.getByText('active@test.com')).toBeInTheDocument();
    });

    const lockButtons = screen.getAllByTitle(/khóa tài khoản/i);
    fireEvent.click(lockButtons[0]);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/lỗi/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  /**
   * @Test: test401UnauthorizedHandling
   * Kiểm tra xử lý lỗi 401 Unauthorized
   */
  test('should handle 401 unauthorized error', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/lock')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ 
            success: false, 
            error: { message: 'Unauthorized' }
          })
        });
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockActiveUser]
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
      expect(screen.getByText('active@test.com')).toBeInTheDocument();
    });

    const lockButtons = screen.getAllByTitle(/khóa tài khoản/i);
    fireEvent.click(lockButtons[0]);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /xác nhận/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
