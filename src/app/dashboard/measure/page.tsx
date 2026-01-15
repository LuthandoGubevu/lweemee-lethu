
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCollection } from '@/firebase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DateRangePicker,
  DateRange,
} from '@/components/measure/date-range-picker';
import { addDays, format } from 'date-fns';
import { KpiCard } from '@/components/measure/kpi-card';
import { TrendChart } from '@/components/measure/trend-chart';
import { BarChart3, Eye, Heart, MessageCircle, Users } from 'lucide-react';

interface Connection {
  id: string;
  handle: string;
}

interface DailyMetric {
  id: string;
  date: string; // YYYY-MM-DD
  followers: number;
  totalViews: number;
  totalEngagements: number;
  profileViews: number;
}

export default function MeasurePage() {
  const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const { data: connections, loading: connectionsLoading } = useCollection<Connection>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/connections` : ''
  );
  
   // Set initial connection
  useEffect(() => {
    if (!selectedConnectionId && connections.length > 0) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);


  const { data: metrics, loading: metricsLoading } = useCollection<DailyMetric>(
    currentWorkspaceId && selectedConnectionId
      ? `workspaces/${currentWorkspaceId}/connections/${selectedConnectionId}/dailyMetrics`
      : ''
  );

  const filteredMetrics = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    return metrics
        .filter(m => {
            const metricDate = new Date(m.date);
            return metricDate >= dateRange.from! && metricDate <= dateRange.to!;
        })
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [metrics, dateRange]);


  const previousPeriodRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return undefined;
    const diff = dateRange.to.getTime() - dateRange.from.getTime();
    const from = new Date(dateRange.from.getTime() - diff - (1000 * 60 * 60 * 24));
    const to = new Date(dateRange.from.getTime() - (1000 * 60 * 60 * 24));
    return { from, to };
  }, [dateRange]);

  const previousPeriodMetrics = useMemo(() => {
    if (!previousPeriodRange) return [];
    return metrics
      .filter((m) => {
        const metricDate = new Date(m.date);
        return metricDate >= previousPeriodRange.from && metricDate <= previousPeriodRange.to;
      })
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [metrics, previousPeriodRange]);

  const summary = useMemo(() => {
    const calcTotals = (data: DailyMetric[]) => {
      const totals = data.reduce(
        (acc, m) => {
          acc.views += m.totalViews || 0;
          acc.engagements += m.totalEngagements || 0;
          acc.profileViews += m.profileViews || 0;
          return acc;
        },
        { views: 0, engagements: 0, profileViews: 0 }
      );
      const followerStart = data[0]?.followers || 0;
      const followerEnd = data[data.length - 1]?.followers || 0;
      return {...totals, followers: followerEnd, followerGrowth: followerEnd - followerStart };
    };

    return calcTotals(filteredMetrics);
  }, [filteredMetrics]);
  
  const prevSummary = useMemo(() => {
    const calcTotals = (data: DailyMetric[]) => {
      const totals = data.reduce(
        (acc, m) => {
          acc.views += m.totalViews || 0;
          acc.engagements += m.totalEngagements || 0;
          acc.profileViews += m.profileViews || 0;
          return acc;
        },
        { views: 0, engagements: 0, profileViews: 0 }
      );
      const followerStart = data[0]?.followers || 0;
      const followerEnd = data[data.length - 1]?.followers || 0;
      return {...totals, followers: followerEnd, followerGrowth: followerEnd - followerStart };
    };
    return calcTotals(previousPeriodMetrics);
  }, [previousPeriodMetrics]);


  const chartData = useMemo(() => {
    return filteredMetrics.map(m => ({
        date: format(new Date(m.date), 'MMM d'),
        Views: m.totalViews,
        Followers: m.followers,
        Engagements: m.totalEngagements,
    }));
  }, [filteredMetrics]);

  if (!currentWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
        <h3 className="text-xl font-bold tracking-tight">No workspace selected</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">Please select a workspace to view metrics.</p>
      </div>
    );
  }
   if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
        <h3 className="text-xl font-bold tracking-tight">No TikTok Accounts Connected</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">Go to the 'Connections' page to add a TikTok handle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h1 className="text-2xl font-bold">Measure</h1>
            <div className="flex gap-4 w-full sm:w-auto">
                <Select value={selectedConnectionId ?? ""} onValueChange={setSelectedConnectionId}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select Handle" />
                    </SelectTrigger>
                    <SelectContent>
                        {connections.map(c => <SelectItem key={c.id} value={c.id}>@{c.handle}</SelectItem>)}
                    </SelectContent>
                </Select>
                <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            </div>
       </div>

        {metricsLoading ? <p>Loading metrics...</p> : filteredMetrics.length === 0 ? (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
                <h3 className="text-xl font-bold tracking-tight">No Data Available</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">There is no metric data for the selected account in this date range. Try importing data.</p>
            </div>
        ) : (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Total Views" value={summary.views} previousValue={prevSummary.views} icon={<Eye />} />
                <KpiCard title="Total Engagements" value={summary.engagements} previousValue={prevSummary.engagements} icon={<Heart />} />
                <KpiCard title="Followers" value={summary.followers} previousValue={prevSummary.followers} growth={summary.followerGrowth} icon={<Users />} />
                <KpiCard title="Profile Views" value={summary.profileViews} previousValue={prevSummary.profileViews} icon={<BarChart3 />} />
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                 <TrendChart data={chartData} title="Views over time" dataKey="Views" />
                 <TrendChart data={chartData} title="Followers over time" dataKey="Followers" />
            </div>
             <TrendChart data={chartData} title="Engagements over time" dataKey="Engagements" />
        </>
        )}
    </div>
  );
}
