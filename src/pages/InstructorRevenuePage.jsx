import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  BookOpen,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const InstructorRevenuePage = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, transactionsRes] = await Promise.all([
        api.instructor.getRevenueSummary(),
        api.instructor.getTransactions({ limit: 20 })
      ]);

      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const platformFeeRate = 0.2; // 20%
  const instructorShareRate = 0.8; // 80%

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Revenue</h1>
        <p className="text-gray-600 mt-2">Track your earnings and course sales performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary?.summary?.totalRevenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-teal-100 rounded-full">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              From {summary?.summary?.totalSales || 0} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Share</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(summary?.summary?.instructorShare || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {instructorShareRate * 100}% of revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {summary?.summary?.totalSales || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Across {summary?.summary?.coursesSold || 0} courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fee</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(summary?.summary?.platformFee || 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {platformFeeRate * 100}% commission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      {summary?.monthlyRevenue && summary.monthlyRevenue.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              Monthly Revenue (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.monthlyRevenue.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-sm font-medium text-gray-700 w-20">
                      {month.month}
                    </span>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-500 h-full rounded-full"
                          style={{ 
                            width: `${Math.min(100, (month.instructorShare / (summary.summary.instructorShare || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-sm text-gray-600">
                      {month.sales} sales
                    </span>
                    <span className="text-sm font-bold text-gray-900 w-24 text-right">
                      {formatCurrency(month.instructorShare)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Revenue Breakdown */}
      {summary?.courseRevenue && summary.courseRevenue.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Revenue by Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Sales</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Your Share</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.courseRevenue.map((course) => (
                    <tr key={course.course_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{course.title}</div>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700">
                        {formatCurrency(course.price)}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant={course.sales > 0 ? 'success' : 'secondary'}>
                          {course.sales || 0}
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-gray-900">
                        {formatCurrency(course.totalRevenue || 0)}
                      </td>
                      <td className="text-right py-3 px-4 font-bold text-green-600">
                        {formatCurrency(course.instructorShare || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No transactions yet</p>
              <p className="text-sm mt-1">Your sales will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.invoice_id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {transaction.course_title}
                        </h4>
                        <Badge variant={transaction.status === 'paid' ? 'success' : 'warning'}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Student: {transaction.learner_name}
                      </p>
                      {transaction.txn_ref && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          Ref: {transaction.txn_ref}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.paid_at ? new Date(transaction.paid_at).toLocaleString() : 'Pending'}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(transaction.amount / 100)}
                      </p>
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        +{formatCurrency(transaction.instructorShare / 100)}
                      </p>
                      <p className="text-xs text-gray-500">your share</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Revenue Information</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• You earn <strong>{instructorShareRate * 100}%</strong> of each course sale</li>
              <li>• Platform fee: <strong>{platformFeeRate * 100}%</strong> covers hosting, payment processing, and marketing</li>
              <li>• Revenue is tracked in real-time and updated automatically</li>
              <li>• All transactions include VAT (10%) which is collected from students</li>
              <li>• For questions, please contact admin support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorRevenuePage;
