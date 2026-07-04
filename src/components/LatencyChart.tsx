import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUpIcon } from "lucide-react"

export type LatencyEntry = { call: string; latency: number; endpoint: string; status: "success" | "error" }

const chartConfig: ChartConfig = { latency: { label: "Latency", color: "var(--chart-1)" } }

export function LatencyChart({ data }: { data: LatencyEntry[] }) {
  if (data.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-2"><TrendingUpIcon className="size-4 text-muted-foreground" /><CardTitle className="text-base">API Response Times</CardTitle></div>
          <CardDescription>Make API calls above to see live latency data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border/50"><p className="text-sm text-muted-foreground">No data yet — send a request to start tracking</p></div>
        </CardContent>
      </Card>
    )
  }

  const avg = Math.round(data.reduce((s, d) => s + d.latency, 0) / data.length)
  const min = Math.min(...data.map((d) => d.latency))
  const max = Math.max(...data.map((d) => d.latency))

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><TrendingUpIcon className="size-4 text-muted-foreground" /><CardTitle className="text-base">API Response Times</CardTitle></div>
            <CardDescription className="mt-1">Last {data.length} call{data.length !== 1 ? "s" : ""}</CardDescription>
          </div>
          <div className="flex gap-5 text-sm">
            <div className="text-center"><div className="font-mono text-lg font-bold tabular-nums text-foreground">{avg}<span className="ml-0.5 text-xs font-normal text-muted-foreground">ms</span></div><div className="text-xs text-muted-foreground">avg</div></div>
            <div className="text-center"><div className="font-mono text-lg font-bold tabular-nums text-green-400">{min}<span className="ml-0.5 text-xs font-normal text-muted-foreground">ms</span></div><div className="text-xs text-muted-foreground">min</div></div>
            <div className="text-center"><div className="font-mono text-lg font-bold tabular-nums text-amber-400">{max}<span className="ml-0.5 text-xs font-normal text-muted-foreground">ms</span></div><div className="text-xs text-muted-foreground">max</div></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
            <XAxis dataKey="call" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }} label={{ value: "Call #", position: "insideBottom", offset: -2, fontSize: 10, fill: "oklch(0.556 0 0)" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }} tickFormatter={(v) => `${v}ms`} width={56} />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.endpoint ?? ""} formatter={(v) => [`${v}ms`, "Latency"]} indicator="line" />} />
            <Line type="monotone" dataKey="latency" stroke="var(--color-latency)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-latency)", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--color-latency)", fill: "var(--background)" }} animationDuration={400} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
