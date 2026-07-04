import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api-server/, "") || "/";

    if (path === "/" || path === "") {
      return json({
        status: "online",
        server: "ExternalConnect API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: ["/ping", "/echo", "/data", "/time"],
      });
    }

    if (path === "/ping") {
      return json({ pong: true, latency_ms: 0, timestamp: new Date().toISOString() });
    }

    if (path === "/time") {
      const now = new Date();
      return json({
        utc: now.toISOString(),
        unix: Math.floor(now.getTime() / 1000),
        human: now.toUTCString(),
      });
    }

    if (path === "/echo") {
      let body: unknown = null;
      if (req.method === "POST") {
        try { body = await req.json(); } catch { body = null; }
      }
      return json({
        method: req.method,
        path,
        headers: Object.fromEntries(
          [...req.headers.entries()].filter(([k]) =>
            ["content-type", "user-agent", "x-forwarded-for"].includes(k)
          )
        ),
        query: Object.fromEntries(url.searchParams.entries()),
        body,
        echoed_at: new Date().toISOString(),
      });
    }

    if (path === "/data") {
      return json({
        records: [
          { id: 1, name: "Alpha", value: 42, active: true },
          { id: 2, name: "Beta", value: 17, active: false },
          { id: 3, name: "Gamma", value: 99, active: true },
        ],
        total: 3,
        fetched_at: new Date().toISOString(),
      });
    }

    return json({ error: "Not found", path }, 404);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});