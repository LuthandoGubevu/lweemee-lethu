
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { addDays } from 'date-fns';
import { AudienceGenderChart } from '@/components/audience/audience-gender-chart';
import { AudienceAgeChart } from '@/components/audience/audience-age-chart';
import { AudienceCountryList } from '@/components/audience/audience-country-list';


interface Connection {
  id: string;
  handle: string;
}

interface AudienceSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  gender?: {
    male: number;
    female: number;
    other: number;
  };
  age?: {
    "13-17": number;
    "18-24": number;
    "25-34": number;
    "35-44": number;
    "45+": number;
  };
  countries?: Record<string, number>;
}


export default function AudiencePage() {
  const [currentWorkspaceId] = useLocalStorage<string | null>('currentWorkspaceId', null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const { data: connections, loading: connectionsLoading } = useCollection<Connection>(
    currentWorkspaceId ? `workspaces/${currentWorkspaceId}/connections` : ''
  );
  
  useEffect(() => {
    if (!selectedConnectionId && connections.length > 0) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);


  const { data: snapshots, loading: snapshotsLoading } = useCollection<AudienceSnapshot>(
    currentWorkspaceId && selectedConnectionId
      ? `workspaces/${currentWorkspaceId}/connections/${selectedConnectionId}/audienceSnapshots`
      : ''
  );

  const filteredSnapshots = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    return snapshots.filter(s => {
      const snapshotDate = new Date(s.date);
      return snapshotDate >= dateRange.from! && snapshotDate <= dateRange.to!;
    });
  }, [snapshots, dateRange]);


  const aggregatedData = useMemo(() => {
    if (filteredSnapshots.length === 0) {
        return {
            gender: { male: 0, female: 0, other: 0 },
            age: { "13-17": 0, "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0 },
            countries: {},
        };
    }
    
    // Simple average of all snapshots in the period
    const totals = filteredSnapshots.reduce((acc, snapshot) => {
        if (snapshot.gender) {
            acc.gender.male += snapshot.gender.male || 0;
            acc.gender.female += snapshot.gender.female || 0;
            acc.gender.other += snapshot.gender.other || 0;
        }
        if (snapshot.age) {
            for (const band in snapshot.age) {
                acc.age[band] = (acc.age[band] || 0) + snapshot.age[band as keyof typeof snapshot.age];
            }
        }
        if (snapshot.countries) {
            for (const country in snapshot.countries) {
                acc.countries[country] = (acc.countries[country] || 0) + snapshot.countries[country];
            }
        }
        return acc;
    }, {
        gender: { male: 0, female: 0, other: 0 },
        age: { "13-17": 0, "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0 } as Record<string, number>,
        countries: {} as Record<string, number>,
    });
    
    const count = filteredSnapshots.length;

    const average = {
        gender: {
            male: totals.gender.male / count,
            female: totals.gender.female / count,
            other: totals.gender.other / count,
        },
        age: Object.fromEntries(Object.entries(totals.age).map(([k, v]) => [k, v/count])) as any,
        countries: Object.fromEntries(Object.entries(totals.countries).map(([k, v]) => [k, v/count])),
    };

    return average;
  }, [filteredSnapshots]);


  if (!currentWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
        <h3 className="text-xl font-bold tracking-tight">No workspace selected</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">Please select a workspace to view audience insights.</p>
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
            <h1 className="text-2xl font-bold">Audience Insights</h1>
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

        {snapshotsLoading ? <p>Loading audience data...</p> : filteredSnapshots.length === 0 ? (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center h-full">
                <h3 className="text-xl font-bold tracking-tight">No Data Available</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">There is no audience data for the selected account in this date range. Try importing data.</p>
            </div>
        ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AudienceGenderChart data={aggregatedData.gender} />
            <AudienceAgeChart data={aggregatedData.age} />
            <AudienceCountryList data={aggregatedData.countries} />
        </div>
        )}
    </div>
  );
}
