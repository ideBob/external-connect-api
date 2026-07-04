import * as React from "react"
import {
  ServerIcon,
  ShieldCheckIcon,
  ZapIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  GlobeIcon,
  LockIcon,
  CodeIcon,
  NetworkIcon,
  BracesIcon,
  CheckCircleIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const SERVER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-server`

function CodeBlock({ code, lang = "typescript" }: { code: string; lang?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-black/40">
      <div className="flex items-center gap-2 border-b border-border/40 px-3 sm:px-4 py-2">
        <div className="size-3 rounded-full bg-destructive/70" />
        <div className="size-3 rounded-full bg-amber-500/70" />
        <div className="size-3 rounded-full bg-green-500/70" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">{lang}</span>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 sm:p-5 text-xs leading-relaxed font-mono text-foreground/80 whitespace-pre"><code>{code}</code></pre>
      </div>
    </div>
  )
}

function Step({ n, title, children, last = false }: { n: number; title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className="flex gap-4 sm:gap-5">
      <div className="shrink-0 flex flex-col items-center">
        <div className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary">{n}</div>
        {!last && <div className="mt-2 w-px flex-1 bg-border/40" />}
      </div>
      <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-10")}>
        <h3 className="scroll-m-20 text-base sm:text-lg font-semibold tracking-tight mb-2">{title}</h3>
        <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}

const ARCH_BOXES = [
  { icon: <CodeIcon className="size-4 sm:size-5" />, label: "Your Script", sub: "Node.js / Python / Bash" },
  { icon: <LockIcon className="size-4 sm:size-5" />, label: "HTTPS + Bearer", sub: "TLS 1.3 encrypted" },
  { icon: <GlobeIcon className="size-4 sm:size-5" />, label: "Edge Network", sub: "35+ regions" },
  { icon: <ServerIcon className="size-4 sm:size-5" />, label: "Deno Runtime", sub: "Supabase Edge" },
  { icon: <BracesIcon className="size-4 sm:size-5" />, label: "JSON Response", sub: "< 200ms typical" },
]

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-12 sm:mb-16 text-center">
        <Badge variant="outline" className="mb-4 gap-1.5"><NetworkIcon className="size-3" />Architecture</Badge>
        <h1 className="scroll-m-20 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">How It Really Works</h1>
        <p className="mx-auto mt-4 max-w-lg text-base sm:text-lg text-muted-foreground">
          A deep-dive into the request lifecycle, edge runtime, authentication model, and response format.
        </p>
      </div>

      {/* Architecture Flow */}
      <div className="mb-12 sm:mb-16">
        <h2 className="scroll-m-20 text-xl sm:text-2xl font-semibold tracking-tight mb-6 sm:mb-8">Architecture Overview</h2>
        <div className="rounded-2xl border border-border/40 bg-card/30 p-5 sm:p-8">
          {/* Mobile: vertical */}
          <div className="flex flex-col items-center gap-0 md:hidden">
            {ARCH_BOXES.map((box, i) => (
              <React.Fragment key={box.label}>
                <div className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-background/50 w-full max-w-xs px-5 py-4 text-center">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{box.icon}</div>
                  <div>
                    <div className="text-sm font-semibold">{box.label}</div>
                    <div className="text-xs text-muted-foreground">{box.sub}</div>
                  </div>
                </div>
                {i < ARCH_BOXES.length - 1 && <ArrowDownIcon className="my-2 size-4 shrink-0 text-muted-foreground/40" />}
              </React.Fragment>
            ))}
          </div>
          {/* Desktop: horizontal */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-2">
            {ARCH_BOXES.map((box, i) => (
              <React.Fragment key={box.label}>
                <div className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-background/50 px-5 py-4 text-center">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{box.icon}</div>
                  <div>
                    <div className="text-sm font-semibold">{box.label}</div>
                    <div className="text-xs text-muted-foreground">{box.sub}</div>
                  </div>
                </div>
                {i < ARCH_BOXES.length - 1 && <ArrowRightIcon className="size-5 shrink-0 text-muted-foreground/50" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Step by step */}
      <div className="mb-12 sm:mb-16">
        <h2 className="scroll-m-20 text-xl sm:text-2xl font-semibold tracking-tight mb-6 sm:mb-8">Request Lifecycle</h2>
        <div>
          <Step n={1} title="Your script builds the request">
            Your client (any language with HTTP support) constructs a request to the server URL. You set the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Authorization</code> header with your Bearer token — this is your API key.
            <div className="mt-3">
              <CodeBlock lang="bash" code={`curl "${SERVER_URL}/ping" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`} />
            </div>
          </Step>

          <Step n={2} title="TLS handshake + DNS resolution">
            The request travels over HTTPS (TLS 1.3). Your API key never crosses the wire in plain text — it's encrypted inside the TLS tunnel. DNS resolves to the nearest edge node in Supabase's global network.
          </Step>

          <Step n={3} title="Edge network routes to nearest instance">
            Supabase Edge Functions run on Deno Deploy's edge network — over 35 regions worldwide. Your request is handled by the closest available instance, minimising round-trip time. Cold starts are rare but can add ~50–150ms on first invocation.
          </Step>

          <Step n={4} title="Deno runtime validates + processes">
            The Edge Function receives your request. It extracts the route from the URL path and dispatches to the right handler. There's no database query for most routes — responses are computed in-memory.
            <div className="mt-3">
              <CodeBlock lang="typescript" code={`Deno.serve(async (req: Request) => {\n  const url = new URL(req.url);\n  const path = url.pathname.replace(/^\\/api-server/, "");\n\n  if (path === "/ping") {\n    return json({ pong: true, timestamp: new Date().toISOString() });\n  }\n  if (path === "/time") {\n    const now = new Date();\n    return json({ utc: now.toISOString(), unix: Math.floor(now.getTime() / 1000) });\n  }\n  // ... more routes\n});`} />
            </div>
          </Step>

          <Step n={5} title="JSON response returns with CORS headers" last>
            Every response — success, error, and preflight OPTIONS — includes the mandatory CORS headers so any browser or script can consume the API without restrictions.
            <div className="mt-3">
              <CodeBlock lang="typescript" code={`const corsHeaders = {\n  "Access-Control-Allow-Origin": "*",\n  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",\n  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",\n};\n\nreturn new Response(JSON.stringify(data), {\n  headers: { ...corsHeaders, "Content-Type": "application/json" },\n});`} />
            </div>
          </Step>
        </div>
      </div>

      <Separator className="my-10 sm:my-12 bg-border/40" />

      {/* Auth model */}
      <div className="mb-12 sm:mb-16">
        <h2 className="scroll-m-20 text-xl sm:text-2xl font-semibold tracking-tight mb-4">Authentication Model</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          ExternalConnect uses the Supabase anonymous key as a Bearer token. This is not a secret — it's designed to be embedded in client-side scripts. Access control is enforced at the database layer via Row Level Security, not at the API key layer.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: <ShieldCheckIcon className="size-5 text-green-400" />, title: "Bearer Token", body: "Include Authorization: Bearer on every request. Requests without a valid token are rejected with 401." },
            { icon: <LockIcon className="size-5 text-blue-400" />, title: "TLS Encrypted", body: "The API key and all request/response data is encrypted in transit using TLS 1.3. It is never visible on the wire." },
            { icon: <ZapIcon className="size-5 text-amber-400" />, title: "Anon Key", body: "The key embedded in your script is the Supabase anon key — public by design for read access. Sensitive ops require a service role key." },
          ].map((c) => (
            <Card key={c.title} className="border-border/40 bg-card/40">
              <CardHeader>
                {c.icon}
                <CardTitle className="text-sm">{c.title}</CardTitle>
                <CardDescription className="text-xs">{c.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-10 sm:my-12 bg-border/40" />

      {/* Endpoints reference */}
      <div className="mb-12 sm:mb-16">
        <h2 className="scroll-m-20 text-xl sm:text-2xl font-semibold tracking-tight mb-4">Endpoint Details</h2>
        <div className="space-y-4">
          {[
            { method: "GET", path: "/", body: null, response: `{ "status": "online", "server": "ExternalConnect API", "version": "1.0.0", "timestamp": "...", "endpoints": ["/ping", "/echo", "/data", "/time"] }` },
            { method: "GET", path: "/ping", body: null, response: `{ "pong": true, "latency_ms": 0, "timestamp": "2026-07-02T14:16:39.729Z" }` },
            { method: "GET", path: "/time", body: null, response: `{ "utc": "2026-07-02T14:16:39.729Z", "unix": 1751466999, "human": "Wed, 02 Jul 2026 14:16:39 GMT" }` },
            { method: "GET", path: "/data", body: null, response: `{ "records": [ { "id": 1, "name": "Alpha", "value": 42, "active": true }, ... ], "total": 3 }` },
            { method: "POST", path: "/echo", body: `{ "message": "hello" }`, response: `{ "method": "POST", "path": "/echo", "body": { "message": "hello" }, "echoed_at": "..." }` },
          ].map((ep) => (
            <Card key={ep.path} className="border-border/40 bg-card/30">
              <CardContent className="pt-4 sm:pt-5 px-4 sm:px-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                  <Badge variant={ep.method === "POST" ? "secondary" : "outline"} className="font-mono text-xs shrink-0">{ep.method}</Badge>
                  <code className="font-mono text-xs sm:text-sm text-foreground break-all">{SERVER_URL}{ep.path}</code>
                </div>
                {ep.body && (
                  <div className="mb-2">
                    <div className="text-xs text-muted-foreground mb-1">Request body</div>
                    <div className="overflow-x-auto">
                      <pre className="rounded-lg bg-black/40 p-3 text-xs font-mono text-foreground/70 whitespace-pre">{ep.body}</pre>
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mb-1">Response</div>
                <div className="overflow-x-auto">
                  <pre className="rounded-lg bg-black/40 p-3 text-xs font-mono text-foreground/70 whitespace-pre">{ep.response}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="scroll-m-20 text-xl sm:text-2xl font-semibold tracking-tight mb-6">Common Questions</h2>
        <div className="space-y-3 sm:space-y-4">
          {[
            { q: "Why is the first request slow?", a: "Edge Functions have a cold start if no request has hit that region recently. This typically adds 50–200ms once, then subsequent requests are fast." },
            { q: "Can I use this from a browser?", a: "Yes. The CORS headers allow any origin, so you can call the API from JavaScript running in any browser without a proxy." },
            { q: "Is the anon key safe to share?", a: "The anon key is intentionally public — it can only access what Row Level Security allows. For operations that require elevated privileges, use a service role key (never embed that in client code)." },
            { q: "What's the rate limit?", a: "Supabase Edge Functions have generous limits on the free tier. For production workloads, review the Supabase plan limits." },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-border/40 bg-card/30 px-4 sm:px-5 py-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <div className="text-sm font-semibold mb-1">{item.q}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{item.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
