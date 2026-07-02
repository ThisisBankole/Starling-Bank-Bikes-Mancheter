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

// Tick marks aligned to clock boundaries: hourly (6h), 2-hourly (24h), daily (7d)
const buildTicks = (minMs: number, maxMs: number, hours: number): number[] => {
  const ticks: number[] = [];
  if (hours > 48) {
    const d = new Date(minMs);
    d.setHours(24, 0, 0, 0); // next local midnight
    while (d.getTime() <= maxMs) {
      ticks.push(d.getTime());
      d.setDate(d.getDate() + 1);
    }
  } else {
    const step = (hours <= 6 ? 1 : 2) * 3600_000;
    for (let t = Math.ceil(minMs / step) * step; t <= maxMs; t += step) {
      ticks.push(t);
    }
  }
  return ticks;
};

const HistoryChart = () => {
  const [hours, setHours] = useState(24);
  const { data, loading, error } = useSnapshotHistory(hours);
  const rangeLabel = RANGES.find(r => r.hours === hours)?.label ?? `${hours}h`;

  const formatTick = (ms: number) =>
    hours > 48
      ? new Date(ms).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
      : new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const formatTooltipLabel = (ms: number) =>
    new Date(ms).toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

  const chartData = data.map(point => ({
    t: Date.parse(point.timestamp),
    bikes: point.bikes_available,
    stations: point.stations_active
  })).reverse(); // Reverse to show oldest to newest

  const ticks = chartData.length > 1
    ? buildTicks(chartData[0].t, chartData[chartData.length - 1].t, hours)
    : undefined;

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
                dataKey="t"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                ticks={ticks}
                tickFormatter={formatTick}
                tick={{ fontSize: 12 }}
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
              <Tooltip labelFormatter={(ms) => formatTooltipLabel(Number(ms))} />
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
