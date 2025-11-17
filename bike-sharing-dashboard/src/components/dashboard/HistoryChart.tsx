import { useSnapshotHistory } from '../../hooks/useAnalytics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const HistoryChart = () => {
  const { data, loading, error } = useSnapshotHistory(24);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Availability Trend</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Availability Trend</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    bikes: point.bikes_available,
    stations: point.stations_active
  })).reverse(); // Reverse to show oldest to newest

  return (
    <Card>
      <CardHeader>
        <CardTitle>24-Hour Availability Trend</CardTitle>
        <CardDescription>
          Bike availability over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="bikes" 
              stroke="#3b82f6" 
              name="Available Bikes"
              strokeWidth={2}
            />
            
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default HistoryChart;