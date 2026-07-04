import * as React from "react"
import {
  BellIcon,
  CheckCircle2Icon,
  XCircleIcon,
  RefreshCwIcon,
  ActivityIcon,
  TerminalIcon,
  ServerIcon,
  WifiIcon,
  WifiOffIcon,
  ClockIcon,
  ZapIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const SERVER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-server`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

type LogEntry = {
  id: number
  timestamp: Date
  type: "success" | "error" | "info" | "warning"
  message: string
  details?: string
}

type ServerStatus = {
  online: boolean
  lastChecked: Date | null
  latency: number | null
  version: string | null
}

function StatusIndicator({ online }: { online: boolean }) {
  return (
    <span className="relative flex size-3">
      <span className={cn("absolute inset-0 rounded-full animate-ping", online ? "bg-green-500" : "bg-red-500")} style={{ animationDuration: "1.5s" }} />
      <span className={cn("relative rounded-full size-3", online ? "bg-green-500" : "bg-red-500")} />
    </span>
  )
}

function LogRow({ log }: { log: LogEntry }) {
  const iconMap = {
    success: <CheckCircle2Icon className="size-4 text-green-500 shrink-0" />,
    error: <XCircleIcon className="size-4 text-red-500 shrink-0" />,
    warning: <AlertTriangleIcon className="size-4 text-amber-500 shrink-0" />,
    info: <ActivityIcon className="size-4 text-blue-500 shrink-0" />,
  }

  return (
    <div className="flex items-start gap-3 py-3 px-4 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="mt-0.5">{iconMap[log.type]}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{log.message}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">{log.timestamp.toLocaleTimeString()}</Badge>
        </div>
        {log.details && <p className="mt-1 text-xs text-muted-foreground font-mono truncate">{log.details}</p>}
      </div>
    </div>
  )
}

export function LogsPage() {
  const [status, setStatus] = React.useState<ServerStatus>({ online: false, lastChecked: null, latency: null, version: null })
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [checking, setChecking] = React.useState(false)
  const [autoRefresh, setAutoRefresh] = React.useState(true)
  const logIdRef = React.useRef(0)

  const addLog = (type: LogEntry["type"], message: string, details?: string) => {
    logIdRef.current += 1
    setLogs((prev) => [{ id: logIdRef.current, timestamp: new Date(), type, message, details }, ...prev])
  }

  const checkServer = React.useCallback(async () => {
    setChecking(true)
    const start = Date.now()

    try {
      const res = await fetch(`${SERVER_URL}/ping`, { headers: { Authorization: `Bearer ${ANON_KEY}` } })
      const latency = Date.now() - start

      if (res.ok) {
        const data = await res.json()
        setStatus({ online: true, lastChecked: new Date(), latency, version: data.version ?? "1.0.0" })
        addLog("success", "API server is online", `Latency: ${latency}ms — Pong received`)
        toast.success("API Connected", { description: `Your Luau script can connect. Latency: ${latency}ms` })
      } else {
        throw new Error(`Server returned ${res.status}`)
      }
    } catch (e) {
      setStatus({ online: false, lastChecked: new Date(), latency: null, version: null })
      addLog("error", "API server is offline", (e as Error).message)
      toast.error("API Disconnected", { description: "Unable to reach the server. Check your connection." })
    } finally {
      setChecking(false)
    }
  }, [])

  React.useEffect(() => { checkServer() }, [])

  React.useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(checkServer, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, checkServer])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      {/* Connection Status Banner */}
      <div className={cn("mb-8 rounded-2xl border p-6 transition-all duration-500", status.online ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5")}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn("flex size-14 items-center justify-center rounded-2xl", status.online ? "bg-green-500/10" : "bg-red-500/10")}>
              {status.online ? <WifiIcon className="size-7 text-green-500" /> : <WifiOffIcon className="size-7 text-red-500" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusIndicator online={status.online} />
                <h2 className="text-xl font-bold">{status.online ? "API Connected" : "API Disconnected"}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {status.online ? "Your Luau script can successfully communicate with the server." : "Unable to reach the API server. Check network connection."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={checkServer} disabled={checking}>
              <RefreshCwIcon className={cn("size-3.5", checking && "animate-spin")} />Refresh
            </Button>
          </div>
        </div>

        {/* Status Details */}
        {status.online && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-background/50 border border-border/40 px-4 py-3">
              <div className="text-xs text-muted-foreground mb-1">Latency</div>
              <div className="flex items-center gap-1.5">
                <ZapIcon className="size-4 text-amber-500" />
                <span className="text-lg font-bold tabular-nums">{status.latency}ms</span>
              </div>
            </div>
            <div className="rounded-lg bg-background/50 border border-border/40 px-4 py-3">
              <div className="text-xs text-muted-foreground mb-1">Last Checked</div>
              <div className="flex items-center gap-1.5">
                <ClockIcon className="size-4 text-blue-500" />
                <span className="text-lg font-bold tabular-nums">{status.lastChecked?.toLocaleTimeString() ?? "—"}</span>
              </div>
            </div>
            <div className="rounded-lg bg-background/50 border border-border/40 px-4 py-3">
              <div className="text-xs text-muted-foreground mb-1">Version</div>
              <div className="flex items-center gap-1.5">
                <ServerIcon className="size-4 text-purple-500" />
                <span className="text-lg font-bold">{status.version ?? "—"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Good Sign Notification */}
      {status.online && (
        <Card className="mb-8 border-green-500/30 bg-green-500/5">
          <CardContent className="pt-5 pb-5 flex items-start gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-500/20 shrink-0">
              <CheckCircle2Icon className="size-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-green-500 mb-1">Good Sign — Everything Working</h3>
              <p className="text-sm text-muted-foreground">
                The API server responded successfully. Your Luau script should be able to connect and make requests. You can now use the endpoints in your script:
              </p>
              <div className="mt-3 rounded-lg bg-black/40 p-3 font-mono text-xs overflow-x-auto">
                <code>{SERVER_URL}/ping — Health check{"\n"}{SERVER_URL}/data — Sample data{"\n"}{SERVER_URL}/echo — Echo POST body</code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-refresh toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2"><BellIcon className="size-4.5" />Activity Log</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Auto-refresh</span>
          <Button variant={autoRefresh ? "secondary" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? "On" : "Off"}
          </Button>
        </div>
      </div>

      {/* Logs */}
      <Card className="border-border/40 bg-card/30">
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <TerminalIcon className="size-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Waiting for activity...</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">{logs.map((log) => <LogRow key={log.id} log={log} />)}</div>
          )}
        </CardContent>
      </Card>

      {logs.length > 0 && <p className="mt-3 text-center text-xs text-muted-foreground">Logs are kept in memory and reset on page reload.</p>}
    </div>
  )
}
