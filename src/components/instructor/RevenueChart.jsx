
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { convertUSDtoVND, formatVND } from '../../utils/currency';

export const RevenueLineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Chưa có dữ liệu doanh thu
        </CardContent>
      </Card>
    );
  }

  // Format data for chart (convert USD to VND)
  const chartData = data.map(item => ({
    month: item.month,
    'Doanh thu': convertUSDtoVND(parseFloat(item.instructor_share || item.instructorShare) || 0),
    'Số đơn': parseInt(item.sales) || 0
  })).reverse(); // Reverse to show oldest first
  
  console.log('📊 RevenueLineChart - Input data:', data);
  console.log('📊 RevenueLineChart - Chart data:', chartData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu theo tháng (6 tháng gần nhất)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'Doanh thu') {
                  return `${value.toLocaleString('vi-VN')} VND`;
                }
                return value;
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Doanh thu" 
              stroke="#0d9488" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const CourseRevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Chưa có dữ liệu theo khóa học
        </CardContent>
      </Card>
    );
  }

  // Take top 5 courses by revenue (convert USD to VND)
  const top5 = data
    .filter(item => item.sales > 0)
    .sort((a, b) => b.instructorShare - a.instructorShare)
    .slice(0, 5)
    .map(item => ({
      course: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
      'Doanh thu': convertUSDtoVND(parseFloat(item.instructorShare) || 0),
      'Số đơn': parseInt(item.sales) || 0
    }));

  if (top5.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Chưa có khóa học nào có doanh thu
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 khóa học theo doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top5}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="course" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'Doanh thu') {
                  return `${value.toLocaleString('vi-VN')} VND`;
                }
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="Doanh thu" fill="#0d9488" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const SalesOverviewChart = ({ monthlyData }) => {
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Chưa có dữ liệu bán hàng
        </CardContent>
      </Card>
    );
  }

  const chartData = monthlyData.map(item => ({
    month: item.month,
    'Số đơn': parseInt(item.sales) || 0
  })).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Số đơn hàng theo tháng</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="Số đơn" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
