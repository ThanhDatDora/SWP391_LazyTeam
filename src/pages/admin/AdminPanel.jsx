import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import {
  Users, BookOpen, AlertCircle, CheckCircle, XCircle, Shield, BarChart3,
  DollarSign, RefreshCw, GraduationCap, Lock, Unlock, Edit, Eye,
  TrendingUp, UserCheck, UserX, Search, LogOut, Menu, X, Home,
  FileText, Settings, Bell, UserCircle, Edit2, ChevronDown, ChevronRight,
  Folder, PieChart, Activity, Moon, Sun, TrendingDown, CreditCard, 
  ArrowUpRight, Download, Banknote, Clock, FileDown
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// GLOBAL CONFIG: Tắt TẤT CẢ grid lines mặc định
ChartJS.defaults.scale.grid.display = false;
ChartJS.defaults.scale.grid.drawBorder = false;
ChartJS.defaults.scale.grid.drawOnChartArea = false;
ChartJS.defaults.scale.grid.drawTicks = false;
ChartJS.defaults.plugins.legend.display = false;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Theme colors - Enhanced Modern Design
const COLORS = {
  light: {
    primary: '#4f46e5', // Indigo-600
    secondary: '#0891b2', // Cyan-600
    accent: '#7c3aed', // Violet-600
    success: '#059669', // Emerald-600
    warning: '#d97706', // Amber-600
    danger: '#dc2626', // Red-600
    background: '#f9fafb', // Gray-50
    card: '#ffffff',
    cardHover: '#f8fafc',
    text: '#111827', // Gray-900
    textSecondary: '#6b7280', // Gray-500
    border: '#e5e7eb', // Gray-200
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowHover: 'rgba(0, 0, 0, 0.15)'
  },
  dark: {
    primary: '#818cf8', // Indigo-400
    secondary: '#22d3ee', // Cyan-400
    accent: '#a78bfa', // Violet-400
    success: '#34d399', // Emerald-400
    warning: '#fbbf24', // Amber-400
    danger: '#f87171', // Red-400
    background: '#0f172a', // Gray-900 - dark background
    card: '#1e293b', // Gray-800 - lighter than background
    cardHover: '#334155', // Gray-700
    sidebar: '#1e293b', // Gray-800 - same as card but will have different styling
    topBar: '#0f172a', // Gray-900 - dark like background
    text: '#f9fafb', // Gray-50
    textSecondary: '#9ca3af', // Gray-400
    border: '#374155', // Gray-700
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowHover: 'rgba(0, 0, 0, 0.5)'
  }
};

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

// Utility function: Format number to VND currency
const formatVND = (n) =>
  (n ?? 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

// Role mapping constants for consistent role handling
const ROLE_ID_BY_KEY = {
  admin: 1,
  instructor: 2,
  learner: 3
};

const ROLE_KEY_BY_ID = {
  1: 'admin',
  2: 'instructor',
  3: 'learner'
};

const ROLE_LABEL_BY_ID = {
  1: 'Admin',
  2: 'Giảng Viên',
  3: 'Học Viên'
};

/**
 * Global Toast Notification Component - Uses React Portal
 * Displays fixed at viewport top, independent of scroll containers
 * @param {boolean} show - Show/hide toast
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {string} message - Toast message
 * @param {function} onClose - Close handler
 */
const AlertNotification = ({ show, type, message, onClose }) => {
  if (!show) return null;

  const alertConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-800 dark:text-emerald-200'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-800 dark:text-red-200'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
      textColor: 'text-amber-800 dark:text-amber-200'
    },
    info: {
      icon: AlertCircle,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-800 dark:text-blue-200'
    }
  };

  const config = alertConfig[type] || alertConfig.info;
  const Icon = config.icon;

  const toastContent = (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex justify-center items-start pt-4 px-4">
      <div 
        role="status"
        aria-live="polite"
        className={`flex items-center gap-5 p-5 rounded-xl border-2 shadow-2xl ${config.bgColor} ${config.borderColor} backdrop-blur-sm max-w-xl w-full pointer-events-auto animate-in slide-in-from-top fade-in duration-300`}
      >
        <Icon className={`w-8 h-8 ${config.iconColor} flex-shrink-0`} aria-hidden="true" />
        <p className={`flex-1 font-semibold text-lg ${config.textColor}`}>{message}</p>
        <button
          onClick={onClose}
          className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Đóng thông báo"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
};

/**
 * Reusable Modal Component - Uses React Portal
 * Displays fixed at viewport center, independent of scroll containers
 * @param {boolean} isOpen - Show/hide modal
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {function} onConfirm - Optional confirm handler
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {string} confirmVariant - 'primary' | 'danger' | 'success'
 * @param {object} currentColors - Theme colors
 * @param {string} theme - Current theme ('dark' | 'light')
 */
const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText = 'Xác nhận', cancelText = 'Hủy', confirmVariant = 'primary', currentColors, theme = 'light' }) => {
  if (!isOpen) return null;

  // Add theme class to portal wrapper for proper text color inheritance
  const themeClass = theme === 'dark' ? 'modal-dark' : 'modal-light';

  const modalContent = (
    <div className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 ${themeClass}`}>
      <div 
        className="modal-surface rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200" 
        style={{ backgroundColor: currentColors.card }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: currentColors.border }}>
          <h3 id="modal-title" className="text-xl font-bold text-inherit">{title}</h3>
          <button 
            onClick={onClose} 
            className="hover:opacity-70 transition-opacity text-inherit opacity-70" 
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 modal-content-wrapper">
          {children}
        </div>
        <div className="flex gap-3 p-6 border-t" style={{ 
          borderColor: currentColors.border,
          backgroundColor: currentColors.background 
        }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium hover:opacity-90"
            style={{ 
              backgroundColor: currentColors.border,
              color: currentColors.text
            }}
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                confirmVariant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : confirmVariant === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Card Component
const Card = ({ children, className = '', style = {} }) => (
  <div className={`rounded-lg shadow-md ${className}`} style={style}>
    {children}
  </div>
);

// Badge Component with role and status variants
const Badge = ({ children, variant = 'default', type, value, className = '' }) => {
  // Legacy variants for backward compatibility
  const legacyVariants = {
    default: 'bg-blue-100',
    success: 'bg-green-100',
    danger: 'bg-red-100',
    warning: 'bg-yellow-100',
    secondary: 'bg-gray-100'
  };

  // Role-based class mapping
  const roleToClass = {
    'learner': 'badge badge--role-learner',
    'instructor': 'badge badge--role-instructor',
    'giảng viên': 'badge badge--role-instructor',
    'admin': 'badge badge--role-admin',
    'học viên': 'badge badge--role-learner'
  };

  // Status-based class mapping
  const statusToClass = {
    'active': 'badge badge--status-active',
    'inactive': 'badge badge--status-inactive',
    'hoạt động': 'badge badge--status-active',
    'bị khóa': 'badge badge--status-inactive',
    'locked': 'badge badge--status-inactive'
  };

  // Determine class based on type and value
  let badgeClass = 'badge';
  
  if (type === 'role' && value) {
    const normalizedValue = value.toLowerCase();
    badgeClass = roleToClass[normalizedValue] || 'badge';
  } else if (type === 'status' && value) {
    const normalizedValue = value.toLowerCase();
    badgeClass = statusToClass[normalizedValue] || 'badge';
  } else if (variant && variant !== 'default') {
    // Legacy variant support
    badgeClass = `badge px-2 py-1 text-xs font-semibold rounded-full ${legacyVariants[variant] || legacyVariants.default}`;
  }

  return (
    <span className={`${badgeClass} ${className}`}>
      {children}
    </span>
  );
};

// Button Component
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    outline: 'bg-transparent border border-current',
    ghost: 'bg-transparent hover:bg-white/10',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    default: 'bg-gray-600 text-white hover:bg-gray-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${sizes[size]} rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ value, onChange, placeholder, className = '', type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
  />
);

// CardContent Component
const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

// Tabs Context
const TabsContext = React.createContext();

// Tabs Components
const Tabs = ({ children, defaultValue, value, onValueChange, className = '' }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const TabsTrigger = ({ children, value, className = '' }) => {
  const { activeTab, onTabChange } = React.useContext(TabsContext);
  
  return (
    <button
      onClick={() => onTabChange && onTabChange(value)}
      className={`${className} ${activeTab === value ? 'active' : ''}`}
      data-state={activeTab === value ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, value, className = '' }) => {
  const { activeTab } = React.useContext(TabsContext);
  
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, state: authState } = useAuth();

  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('adminTheme');
    return saved || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('adminTheme', newTheme);
  };

  const currentColors = COLORS[theme];

  // KPI Card Component - Define inside AdminPanel to access theme
  const KpiCard = ({ title, value, sub, gradientColors, icon: Icon }) => {
    // Only use gradient in DARK theme
    const shouldUseGradient = theme === 'dark' && gradientColors && gradientColors.length === 2;
    
    // Background style - gradient only in dark theme
    const bgStyle = shouldUseGradient 
      ? `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`
      : currentColors.card;
    
    // Text colors - white for gradient (dark theme), theme colors for light theme
    const titleColor = shouldUseGradient ? 'rgba(255,255,255,0.9)' : currentColors.textSecondary;
    const valueColor = shouldUseGradient ? '#ffffff' : currentColors.text;
    const subColor = shouldUseGradient ? 'rgba(255,255,255,0.8)' : currentColors.textSecondary;

    return (
      <div 
        className="p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
        style={{
          background: bgStyle,
          borderColor: shouldUseGradient ? 'transparent' : currentColors.border,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-sm font-medium" style={{ color: titleColor }}>
              {title}
            </p>
            <p className="text-3xl font-bold" style={{ color: valueColor }}>
              {value}
            </p>
            {sub && (
              <p className="text-xs" style={{ color: subColor }}>
                {sub}
              </p>
            )}
          </div>
          {Icon && shouldUseGradient && (
            <div 
              className="p-3 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    users: true,
    courses: true,
    revenue: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Modal states
  const [modalState, setModalState] = useState({
    type: null,
    isOpen: false,
    data: null
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingCourses: 0,
    totalRevenue: 0,
    activeInstructors: 0,
    monthlySignups: 0
  });

  // Mock chart data (replace with real API data later)
  const [revenueData] = useState([
    { month: 'T1', revenue: 4500000 },
    { month: 'T2', revenue: 5200000 },
    { month: 'T3', revenue: 4800000 },
    { month: 'T4', revenue: 6100000 },
    { month: 'T5', revenue: 7200000 },
    { month: 'T6', revenue: 6800000 },
    { month: 'T7', revenue: 8900000 },
    { month: 'T8', revenue: 9500000 },
    { month: 'T9', revenue: 8700000 },
    { month: 'T10', revenue: 10200000 },
    { month: 'T11', revenue: 11500000 },
    { month: 'T12', revenue: 12800000 }
  ]);

  const [userDistribution] = useState([
    { name: 'Giảng viên', value: 1, color: '#3b82f6' },
    { name: 'Học viên', value: 4, color: '#10b981' }
  ]);

  const [courseStats] = useState([
    { name: 'Đã duyệt', value: 9, color: '#10b981' },
    { name: 'Chờ duyệt', value: 0, color: '#f59e0b' },
    { name: 'Từ chối', value: 0, color: '#ef4444' }
  ]);

  const [users, setUsers] = useState([]);
  const [learners, setLearners] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // NEW: States for missing features
  const [instructorRequests, setInstructorRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructorRevenue, setInstructorRevenue] = useState([]);
  const [payModal, setPayModal] = useState({ isOpen: false, instructor: null, amount: '' });
  
  // Global Toast state
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  /**
   * Show global toast notification
   * Replaces all window.alert() calls for consistent UX
   * Toast appears fixed at viewport top via React Portal
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {string} message - Toast message
   */
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    // Auto-hide after 4.5 seconds
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 4500);
  };

  // Sync activeMenu with activeTab for existing tab content
  useEffect(() => {
    const menuToTabMapping = {
      'overview': 'overview',
      'pending-courses': 'overview', // pending courses is shown in overview tab
      'all-users': 'users',
      'learners': 'learners',
      'instructors': 'instructors',
      'all-courses': 'courses',
      'statistics': 'users', // placeholder - will need dedicated tab
      'revenue': 'revenue',
      'categories': 'courses', // placeholder - shown in courses tab
      'instructor-reports': 'revenue', // placeholder - shown in revenue tab
      'settings': 'users', // placeholder
      'profile': 'users' // placeholder
    };

    const tabValue = menuToTabMapping[activeMenu];
    if (tabValue && tabValue !== activeTab) {
      setActiveTab(tabValue);
    }
  }, [activeMenu]);

  // Menu items với paths cho routing
  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: Home, path: '/admin', isOverview: true },
    { id: 'statistics', label: 'Thống kê', icon: BarChart3, path: '/admin/statistics' },
    { id: 'pending', label: 'Duyệt khóa học', icon: FileText, path: '/admin/course-pending' },
    { id: 'users', label: 'Người dùng', icon: Users, path: '/admin/users' },
    { id: 'learners', label: 'Học viên', icon: UserCheck, path: '/admin/learners' },
    { id: 'instructors', label: 'Giảng viên', icon: GraduationCap, path: '/admin/instructors' },
    { id: 'courses', label: 'Khóa học', icon: BookOpen, path: '/admin/courses' },
    { id: 'revenue', label: 'Doanh thu', icon: DollarSign, path: '/admin/revenue' },
    { id: 'instructor-requests', label: 'Yêu cầu giảng viên', icon: UserCircle, path: '/admin/instructor-requests' },
    { id: 'withdrawal-requests', label: 'Yêu cầu rút tiền', icon: Download, path: '/admin/withdrawal-requests' },
    { id: 'payouts', label: 'Chi trả doanh thu', icon: CreditCard, path: '/admin/payouts' },
    { id: 'lock', label: 'Khóa tài khoản', icon: Lock, path: '/admin/lock-accounts' },
    { id: 'unlock', label: 'Mở khóa', icon: Unlock, path: '/admin/unlock-accounts' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/admin/settings' },
    { id: 'profile', label: 'Hồ sơ', icon: UserCircle, path: '/admin/profile' }
  ];

  // Sync activeMenu với URL khi component mount hoặc URL thay đổi
  useEffect(() => {
    const path = location.pathname;
    const menuItem = menuItems.find(item => item.path === path);
    if (menuItem && menuItem.id !== activeMenu) {
      setActiveMenu(menuItem.id);
    }
  }, [location.pathname]);

  // Handle menu click - navigate to route
  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
    setSidebarOpen(false);
  };

  useEffect(() => {
    console.log("🔄 Loading AdminPanel data...");
    loadDashboardData();
    loadInstructorRevenue();
  }, []);

  // Sync activeMenu with current location pathname
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin') {
      setActiveMenu('overview');
    } else if (path.includes('/admin/users')) {
      setActiveMenu('all-users');
    } else if (path.includes('/admin/learners')) {
      setActiveMenu('learners');
    } else if (path.includes('/admin/instructors-list')) {
      setActiveMenu('instructors');
    } else if (path.includes('/admin/courses')) {
      setActiveMenu('all-courses');
    } else if (path.includes('/admin/categories')) {
      setActiveMenu('categories');
    } else if (path.includes('/admin/course-pending')) {
      setActiveMenu('pending');
    } else if (path.includes('/admin/learning-stats')) {
      setActiveMenu('statistics');
    } else if (path.includes('/admin/instructor-reports')) {
      setActiveMenu('instructor-reports');
    } else if (path.includes('/admin/instructor-requests')) {
      setActiveMenu('instructor-requests');
    } else if (path.includes('/admin/withdrawal-requests')) {
      setActiveMenu('withdrawal-requests');
    } else if (path.includes('/admin/payouts')) {
      setActiveMenu('payouts');
    } else if (path.includes('/admin/settings')) {
      setActiveMenu('settings');
    }
  }, [location.pathname]);

  // ========== STUB FUNCTIONS FOR MISSING FEATURES ==========
  // These are placeholders waiting for backend implementation
  
  /**
   * STUB: Fetch pending instructor role requests
   * @returns {Promise<Array>} List of users requesting instructor role
   */
  const fetchInstructorRequests = async () => {
    console.log('🔄 [STUB] Fetching instructor requests...');
    // TODO: Implement real API call
    // const response = await fetch(`${API_BASE_URL}/admin/instructor-requests`, {...});
    // return await response.json();
    return []; // Placeholder
  };

  /**
   * STUB: Approve instructor role request
   * @param {number} userId - User ID to approve
   */
  const approveInstructorRequest = async (userId) => {
    console.log(`✅ [STUB] Approving instructor request for user ${userId}`);
    // TODO: Implement real API call
    // await fetch(`${API_BASE_URL}/admin/instructor-requests/${userId}/approve`, {...});
    showToast('success', '✅ [STUB] Instructor request approved (waiting for BE implementation)');
  };

  /**
   * STUB: Reject instructor role request
   * @param {number} userId - User ID to reject
   * @param {string} reason - Rejection reason
   */
  const rejectInstructorRequest = async (userId, reason) => {
    console.log(`❌ [STUB] Rejecting instructor request for user ${userId}. Reason: ${reason}`);
    // TODO: Implement real API call
    // await fetch(`${API_BASE_URL}/admin/instructor-requests/${userId}/reject`, {...});
    showToast('error', `❌ [STUB] Instructor request rejected (waiting for BE implementation)`);
  };

  /**
   * STUB: Fetch withdrawal requests from instructors
   * @returns {Promise<Array>} List of pending withdrawals
   */
  const fetchWithdrawalRequests = async () => {
    console.log('💰 [STUB] Fetching withdrawal requests...');
    // TODO: Implement real API call
    // const response = await fetch(`${API_BASE_URL}/admin/withdrawals/pending`, {...});
    // return await response.json();
    return []; // Placeholder
  };

  /**
   * STUB: Approve withdrawal request
   * @param {number} requestId - Withdrawal request ID
   */
  const approveWithdrawal = async (requestId) => {
    console.log(`✅ [STUB] Approving withdrawal request ${requestId}`);
    // TODO: Implement real API call
    // await fetch(`${API_BASE_URL}/admin/withdrawals/${requestId}/approve`, {...});
    showToast('success', '✅ [STUB] Withdrawal approved (waiting for BE implementation)');
  };

  /**
   * STUB: Reject withdrawal request
   * @param {number} requestId - Withdrawal request ID
   * @param {string} reason - Rejection reason
   */
  const rejectWithdrawal = async (requestId, reason) => {
    console.log(`❌ [STUB] Rejecting withdrawal request ${requestId}. Reason: ${reason}`);
    // TODO: Implement real API call
    // await fetch(`${API_BASE_URL}/admin/withdrawals/${requestId}/reject`, {...});
    showToast('error', `❌ [STUB] Withdrawal rejected (waiting for BE implementation)`);
  };

  /**
   * STUB: Fetch instructors with pending revenue
   * @returns {Promise<Array>} List of instructors eligible for payout
   */
  const fetchPayoutData = async () => {
    console.log('💸 [STUB] Fetching payout data...');
    // TODO: Implement real API call
    // const response = await fetch(`${API_BASE_URL}/admin/payouts/pending`, {...});
    // return await response.json();
    return []; // Placeholder
  };

  /**
   * STUB: Pay instructor revenue
   * @param {number} userId - Instructor user ID
   * @param {number} amount - Amount to pay
   */
  const payInstructorRevenue = async (userId, amount) => {
    console.log(`💵 [STUB] Paying ${amount} VND to instructor ${userId}`);
    // TODO: Implement real API call
    // await fetch(`${API_BASE_URL}/admin/payouts/${userId}/pay`, {...});
    showToast('success', `💵 [STUB] Payment of ${amount.toLocaleString()} VND processed (waiting for BE implementation)`);
  };

  /**
   * STUB: Fetch detailed course data
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Course details with lessons
   */
  const fetchCourseDetails = async (courseId) => {
    console.log(`📚 [STUB] Fetching course details for course ${courseId}`);
    // TODO: Implement real API call
    // const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/details`, {...});
    // return await response.json();
    return null; // Placeholder
  };

  /**
   * STUB: Export data to CSV
   * @param {string} type - Type of data to export (users, courses, revenue, etc.)
   */
  const exportToCSV = (type) => {
    console.log(`📊 [STUB] Exporting ${type} data to CSV...`);
    // TODO: Implement real CSV export logic
    showToast('info', `📊 [STUB] ${type} data export initiated (waiting for implementation)`);
  };

  // ========== END STUB FUNCTIONS ==========

  // Helper function to handle 401 errors (token expired)
  const handleUnauthorized = () => {
    console.log('❌ Token expired or unauthorized, logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  // Helper function to check response status and handle 401
  const checkResponseAuth = async (response, dataName = 'data') => {
    if (response.status === 401) {
      console.log(`❌ 401 Unauthorized while fetching ${dataName}`);
      handleUnauthorized();
      return null;
    }
    return response;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('❌ No token found, redirecting to login...');
        navigate('/auth');
        return;
      }

      console.log('📡 Fetching admin data with token:', token ? 'exists' : 'missing');
      console.log('📡 API Base URL:', API_BASE_URL);
      
      // Load statistics from /stats endpoint
      console.log('📡 [1/6] Fetching stats...');
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check for 401 error
      if (!(await checkResponseAuth(statsRes, 'stats'))) return;
      
      console.log('📊 Stats response status:', statsRes.status);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('📊 Stats data:', statsData);
        
        if (statsData.success && statsData.data) {
          setStats({
            totalUsers: statsData.data.totalUsers || 0,
            totalCourses: statsData.data.totalCourses || 0,
            pendingCourses: statsData.data.pendingCourses || 0,
            totalRevenue: statsData.data.totalRevenue || 0,
            activeInstructors: statsData.data.totalInstructors || 0,
            monthlySignups: statsData.data.newUsersThisMonth || 0
          });
          console.log('✅ Stats loaded successfully');
        }
      } else {
        const errorText = await statsRes.text();
        console.error('❌ Stats API error:', statsRes.status, errorText);
      }

      // Load users from /users endpoint
      console.log('📡 [2/6] Fetching users...');
      const usersRes = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check for 401 error
      if (!(await checkResponseAuth(usersRes, 'users'))) return;
      
      console.log('👥 Users response status:', usersRes.status);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('👥 Users data:', usersData);
        
        if (usersData.success && usersData.data) {
          setUsers(usersData.data.users || []);
          console.log('✅ Users loaded:', usersData.data.users?.length || 0, 'users');
        }
      } else {
        const errorText = await usersRes.text();
        console.error('❌ Users API error:', usersRes.status, errorText);
      }

      // Load pending courses
      console.log('📡 [3/6] Fetching pending courses...');
      const pendingRes = await fetch(`${API_BASE_URL}/admin/courses/pending`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check for 401 error
      if (!(await checkResponseAuth(pendingRes, 'pending courses'))) return;
      
      console.log('📚 Pending courses response status:', pendingRes.status);
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        console.log('📚 Pending courses data:', pendingData);
        
        if (pendingData.success && pendingData.data) {
          setPendingCourses(pendingData.data.courses || []);
          console.log('✅ Pending courses loaded:', pendingData.data.courses?.length || 0, 'courses');
        }
      } else {
        const errorText = await pendingRes.text();
        console.error('❌ Pending courses API error:', pendingRes.status, errorText);
      }

      // Load learners
      console.log('📡 [4/6] Fetching learners...');
      const learnersRes = await fetch(`${API_BASE_URL}/admin/learners`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check for 401 error
      if (!(await checkResponseAuth(learnersRes, 'learners'))) return;
      
      console.log('🎓 Learners response status:', learnersRes.status);
      if (learnersRes.ok) {
        const learnersData = await learnersRes.json();
        console.log('🎓 Learners data:', learnersData);
        
        if (learnersData.success && learnersData.data) {
          setLearners(learnersData.data.learners || []);
          console.log('✅ Learners loaded:', learnersData.data.learners?.length || 0, 'learners');
        }
      } else {
        const errorText = await learnersRes.text();
        console.error('❌ Learners API error:', learnersRes.status, errorText);
      }

      // Load instructors
      console.log('📡 [5/6] Fetching instructors...');
      const instructorsRes = await fetch(`${API_BASE_URL}/admin/instructors`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check for 401 error
      if (!(await checkResponseAuth(instructorsRes, 'instructors'))) return;
      
      console.log('👨‍🏫 Instructors response status:', instructorsRes.status);
      if (instructorsRes.ok) {
        const instructorsData = await instructorsRes.json();
        console.log('👨‍🏫 Instructors data:', instructorsData);
        
        if (instructorsData.success && instructorsData.data) {
          setInstructors(instructorsData.data.instructors || []);
          console.log('✅ Instructors loaded:', instructorsData.data.instructors?.length || 0, 'instructors');
        }
      } else {
        const errorText = await instructorsRes.text();
        console.error('❌ Instructors API error:', instructorsRes.status, errorText);
      }

      // Load all courses
      console.log('📡 [6/6] Fetching all courses...');
      const coursesRes = await fetch(`${API_BASE_URL}/admin/courses`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check for 401 error
      if (!(await checkResponseAuth(coursesRes, 'all courses'))) return;
      
      console.log('📖 Courses response status:', coursesRes.status);
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        console.log('📖 Courses data:', coursesData);
        
        if (coursesData.success && coursesData.data) {
          setCourses(coursesData.data.courses || []);
          console.log('✅ All courses loaded:', coursesData.data.courses?.length || 0, 'courses');
        }
      } else {
        const errorText = await coursesRes.text();
        console.error('❌ Courses API error:', coursesRes.status, errorText);
      }

      console.log('✅ All admin data fetch attempts completed');
      console.log('📊 Final state:', {
        users: users.length,
        learners: learners.length,
        instructors: instructors.length,
        courses: courses.length
      });
        
    } catch (error) {
      console.error('❌ Failed to load dashboard:', error);
      console.error('❌ Error details:', error.message, error.stack);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || (userFilter === 'instructors' && user.role_id === 2) || (userFilter === 'learners' && user.role_id === 3) || (userFilter === 'admins' && user.role_id === 1);
    return matchesSearch && matchesFilter;
  });

  const filteredLearners = learners.filter(learner => {
    return (learner.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (learner.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  });

  const filteredInstructors = instructors.filter(instructor => {
    return (instructor.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (instructor.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  });

  const filteredCourses = courses.filter(course => {
    return (course.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  });

  const getRoleName = (roleId) => {
    const roles = { 1: 'Admin', 2: 'Giảng Viên', 3: 'Học Viên' };
    return roles[roleId] || 'Unknown';
  };

  const getRoleColor = (roleId) => {
    const colors = { 1: 'destructive', 2: 'default', 3: 'secondary' };
    return colors[roleId] || 'secondary';
  };

  // ========== INSTRUCTOR REVENUE MANAGEMENT ==========
  
  /**
   * Load instructor revenue data
   */
  const loadInstructorRevenue = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found');
        return;
      }

      console.log('💰 Fetching instructor revenue...');
      const response = await fetch(`${API_BASE_URL}/admin/instructor-revenue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Instructor revenue loaded:', data);
        
        if (data.success && data.data) {
          setInstructorRevenue(data.data.instructors || []);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load instructor revenue:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error loading instructor revenue:', error);
    }
  };

  /**
   * Open pay modal for instructor
   */
  const handlePayInstructor = (instructor) => {
    setPayModal({
      isOpen: true,
      instructor: instructor,
      amount: ''
    });
  };

  /**
   * Confirm payment to instructor
   */
  const confirmPayInstructor = async () => {
    const { instructor, amount } = payModal;
    
    if (!amount || parseFloat(amount) <= 0) {
      showToast('warning', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (parseFloat(amount) > instructor.pending) {
      showToast('warning', `Số tiền không được vượt quá ${instructor.pending.toLocaleString('vi-VN')} VND`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/pay-instructor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: instructor.user_id,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('success', `Đã chi trả ${parseFloat(amount).toLocaleString('vi-VN')} VND cho ${instructor.full_name}`);
        setPayModal({ isOpen: false, instructor: null, amount: '' });
        loadInstructorRevenue();
      } else {
        showToast('error', data.message || 'Không thể chi trả. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ Error paying instructor:', error);
      showToast('error', 'Có lỗi xảy ra khi chi trả');
    }
  };

  // View user details
  const handleViewUser = (user) => {
    setModalState({
      type: 'viewUser',
      isOpen: true,
      data: user
    });
  };

  // Lock user account
  const handleLockUser = async (userId) => {
    setModalState({
      type: 'lock',
      isOpen: true,
      data: { userId }
    });
  };

  const confirmLockUser = async () => {
    const { userId } = modalState.data;
    const token = localStorage.getItem('token');
    try {
      console.log(`🔒 Locking user ${userId}...`);
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/lock`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Lock response:', data);
      
      if (response.ok && data.success) {
        showToast('success', 'Tài khoản đã bị khóa thành công');
        loadDashboardData();
      } else {
        const errorMsg = data.error?.message || 'Không thể khóa tài khoản';
        console.error('Lock failed:', errorMsg);
        showToast('error', errorMsg);
      }
    } catch (error) {
      console.error('Lock user error:', error);
      showToast('error', 'Lỗi khi khóa tài khoản: ' + error.message);
    } finally {
      setModalState({ type: null, isOpen: false, data: null });
    }
  };

  // Unlock user account
  const handleUnlockUser = async (userId) => {
    setModalState({
      type: 'unlock',
      isOpen: true,
      data: { userId }
    });
  };

  const confirmUnlockUser = async () => {
    const { userId } = modalState.data;
    const token = localStorage.getItem('token');
    try {
      console.log(`🔓 Unlocking user ${userId}...`);
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unlock`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Unlock response:', data);
      
      if (response.ok && data.success) {
        showToast('success', 'Tài khoản đã mở khóa thành công');
        loadDashboardData();
      } else {
        const errorMsg = data.error?.message || 'Không thể mở khóa tài khoản';
        console.error('Unlock failed:', errorMsg);
        showToast('error', errorMsg);
      }
    } catch (error) {
      console.error('Unlock user error:', error);
      showToast('error', 'Lỗi khi mở khóa tài khoản: ' + error.message);
    } finally {
      setModalState({ type: null, isOpen: false, data: null });
    }
  };

  // Change user role
  const handleChangeRole = async (userId, newRoleKey) => {
    // Find user to get current role
    const user = users.find(u => u.user_id === userId);
    if (!user) {
      showToast('error', 'Không tìm thấy người dùng');
      return;
    }

    const currentRoleKey = ROLE_KEY_BY_ID[user.role_id];
    
    // Validate: prevent Admin role changes
    if (currentRoleKey === 'admin' || newRoleKey === 'admin') {
      showToast('error', 'Không thể thay đổi vai trò Admin');
      return;
    }

    // Don't show modal if role unchanged
    if (currentRoleKey === newRoleKey) {
      return;
    }

    setModalState({
      type: 'editRole',
      isOpen: true,
      data: { userId, currentRole: currentRoleKey, newRole: newRoleKey }
    });
  };

  /**
   * Try role change with detailed error logging
   * DEBUG MODE: Shows exact backend response to identify correct contract
   */
  const tryChangeRole = async (userId, token, newRoleId, newRoleKey) => {
    // TODO: Update these based on actual backend contract
    const url = `${API_BASE_URL}/admin/users/${userId}/role`;
    const method = 'PUT'; // Change to 'PATCH' if needed
    const body = { role_id: newRoleId }; // Try: {roleId: newRoleId} or {role: newRoleKey} if this fails

    console.log('🔄 Attempting role change:', {
      url,
      method,
      body,
      userId,
      newRoleId,
      newRoleKey
    });

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });

      console.log('📡 Response status:', res.status);

      // Success: 204 No Content
      if (res.status === 204) {
        console.log('✅ Role change success (204 No Content)');
        showToast('success', '✅ Đổi vai trò thành công (204)');
        return { ok: true, data: null };
      }

      // Success: 200 OK
      if (res.ok) {
        let data = null;
        try {
          data = await res.json();
          console.log('✅ Role change success (200 OK):', data);
        } catch {
          console.log('✅ Role change success (200 OK, no JSON body)');
        }
        
        // Check success flag if present
        if (!data || data.success === undefined || data.success === true) {
          showToast('success', '✅ Đổi vai trò thành công');
          return { ok: true, data };
        } else {
          console.error('❌ Backend returned success:false:', data);
          showToast('error', `Backend error: ${data.message || 'Unknown'}`);
          return { ok: false, data };
        }
      }

      // Error: Get detailed error message
      let errorText = '';
      try {
        errorText = await res.text();
        console.error('❌ Backend error response:', errorText);
      } catch {
        errorText = 'No response body';
      }

      // Show detailed error in toast for debugging
      showToast('error', `❌ Role API ${res.status}: ${errorText || 'No body'}`);
      
      console.warn('⚠️ Role change failed:', {
        url,
        method,
        body,
        status: res.status,
        errorText
      });

      return { ok: false, data: null };

    } catch (err) {
      console.error('❌ Role change network error:', err);
      showToast('error', `Network error: ${err.message}`);
      return { ok: false, data: null };
    }
  };

  const confirmChangeRole = async () => {
    const { userId, currentRole, newRole } = modalState.data;
    const token = localStorage.getItem('token');
    
    // Validate role key
    if (!ROLE_ID_BY_KEY[newRole]) {
      showToast('error', 'Vai trò không hợp lệ');
      return;
    }

    // Prevent Admin role changes
    if (currentRole === 'admin' || newRole === 'admin') {
      showToast('error', 'Không thể thay đổi vai trò Admin');
      return;
    }

    const newRoleId = ROLE_ID_BY_KEY[newRole];
    const newRoleLabel = ROLE_LABEL_BY_ID[newRoleId];

    // Optimistic UI update
    const revert = () => loadDashboardData();
    const updateUserRole = (user) => 
      user.user_id === userId ? { ...user, role_id: newRoleId } : user;
    
    setUsers(prev => prev.map(updateUserRole));
    setLearners(prev => prev.map(updateUserRole));
    setInstructors(prev => prev.map(updateUserRole));

    try {
      const result = await tryChangeRole(userId, token, newRoleId, newRole);
      
      if (result.ok) {
        // Success toast already shown in tryChangeRole
        loadDashboardData(); // Reload for consistency
      } else {
        // Error toast already shown in tryChangeRole with details
        revert();
      }
    } catch (error) {
      console.error('❌ Change role fatal error:', error);
      showToast('error', `Lỗi nghiêm trọng: ${error.message}`);
      revert();
    } finally {
      setModalState({ type: null, isOpen: false, data: null });
    }
  };

  // Approve course
  const handleApproveCourse = async (courseId, courseTitle) => {
    setModalState({
      type: 'approve',
      isOpen: true,
      data: { courseId, courseTitle }
    });
  };

  const confirmApproveCourse = async () => {
    const { courseId } = modalState.data;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('success', 'Khóa học đã được duyệt thành công');
        loadDashboardData();
      } else {
        showToast('error', 'Không thể duyệt khóa học');
      }
    } catch (error) {
      console.error('Approve course error:', error);
      showToast('error', 'Lỗi khi duyệt khóa học');
    } finally {
      setModalState({ type: null, isOpen: false, data: null });
    }
  };

  // Reject course
  const handleRejectCourse = async (courseId, courseTitle) => {
    setModalState({
      type: 'reject',
      isOpen: true,
      data: { courseId, courseTitle }
    });
  };

  const confirmRejectCourse = async (reason) => {
    const { courseId } = modalState.data;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        showToast('success', 'Khóa học đã bị từ chối');
        loadDashboardData();
      } else {
        showToast('error', 'Không thể từ chối khóa học');
      }
    } catch (error) {
      console.error('Reject course error:', error);
      showToast('error', 'Lỗi khi từ chối khóa học');
    } finally {
      setModalState({ type: null, isOpen: false, data: null });
    }
  };

  // Logout function - Use modal instead of window.confirm
  const handleLogout = () => {
    setModalState({
      type: 'logout',
      isOpen: true,
      data: null
    });
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setModalState({ type: null, isOpen: false, data: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mb-4" />
          <p className="text-lg font-medium" style={{ color: currentColors.text }}>Dang tai bang dieu khien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-panel-theme-${theme} min-h-screen transition-colors duration-300`} style={{ 
      backgroundColor: currentColors.background,
      color: currentColors.text,
      isolation: 'isolate',
      backgroundImage: 'none',
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Global Toast Notification - Fixed at Viewport Top via Portal */}
      <AlertNotification
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, type: '', message: '' })}
      />
      <style>{`
        /* ===================================================================
           SIDEBAR & TOP BAR ENHANCEMENTS - Better Visibility in Dark Mode
           =================================================================== */
        
        /* Sidebar styling - Better contrast in dark mode */
        .admin-panel-theme-dark .sidebar-menu-item {
          background-color: transparent;
          color: #e5e7eb;
          transition: all 0.2s ease;
        }

        .admin-panel-theme-dark .sidebar-menu-item:hover {
          background-color: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
        }

        .admin-panel-theme-dark .sidebar-menu-item.active {
          background-color: rgba(129, 140, 248, 0.15);
          color: #818cf8;
          font-weight: 600;
        }

        /* Section headers in sidebar */
        .admin-panel-theme-dark .sidebar-section-header {
          color: #9ca3af;
          font-weight: 700;
        }

        .admin-panel-theme-dark .sidebar-section-header:hover {
          color: #d1d5db;
        }

        /* Top bar in dark mode - Better visibility */
        .admin-panel-theme-dark .top-bar-gradient {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
          border-bottom: 2px solid #818cf8;
        }

        /* Sidebar separator line - Better visibility */
        .sidebar-separator {
          position: fixed;
          left: 264px; /* w-64 (256px) + 8px spacing */
          top: 80px; /* Match top bar height */
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, 
            transparent 0%, 
            ${theme === 'dark' ? '#475569' : '#cbd5e1'} 5%, 
            ${theme === 'dark' ? '#475569' : '#cbd5e1'} 95%, 
            transparent 100%);
          pointer-events: none;
          z-index: 31;
          transition: opacity 0.3s ease;
          box-shadow: ${theme === 'dark' ? '1px 0 3px rgba(0, 0, 0, 0.3)' : '1px 0 2px rgba(0, 0, 0, 0.1)'};
        }

        @media (max-width: 1024px) {
          .sidebar-separator {
            opacity: 0;
          }
        }

        /* Main content spacing adjustment */
        .main-content-wrapper {
          margin-left: 0;
        }

        @media (min-width: 1024px) {
          .main-content-wrapper {
            margin-left: 16px; /* Extra spacing from separator */
          }
        }

        /* ===================================================================
           MODERN ADMIN DASHBOARD CSS - Enhanced Design System
           =================================================================== */
        
        /* Dark mode styles for AdminPanel */
        .admin-panel-theme-dark {
          color: ${currentColors.text};
        }
        
        .admin-panel-theme-light {
          color: ${currentColors.text};
        }

        /* ===================================================================
           CARD ENHANCEMENTS - Modern Shadow & Hover Effects
           =================================================================== */
        .admin-card {
          background: ${currentColors.card};
          border-radius: 16px;
          border: 1px solid ${currentColors.border};
          box-shadow: 0 1px 3px ${currentColors.shadow};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-card:hover {
          box-shadow: 0 10px 25px ${currentColors.shadowHover};
          transform: translateY(-2px);
          border-color: ${currentColors.primary}40;
        }

        /* Stat Cards with Gradient Overlays */
        .stat-card {
          position: relative;
          overflow: hidden;
          background: ${currentColors.card};
          border-radius: 16px;
          border: 1px solid ${currentColors.border};
          box-shadow: 0 2px 8px ${currentColors.shadow};
          transition: all 0.3s ease;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, ${currentColors.primary}, ${currentColors.accent});
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .stat-card:hover::before {
          transform: scaleX(1);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px ${currentColors.shadowHover};
          border-color: ${currentColors.primary}60;
        }

        /* ===================================================================
           TABLE STYLING - Modern Data Tables
           =================================================================== */
        .admin-panel-theme-dark .table-header,
        .admin-panel-theme-light .table-header {
          background-color: ${currentColors.card} !important;
          color: ${currentColors.text} !important;
          border-color: ${currentColors.border} !important;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        
        .admin-panel-theme-dark .table-row,
        .admin-panel-theme-light .table-row {
          border-color: ${currentColors.border} !important;
          background-color: transparent !important;
          transition: all 0.2s ease;
        }
        
        .admin-panel-theme-dark .table-row:hover,
        .admin-panel-theme-light .table-row:hover {
          background-color: ${currentColors.primary}10 !important;
          transform: scale(1.01);
        }
        
        .admin-panel-theme-dark .table-cell,
        .admin-panel-theme-light .table-cell {
          color: ${currentColors.text} !important;
          border-color: ${currentColors.border} !important;
          padding: 1rem !important;
        }

        /* ===================================================================
           TYPOGRAPHY ENHANCEMENTS
           =================================================================== */
        .section-title {
          font-size: 1.875rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          font-size: 0.875rem;
          font-weight: 500;
          color: ${currentColors.textSecondary};
          letter-spacing: 0.025em;
        }

        .admin-panel-theme-dark .section-header,
        .admin-panel-theme-light .section-header {
          color: ${currentColors.textSecondary} !important;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }
        
        .admin-panel-theme-dark .text-gray-900,
        .admin-panel-theme-dark .text-gray-700,
        .admin-panel-theme-dark .text-gray-600,
        .admin-panel-theme-light .text-gray-900,
        .admin-panel-theme-light .text-gray-700,
        .admin-panel-theme-light .text-gray-600 {
          color: ${currentColors.text} !important;
        }
        
        .admin-panel-theme-dark .text-gray-500,
        .admin-panel-theme-light .text-gray-500 {
          color: ${currentColors.textSecondary} !important;
        }

        /* ===================================================================
           MODAL PORTAL TEXT FIX - Ensure visibility in dark mode
           Modal uses Portal so theme class must be on portal wrapper
           =================================================================== */
        /* Modal surface (header, title, buttons) - Theme aware colors */
        .modal-dark .modal-surface,
        .modal-dark .modal-surface * {
          color: #f9fafb !important;
        }
        
        .modal-light .modal-surface,
        .modal-light .modal-surface * {
          color: #1f2937 !important;
        }
        
        /* Modal dark theme - White text */
        .modal-dark .modal-content-wrapper,
        .modal-dark .modal-content-wrapper * {
          color: #f9fafb !important;
        }
        
        .modal-dark .modal-content-wrapper strong,
        .modal-dark .modal-content-wrapper b {
          color: #ffffff !important;
          font-weight: 700;
        }
        
        .modal-dark .modal-content-wrapper .badge {
          color: #ffffff !important;
          font-weight: 600;
        }
        
        /* Modal light theme - Dark text */
        .modal-light .modal-content-wrapper,
        .modal-light .modal-content-wrapper * {
          color: #1f2937 !important;
        }
        
        .modal-light .modal-content-wrapper strong,
        .modal-light .modal-content-wrapper b {
          color: #000000 !important;
          font-weight: 700;
        }
        
        .modal-light .modal-content-wrapper .badge {
          color: #000000 !important;
          font-weight: 600;
        }

        /* ===================================================================
           BUTTON & BADGE ENHANCEMENTS
           =================================================================== */
        .action-button {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${currentColors.shadowHover};
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.025em;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        /* ===================================================================
           BADGE CONTRAST FIXES - High visibility in Dark theme
           =================================================================== */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.75rem;
          line-height: 1.5;
          border: 1px solid transparent;
        }

        /* Light theme: dark text, Dark theme: white text */
        .admin-panel-theme-light .badge { 
          color: #111827 !important; 
        }
        .admin-panel-theme-dark .badge { 
          color: #ffffff !important; 
        }

        /* Role variants - Light theme */
        .badge--role-learner {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.35);
        }
        .badge--role-instructor {
          background: rgba(168, 85, 247, 0.18);
          border-color: rgba(168, 85, 247, 0.40);
        }
        .badge--role-admin {
          background: rgba(239, 68, 68, 0.18);
          border-color: rgba(239, 68, 68, 0.40);
        }

        /* Status variants - Light theme */
        .badge--status-active {
          background: rgba(16, 185, 129, 0.18);
          border-color: rgba(16, 185, 129, 0.40);
        }
        .badge--status-inactive {
          background: rgba(107, 114, 128, 0.20);
          border-color: rgba(107, 114, 128, 0.45);
        }

        /* Dark theme: Higher contrast (darker backgrounds) */
        .admin-panel-theme-dark .badge--role-learner {
          background: rgba(59, 130, 246, 0.28);
          border-color: rgba(59, 130, 246, 0.55);
        }
        .admin-panel-theme-dark .badge--role-instructor {
          background: rgba(168, 85, 247, 0.32);
          border-color: rgba(168, 85, 247, 0.60);
        }
        .admin-panel-theme-dark .badge--role-admin {
          background: rgba(239, 68, 68, 0.30);
          border-color: rgba(239, 68, 68, 0.58);
        }
        .admin-panel-theme-dark .badge--status-active {
          background: rgba(16, 185, 129, 0.30);
          border-color: rgba(16, 185, 129, 0.58);
        }
        .admin-panel-theme-dark .badge--status-inactive {
          background: rgba(156, 163, 175, 0.26);
          border-color: rgba(156, 163, 175, 0.55);
        }
        
        .admin-panel-theme-dark .bg-gray-50,
        .admin-panel-theme-dark .bg-gray-100,
        .admin-panel-theme-light .bg-gray-50,
        .admin-panel-theme-light .bg-gray-100 {
          background-color: transparent !important;
        }
        
        .admin-panel-theme-dark .border-gray-200,
        .admin-panel-theme-dark .border-gray-300,
        .admin-panel-theme-dark .divide-gray-200 > *,
        .admin-panel-theme-light .border-gray-200,
        .admin-panel-theme-light .border-gray-300,
        .admin-panel-theme-light .divide-gray-200 > * {
          border-color: ${currentColors.border} !important;
        }
        
        .admin-panel-theme-dark .hover\\:bg-gray-50:hover,
        .admin-panel-theme-dark .hover\\:bg-gray-100:hover,
        .admin-panel-theme-light .hover\\:bg-gray-50:hover,
        .admin-panel-theme-light .hover\\:bg-gray-100:hover {
          background-color: ${currentColors.cardHover} !important;
        }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${currentColors.background};
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${currentColors.border};
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${currentColors.primary};
        }

        /* Ensure proper box-sizing */
        * {
          box-sizing: border-box;
        }

        /* Prevent SVG artifacts */
        svg {
          shape-rendering: geometricPrecision;
        }

        /* Fix gradient rendering artifacts in dark mode */
        .bg-gradient-to-br,
        .bg-gradient-to-r,
        .bg-gradient-to-l,
        .bg-gradient-to-t,
        .bg-gradient-to-b {
          -webkit-backface-visibility: hidden;
          -moz-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-transform: translateZ(0);
          -moz-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-font-smoothing: subpixel-antialiased;
        }

        /* Isolate gradient backgrounds to prevent bleeding */
        .admin-panel-theme-dark .bg-gradient-to-br,
        .admin-panel-theme-dark .bg-gradient-to-r {
          isolation: isolate;
          will-change: transform;
        }

        /* CHART.JS: Tắt hoàn toàn mọi grid lines */
        canvas {
          background: transparent !important;
          background-image: none !important;
        }

        /* Ẩn bất kỳ SVG grid nào từ Chart.js */
        canvas + svg,
        canvas ~ svg {
          display: none !important;
        }

        /* Loại bỏ background patterns */
        .admin-panel-theme-dark canvas,
        .admin-panel-theme-light canvas {
          background-image: none !important;
          background-color: transparent !important;
        }

        /* LAYER 6: FORCE DISABLE ALL GRID-LIKE PATTERNS */
        * {
          background-image: none !important;
        }

        /* LAYER 7: ANTI-ALIASING FIX - Ngăn subpixel rendering artifacts */
        .admin-panel-theme-dark,
        .admin-panel-theme-light,
        .admin-panel-theme-dark *,
        .admin-panel-theme-light * {
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
          -webkit-transform: translateZ(0) !important;
          transform: translateZ(0) !important;
          -webkit-font-smoothing: subpixel-antialiased !important;
          image-rendering: -webkit-optimize-contrast !important;
          image-rendering: crisp-edges !important;
        }

        /* OVERRIDE: Prevent global transform from breaking modal colors */
        .modal-content-wrapper,
        .modal-content-wrapper * {
          transform: none !important;
          -webkit-transform: none !important;
          backface-visibility: visible !important;
          -webkit-backface-visibility: visible !important;
        }

        /* LAYER 8: FORCE CLEAN GRADIENTS - No banding/diagonal artifacts */
        .admin-panel-theme-dark .bg-gradient-to-br,
        .admin-panel-theme-dark .bg-gradient-to-r,
        .admin-panel-theme-dark .bg-gradient-to-l,
        .admin-panel-theme-dark .bg-gradient-to-t,
        .admin-panel-theme-dark .bg-gradient-to-b {
          background-image: linear-gradient(transparent, transparent) !important;
        }

        /* TẮT TẤT CẢ BORDERS TRONG TABLES - Nguyên nhân chính của grid-lines */
        .admin-panel-theme-dark table,
        .admin-panel-theme-light table {
          border: none !important;
        }

        .admin-panel-theme-dark th.border,
        .admin-panel-theme-light th.border,
        .admin-panel-theme-dark td.border,
        .admin-panel-theme-light td.border {
          border: none !important;
        }

        .admin-panel-theme-dark .divide-y > *,
        .admin-panel-theme-light .divide-y > * {
          border-top: none !important;
        }

        /* Loại bỏ border-b trong TabsContent */
        .admin-panel-theme-dark .border-b-2,
        .admin-panel-theme-light .border-b-2 {
          border-bottom-width: 1px !important;
        }
      `}</style>
      {/* Header - Enhanced with better visibility */}
      <div 
        className="shadow-2xl fixed top-0 left-0 right-0 z-40" 
        style={{ 
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' // Dark mode: solid dark gradient
            : `linear-gradient(to right, ${currentColors.primary}, ${currentColors.accent})`, // Light mode: colorful gradient
          borderBottom: theme === 'dark' ? `2px solid ${currentColors.primary}` : 'none',
          height: '80px', // Increased from 72px for better spacing
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="px-6 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant="ghost"
                className="lg:hidden hover:bg-white/20"
                style={{ color: '#ffffff' }}
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <GraduationCap className="w-8 h-8" style={{ color: currentColors.primary }} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: currentColors.text }}>Mini-Coursera</h1>
                <p className="mt-1 text-sm" style={{ color: currentColors.textSecondary }}>Bảng điều khiển quản trị</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden md:flex bg-white/20 border-none px-4 py-2" style={{ color: currentColors.text }}>Admin Access</Badge>
              <Button 
                onClick={toggleTheme} 
                variant="outline" 
                className="bg-white/10 border-white/30 hover:bg-white/20 hover:opacity-70 transition-opacity"
                style={{ color: currentColors.text }}
                title={theme === 'light' ? 'Chuyển sang Dark Mode' : 'Chuyển sang Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              <Button onClick={loadDashboardData} variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 hover:opacity-70 transition-opacity" style={{ color: currentColors.text }}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={handleLogout} variant="outline" className="bg-red-500/80 border-red-400 hover:bg-red-600 hover:opacity-70 transition-opacity" style={{ color: currentColors.danger }}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Separator Line - Visual divider */}
      <div className="sidebar-separator hidden lg:block"></div>

      {/* Sidebar - Enhanced with better contrast */}
      <div 
        className={`fixed left-0 bottom-0 w-64 shadow-2xl z-30 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-y-auto`}
        style={{ 
          top: '80px', // Match top bar height
          backgroundColor: theme === 'dark' ? '#1e293b' : currentColors.card, // Dark mode: Gray-800, Light mode: white
          borderRight: 'none', // Remove border, using separator instead
          boxShadow: theme === 'dark' ? '2px 0 16px rgba(0, 0, 0, 0.4)' : '2px 0 8px rgba(0, 0, 0, 0.1)' // Softer shadow
        }}
      >
        <div className="flex flex-col h-full" style={{ paddingRight: '8px' }}> {/* Add right padding */}
          <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar"> {/* Increased py from 4 to 6 */}
            <div className="space-y-2 px-4"> {/* Increased px from 3 to 4 */}
              
              {/* Tổng quan */}
              <button
                onClick={() => handleMenuClick(menuItems.find(m => m.id === 'overview'))}
                className={`sidebar-menu-item ${activeMenu === 'overview' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200`}
                style={{
                  backgroundColor: activeMenu === 'overview' ? currentColors.primary + '20' : 'transparent',
                  color: activeMenu === 'overview' ? currentColors.primary : currentColors.text,
                  fontWeight: activeMenu === 'overview' ? '600' : '500'
                }}
              >
                <div 
                  className={`p-2 rounded-lg transition-all`}
                  style={{
                    backgroundColor: activeMenu === 'overview' 
                      ? (theme === 'dark' ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255, 255, 255, 0.5)')
                      : 'transparent'
                  }}
                >
                  <Home className="w-5 h-5" />
                </div>
                <span className="font-medium">Tổng quan</span>
              </button>

              {/* Divider */}
              <div className="h-px my-3" style={{ backgroundColor: currentColors.border }} />

              {/* Quản lý người dùng - Section */}
              <div className="pt-1">
                <button
                  onClick={() => toggleSection('users')}
                  className="sidebar-section-header w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  style={{ 
                    color: currentColors.textSecondary,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Users className="w-4 h-4" />
                  <span className="flex-1 text-left">Người dùng</span>
                  {expandedSections.users ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.users && (
                  <div className="mt-2 space-y-1 ml-2">
                    <Link
                      to="/admin/users"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item ${activeMenu === 'all-users' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'all-users' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'all-users' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'all-users' ? '600' : '500'
                      }}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm">Tất cả người dùng</span>
                    </Link>

                    <Link
                      to="/admin/learners"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item ${activeMenu === 'learners' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'learners' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'learners' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'learners' ? '600' : '500'
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">Học viên</span>
                    </Link>

                    <Link
                      to="/admin/instructors-list"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item ${activeMenu === 'instructors' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'instructors' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'instructors' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'instructors' ? '600' : '500'
                      }}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm">Giảng viên</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Quản lý khóa học - Section */}
              <div className="pt-2">
                <button
                  onClick={() => toggleSection('courses')}
                  className="sidebar-section-header w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  style={{ 
                    color: currentColors.textSecondary,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="flex-1 text-left">Quản lý khóa học</span>
                  {expandedSections.courses ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.courses && (
                  <div className="mt-1 space-y-1 ml-4">
                    <Link
                      to="/admin/courses"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item ${activeMenu === 'all-courses' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'all-courses' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'all-courses' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'all-courses' ? '600' : '500'
                      }}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="text-sm">Tất cả khóa học</span>
                    </Link>

                    <button
                      onClick={() => handleMenuClick(menuItems.find(m => m.id === 'pending'))}
                      className={`sidebar-menu-item ${activeMenu === 'pending' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'pending' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'pending' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'pending' ? '600' : '500'
                      }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Khóa học chờ duyệt</span>
                      {stats.pendingCourses > 0 && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5">{stats.pendingCourses}</Badge>
                      )}
                    </button>

                    <Link
                      to="/admin/categories"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item ${activeMenu === 'categories' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'categories' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'categories' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'categories' ? '600' : '500'
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Danh mục khóa học</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Doanh thu & Thống kê - Section */}
              <div className="pt-2">
                <button
                  onClick={() => toggleSection('revenue')}
                  className="sidebar-section-header w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  style={{ 
                    color: currentColors.textSecondary,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="flex-1 text-left">Doanh thu & Thống kê</span>
                  {expandedSections.revenue ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.revenue && (
                  <div className="mt-1 space-y-1 ml-4">
                    <button
                      onClick={() => { setActiveMenu('revenue'); setSidebarOpen(false); }}
                      className={`sidebar-menu-item ${activeMenu === 'revenue' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'revenue' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'revenue' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'revenue' ? '600' : '500'
                      }}
                    >
                      <PieChart className="w-4 h-4" />
                      <span className="text-sm">Biểu đồ doanh thu</span>
                    </button>

                    <Link
                      to="/admin/learning-stats"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item ${activeMenu === 'statistics' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'statistics' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'statistics' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'statistics' ? '600' : '500'
                      }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Thống kê học tập</span>
                    </Link>

                    <Link
                      to="/admin/instructor-reports"
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-menu-item ${activeMenu === 'instructor-reports' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'instructor-reports' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'instructor-reports' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'instructor-reports' ? '600' : '500'
                      }}
                    >
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Báo cáo giảng viên</span>
                    </Link>

                    {/* NEW: Instructor Requests */}
                    <button
                      onClick={() => handleMenuClick(menuItems.find(m => m.id === 'instructor-requests'))}
                      className={`sidebar-menu-item ${activeMenu === 'instructor-requests' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'instructor-requests' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'instructor-requests' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'instructor-requests' ? '600' : '500'
                      }}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm">Duyệt giảng viên</span>
                    </button>

                    {/* NEW: Withdrawal Requests */}
                    <button
                      onClick={() => handleMenuClick(menuItems.find(m => m.id === 'withdrawal-requests'))}
                      className={`sidebar-menu-item ${activeMenu === 'withdrawal-requests' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'withdrawal-requests' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'withdrawal-requests' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'withdrawal-requests' ? '600' : '500'
                      }}
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Yêu cầu rút tiền</span>
                    </button>

                    {/* NEW: Payouts */}
                    <button
                      onClick={() => handleMenuClick(menuItems.find(m => m.id === 'payouts'))}
                      className={`sidebar-menu-item ${activeMenu === 'payouts' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200`}
                      style={{
                        backgroundColor: activeMenu === 'payouts' ? currentColors.primary + '20' : 'transparent',
                        color: activeMenu === 'payouts' ? currentColors.primary : currentColors.text,
                        fontWeight: activeMenu === 'payouts' ? '600' : '500'
                      }}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">Chi trả doanh thu</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Cài đặt hệ thống */}
              <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${currentColors.border}` }}>
                <button
                  onClick={() => { navigate('/admin/settings'); setSidebarOpen(false); }}
                  className={`sidebar-menu-item ${activeMenu === 'settings' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200`}
                  style={{
                    backgroundColor: activeMenu === 'settings' ? currentColors.primary + '20' : 'transparent',
                    color: activeMenu === 'settings' ? currentColors.primary : currentColors.text,
                    fontWeight: activeMenu === 'settings' ? '600' : '500'
                  }}
                >
                  <Settings className="w-5 h-5" />
                  <span>Cài đặt</span>
                </button>

                <button
                  onClick={() => { navigate('/admin/profile'); setSidebarOpen(false); }}
                  className={`sidebar-menu-item ${activeMenu === 'profile' ? 'active' : ''} w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200`}
                  style={{
                    backgroundColor: activeMenu === 'profile' ? currentColors.primary + '20' : 'transparent',
                    color: activeMenu === 'profile' ? currentColors.primary : currentColors.text,
                    fontWeight: activeMenu === 'profile' ? '600' : '500'
                  }}
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Hồ sơ</span>
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mt-2 hover:bg-red-50"
                style={{ color: '#ef4444' }}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay cho mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{ top: '80px' }} // Match top bar height
        />
      )}

      {/* Main Content */}
      <div className="main-content-wrapper min-h-screen transition-all duration-300 lg:pl-64" style={{ paddingTop: '80px', overflow: 'hidden' }}>
        {/* Conditional Rendering: Show Overview ONLY at /admin, else show child route via Outlet */}
        {location.pathname === '/admin' ? (
          <div className="px-8 py-8 space-y-8 w-full"> {/* Increased px from 6 to 8, py from 8 to 8, space-y from 6 to 8 */}
            {/* Stats Cards - 3 Large KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Users Card */}
            <Card 
              className="shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] border-2" 
              style={{ 
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                  : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(191, 219, 254, 0.8)',
                boxShadow: theme === 'dark' 
                  ? '0 20px 50px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <CardContent className="p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ 
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(59,130,246,0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Users className="w-6 h-6" style={{ color: theme === 'dark' ? '#ffffff' : '#1e3a8a' }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-90" style={{ color: theme === 'dark' ? '#ffffff' : '#1e40af' }}>Tổng người dùng</p>
                    <p className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#1e3a8a' }}>{stats.totalUsers}</p>
                    <p className="text-xs opacity-75 mt-1" style={{ color: theme === 'dark' ? '#ffffff' : '#3b82f6' }}>+{stats.monthlySignups} tháng này</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Courses Card */}
            <Card 
              className="shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] border-2" 
              style={{ 
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(167, 243, 208, 0.8)',
                boxShadow: theme === 'dark' 
                  ? '0 20px 50px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <CardContent className="p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ 
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <BookOpen className="w-6 h-6" style={{ color: theme === 'dark' ? '#ffffff' : '#065f46' }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-90" style={{ color: theme === 'dark' ? '#ffffff' : '#047857' }}>Tổng khóa học</p>
                    <p className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#065f46' }}>{stats.totalCourses}</p>
                    <p className="text-xs opacity-75 mt-1 flex items-center gap-1" style={{ color: theme === 'dark' ? '#ffffff' : '#10b981' }}>
                      <AlertCircle className="w-3 h-3" style={{ color: theme === 'dark' ? '#ffffff' : '#10b981' }} />
                      {stats.pendingCourses} chờ duyệt
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Card */}
            <Card 
              className="shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] border-2" 
              style={{ 
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                  : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(253, 230, 138, 0.8)',
                boxShadow: theme === 'dark' 
                  ? '0 20px 50px rgba(245, 158, 11, 0.4), 0 0 20px rgba(245, 158, 11, 0.2)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              <CardContent className="p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ 
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(245,158,11,0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <DollarSign className="w-6 h-6" style={{ color: theme === 'dark' ? '#ffffff' : '#78350f' }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-90" style={{ color: theme === 'dark' ? '#ffffff' : '#92400e' }}>Doanh thu</p>
                    <p className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#78350f' }}>{(stats.totalRevenue / 1000000).toFixed(1)}M VND</p>
                    <p className="text-xs opacity-75 mt-1" style={{ color: theme === 'dark' ? '#ffffff' : '#f59e0b' }}>Từ khóa học có phí</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPI Cards Section - Additional Metrics (No Duplicates) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <KpiCard 
              title="Giảng viên đang hoạt động" 
              value={stats.activeInstructors} 
              sub="Giảng viên tích cực"
              gradientColors={['#8b5cf6', '#7c3aed']}
              icon={GraduationCap}
            />
            <KpiCard 
              title="Học viên đang hoạt động" 
              value={stats.totalUsers - stats.activeInstructors} 
              sub="Người dùng với vai trò học viên"
              gradientColors={['#ec4899', '#db2777']}
              icon={UserCheck}
            />
            <KpiCard 
              title="Khóa học chờ duyệt" 
              value={stats.pendingCourses} 
              sub="Cần xem xét và phê duyệt"
              gradientColors={['#f59e0b', '#d97706']}
              icon={Clock}
            />
            <KpiCard 
              title="Tăng trưởng tháng này" 
              value={`+${stats.monthlySignups}`}
              sub="Người dùng mới đăng ký"
              gradientColors={['#10b981', '#059669']}
              icon={TrendingUp}
            />
            <KpiCard 
              title="Tỉ lệ Giảng viên/Học viên" 
              value={`1:${Math.round((stats.totalUsers - stats.activeInstructors) / stats.activeInstructors)}`}
              sub={`${stats.activeInstructors} GV, ${stats.totalUsers - stats.activeInstructors} HV`}
              gradientColors={['#3b82f6', '#2563eb']}
              icon={BarChart3}
            />
            <KpiCard 
              title="Khóa học đã duyệt" 
              value={stats.totalCourses - stats.pendingCourses}
              sub={`${Math.round(((stats.totalCourses - stats.pendingCourses) / stats.totalCourses) * 100)}% tổng khóa học`}
              gradientColors={['#06b6d4', '#0891b2']}
              icon={CheckCircle}
            />
          </div>

          {/* Charts Section - Enhanced Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card 
              className="admin-card overflow-hidden" 
              style={{ 
                backgroundColor: currentColors.card,
                border: `1px solid ${currentColors.border}`,
                borderRadius: '16px'
              }}
            >
              <CardContent className="p-0">
                {/* Chart Header with Gradient */}
                <div 
                  className="px-6 py-4" 
                  style={{ 
                    background: `linear-gradient(135deg, ${currentColors.primary}15 0%, ${currentColors.accent}15 100%)`,
                    borderBottom: `1px solid ${currentColors.border}`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="section-title text-lg" style={{ color: currentColors.text, marginBottom: '0.25rem' }}>
                        Doanh thu theo tháng
                      </h3>
                      <p className="section-subtitle" style={{ color: currentColors.textSecondary }}>
                        12 tháng gần đây
                      </p>
                    </div>
                    <div 
                      className="p-3 rounded-xl" 
                      style={{ 
                        background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.accent})`,
                        boxShadow: `0 4px 12px ${currentColors.primary}40`
                      }}
                    >
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Chart Body */}
                <div className="p-6">
                  <div style={{ height: '320px' }}>
                    <Line
                      data={{
                        labels: revenueData.map(d => d.month),
                        datasets: [{
                          label: 'Doanh thu (VNĐ)',
                          data: revenueData.map(d => d.revenue),
                          borderColor: currentColors.primary,
                          backgroundColor: currentColors.primary + '20',
                          borderWidth: 3,
                          tension: 0.4,
                          fill: true,
                          pointRadius: 5,
                          pointHoverRadius: 8,
                          pointBackgroundColor: currentColors.primary,
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            backgroundColor: currentColors.card,
                            titleColor: currentColors.text,
                            bodyColor: currentColors.text,
                            borderColor: currentColors.border,
                            borderWidth: 1,
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                              label: (context) => `${context.parsed.y.toLocaleString('vi-VN')} VNĐ`
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: { 
                              display: false,
                              drawBorder: false,
                              drawOnChartArea: false,
                              drawTicks: false,
                              lineWidth: 0
                            },
                            border: { display: false },
                            ticks: { color: currentColors.textSecondary }
                          },
                          y: {
                            grid: { 
                              display: false,
                              drawBorder: false,
                              drawOnChartArea: false,
                              drawTicks: false,
                              lineWidth: 0
                            },
                            border: { display: false },
                            ticks: { 
                              color: currentColors.textSecondary,
                              callback: (value) => `${(value / 1000000).toFixed(1)}M`
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Distribution Pie Chart */}
            <Card 
              className="admin-card overflow-hidden" 
              style={{ 
                backgroundColor: currentColors.card,
                border: `1px solid ${currentColors.border}`,
                borderRadius: '16px'
              }}
            >
              <CardContent className="p-0">
                {/* Chart Header with Gradient */}
                <div 
                  className="px-6 py-4" 
                  style={{ 
                    background: `linear-gradient(135deg, ${currentColors.accent}15 0%, ${currentColors.secondary}15 100%)`,
                    borderBottom: `1px solid ${currentColors.border}`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="section-title text-lg" style={{ color: currentColors.text, marginBottom: '0.25rem' }}>
                        Phân bố người dùng
                      </h3>
                      <p className="section-subtitle" style={{ color: currentColors.textSecondary }}>
                        Theo vai trò
                      </p>
                    </div>
                    <div 
                      className="p-3 rounded-xl" 
                      style={{ 
                        background: `linear-gradient(135deg, ${currentColors.accent}, ${currentColors.secondary})`,
                        boxShadow: `0 4px 12px ${currentColors.accent}40`
                      }}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Chart Body */}
                <div className="p-6">
                  <div style={{ height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Pie
                      data={{
                        labels: userDistribution.map(d => d.name),
                        datasets: [{
                          data: userDistribution.map(d => d.value),
                          backgroundColor: userDistribution.map(d => d.color),
                          borderColor: currentColors.card,
                          borderWidth: 3,
                          hoverOffset: 10
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: currentColors.text,
                              padding: 15,
                              font: { size: 13, weight: '600' }
                            }
                          },
                          tooltip: {
                            backgroundColor: currentColors.card,
                            titleColor: currentColors.text,
                            bodyColor: currentColors.text,
                            borderColor: currentColors.border,
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                              label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percent}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Stats Bar Chart */}
            <Card 
              className="admin-card overflow-hidden lg:col-span-2" 
              style={{ 
                backgroundColor: currentColors.card,
                border: `1px solid ${currentColors.border}`,
                borderRadius: '16px'
              }}
            >
              <CardContent className="p-0">
                {/* Chart Header with Gradient */}
                <div 
                  className="px-6 py-4" 
                  style={{ 
                    background: `linear-gradient(135deg, ${currentColors.success}15 0%, ${currentColors.primary}15 100%)`,
                    borderBottom: `1px solid ${currentColors.border}`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="section-title text-lg" style={{ color: currentColors.text, marginBottom: '0.25rem' }}>
                        Thống kê khóa học
                      </h3>
                      <p className="section-subtitle" style={{ color: currentColors.textSecondary }}>
                        Trạng thái phê duyệt
                      </p>
                    </div>
                    <div 
                      className="p-3 rounded-xl" 
                      style={{ 
                        background: `linear-gradient(135deg, ${currentColors.success}, ${currentColors.primary})`,
                        boxShadow: `0 4px 12px ${currentColors.success}40`
                      }}
                    >
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Chart Body */}
                <div className="p-6">
                  <div style={{ height: '320px' }}>
                    <Bar
                      data={{
                        labels: courseStats.map(d => d.status),
                        datasets: [{
                          label: 'Số lượng khóa học',
                          data: courseStats.map(d => d.count),
                          backgroundColor: courseStats.map(d => d.color),
                          borderColor: courseStats.map(d => d.color),
                          borderWidth: 2,
                          borderRadius: 8,
                          hoverBackgroundColor: courseStats.map(d => d.color + 'dd')
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            backgroundColor: currentColors.card,
                            titleColor: currentColors.text,
                            bodyColor: currentColors.text,
                            borderColor: currentColors.border,
                            borderWidth: 1,
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                              label: (context) => `${context.parsed.y} khóa học`
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: { 
                              display: false,
                              drawBorder: false,
                              drawOnChartArea: false,
                              drawTicks: false,
                              lineWidth: 0
                            },
                            border: { display: false },
                            ticks: { color: currentColors.textSecondary }
                          },
                          y: {
                            grid: { 
                              display: false,
                              drawBorder: false,
                              drawOnChartArea: false,
                              drawTicks: false,
                              lineWidth: 0
                            },
                            border: { display: false },
                            ticks: { 
                              color: currentColors.textSecondary,
                              stepSize: 1
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card 
            className="shadow-lg" 
            style={{ 
              backgroundColor: currentColors.card,
              border: `1px solid ${currentColors.border}`
            }}
          >
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div style={{ borderBottom: `1px solid ${currentColors.border}`, overflowX: 'auto' }}>
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent" style={{ flexWrap: 'nowrap' }}>
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent px-4 py-4 transition-colors whitespace-nowrap"
                    style={{
                      borderBottomColor: activeTab === 'overview' ? currentColors.primary : 'transparent',
                      backgroundColor: activeTab === 'overview' ? currentColors.primary + '15' : 'transparent',
                      color: activeTab === 'overview' ? currentColors.primary : currentColors.textSecondary
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Duyệt khóa học
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="rounded-none border-b-2 border-transparent px-4 py-4 transition-colors whitespace-nowrap"
                    style={{
                      borderBottomColor: activeTab === 'users' ? currentColors.primary : 'transparent',
                      backgroundColor: activeTab === 'users' ? currentColors.primary + '15' : 'transparent',
                      color: activeTab === 'users' ? currentColors.primary : currentColors.textSecondary
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Quản lý người dùng
                  </TabsTrigger>
                  <TabsTrigger 
                    value="learners" 
                    className="rounded-none border-b-2 border-transparent px-4 py-4 transition-colors whitespace-nowrap"
                    style={{
                      borderBottomColor: activeTab === 'learners' ? currentColors.primary : 'transparent',
                      backgroundColor: activeTab === 'learners' ? currentColors.primary + '15' : 'transparent',
                      color: activeTab === 'learners' ? currentColors.primary : currentColors.textSecondary
                    }}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Danh sách học viên
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instructors" 
                    className="rounded-none border-b-2 border-transparent px-4 py-4 transition-colors whitespace-nowrap"
                    style={{
                      borderBottomColor: activeTab === 'instructors' ? currentColors.primary : 'transparent',
                      backgroundColor: activeTab === 'instructors' ? currentColors.primary + '15' : 'transparent',
                      color: activeTab === 'instructors' ? currentColors.primary : currentColors.textSecondary
                    }}
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Danh sách giảng viên
                  </TabsTrigger>
                  <TabsTrigger 
                    value="courses" 
                    className="rounded-none border-b-2 border-transparent px-4 py-4 transition-colors whitespace-nowrap"
                    style={{
                      borderBottomColor: activeTab === 'courses' ? currentColors.primary : 'transparent',
                      backgroundColor: activeTab === 'courses' ? currentColors.primary + '15' : 'transparent',
                      color: activeTab === 'courses' ? currentColors.primary : currentColors.textSecondary
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Tất cả khóa học
                  </TabsTrigger>
                  <TabsTrigger 
                    value="revenue" 
                    className="rounded-none border-b-2 border-transparent px-4 py-4 transition-colors whitespace-nowrap"
                    style={{
                      borderBottomColor: activeTab === 'revenue' ? currentColors.primary : 'transparent',
                      backgroundColor: activeTab === 'revenue' ? currentColors.primary + '15' : 'transparent',
                      color: activeTab === 'revenue' ? currentColors.primary : currentColors.textSecondary
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Doanh thu
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instructor-requests" 
                    className="rounded-none border-b-2 border-transparent px-4 py-4 transition-colors whitespace-nowrap"
                    style={{
                      borderBottomColor: activeTab === 'instructor-requests' ? currentColors.primary : 'transparent',
                      backgroundColor: activeTab === 'instructor-requests' ? currentColors.primary + '15' : 'transparent',
                      color: activeTab === 'instructor-requests' ? currentColors.primary : currentColors.textSecondary
                    }}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Yêu cầu giảng viên
                  </TabsTrigger>
                  <TabsTrigger 
                    value="withdrawals" 
                    className="rounded-none border-b-2 border-transparent px-4 py-4 transition-colors whitespace-nowrap"
                    style={{
                      borderBottomColor: activeTab === 'withdrawals' ? currentColors.primary : 'transparent',
                      backgroundColor: activeTab === 'withdrawals' ? currentColors.primary + '15' : 'transparent',
                      color: activeTab === 'withdrawals' ? currentColors.primary : currentColors.textSecondary
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Rút tiền
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payouts" 
                    className="rounded-none border-b-2 border-transparent px-4 py-4 transition-colors whitespace-nowrap"
                    style={{
                      borderBottomColor: activeTab === 'payouts' ? currentColors.primary : 'transparent',
                      backgroundColor: activeTab === 'payouts' ? currentColors.primary + '15' : 'transparent',
                      color: activeTab === 'payouts' ? currentColors.primary : currentColors.textSecondary
                    }}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Chi trả
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: currentColors.text }}>Khóa học chờ duyệt ({pendingCourses.length})</h3>
                </div>

                {pendingCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-medium" style={{ color: currentColors.text }}>Không có khóa học nào chờ duyệt</p>
                    <p className="text-sm mt-1" style={{ color: currentColors.textSecondary }}>Tất cả khóa học đã được xem xét và phê duyệt</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCourses.map(course => (
                      <Card key={course.id} className="border hover:shadow-lg transition-all duration-200" style={{ 
                        backgroundColor: currentColors.card,
                        borderColor: currentColors.border 
                      }}>
                        <CardContent className="p-5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                                  <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg" style={{ color: currentColors.text }}>{course.title}</h4>
                                  <div className="flex flex-wrap gap-3 mt-2 text-sm" style={{ color: currentColors.textSecondary }}>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      {course.price?.toLocaleString()} VND
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <GraduationCap className="w-4 h-4" />
                                      {course.instructor_name || 'Chưa có giảng viên'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setModalState({ type: 'viewCourse', isOpen: true, data: course })}
                                className="px-4 py-2.5 flex items-center gap-2 rounded-lg font-medium transition-all hover:scale-105"
                                style={{ 
                                  backgroundColor: currentColors.primary + '15',
                                  color: currentColors.primary,
                                  border: `1px solid ${currentColors.primary}30`
                                }}
                                title="Xem chi tiết khóa học"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Xem</span>
                              </button>
                              <button
                                onClick={() => handleApproveCourse(course.course_id)}
                                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center gap-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg"
                                title="Phê duyệt khóa học"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Duyệt</span>
                              </button>
                              <button
                                onClick={() => handleRejectCourse(course.course_id)}
                                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center gap-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg"
                                title="Từ chối khóa học"
                              >
                                <XCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Từ chối</span>
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: currentColors.text }}>Danh sách người dùng ({filteredUsers.length})</h3>
                  <div className="flex gap-3">
                    <Input placeholder="Tìm kiếm người dùng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
                    <select 
                      value={userFilter} 
                      onChange={(e) => setUserFilter(e.target.value)} 
                      className="px-4 py-2 border rounded-md"
                      style={{ 
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        borderColor: theme === 'dark' ? '#374151' : '#d1d5db'
                      }}
                    >
                      <option value="all" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>Tất cả</option>
                      <option value="admins" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>Admin</option>
                      <option value="instructors" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>Giảng viên</option>
                      <option value="learners" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>Học viên</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="table-header bg-gray-50 border-b">
                      <tr>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>ID</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Họ tên</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Email</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Vai trò</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Trạng thái</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map(user => (
                        <tr key={user.user_id} className="table-row hover:bg-gray-50">
                          <td className="table-cell px-4 py-3 text-sm">{user.user_id}</td>
                          <td className="table-cell px-4 py-3 text-sm font-medium">{user.full_name}</td>
                          <td className="table-cell px-4 py-3 text-sm" style={{ color: currentColors.textSecondary }}>{user.email}</td>
                          <td className="table-cell px-4 py-3">
                            <Badge type="role" value={getRoleName(user.role_id)}>{getRoleName(user.role_id)}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge type="status" value={user.is_locked ? 'locked' : 'active'}>
                              {user.is_locked ? 'Bị khóa' : 'Hoạt động'}
                            </Badge>
                          </td>
                          <td className="table-cell px-4 py-3">
                            <div className="flex gap-2 items-center">
                              {user.role_id !== 1 && (
                                <>
                                  <button
                                    onClick={() => handleViewUser(user)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Xem chi tiết"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  
                                  {user.status === 'active' ? (
                                    <button
                                      onClick={() => handleLockUser(user.user_id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Khóa tài khoản"
                                    >
                                      <Lock className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUnlockUser(user.user_id)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Mở khóa tài khoản"
                                    >
                                      <Unlock className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  <select
                                    className="px-3 py-1.5 border rounded-lg text-sm transition-colors hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                    style={{
                                      backgroundColor: currentColors.card,
                                      color: currentColors.text,
                                      borderColor: currentColors.border
                                    }}
                                    value={user.role_id === 2 ? 'instructor' : 'learner'}
                                    onChange={(e) => handleChangeRole(user.user_id, e.target.value)}
                                    title="Thay đổi vai trò"
                                  >
                                    <option value="learner">Học viên</option>
                                    <option value="instructor">Giảng viên</option>
                                  </select>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="learners" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: currentColors.text }}>Danh sách học viên ({learners.length})</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="table-header bg-gray-50 border-b">
                      <tr>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>ID</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Họ tên</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Email</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Khóa học đăng ký</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Chứng chỉ</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {learners.map(learner => (
                        <tr key={learner.user_id} className="table-row hover:bg-gray-50">
                          <td className="table-cell px-4 py-3 text-sm">{learner.user_id}</td>
                          <td className="table-cell px-4 py-3 text-sm font-medium">{learner.full_name}</td>
                          <td className="table-cell px-4 py-3 text-sm" style={{ color: currentColors.textSecondary }}>{learner.email}</td>
                          <td className="table-cell px-4 py-3 text-sm">{learner.enrolled_courses || 0}</td>
                          <td className="table-cell px-4 py-3 text-sm">{learner.certificates_earned || 0}</td>
                          <td className="px-4 py-3">
                            <Badge variant={learner.status === 'active' ? 'default' : 'secondary'}>
                              {learner.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="instructors" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: currentColors.text }}>Danh sách giảng viên ({instructors.length})</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="table-header bg-gray-50 border-b">
                      <tr>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>ID</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Họ tên</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Email</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Tổng khóa học</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Đã xuất bản</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Tổng học viên</th>
                        <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {instructors.map(instructor => (
                        <tr key={instructor.user_id} className="table-row hover:bg-gray-50">
                          <td className="table-cell px-4 py-3 text-sm">{instructor.user_id}</td>
                          <td className="table-cell px-4 py-3 text-sm font-medium">{instructor.full_name}</td>
                          <td className="table-cell px-4 py-3 text-sm" style={{ color: currentColors.textSecondary }}>{instructor.email}</td>
                          <td className="table-cell px-4 py-3 text-sm">{instructor.total_courses || 0}</td>
                          <td className="table-cell px-4 py-3 text-sm">{instructor.published_courses || 0}</td>
                          <td className="table-cell px-4 py-3 text-sm">{instructor.total_students || 0}</td>
                          <td className="table-cell px-4 py-3">
                            <Badge variant={instructor.status === 'active' ? 'default' : 'secondary'}>
                              {instructor.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="courses" className="p-6 space-y-4">
                <h3 className="text-xl font-bold" style={{ color: currentColors.text }}>Tất cả khóa học ({courses.length})</h3>
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <p style={{ color: currentColors.textSecondary }}>Không có khóa học</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="table-header bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>ID</th>
                          <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Tiêu đề</th>
                          <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {courses.map(course => (
                          <tr key={course.course_id} className="table-row hover:bg-gray-50">
                            <td className="table-cell px-4 py-3 text-sm border">{course.course_id}</td>
                            <td className="table-cell px-4 py-3 text-sm font-medium border">{course.title}</td>
                            <td className="table-cell px-4 py-3 border">
                              <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                                {course.status === 'published' ? 'Đã xuất bản' : 
                                 course.status === 'draft' ? 'Bản nháp' :
                                 course.status === 'pending' ? 'Chờ duyệt' : course.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="revenue" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: currentColors.text }}>Báo cáo doanh thu</h3>
                </div>

                {revenue && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="border-2 border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <p className="text-sm" style={{ color: currentColors.textSecondary }}>Tổng doanh thu</p>
                          <p className="text-2xl font-bold text-green-600">
                            {(revenue.summary?.totalRevenue / 1000000 || 0).toFixed(1)}M VND
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                          <p className="text-sm" style={{ color: currentColors.textSecondary }}>Tổng đăng ký</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {revenue.summary?.totalEnrollments || 0}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-2 border-purple-200 bg-purple-50">
                        <CardContent className="p-4">
                          <p className="text-sm" style={{ color: currentColors.textSecondary }}>Trung bình / khóa học</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {((revenue.summary?.averagePerCourse || 0) / 1000000).toFixed(1)}M VND
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="table-header bg-gray-50 border-b">
                          <tr>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Khóa học</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Giảng viên</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Giá</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Đăng ký</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold" style={{ color: currentColors.text }}>Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {revenue.details && revenue.details.map((item, index) => (
                            <tr key={index} className="table-row hover:bg-gray-50">
                              <td className="table-cell px-4 py-3 text-sm font-medium">{item.title}</td>
                              <td className="table-cell px-4 py-3 text-sm" style={{ color: currentColors.textSecondary }}>{item.instructor_name}</td>
                              <td className="table-cell px-4 py-3 text-sm">{(item.price || 0).toLocaleString()} VND</td>
                              <td className="table-cell px-4 py-3 text-sm">{item.total_enrollments}</td>
                              <td className="table-cell px-4 py-3 text-sm font-bold text-green-600">
                                {(item.total_revenue || 0).toLocaleString()} VND
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* INSTRUCTOR REQUESTS TAB */}
              <TabsContent value="instructor-requests" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: currentColors.text }}>
                    Yêu cầu trở thành giảng viên ({instructorRequests.length})
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportToCSV(instructorRequests, 'instructor-requests')}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Xuất CSV
                  </Button>
                </div>

                {instructorRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: currentColors.textSecondary }} />
                    <p className="text-lg font-medium" style={{ color: currentColors.text }}>Không có yêu cầu giảng viên nào</p>
                    <p className="text-sm mt-2" style={{ color: currentColors.textSecondary }}>
                      Các yêu cầu đăng ký giảng viên sẽ hiển thị ở đây
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="table-header bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>ID</th>
                          <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Họ tên</th>
                          <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Email</th>
                          <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Ngày yêu cầu</th>
                          <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Trạng thái</th>
                          <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {instructorRequests.map(request => (
                          <tr key={request.user_id} className="table-row hover:bg-gray-50">
                            <td className="table-cell px-4 py-3 text-sm border">{request.user_id}</td>
                            <td className="table-cell px-4 py-3 text-sm font-medium border">{request.full_name}</td>
                            <td className="table-cell px-4 py-3 text-sm border">{request.email}</td>
                            <td className="table-cell px-4 py-3 text-sm border">
                              {new Date(request.request_date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="table-cell px-4 py-3 border">
                              <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                                {request.status === 'pending' ? 'Chờ duyệt' : request.status}
                              </Badge>
                            </td>
                            <td className="table-cell px-4 py-3 border">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => approveInstructorRequest(request.user_id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Duyệt
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    setModalState({ 
                                      type: 'rejectInstructorRequest', 
                                      isOpen: true, 
                                      data: { userId: request.user_id } 
                                    });
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Từ chối
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              {/* WITHDRAWAL REQUESTS TAB */}
              <TabsContent value="withdrawals" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: currentColors.text }}>
                    Yêu cầu rút tiền ({withdrawalRequests.length})
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportToCSV(withdrawalRequests, 'withdrawal-requests')}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Xuất CSV
                  </Button>
                </div>

                {withdrawalRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: currentColors.textSecondary }} />
                    <p className="text-lg font-medium" style={{ color: currentColors.text }}>Không có yêu cầu rút tiền</p>
                    <p className="text-sm mt-2" style={{ color: currentColors.textSecondary }}>
                      Các yêu cầu rút tiền từ giảng viên sẽ hiển thị ở đây
                    </p>
                  </div>
                ) : (
                  <>
                    <Card className="border-2 border-orange-200 bg-orange-50 mb-4">
                      <CardContent className="p-4">
                        <p className="text-sm" style={{ color: currentColors.textSecondary }}>Tổng số tiền chờ xử lý</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {withdrawalRequests
                            .filter(w => w.status === 'pending')
                            .reduce((sum, w) => sum + (w.amount || 0), 0)
                            .toLocaleString()} VND
                        </p>
                      </CardContent>
                    </Card>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="table-header bg-gray-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>ID</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Giảng viên</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Số tiền</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Thông tin ngân hàng</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Ngày yêu cầu</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Trạng thái</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {withdrawalRequests.map(withdrawal => (
                            <tr key={withdrawal.request_id} className="table-row hover:bg-gray-50">
                              <td className="table-cell px-4 py-3 text-sm border">{withdrawal.request_id}</td>
                              <td className="table-cell px-4 py-3 text-sm font-medium border">{withdrawal.instructor_name}</td>
                              <td className="table-cell px-4 py-3 text-sm font-bold text-orange-600 border">
                                {(withdrawal.amount || 0).toLocaleString()} VND
                              </td>
                              <td className="table-cell px-4 py-3 text-sm border">
                                <div className="text-xs" style={{ color: currentColors.textSecondary }}>
                                  <div>{withdrawal.bank_name}</div>
                                  <div>{withdrawal.account_number}</div>
                                </div>
                              </td>
                              <td className="table-cell px-4 py-3 text-sm border">
                                {new Date(withdrawal.request_date).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="table-cell px-4 py-3 border">
                                <Badge variant={withdrawal.status === 'pending' ? 'secondary' : 'default'}>
                                  {withdrawal.status === 'pending' ? 'Chờ xử lý' : 
                                   withdrawal.status === 'approved' ? 'Đã duyệt' : 
                                   withdrawal.status === 'rejected' ? 'Từ chối' : withdrawal.status}
                                </Badge>
                              </td>
                              <td className="table-cell px-4 py-3 border">
                                {withdrawal.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={() => approveWithdrawal(withdrawal.request_id)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Duyệt
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => {
                                        setModalState({ 
                                          type: 'rejectWithdrawal', 
                                          isOpen: true, 
                                          data: { requestId: withdrawal.request_id } 
                                        });
                                      }}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Từ chối
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* PAYOUTS TAB */}
              <TabsContent value="payouts" className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: currentColors.text }}>
                    Chi trả doanh thu giảng viên ({pendingPayouts.length})
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportToCSV(pendingPayouts, 'pending-payouts')}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Xuất CSV
                  </Button>
                </div>

                {pendingPayouts.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowUpRight className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: currentColors.textSecondary }} />
                    <p className="text-lg font-medium" style={{ color: currentColors.text }}>Không có khoản chi trả nào</p>
                    <p className="text-sm mt-2" style={{ color: currentColors.textSecondary }}>
                      Các giảng viên có doanh thu chờ chi trả sẽ hiển thị ở đây
                    </p>
                  </div>
                ) : (
                  <>
                    <Card className="border-2 border-purple-200 bg-purple-50 mb-4">
                      <CardContent className="p-4">
                        <p className="text-sm" style={{ color: currentColors.textSecondary }}>Tổng doanh thu chờ chi trả</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {pendingPayouts
                            .reduce((sum, p) => sum + (p.pending_revenue || 0), 0)
                            .toLocaleString()} VND
                        </p>
                      </CardContent>
                    </Card>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="table-header bg-gray-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>ID</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Giảng viên</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Doanh thu chờ</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Lần chi trả cuối</th>
                            <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text }}>Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {pendingPayouts.map(payout => (
                            <tr key={payout.user_id} className="table-row hover:bg-gray-50">
                              <td className="table-cell px-4 py-3 text-sm border">{payout.user_id}</td>
                              <td className="table-cell px-4 py-3 text-sm font-medium border">{payout.instructor_name}</td>
                              <td className="table-cell px-4 py-3 text-sm font-bold text-purple-600 border">
                                {(payout.pending_revenue || 0).toLocaleString()} VND
                              </td>
                              <td className="table-cell px-4 py-3 text-sm border">
                                {payout.last_payout_date 
                                  ? new Date(payout.last_payout_date).toLocaleDateString('vi-VN')
                                  : 'Chưa chi trả'}
                              </td>
                              <td className="table-cell px-4 py-3 border">
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => {
                                    setModalState({ 
                                      type: 'payInstructor', 
                                      isOpen: true, 
                                      data: { 
                                        userId: payout.user_id, 
                                        amount: payout.pending_revenue,
                                        instructorName: payout.instructor_name
                                      } 
                                    });
                                  }}
                                >
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  Chi trả ngay
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Chi trả doanh thu Tab */}
              {activeMenu === 'payouts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold" style={{ color: currentColors.text }}>
                      💰 Chi trả doanh thu giảng viên
                    </h2>
                    <Button 
                      onClick={loadInstructorRevenue}
                      variant="outline"
                      style={{ borderColor: currentColors.border }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Làm mới
                    </Button>
                  </div>

                  {instructorRevenue.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: currentColors.textSecondary }} />
                      <p className="text-lg font-medium" style={{ color: currentColors.text }}>
                        Chưa có dữ liệu doanh thu
                      </p>
                      <p className="text-sm mt-2" style={{ color: currentColors.textSecondary }}>
                        Các giảng viên có doanh thu sẽ hiển thị ở đây
                      </p>
                    </div>
                  ) : (
                    <>
                      <Card 
                        className="border-2 shadow-lg"
                        style={{ 
                          borderColor: currentColors.primary,
                          backgroundColor: theme === 'dark' ? currentColors.card : '#ffffff'
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                                Tổng doanh thu
                              </p>
                              <p className="text-2xl font-bold" style={{ color: currentColors.primary }}>
                                {instructorRevenue
                                  .reduce((sum, i) => sum + (i.total_earned || 0), 0)
                                  .toLocaleString('vi-VN')} VND
                              </p>
                            </div>
                            <div>
                              <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                                Đã chi trả
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                {instructorRevenue
                                  .reduce((sum, i) => sum + (i.total_paid || 0), 0)
                                  .toLocaleString('vi-VN')} VND
                              </p>
                            </div>
                            <div>
                              <p className="text-sm" style={{ color: currentColors.textSecondary }}>
                                Còn lại
                              </p>
                              <p className="text-2xl font-bold text-orange-600">
                                {instructorRevenue
                                  .reduce((sum, i) => sum + (i.pending || 0), 0)
                                  .toLocaleString('vi-VN')} VND
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead 
                            className="table-header border-b-2"
                            style={{ 
                              backgroundColor: theme === 'dark' ? currentColors.card : '#f9fafb',
                              borderColor: currentColors.border
                            }}
                          >
                            <tr>
                              <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text, borderColor: currentColors.border }}>
                                STT
                              </th>
                              <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text, borderColor: currentColors.border }}>
                                Giảng viên
                              </th>
                              <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text, borderColor: currentColors.border }}>
                                Tổng thu
                              </th>
                              <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text, borderColor: currentColors.border }}>
                                Đã trả
                              </th>
                              <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text, borderColor: currentColors.border }}>
                                Còn lại
                              </th>
                              <th className="table-cell px-4 py-3 text-left text-sm font-semibold border" style={{ color: currentColors.text, borderColor: currentColors.border }}>
                                Hành động
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: currentColors.border }}>
                            {instructorRevenue.map((instructor, index) => (
                              <tr 
                                key={instructor.user_id} 
                                className="table-row hover:bg-opacity-50 transition-colors"
                                style={{ 
                                  backgroundColor: theme === 'dark' ? currentColors.background : '#ffffff'
                                }}
                              >
                                <td className="table-cell px-4 py-3 text-sm border" style={{ color: currentColors.text, borderColor: currentColors.border }}>
                                  {index + 1}
                                </td>
                                <td className="table-cell px-4 py-3 border" style={{ borderColor: currentColors.border }}>
                                  <div>
                                    <p className="text-sm font-medium" style={{ color: currentColors.text }}>
                                      {instructor.full_name}
                                    </p>
                                    <p className="text-xs" style={{ color: currentColors.textSecondary }}>
                                      {instructor.email}
                                    </p>
                                  </div>
                                </td>
                                <td className="table-cell px-4 py-3 text-sm font-bold border" style={{ color: currentColors.primary, borderColor: currentColors.border }}>
                                  {(instructor.total_earned || 0).toLocaleString('vi-VN')} VND
                                </td>
                                <td className="table-cell px-4 py-3 text-sm font-bold text-green-600 border" style={{ borderColor: currentColors.border }}>
                                  {(instructor.total_paid || 0).toLocaleString('vi-VN')} VND
                                </td>
                                <td className="table-cell px-4 py-3 border" style={{ borderColor: currentColors.border }}>
                                  <span 
                                    className={`text-sm font-bold ${instructor.pending > 0 ? 'text-orange-600' : 'text-gray-400'}`}
                                  >
                                    {(instructor.pending || 0).toLocaleString('vi-VN')} VND
                                  </span>
                                </td>
                                <td className="table-cell px-4 py-3 border" style={{ borderColor: currentColors.border }}>
                                  {instructor.pending > 0 ? (
                                    <Button 
                                      size="sm" 
                                      onClick={() => handlePayInstructor(instructor)}
                                      style={{ 
                                        backgroundColor: currentColors.primary,
                                        color: '#ffffff'
                                      }}
                                    >
                                      <CreditCard className="w-4 h-4 mr-1" />
                                      Chi trả
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-gray-400">Đã thanh toán</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Tabs>
          </Card>
          </div>
        ) : (
          /* Child routes will render here */
          <Outlet context={{ theme, currentColors }} />
        )}
      </div>

      {/* View User Details Modal */}
      {modalState.type === 'viewUser' && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ type: null, isOpen: false, data: null })}
          title="Chi tiết người dùng"
          currentColors={currentColors}
          theme={theme}
        >
          <div className="space-y-3">
            <p className="text-inherit"><strong>ID:</strong> {modalState.data.user_id}</p>
            <p className="text-inherit"><strong>Họ tên:</strong> {modalState.data.full_name}</p>
            <p className="text-inherit"><strong>Email:</strong> {modalState.data.email}</p>
            <p className="text-inherit"><strong>Vai trò:</strong> 
              <Badge type="role" value={modalState.data.role_name}>{modalState.data.role_name || 'Chưa xác định'}</Badge>
            </p>
            <p className="text-inherit"><strong>Trạng thái:</strong> 
              <Badge type="status" value={modalState.data.is_locked ? 'locked' : 'active'}>
                {modalState.data.is_locked ? 'Bị khóa' : 'Hoạt động'}
              </Badge>
            </p>
            <p className="text-inherit"><strong>Ngày tạo:</strong> {new Date(modalState.data.created_at).toLocaleDateString('vi-VN')}</p>
          </div>
        </Modal>
      )}

      {/* Lock User Modal */}
      {modalState.type === 'lock' && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ type: null, isOpen: false, data: null })}
          title="Xác nhận khóa tài khoản"
          onConfirm={confirmLockUser}
          confirmText="Khóa tài khoản"
          confirmVariant="danger"
          currentColors={currentColors}
          theme={theme}
        >
          <p className="text-inherit opacity-90">
            Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập sau khi bị khóa.
          </p>
        </Modal>
      )}

      {/* Unlock User Modal */}
      {modalState.type === 'unlock' && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ type: null, isOpen: false, data: null })}
          title="Xác nhận mở khóa tài khoản"
          onConfirm={confirmUnlockUser}
          confirmText="Mở khóa"
          confirmVariant="success"
          currentColors={currentColors}
          theme={theme}
        >
          <p className="text-inherit opacity-90">
            Bạn có chắc chắn muốn mở khóa tài khoản này? Người dùng sẽ có thể đăng nhập trở lại.
          </p>
        </Modal>
      )}


      {/* Edit Role Modal */}
      {modalState.type === 'editRole' && modalState.isOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalState({ type: null, isOpen: false, data: null })}
          title="Xác nhận thay đổi vai trò"
          currentColors={currentColors}
          theme={theme}
          onConfirm={confirmChangeRole}
          confirmText="Xác nhận thay đổi"
        >
          <p className="mb-4 text-inherit opacity-90">
            Bạn có chắc chắn muốn thay đổi vai trò của người dùng này?
          </p>
          <div className="p-4 rounded-lg" style={{ 
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            borderLeft: '4px solid rgb(59, 130, 246)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-inherit opacity-70 mb-1">Từ:</div>
                <Badge type="role" value={ROLE_LABEL_BY_ID[ROLE_ID_BY_KEY[modalState.data?.currentRole]]}>
                  {ROLE_LABEL_BY_ID[ROLE_ID_BY_KEY[modalState.data?.currentRole]]}
                </Badge>
              </div>
              <div className="text-2xl text-inherit opacity-50">→</div>
              <div>
                <div className="text-sm text-inherit opacity-70 mb-1">Thành:</div>
                <Badge type="role" value={ROLE_LABEL_BY_ID[ROLE_ID_BY_KEY[modalState.data?.newRole]]}>
                  {ROLE_LABEL_BY_ID[ROLE_ID_BY_KEY[modalState.data?.newRole]]}
                </Badge>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Approve Course Modal */}
      {modalState.type === 'approve' && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ type: null, isOpen: false, data: null })}
          title="Xác nhận duyệt khóa học"
          onConfirm={confirmApproveCourse}
          confirmText="Duyệt khóa học"
          confirmVariant="success"
          currentColors={currentColors}
          theme={theme}
        >
          <p className="text-inherit opacity-90">
            Bạn có chắc chắn muốn duyệt khóa học này? Khóa học sẽ được xuất bản và hiển thị cho học viên.
          </p>
        </Modal>
      )}

      {/* Reject Course Modal */}
      {modalState.type === 'reject' && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ type: null, isOpen: false, data: null })}
          title="Xác nhận từ chối khóa học"
          onConfirm={confirmRejectCourse}
          confirmText="Từ chối"
          confirmVariant="danger"
          currentColors={currentColors}
          theme={theme}
        >
          <p className="text-inherit opacity-90">
            Bạn có chắc chắn muốn từ chối khóa học này? Giảng viên sẽ cần chỉnh sửa lại.
          </p>
        </Modal>
      )}

      {/* Logout Modal */}
      {modalState.type === 'logout' && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ type: null, isOpen: false, data: null })}
          title="Xác nhận đăng xuất"
          onConfirm={confirmLogout}
          confirmText="Đăng xuất"
          confirmVariant="danger"
          currentColors={currentColors}
          theme={theme}
        >
          <p className="text-inherit opacity-90">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Admin?
          </p>
        </Modal>
      )}

      {/* Pay Instructor Revenue Modal with Portal */}
      {payModal.isOpen && createPortal(
        <div className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 ${theme === 'dark' ? 'modal-dark' : 'modal-light'}`}>
          <div 
            className="modal-surface rounded-xl shadow-2xl w-full max-w-md modal-content-wrapper" 
            style={{ backgroundColor: currentColors.card }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pay-modal-title"
          >
            <div className="p-6 border-b" style={{ borderColor: currentColors.border }}>
              <h3 id="pay-modal-title" className="text-xl font-bold text-inherit">
                💰 Chi trả doanh thu
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-inherit opacity-70">Giảng viên</p>
                <p className="text-lg font-medium text-inherit">
                  {payModal.instructor?.full_name}
                </p>
                <p className="text-xs text-inherit opacity-70">
                  {payModal.instructor?.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-inherit opacity-70">Số tiền còn lại</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(payModal.instructor?.pending || 0).toLocaleString('vi-VN')} VND
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-inherit">
                  Số tiền chi trả <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Nhập số tiền..."
                  value={payModal.amount}
                  onChange={(e) => setPayModal({ ...payModal, amount: e.target.value })}
                  max={payModal.instructor?.pending || 0}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: currentColors.border,
                    backgroundColor: theme === 'dark' ? currentColors.card : '#ffffff',
                    color: currentColors.text
                  }}
                />
                <p className="text-xs mt-1 text-inherit opacity-70">
                  Tối đa: {(payModal.instructor?.pending || 0).toLocaleString('vi-VN')} VND
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t" style={{ borderColor: currentColors.border, backgroundColor: currentColors.background }}>
              <button 
                onClick={() => setPayModal({ isOpen: false, instructor: null, amount: '' })}
                className="flex-1 px-4 py-2 rounded-lg font-medium hover:opacity-90"
                style={{ backgroundColor: currentColors.border, color: currentColors.text }}
              >
                Hủy
              </button>
              <button 
                onClick={confirmPayInstructor}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <CreditCard className="w-4 h-4 mr-2 inline" />
                Xác nhận chi trả
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminPanel;