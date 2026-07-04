import * as React from "react"
import { KeyRoundIcon, UserIcon, BookMarkedIcon, StarIcon, GitForkIcon, UsersIcon, EyeIcon, RefreshCwIcon, CheckCircleIcon, XCircleIcon, LogOutIcon, ExternalLinkIcon, LockIcon, UnlockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.393.1 2.646.64.698 1.028 1.59 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .269.18.58.688.482C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

const GH_API = "https://api.github.com"

type GHUser = { login: string; name: string | null; avatar_url: string; bio: string | null; public_repos: number; followers: number; following: number; html_url: string; created_at: string; company: string | null; location: string | null; blog: string | null }
type GHRepo = { id: number; name: string; full_name: string; description: string | null; html_url: string; stargazers_count: number; forks_count: number; watchers_count: number; language: string | null; private: boolean; fork: boolean; updated_at: string }

const LANG_COLORS: Record<string, string> = { TypeScript: "bg-blue-500", JavaScript: "bg-yellow-400", Python: "bg-green-500", Rust: "bg-orange-500", Go: "bg-cyan-500", Java: "bg-red-500", "C++": "bg-pink-500", C: "bg-gray-500", CSS: "bg-purple-500", HTML: "bg-orange-400", Ruby: "bg-red-400", PHP: "bg-indigo-500", Swift: "bg-orange-500", Kotlin: "bg-violet-500", Dart: "bg-teal-500" }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function RepoCard({ repo }: { repo: GHRepo }) {
  return (
    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="group block rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:bg-card/80 hover:border-primary/30">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {repo.private ? <LockIcon className="size-3.5 shrink-0 text-muted-foreground" /> : <UnlockIcon className="size-3.5 shrink-0 text-muted-foreground" />}
          <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{repo.name}</span>
          {repo.fork && <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">fork</Badge>}
        </div>
        <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {repo.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{repo.description}</p>}
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        {repo.language && <span className="flex items-center gap-1.5"><span className={cn("size-2.5 rounded-full", LANG_COLORS[repo.language] ?? "bg-muted-foreground")} />{repo.language}</span>}
        {repo.stargazers_count > 0 && <span className="flex items-center gap-1"><StarIcon className="size-3" />{repo.stargazers_count}</span>}
        {repo.forks_count > 0 && <span className="flex items-center gap-1"><GitForkIcon className="size-3" />{repo.forks_count}</span>}
        <span className="ml-auto">{timeAgo(repo.updated_at)}</span>
      </div>
    </a>
  )
}

export function GitHubConnectPage() {
  const [token, setToken] = React.useState("")
  const [savedToken, setSavedToken] = React.useState(() => sessionStorage.getItem("gh_token") ?? "")
  const [user, setUser] = React.useState<GHUser | null>(null)
  const [repos, setRepos] = React.useState<GHRepo[]>([])
  const [loading, setLoading] = React.useState(false)
  const [reposLoading, setReposLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sortBy, setSortBy] = React.useState<"updated" | "stars" | "name">("updated")
  const [showAll, setShowAll] = React.useState(false)

  React.useEffect(() => { if (savedToken && !user) connectWithToken(savedToken) }, [])

  async function connectWithToken(t: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${GH_API}/user`, { headers: { Authorization: `Bearer ${t}`, Accept: "application/vnd.github+json" } })
      if (!res.ok) { if (res.status === 401) throw new Error("Invalid token — check that it hasn't expired and has the right scopes."); throw new Error(`GitHub API error: ${res.status} ${res.statusText}`) }
      const data: GHUser = await res.json()
      setUser(data)
      setSavedToken(t)
      sessionStorage.setItem("gh_token", t)
      fetchRepos(t)
    } catch (e) { setError((e as Error).message); setSavedToken(""); sessionStorage.removeItem("gh_token") } finally { setLoading(false) }
  }

  async function fetchRepos(t: string) {
    setReposLoading(true)
    try {
      const res = await fetch(`${GH_API}/user/repos?per_page=100&sort=updated`, { headers: { Authorization: `Bearer ${t}`, Accept: "application/vnd.github+json" } })
      if (!res.ok) throw new Error(`Could not fetch repos: ${res.status}`)
      const data: GHRepo[] = await res.json()
      setRepos(data)
    } catch { } finally { setReposLoading(false) }
  }

  function handleConnect(e: React.FormEvent) { e.preventDefault(); if (!token.trim()) return; connectWithToken(token.trim()) }
  function handleDisconnect() { setUser(null); setRepos([]); setSavedToken(""); setToken(""); setError(null); setShowAll(false); sessionStorage.removeItem("gh_token") }

  const sortedRepos = React.useMemo(() => {
    const copy = [...repos]
    if (sortBy === "stars") return copy.sort((a, b) => b.stargazers_count - a.stargazers_count)
    if (sortBy === "name") return copy.sort((a, b) => a.name.localeCompare(b.name))
    return copy.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [repos, sortBy])

  const visibleRepos = showAll ? sortedRepos : sortedRepos.slice(0, 12)

  if (user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img src={user.avatar_url} alt={user.login} className="size-16 sm:size-20 rounded-full border-2 border-border/50 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.name ?? user.login}</h1>
              <Badge variant="outline" className="gap-1.5 text-green-400 border-green-500/30"><span className="size-1.5 rounded-full bg-green-500 inline-block" />Connected</Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">@{user.login}</p>
            {user.bio && <p className="mt-1.5 text-sm text-muted-foreground">{user.bio}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><UsersIcon className="size-3" />{user.followers} followers</span>
              <span>{user.following} following</span>
              <span className="flex items-center gap-1"><BookMarkedIcon className="size-3" />{user.public_repos} repos</span>
              {user.company && <span>{user.company}</span>}
              {user.location && <span>{user.location}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fetchRepos(savedToken)} disabled={reposLoading}><RefreshCwIcon className={cn("size-3.5", reposLoading && "animate-spin")} />Refresh</Button>
            <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={handleDisconnect}><LogOutIcon className="size-3.5" />Disconnect</Button>
          </div>
        </div>
        <div className="border-t border-border/40 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[{ label: "Public Repos", value: user.public_repos, icon: <BookMarkedIcon className="size-4" /> }, { label: "Followers", value: user.followers, icon: <UsersIcon className="size-4" /> }, { label: "Following", value: user.following, icon: <EyeIcon className="size-4" /> }, { label: "Total Stars", value: repos.reduce((s, r) => s + r.stargazers_count, 0), icon: <StarIcon className="size-4" /> }].map((s) => (
            <Card key={s.label} className="border-border/40 bg-card/40"><CardContent className="pt-4 pb-3 px-4"><div className="flex items-center gap-2 text-muted-foreground mb-1">{s.icon}<span className="text-xs">{s.label}</span></div><div className="text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</div></CardContent></Card>
          ))}
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Repositories{repos.length > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">({repos.length})</span>}</h2>
            <div className="flex items-center gap-1">{(["updated", "stars", "name"] as const).map((s) => (<Button key={s} size="sm" variant={sortBy === s ? "secondary" : "ghost"} className="text-xs h-7 px-2.5" onClick={() => setSortBy(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</Button>))}</div>
          </div>
          {reposLoading ? (<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-24 rounded-xl border border-border/40 bg-card/30 animate-pulse" />))}</div>) : repos.length === 0 ? (<p className="text-sm text-muted-foreground py-8 text-center">No repositories found.</p>) : (<><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visibleRepos.map((repo) => (<RepoCard key={repo.id} repo={repo} />))}</div>{sortedRepos.length > 12 && (<div className="mt-4 text-center"><Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>{showAll ? "Show less" : `Show all ${sortedRepos.length} repos`}</Button></div>)}</>)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:py-24">
      <div className="text-center mb-10">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4"><GitHubIcon className="size-7 text-foreground" /></div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Connect With GitHub</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Enter a GitHub Personal Access Token to view your profile and repositories.</p>
      </div>
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2"><KeyRoundIcon className="size-4 text-muted-foreground" /><CardTitle className="text-base">Personal Access Token</CardTitle></div>
          <CardDescription>
            Create one at{" "}<a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">github.com/settings/tokens</a>. The <code className="rounded bg-muted px-1 font-mono text-xs">read:user</code> and{" "}<code className="rounded bg-muted px-1 font-mono text-xs">repo</code> scopes are needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnect} className="flex flex-col gap-3">
            <Input type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" value={token} onChange={(e) => { setToken(e.target.value); setError(null) }} className="font-mono text-sm" autoComplete="off" spellCheck={false} />
            {error && (<div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"><XCircleIcon className="size-3.5 shrink-0 mt-0.5" />{error}</div>)}
            <Button type="submit" className="w-full gap-2" disabled={loading || !token.trim()}>{loading ? <RefreshCwIcon className="size-4 animate-spin" /> : <GitHubIcon className="size-4" />}{loading ? "Connecting..." : "Connect"}</Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[{ icon: <CheckCircleIcon className="size-4 text-green-400 shrink-0" />, title: "What you'll see", body: "Your GitHub profile, all repos with stars, forks, language, and last update time." }, { icon: <UserIcon className="size-4 text-blue-400 shrink-0" />, title: "Privacy", body: "Your token is only kept in this browser tab's session memory and is never sent anywhere except GitHub." }].map((c) => (<div key={c.title} className="flex gap-3 rounded-xl border border-border/40 bg-card/30 p-3.5"><div className="mt-0.5">{c.icon}</div><div><div className="text-sm font-semibold mb-0.5">{c.title}</div><div className="text-xs text-muted-foreground">{c.body}</div></div></div>))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Token is stored only in{" "}<code className="rounded bg-muted px-1 font-mono">sessionStorage</code> — cleared when you close this tab.</p>
    </div>
  )
}
