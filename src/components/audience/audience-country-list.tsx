
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Progress } from '../ui/progress';

interface AudienceCountryListProps {
  data?: Record<string, number>;
}

// Full country names for codes - extend as needed
const countryNames: Record<string, string> = {
    ZA: 'South Africa',
    US: 'United States',
    GB: 'United Kingdom',
    NG: 'Nigeria',
    KE: 'Kenya',
    GH: 'Ghana',
    AU: 'Australia',
    CA: 'Canada',
    ZW: 'Zimbabwe',
    BW: 'Botswana',
};

export function AudienceCountryList({ data }: AudienceCountryListProps) {
  const sortedCountries = Object.entries(data || {})
    .map(([code, value]) => ({
      code,
      name: countryNames[code] || code,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const totalValue = sortedCountries.reduce((acc, curr) => acc + curr.value, 0);


  if (totalValue === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Top 10 Countries</CardTitle>
                <CardDescription>Average over selected period.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No data available</p>
            </CardContent>
        </Card>
      )
  }

  const topValue = sortedCountries[0]?.value || 100;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Countries</CardTitle>
        <CardDescription>Average percentage of audience from each country.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCountries.map((country) => (
            <div key={country.code} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{country.name}</span>
                <span className="text-muted-foreground">{country.value.toFixed(2)}%</span>
              </div>
              <Progress value={(country.value / topValue) * 100} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
