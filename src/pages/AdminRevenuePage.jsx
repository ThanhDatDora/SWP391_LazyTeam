import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock,
  Eye,
  X,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const AdminRevenuePage = () => {
  const [summary, setSummary] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [instructorRevenue, setInstructorRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, pendingRes, instructorRes] = await Promise.all([
        api.admin.getRevenueSummary(),
        api.admin.getPendingPayments(),
        api.admin.getInstructorRevenue()
      ]);

      setSummary(summaryRes.data);
      setPendingPayments(pendingRes.data);
      setInstructorRevenue(instructorRes.data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId, verified) => {
    try {
      await api.admin.verifyPayment(paymentId, verified);
      
      // Refresh data
      fetchData();
      setSelectedPayment(null);
    } catch (error) {
      console.error('Failed to verify payment:', error);
      alert('Failed to verify payment');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform revenue overview and payment verification</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency((summary?.completedRevenue || 0) / 100)}
                </p>
              </div>
              <div className="p-3 bg-teal-100 rounded-full">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {summary?.totalPayments || 0} payments completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fee</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency((summary?.platformFee || 0) / 100)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {platformFeeRate * 100}% commission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Instructor Share</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency((summary?.instructorShare || 0) / 100)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {(1 - platformFeeRate) * 100}% to instructors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency((summary?.pendingRevenue || 0) / 100)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {pendingPayments.length} awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Pending Payment Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.payment_id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {payment.learner_name}
                        </h3>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{payment.learner_email}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Courses:</strong> {payment.courses || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(payment.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 mb-4">
                        {formatCurrency(payment.amount_cents / 100)}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyPayment(payment.payment_id, false)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyPayment(payment.payment_id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructor Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Instructor Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Instructor</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Sales</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Platform Fee</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Instructor Share</th>
                </tr>
              </thead>
              <tbody>
                {instructorRevenue.map((instructor) => (
                  <tr key={instructor.instructor_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{instructor.instructor_name}</p>
                        <p className="text-sm text-gray-600">{instructor.email}</p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {instructor.totalSales}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900">
                      {formatCurrency(instructor.totalRevenue)}
                    </td>
                    <td className="text-right py-3 px-4 text-green-600 font-medium">
                      {formatCurrency(instructor.platformFee)}
                    </td>
                    <td className="text-right py-3 px-4 text-blue-600 font-medium">
                      {formatCurrency(instructor.instructorShare)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRevenuePage;
