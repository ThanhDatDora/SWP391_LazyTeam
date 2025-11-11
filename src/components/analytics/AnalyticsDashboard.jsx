/**
 * Analytics Dashboard Component
 * Comprehensive analytics and insights for courses, users, and engagement
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, BookOpen, 
  Award, DollarSign, Eye, Clock, 
  Calendar, Filter, Download, RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs } from '../ui/tabs';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Mock data - in real app, fetch from API
  const mockData = {
    overview: {
      totalUsers: 15420,
      totalCourses: 342,
      totalRevenue: 245600,
      totalCompletions: 8934,
      userGrowth: 12.5,
      courseGrowth: 8.2,
      revenueGrowth: 15.8,
      completionRate: 68.5
    },
    userEngagement: [
      { date: '2024-01-01', activeUsers: 1200, newUsers: 150, returning: 1050 },
      { date: '2024-01-02', activeUsers: 1350, newUsers: 180, returning: 1170 },
      { date: '2024-01-03', activeUsers: 1180, newUsers: 120, returning: 1060 },
      { date: '2024-01-04', activeUsers: 1420, newUsers: 200, returning: 1220 },
      { date: '2024-01-05', activeUsers: 1580, newUsers: 220, returning: 1360 },
      { date: '2024-01-06', activeUsers: 1320, newUsers: 160, returning: 1160 },
      { date: '2024-01-07', activeUsers: 1450, newUsers: 190, returning: 1260 }
    ],
    coursePerformance: [
      { name: 'JavaScript Fundamentals', enrollments: 1245, completions: 890, revenue: 24500, rating: 4.8 },
      { name: 'React Masterclass', enrollments: 980, completions: 720, revenue: 39200, rating: 4.9 },
      { name: 'Node.js Backend', enrollments: 756, completions: 512, revenue: 18900, rating: 4.6 },
      { name: 'Python for Beginners', enrollments: 1120, completions: 834, revenue: 22400, rating: 4.7 },
      { name: 'Database Design', enrollments: 654, completions: 445, revenue: 16350, rating: 4.5 }
    ],
    revenueAnalytics: [
      { month: 'Jan', revenue: 18500, subscriptions: 245, oneTime: 12300 },
      { month: 'Feb', revenue: 22100, subscriptions: 289, oneTime: 15200 },
      { month: 'Mar', revenue: 25800, subscriptions: 334, oneTime: 18100 },
      { month: 'Apr', revenue: 28900, subscriptions: 378, oneTime: 20200 },
      { month: 'May', revenue: 32400, subscriptions: 420, oneTime: 23100 },
      { month: 'Jun', revenue: 35200, subscriptions: 465, oneTime: 25800 }
    ],
    categoryDistribution: [
      { name: 'Programming', value: 45, count: 154 },
      { name: 'Design', value: 25, count: 86 },
      { name: 'Business', value: 18, count: 62 },
      { name: 'Marketing', value: 12, count: 40 }
    ],
    learningPaths: [
      { path: 'Full-Stack Developer', users: 2340, avgProgress: 65, completionRate: 78 },
      { path: 'Data Science', users: 1890, avgProgress: 58, completionRate: 72 },
      { path: 'DevOps Engineer', users: 1245, avgProgress: 71, completionRate: 85 },
      { path: 'UI/UX Designer', users: 1678, avgProgress: 62, completionRate: 75 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const StatCard = ({ title, value, change, icon: Icon, format = 'number' }) => {
    const isPositive = change > 0;
    const formattedValue = format === 'currency' ? `$${value.toLocaleString()}` 
      : format === 'percentage' ? `${value}%`
        : value.toLocaleString();

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your platform's performance and insights</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analyticsData.overview.totalUsers}
          change={analyticsData.overview.userGrowth}
          icon={Users}
        />
        <StatCard
          title="Total Courses"
          value={analyticsData.overview.totalCourses}
          change={analyticsData.overview.courseGrowth}
          icon={BookOpen}
        />
        <StatCard
          title="Revenue"
          value={analyticsData.overview.totalRevenue}
          change={analyticsData.overview.revenueGrowth}
          icon={DollarSign}
          format="currency"
        />
        <StatCard
          title="Completion Rate"
          value={analyticsData.overview.completionRate}
          change={5.2}
          icon={Award}
          format="percentage"
        />
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.userEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.revenueAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} />
              <Line type="monotone" dataKey="subscriptions" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Course Performance Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Courses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-3 font-semibold text-gray-900">Course Name</th>
                <th className="pb-3 font-semibold text-gray-900">Enrollments</th>
                <th className="pb-3 font-semibold text-gray-900">Completions</th>
                <th className="pb-3 font-semibold text-gray-900">Revenue</th>
                <th className="pb-3 font-semibold text-gray-900">Rating</th>
                <th className="pb-3 font-semibold text-gray-900">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.coursePerformance.map((course, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 font-medium">{course.name}</td>
                  <td className="py-3">{course.enrollments.toLocaleString()}</td>
                  <td className="py-3">{course.completions.toLocaleString()}</td>
                  <td className="py-3">${course.revenue.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge variant="secondary">{course.rating} ⭐</Badge>
                  </td>
                  <td className="py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(course.completions / course.enrollments) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 mt-1">
                      {Math.round((course.completions / course.enrollments) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Category Distribution & Learning Paths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Course Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Learning Paths Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Learning Paths</h3>
          <div className="space-y-4">
            {analyticsData.learningPaths.map((path, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{path.path}</h4>
                  <Badge variant="outline">{path.users} learners</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Average Progress</span>
                    <span>{path.avgProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${path.avgProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Completion Rate</span>
                    <span className="font-medium">{path.completionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}