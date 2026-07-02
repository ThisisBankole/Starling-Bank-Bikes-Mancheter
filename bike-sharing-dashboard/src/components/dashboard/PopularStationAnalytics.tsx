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
import { usePopularStations } from '../../hooks/useAnalytics';

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
  // True 24-hour averages from snapshot history, not just the current moment
  const { data: popularStations, loading: popularLoading, error: popularError } = usePopularStations(10);

  const stationMetrics = useMemo(() => {
    const byId = new Map(activeStations.map(s => [s.station_id, s]));

    // Popularity from the API (24h average bikes), joined with live status
    const topStations = popularStations.map(p => {
      const live = byId.get(p.station_id);
      return {
        stationId: p.station_id,
        name: p.name,
        averageBikes: p.average_bikes,
        availableBikes: live?.status.num_bikes_available ?? null,
        capacity: live?.capacity ?? null,
        avgFillPercent: live && live.capacity > 0
          ? Math.min((p.average_bikes / live.capacity) * 100, 100)
          : null,
        status: live ? operationalStatus(live) : null
      };
    });

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
            <CardDescription className="text-sm">Busiest stations over the last 24 hours, and highest capacity stations</CardDescription>
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
            {popularError && (
              <p className="py-4 text-sm text-red-500">Could not load 24-hour rankings: {popularError}</p>
            )}
            {popularLoading && !popularError && stationMetrics.topStations.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">Loading 24-hour rankings...</p>
            )}
            {!popularError && stationMetrics.topStations.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station Name</TableHead>
                  <TableHead>Avg Bikes (24h)</TableHead>
                  <TableHead>Right Now</TableHead>
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
                        {station.avgFillPercent !== null && (
                          <Progress value={station.avgFillPercent} className="h-2 w-full" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {station.averageBikes.toFixed(1)} bikes
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap min-w-[120px]">
                      {station.availableBikes !== null ? `${station.availableBikes} / ${station.capacity}` : '—'}
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      {station.status && (
                        <Badge variant={station.status === 'Fully Operational' ? 'default' : 'secondary'}>
                          {station.status}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
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