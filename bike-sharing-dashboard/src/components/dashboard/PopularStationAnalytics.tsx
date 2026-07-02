import { useMemo } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Station } from '../../types';

interface PopularStationsProps {
  activeStations: Station[];
}

const operationalStatus = (station: Station) =>
  station.status.is_renting && station.status.is_returning ? 'Fully Operational' : 'Limited Service';

const utilizationOf = (station: Station) =>
  station.capacity > 0
    ? ((station.capacity - station.status.num_docks_available) / station.capacity) * 100
    : 0;

const PopularStationsAnalytics = ({ activeStations }: PopularStationsProps) => {
  const stationMetrics = useMemo(() => {
    // Rank by how full each station is right now
    const topStations = [...activeStations]
      .map(station => ({
        stationId: station.station_id,
        name: station.name,
        utilization: utilizationOf(station),
        availableBikes: station.status.num_bikes_available,
        capacity: station.capacity,
        status: operationalStatus(station)
      }))
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 10);

    const highCapacityStations = [...activeStations]
      .sort((a, b) => b.capacity - a.capacity)
      .slice(0, 10)
      .map(station => ({
        stationId: station.station_id,
        name: station.name,
        capacity: station.capacity,
        availableBikes: station.status.num_bikes_available,
        utilization: utilizationOf(station),
        status: operationalStatus(station)
      }));

    return {
      topStations,
      highCapacityStations
    };
  }, [activeStations, popularStations]);

  return (
    <Tabs defaultValue="utilization" className="w-full space-y-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">Popular Stations</CardTitle>
            <CardDescription className="text-sm">Most utilized and highest capacity stations</CardDescription>
          </div>
          <TabsList className="self-start sm:self-center">
            <TabsTrigger value="utilization" className="text-sm">By Usage</TabsTrigger>
            <TabsTrigger value="capacity" className="text-sm">By Capacity</TabsTrigger>
            
          </TabsList>
        </div>
      </CardHeader>

      <TabsContent value="utilization">
        <Card>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station Name</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Available Bikes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stationMetrics.topStations.map((station, index) => (
                  <TableRow key={station.stationId}>
                    <TableCell className="font-medium whitespace-nowrap min-w-[200px]">
                      {station.name}
                      {index < 3 && (
                        <Badge className="ml-2 hidden sm:inline-flex" variant="secondary">
                          Top {index + 1}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <div className="space-y-2">
                        <Progress value={station.utilization} className="h-2 w-full" />
                        <span className="text-sm text-muted-foreground">
                          {station.utilization.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[120px]">{station.availableBikes} / {station.capacity}</TableCell>
                    <TableCell className="min-w-[140px]">
                      <Badge variant={station.status === 'Fully Operational' ? 'default' : 'secondary'}>
                        {station.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="capacity">
        <Card>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Current Usage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stationMetrics.highCapacityStations.map((station, index) => (
                  <TableRow key={station.stationId}>
                    <TableCell className="font-medium whitespace-nowrap min-w-[200px]">
                      {station.name}
                      {index < 3 && (
                        <Badge className="ml-2 hidden sm:inline-flex" variant="secondary">
                          Top {index + 1}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[120px]">{station.capacity} bikes</TableCell>
                    <TableCell className="min-w-[150px]">
                      <div className="space-y-2">
                        <Progress value={station.utilization} className="h-2 w-full" />
                        <span className="text-sm text-muted-foreground">
                          {station.availableBikes} bikes available
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <Badge variant={station.status === 'Fully Operational' ? 'default' : 'secondary'}>
                        {station.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  );
};

export default PopularStationsAnalytics;