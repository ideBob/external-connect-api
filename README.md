# ExternalConnect API

A modern API testing dashboard with GitHub integration and real-time monitoring.

## Features

- **Home Page** - API testing with auto-generated connection scripts in Node.js, Python, Bash, Luau, and cURL
- **How It Works** - Architecture documentation explaining the request lifecycle
- **GitHub Connect** - Token-based GitHub API integration to view your profile and repositories
- **Logs Page** - Real-time connection monitoring with status notifications for your Luau scripts
- **Dark/Light Theme** - Full theme support with system preference detection
- **Responsive Design** - Works on mobile, tablet, and desktop

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4 + shadcn/ui
- Supabase Edge Functions (Deno runtime)
- Recharts for latency visualization

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Server status & available endpoints |
| GET | /ping | Health check — responds with pong |
| GET | /time | Current UTC time in multiple formats |
| GET | /data | Sample data records from the server |
| POST | /echo | Echo back request details |

## License

MIT
