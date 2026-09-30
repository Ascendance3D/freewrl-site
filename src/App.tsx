import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

const GITHUB_URL = "https://github.com/Ascendance3D/freewrl"

export default function App() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* soft ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10
                   bg-[radial-gradient(60%_60%_at_50%_35%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent)]"
      />

      <div className="flex w-full max-w-xl flex-col items-center text-center">
        {/* logo tile — the mark is an app icon, so a light tile keeps it exact and
            legible in both light and dark themes */}
        <div className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-black/5 sm:p-7">
          <img
            src="/freewrl-logo.png"
            alt="FreeWRL"
            width={220}
            height={220}
            className="h-auto w-[clamp(150px,42vw,220px)]"
            draggable={false}
          />
        </div>

        <Badge variant="secondary" className="mt-8 rounded-full px-3 py-1 text-xs tracking-wide">
          Coming soon
        </Badge>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          FreeWRL
        </h1>

        <p className="mt-3 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
          The open X3D&nbsp;/&nbsp;VRML browser — reborn for Apple&nbsp;Silicon.
        </p>

        <div className="mt-8">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "gap-2 rounded-full px-5",
            })}
          >
            <GitHubMark className="size-4" />
            View on GitHub
          </a>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-muted-foreground/70">
        © {new Date().getFullYear()} FreeWRL · Ascendance Open Worlds
      </footer>
    </main>
  )
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
