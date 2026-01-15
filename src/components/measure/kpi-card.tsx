
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { ReactElement } from 'react';

interface KpiCardProps {
  title: string;
  value: number;
  previousValue: number;
  growth?: number;
  icon: ReactElement;
}

export function KpiCard({ title, value, previousValue, growth, icon }: KpiCardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };
  
  const totalValue = growth !== undefined ? value + growth : value;
  const prevTotalValue = growth !== undefined ? previousValue + (growth || 0) : previousValue;
  const percentageChange = calculatePercentageChange(totalValue, prevTotalValue);

  const ChangeIndicator = () => {
    if (percentageChange > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    }
    if (percentageChange < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatNumber(value)}</div>
        <div className="text-xs text-muted-foreground flex items-center">
            <ChangeIndicator />
            {percentageChange.toFixed(1)}% from previous period
            {growth !== undefined && ` (${growth > 0 ? '+' : ''}${formatNumber(growth)})`}
        </div>
      </CardContent>
    </Card>
  );
}
