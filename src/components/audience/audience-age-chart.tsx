
"use client"

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"

interface AudienceAgeChartProps {
    data?: {
        "13-17": number;
        "18-24": number;
        "25-34": number;
        "35-44": number;
        "45+": number;
    }
}

export function AudienceAgeChart({ data }: AudienceAgeChartProps) {
    const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }));

    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

    if (totalValue === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Age Distribution</CardTitle>
                    <CardDescription>Average over selected period.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No data available</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
                <CardDescription>Average over selected period.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                             <XAxis type="number" hide />
                             <YAxis 
                                dataKey="name" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} 
                                width={50}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
