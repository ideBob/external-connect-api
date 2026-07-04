import * as React from "react"
import {
  ServerIcon,
  ZapIcon,
  PlayIcon,
  CheckCircleIcon,
  CodeIcon,
  GlobeIcon,
  ShieldCheckIcon,
  CopyIcon,
  RefreshCwIcon,
  TerminalIcon,
  ActivityIcon,
  NetworkIcon,
  ChevronRightIcon,
  MenuIcon,
  ScrollTextIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LatencyChart, type LatencyEntry } from "@/components/LatencyChart"
import { HowItWorksPage } from "@/pages/HowItWorksPage"
import { GitHubConnectPage } from "@/pages/GitHubConnectPage"
import { LogsPage } from "@/pages/LogsPage"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

const SERVER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-server`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

type Page = "home" | "how-it-works" | "github" | "logs"

type Endpoint = { method: "GET" | "POST"; path: string; description: string }

const ENDPOINTS: Endpoint[] = [
  { method: "GET", path: "/", description: "Server status & available endpoints" },
  { method: "GET", path: "/ping", description: "Health check — responds with pong" },
  { method: "GET", path: "/time", description: "Current UTC time in multiple formats" },
  { method: "GET", path: "/data", description: "Sample data records from the server" },
  { method: "POST", path: "/echo", description: "Echo back request details" },
]

type Lang = "nodejs" | "python" | "bash" | "curl" | "luau"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.393.1 2.646.64.698 1.028 1.59 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .269.18.58.688.482C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

function generateScript(lang: Lang): string {
  const url = SERVER_URL
  const key = ANON_KEY
  if (lang === "nodejs") return `// ExternalConnect — Node.js client
// Node 18+ has built-in fetch

const SERVER_URL = "${url}";
const API_KEY = "${key}";

const headers = {
  "Authorization": \`Bearer \${API_KEY}\`,
  "Content-Type": "application/json",
};

async function ping() {
  const res = await fetch(\`\${SERVER_URL}/ping\`, { headers });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

async function getTime() {
  const res = await fetch(\`\${SERVER_URL}/time\`, { headers });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

async function getData() {
  const res = await fetch(\`\${SERVER_URL}/data\`, { headers });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

async function echo(body) {
  const res = await fetch(\`\${SERVER_URL}/echo\`, {
    method: "POST", headers, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

(async () => {
  console.log("Connecting to external server...");
  const pong = await ping();
  console.log("Ping:", pong);
  const time = await getTime();
  console.log("Server time:", time.utc);
  const data = await getData();
  console.log("Records:", data.records.length);
})();
`
  if (lang === "python") return `# ExternalConnect — Python client
# pip install requests

import requests

SERVER_URL = "${url}"
API_KEY = "${key}"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

def ping():
    r = requests.get(f"{SERVER_URL}/ping", headers=HEADERS)
    r.raise_for_status()
    return r.json()

def get_time():
    r = requests.get(f"{SERVER_URL}/time", headers=HEADERS)
    r.raise_for_status()
    return r.json()

def get_data():
    r = requests.get(f"{SERVER_URL}/data", headers=HEADERS)
    r.raise_for_status()
    return r.json()

def echo(body: dict):
    r = requests.post(f"{SERVER_URL}/echo", json=body, headers=HEADERS)
    r.raise_for_status()
    return r.json()

if __name__ == "__main__":
    print("Connecting...")
    print("Ping:", ping())
    print("Time:", get_time()["utc"])
    print("Records:", len(get_data()["records"]))
`
  if (lang === "bash") return `#!/usr/bin/env bash
# ExternalConnect — Bash client (requires curl, jq)

SERVER_URL="${url}"
API_KEY="${key}"

call() {
  local method="$1" path="$2" body="$3"
  if [ "$method" = "POST" ]; then
    curl -s -X POST "\${SERVER_URL}\${path}" \\
      -H "Authorization: Bearer \${API_KEY}" \\
      -H "Content-Type: application/json" \\
      -d "\${body}"
  else
    curl -s "\${SERVER_URL}\${path}" \\
      -H "Authorization: Bearer \${API_KEY}"
  fi
}

echo "--- Ping ---"
call GET /ping | jq .

echo "--- Server Time ---"
call GET /time | jq .utc

echo "--- Data Records ---"
call GET /data | jq '.records | length'

echo "--- Echo ---"
call POST /echo '{"hello":"world"}' | jq .body
`
  if (lang === "luau") return `-- ExternalConnect — Luau client (Roblox)

local SERVER_URL = "${url}"
local API_KEY = "${key}"
local HttpService = game:GetService("HttpService")

local headers = {
    ["Authorization"] = "Bearer " .. API_KEY,
    ["Content-Type"] = "application/json",
}

local function request(method, path, body)
    local opts = { Url = SERVER_URL .. path, Method = method, Headers = headers }
    if body then opts.Body = HttpService:JSONEncode(body) end
    local res = HttpService:RequestAsync(opts)
    if not res.Success then error("HTTP " .. res.StatusCode) end
    return HttpService:JSONDecode(res.Body)
end

local ping = function() return request("GET", "/ping") end
local getTime = function() return request("GET", "/time") end
local getData = function() return request("GET", "/data") end
local echo = function(b) return request("POST", "/echo", b) end

print("Ping:", ping().pong)
print("Time:", getTime().utc)
print("Records:", #getData().records)
`
  return `# ExternalConnect — cURL examples

SERVER="${url}"
KEY="${key}"

# Health check
curl "$SERVER/ping" -H "Authorization: Bearer $KEY"

# Server time
curl "$SERVER/time" -H "Authorization: Bearer $KEY"

# Fetch data
curl "$SERVER/data" -H "Authorization: Bearer $KEY"

# Echo (POST)
curl -X POST "$SERVER/echo" \\
  -H "Authorization: Bearer $KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"hello from curl"}'
`
}

function useInView(threshold = 0.12) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </div>
  )
}

function StatusBadge({ online }: { online: boolean | null }) {
  if (online === null)
    return (
      <Badge variant="outline" className="gap-1.5 text-xs">
        <span className="size-1.5 rounded-full bg-muted-foreground inline-block" />
        <span className="hidden sm:inline">Checking</span>
      </Badge>
    )
  if (online)
    return (
      <Badge variant="outline" className="gap-1.5 border-green-500/30 text-green-400 text-xs">
        <span className="size-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
        <span className="hidden sm:inline">Online</span>
      </Badge>
    )
  return (
    <Badge variant="destructive" className="gap-1.5 text-xs">
        <span className="size-1.5 rounded-full bg-white inline-block" />
        <span className="hidden sm:inline">Offline</span>
      </Badge>
    )
}

function CopyButton({ text }: { text: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle")
  const copy = async () => {
    const ok = await copyToClipboard(text)
    setState(ok ? "copied" : "failed")
    setTimeout(() => setState("idle"), 2000)
  }
  return (
    <Button size="sm" variant="ghost" onClick={copy} className="gap-1.5">
      {state === "copied"
        ? <CheckCircleIcon className="size-3.5 text-green-400" />
        : state === "failed"
        ? <CopyIcon className="size-3.5 text-destructive" />
        : <CopyIcon className="size-3.5" />}
      {state === "copied" ? "Copied!" : state === "failed" ? "Failed" : "Copy"}
    </Button>
  )
}

export function App() {
  const [page, setPage] = React.useState<Page>("home")
  const [serverOnline, setServerOnline] = React.useState<boolean | null>(null)
  const [selectedLang, setSelectedLang] = React.useState<Lang>("nodejs")
  const [apiResponse, setApiResponse] = React.useState<string | null>(null)
  const [apiLoading, setApiLoading] = React.useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = React.useState<Endpoint>(ENDPOINTS[0])
  const [latencyHistory, setLatencyHistory] = React.useState<LatencyEntry[]>([])
  const [callCount, setCallCount] = React.useState(0)
  const [heroVisible, setHeroVisible] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80)
    checkServer()
    return () => clearTimeout(t)
  }, [])

  async function checkServer() {
    setServerOnline(null)
    try {
      const res = await fetch(`${SERVER_URL}/ping`, {
        headers: { Authorization: `Bearer ${ANON_KEY}` },
      })
      setServerOnline(res.ok)
    } catch {
      setServerOnline(false)
    }
  }

  async function callEndpoint(endpoint: Endpoint) {
    setApiLoading(true)
    setApiResponse(null)
    const t0 = performance.now()
    try {
      const opts: RequestInit = {
        method: endpoint.method,
        headers: { Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json" },
      }
      if (endpoint.method === "POST") {
        opts.body = JSON.stringify({ message: "test from browser", timestamp: new Date().toISOString() })
      }
      const res = await fetch(`${SERVER_URL}${endpoint.path}`, opts)
      const latency = Math.round(performance.now() - t0)
      const data = await res.json()
      setApiResponse(JSON.stringify(data, null, 2))
      const n = callCount + 1
      setCallCount(n)
      setLatencyHistory((prev) => [
        ...prev.slice(-19),
        { call: String(n), latency, endpoint: endpoint.path || "/", status: res.ok ? "success" : "error" },
      ])
    } catch (e) {
      const latency = Math.round(performance.now() - t0)
      setApiResponse(`Error: ${(e as Error).message}`)
      const n = callCount + 1
      setCallCount(n)
      setLatencyHistory((prev) => [
        ...prev.slice(-19),
        { call: String(n), latency, endpoint: endpoint.path || "/", status: "error" },
      ])
    } finally {
      setApiLoading(false)
    }
  }

  const script = generateScript(selectedLang)
  const scriptFilename =
    selectedLang === "nodejs" ? "connect.js"
    : selectedLang === "python" ? "connect.py"
    : selectedLang === "luau" ? "connect.luau"
    : "connect.sh"

  function navigate(p: Page) {
    setPage(p)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] sm:h-[600px] sm:w-[900px] rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] rounded-full bg-chart-1/[0.05] blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <button onClick={() => navigate("home")} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ServerIcon className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">ExternalConnect</span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Button variant={page === "home" ? "secondary" : "ghost"} size="sm" onClick={() => navigate("home")} className="gap-1.5">
              <ActivityIcon className="size-3.5" />Home
            </Button>
            <Button variant={page === "how-it-works" ? "secondary" : "ghost"} size="sm" onClick={() => navigate("how-it-works")} className="gap-1.5">
              <NetworkIcon className="size-3.5" />How It Works
            </Button>
            <Button variant={page === "github" ? "secondary" : "ghost"} size="sm" onClick={() => navigate("github")} className="gap-1.5">
              <GitHubIcon className="size-3.5" />GitHub
            </Button>
            <Button variant={page === "logs" ? "secondary" : "ghost"} size="sm" onClick={() => navigate("logs")} className="gap-1.5">
              <ScrollTextIcon className="size-3.5" />Logs
            </Button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <StatusBadge online={serverOnline} />

            {/* Mobile hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 flex flex-col gap-0">
                <SheetHeader className="pb-4 border-b border-border/50">
                  <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <ServerIcon className="size-3.5" />
                    </div>
                    ExternalConnect
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 pt-6">
                  <Button variant={page === "home" ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={() => navigate("home")}>
                    <ActivityIcon className="size-4" />Home
                  </Button>
                  <Button variant={page === "how-it-works" ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={() => navigate("how-it-works")}>
                    <NetworkIcon className="size-4" />How It Works
                  </Button>
                  <Button variant={page === "github" ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={() => navigate("github")}>
                    <GitHubIcon className="size-4" />GitHub
                  </Button>
                  <Button variant={page === "logs" ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={() => navigate("logs")}>
                    <ScrollTextIcon className="size-4" />Logs
                  </Button>
                </div>
                <Separator className="mt-4 mb-4 bg-border/40" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Server</span>
                  <StatusBadge online={serverOnline} />
                </div>
                <Button size="sm" variant="ghost" onClick={() => { checkServer(); setMobileMenuOpen(false) }} className="mt-2 w-full justify-start gap-2 text-xs">
                  <RefreshCwIcon className="size-3.5" />Refresh status
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {page === "how-it-works" ? (
        <HowItWorksPage />
      ) : page === "github" ? (
        <GitHubConnectPage />
      ) : page === "logs" ? (
        <LogsPage />
      ) : (
        <>
          {/* Hero */}
          <section className="relative mx-auto max-w-6xl px-4 py-14 sm:py-24 text-center">
            <div className={cn("transition-all duration-700 ease-out", heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
              <Badge variant="secondary" className="mb-4 sm:mb-5 gap-1.5 px-3 py-1">
                <span className="size-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                External Server Live
              </Badge>
              <h1 className="scroll-m-20 text-4xl sm:text-5xl font-extrabold tracking-tight text-balance leading-tight">
                Connect Your Script to{" "}
                <span className="bg-gradient-to-br from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                  an External Server
                </span>
              </h1>
              <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-xl text-muted-foreground leading-relaxed">
                A live edge API with auto-generated connection scripts in Node.js, Python, Bash, Luau, and cURL — copy and run it anywhere.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
                <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={() => document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" })}>
                  <CodeIcon className="size-4" />Get Connection Script
                </Button>
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => document.getElementById("tester")?.scrollIntoView({ behavior: "smooth" })}>
                  <PlayIcon className="size-4" />Test Live API
                </Button>
                <Button size="lg" variant="ghost" className="gap-2 w-full sm:w-auto" onClick={() => navigate("how-it-works")}>
                  <NetworkIcon className="size-4" />How It Works<ChevronRightIcon className="size-3.5 opacity-60" />
                </Button>
              </div>
            </div>
          </section>

          {/* Stats bar */}
          <AnimatedSection>
            <div className="border-y border-border/40 bg-card/20">
              <div className="mx-auto max-w-6xl px-4 py-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[{ label: "Regions", value: "35+", sub: "Edge nodes" }, { label: "Endpoints", value: "5", sub: "Live routes" }, { label: "Languages", value: "5", sub: "Script formats" }, { label: "Auth", value: "Bearer", sub: "TLS 1.3 encrypted" }].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-xl sm:text-2xl font-bold tabular-nums">{s.value}</div>
                      <div className="text-sm font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Feature cards */}
          <section className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: <GlobeIcon className="size-7 text-chart-1" />, title: "Live External Server", desc: "A fully hosted API running on Deno Deploy's edge infrastructure — globally distributed with < 200ms latency worldwide.", delay: 0 },
                { icon: <CodeIcon className="size-7 text-chart-2" />, title: "Auto-Generated Scripts", desc: "Download a connection script in Node.js, Python, Bash, Luau, or cURL pre-configured with your server URL and API key.", delay: 100 },
                { icon: <ShieldCheckIcon className="size-7 text-chart-3" />, title: "Secure by Default", desc: "Every request uses Bearer token authentication over TLS 1.3. Your API key is embedded directly into the script.", delay: 200 },
              ].map((c) => (
                <AnimatedSection key={c.title} delay={c.delay}>
                  <Card className="h-full border-border/50 bg-card/50 transition-colors duration-200 hover:bg-card/80">
                    <CardHeader>
                      <div className="mb-3">{c.icon}</div>
                      <CardTitle className="text-base">{c.title}</CardTitle>
                      <CardDescription>{c.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </section>

          <Separator className="mx-auto max-w-6xl bg-border/30" />

          {/* Script Generator */}
          <section id="generator" className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
            <AnimatedSection>
              <div className="mb-6 sm:mb-8">
                <Badge variant="outline" className="mb-3 gap-1.5"><ZapIcon className="size-3" />Script Generator</Badge>
                <h2 className="scroll-m-20 text-2xl sm:text-3xl font-semibold tracking-tight">Download Your Connection Script</h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Pick a language and download a ready-to-run script with your server URL and API key baked in.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="border-b border-border/50 p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <TerminalIcon className="size-4 text-muted-foreground shrink-0" />
                      <span className="font-mono text-sm text-muted-foreground truncate">{scriptFilename}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v as Lang)}>
                        <SelectTrigger className="w-32 sm:w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nodejs">Node.js</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="bash">Bash</SelectItem>
                          <SelectItem value="curl">cURL</SelectItem>
                          <SelectItem value="luau">Luau</SelectItem>
                        </SelectContent>
                      </Select>
                      <CopyButton text={script} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto rounded-b-xl bg-black/30">
                    <pre className="p-4 sm:p-6 text-xs leading-relaxed font-mono text-foreground/75 whitespace-pre"><code>{script}</code></pre>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </section>

          <Separator className="mx-auto max-w-6xl bg-border/30" />

          {/* Live API Tester */}
          <section id="tester" className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
            <AnimatedSection>
              <div className="mb-6 sm:mb-8">
                <Badge variant="outline" className="mb-3 gap-1.5"><PlayIcon className="size-3" />Live Tester</Badge>
                <h2 className="scroll-m-20 text-2xl sm:text-3xl font-semibold tracking-tight">Test the External Server</h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Call the live API from your browser and see the real response. Every call is tracked in the latency graph below.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="grid gap-4 lg:grid-cols-5">
                <div className="lg:col-span-2 min-w-0">
                  <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-hide">
                    {ENDPOINTS.map((ep) => (
                      <button key={ep.path} onClick={() => setSelectedEndpoint(ep)} className={cn("shrink-0 rounded-lg border px-3 py-2 text-left transition-all duration-200", selectedEndpoint.path === ep.path ? "border-primary/40 bg-primary/10" : "border-border/50 bg-card/40")}>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={ep.method === "POST" ? "secondary" : "outline"} className="shrink-0 font-mono text-[10px] px-1.5 py-0">{ep.method}</Badge>
                          <span className="font-mono text-xs font-medium whitespace-nowrap">{ep.path || "/"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="hidden lg:flex flex-col gap-2">
                    {ENDPOINTS.map((ep) => (
                      <button key={ep.path} onClick={() => setSelectedEndpoint(ep)} className={cn("w-full rounded-xl border px-4 py-3 text-left transition-all duration-200", selectedEndpoint.path === ep.path ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/40 hover:bg-card/70")}>
                        <div className="flex items-center gap-2">
                          <Badge variant={ep.method === "POST" ? "secondary" : "outline"} className="shrink-0 font-mono text-xs">{ep.method}</Badge>
                          <span className="font-mono text-sm font-medium">{ep.path || "/"}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{ep.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader className="border-b border-border/50 p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10px] sm:text-xs text-muted-foreground truncate">
                            <span className="text-foreground/60">{selectedEndpoint.method}</span>{" }…/api-server{selectedEndpoint.path}
                          </p>
                        </div>
                        <Button size="sm" id="send-btn" onClick={() => callEndpoint(selectedEndpoint)} disabled={apiLoading} className="shrink-0 gap-1.5">
                          {apiLoading ? <RefreshCwIcon className="size-3.5 animate-spin" /> : <PlayIcon className="size-3.5" />}
                          <span className="hidden xs:inline">{apiLoading ? "Running…" : "Send"}</span>
                          <span className="xs:hidden">{apiLoading ? "…" : "Send"}</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto rounded-b-xl bg-black/30">
                        <pre className={cn("min-h-[180px] sm:min-h-[260px] p-4 sm:p-6 text-xs font-mono leading-relaxed whitespace-pre transition-colors duration-200", apiResponse ? "text-foreground/80" : "text-muted-foreground")}>
                          {apiLoading ? "Sending request…" : apiResponse ?? `// Select an endpoint and click Send\n// Response will appear here`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150} className="mt-6 sm:mt-8">
              <LatencyChart data={latencyHistory} />
            </AnimatedSection>
          </section>

          <Separator className="mx-auto max-w-6xl bg-border/30" />

          {/* API Reference */}
          <section className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
            <AnimatedSection>
              <h2 className="scroll-m-20 text-xl sm:text-2xl font-semibold tracking-tight mb-4 sm:mb-6">API Reference</h2>
              <div className="overflow-hidden rounded-xl border border-border/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Method</th>
                        <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Endpoint</th>
                        <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Description</th>
                        <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Auth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ENDPOINTS.map((ep, i) => (
                        <tr key={ep.path} className={cn("border-b border-border/30 transition-colors duration-150 hover:bg-muted/20", i % 2 === 1 ? "bg-muted/10" : "bg-transparent")}>
                          <td className="px-3 sm:px-4 py-3"><Badge variant={ep.method === "POST" ? "secondary" : "outline"} className="font-mono text-xs">{ep.method}</Badge></td>
                          <td className="px-3 sm:px-4 py-3 font-mono text-xs text-muted-foreground">{ep.path || "/"}</td>
                          <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-muted-foreground">{ep.description}</td>
                          <td className="px-3 sm:px-4 py-3"><Badge variant="outline" className="gap-1 text-xs"><ShieldCheckIcon className="size-3" />Bearer</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedSection>
          </section>

          {/* Footer */}
          <footer className="border-t border-border/40 py-6 sm:py-8">
            <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ServerIcon className="size-4" /><span>ExternalConnect — Live API Server</span></div>
              <div className="flex items-center gap-3">
                <StatusBadge online={serverOnline} />
                <Button size="xs" variant="ghost" onClick={checkServer} className="gap-1.5"><RefreshCwIcon className="size-3" />Refresh</Button>
                <Button size="xs" variant="ghost" onClick={() => navigate("how-it-works")} className="gap-1.5"><NetworkIcon className="size-3" />How It Works</Button>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}

export default App
