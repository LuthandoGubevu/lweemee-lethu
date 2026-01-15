
"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface AudienceGenderChartProps {
    data?: {
        male: number;
        female: number;
        other: number;
    }
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

export function AudienceGenderChart({ data }: AudienceGenderChartProps) {
  const chartData = [
    { name: "Female", value: data?.female || 0, fill: "var(--color-female)" },
    { name: "Male", value: data?.male || 0, fill: "var(--color-male)" },
    { name: "Other", value: data?.other || 0, fill: "var(--color-other)" },
  ].filter(d => d.value > 0);

  const chartConfig = {
    female: { label: "Female", color: "hsl(var(--chart-1))" },
    male: { label: "Male", color: "hsl(var(--chart-2))" },
    other: { label: "Other", color: "hsl(var(--chart-3))" },
  }

  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (totalValue === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Average over selected period.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[250px]">
                <p className="text-muted-foreground">No data available</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gender Distribution</CardTitle>
        <CardDescription>Average over selected period.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Audience is primarily {chartData[0].name.toLowerCase()}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing data for {chartData.length} gender categories
        </div>
      </CardFooter>
    </Card>
  )
}
