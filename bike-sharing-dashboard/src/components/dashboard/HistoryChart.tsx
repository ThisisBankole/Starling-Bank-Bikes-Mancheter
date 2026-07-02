import { useState } from 'react';
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

const RANGES = [
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
];

const HistoryChart = () => {
  const [hours, setHours] = useState(24);
  const { data, loading, error } = useSnapshotHistory(hours);
  const rangeLabel = RANGES.find(r => r.hours === hours)?.label ?? `${hours}h`;

  // Include the day when the window spans more than 48 hours
  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString('en-GB', {
      ...(hours > 48 ? { weekday: 'short' as const } : {}),
      hour: '2-digit',
      minute: '2-digit'
    });

  const chartData = data.map(point => ({
    time: formatTime(point.timestamp),
    bikes: point.bikes_available,
    stations: point.stations_active
  })).reverse(); // Reverse to show oldest to newest

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Availability Trend</CardTitle>
            <CardDescription>
              Bikes and active stations over the last {rangeLabel}
            </CardDescription>
          </div>
          <div className="flex rounded-lg border border-gray-200 p-0.5" role="group" aria-label="Time range">
            {RANGES.map(range => (
              <button
                key={range.hours}
                onClick={() => setHours(range.hours)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  hours === range.hours
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="py-8 text-center text-sm text-red-500">{error}</p>
        ) : loading && chartData.length === 0 ? (
          <div className="h-[300px] animate-pulse rounded bg-gray-100" />
        ) : chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No history for this range yet — snapshots accumulate every 10 minutes.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              {/* Zoomed domains: the fleet moves by tens against a ~650 total,
                  so a 0-based axis renders the lines flat */}
              <YAxis
                yAxisId="bikes"
                tick={{ fontSize: 12 }}
                domain={['dataMin - 5', 'dataMax + 5']}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="stations"
                orientation="right"
                tick={{ fontSize: 12 }}
                domain={['dataMin - 3', 'dataMax + 3']}
                allowDecimals={false}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="bikes"
                type="natural"
                dataKey="bikes"
                stroke="#3b82f6"
                name="Available Bikes"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="stations"
                type="natural"
                dataKey="stations"
                stroke="#10b981"
                name="Active Stations"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChart;
