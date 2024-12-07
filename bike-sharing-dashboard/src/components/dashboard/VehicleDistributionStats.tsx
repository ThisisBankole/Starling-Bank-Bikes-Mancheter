import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface VehicleAnalyticsProps {
  bikes: {
    total: number;
    regular: number;
    electric: number;
    ebikes: Array<{
      current_range_meters: number;
      bike_id: string;
    }>;
  };
}

const VehicleTypeAnalytics = ({ bikes }: VehicleAnalyticsProps) => {
  const vehicleData = useMemo(() => {
    // Distribution data
    const distribution = [
      { name: 'Regular Bikes', value: bikes.regular },
      { name: 'E-Bikes', value: bikes.electric }
    ];

    // Calculate percentages
    const total = bikes.total;
    const regularPercentage = ((bikes.regular / total) * 100).toFixed(1);
    const electricPercentage = ((bikes.electric / total) * 100).toFixed(1);

    // E-bike range groups
    const rangeGroups = bikes.ebikes.reduce((acc, bike) => {
      const range = Math.round(bike.current_range_meters / 1000); // Convert to km
      const rangeKey = range <= 10 ? '0-10km' 
        : range <= 20 ? '11-20km'
        : range <= 30 ? '21-30km'
        : '30km+';
      
      acc[rangeKey] = (acc[rangeKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      distribution,
      regularPercentage,
      electricPercentage,
      rangeGroups,
      total
    };
  }, [bikes]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Tabs defaultValue="distribution" className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Vehicle Type Analysis</CardTitle>
            <CardDescription>Fleet composition and e-bike status</CardDescription>
          </div>
          <TabsList>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="e-bikes">E-Bike Status</TabsTrigger>
          </TabsList>
        </div>
      </CardHeader>

      <TabsContent value="distribution">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleData.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {vehicleData.distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Regular Bikes</p>
                      <Badge variant="secondary">{bikes.regular} bikes</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {vehicleData.regularPercentage}%
                    </span>
                  </div>
                  <Progress value={parseFloat(vehicleData.regularPercentage)} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">E-Bikes</p>
                      <Badge variant="secondary">{bikes.electric} bikes</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {vehicleData.electricPercentage}%
                    </span>
                  </div>
                  <Progress value={parseFloat(vehicleData.electricPercentage)} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="e-bikes">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Object.entries(vehicleData.rangeGroups).map(([range, count], _index) => (
                <div key={range}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{range}</p>
                      <Badge variant="secondary">{count} e-bikes</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {((count / bikes.electric) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(count / bikes.electric) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default VehicleTypeAnalytics;