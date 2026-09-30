import type { ReactNode } from "react"
import media from "../data/archive-media.json"

type MediaEntry = { original: string; width: number; height: number; files: { w: number; h: number; webp: string }[]; fallback: string }
const MEDIA = media as Record<string, MediaEntry>

/** The FreeWRL logo. Two drawings: white lettering for dark grounds, dark for light. */
export function Logo({ ground = "auto", size = 64, className = "" }: { ground?: "auto" | "dark" | "light"; size?: number; className?: string }) {
  const img = (which: "dark" | "light", cls: string) => (
    <picture className={cls}>
      <source type="image/webp" srcSet={`/brand/freewrl-logo-on-${which}-320.webp 320w, /brand/freewrl-logo-on-${which}-640.webp 640w`} sizes={`${size}px`} />
      <img src={`/brand/freewrl-logo-on-${which}-320.png`} width={size} height={size} alt="FreeWRL" decoding="async" />
    </picture>
  )
  if (ground !== "auto") return <span className={`logo ${className}`}>{img(ground, "")}</span>
  return (
    <span className={`logo logo--auto ${className}`}>
      {img("light", "logo__on-light")}
      {img("dark", "logo__on-dark")}
    </span>
  )
}

/** The hand-and-eye mark alone (no lettering): favicon, masthead. */
export function Mark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <picture className={`mark ${className}`}>
      <source type="image/webp" srcSet="/brand/freewrl-mark-512.webp" />
      <img src="/brand/freewrl-mark-512.png" width={size} height={size} alt="" decoding="async" />
    </picture>
  )
}

/** Mono technical label, e.g. "VRML97" or "ISO/IEC 19775-1:2023". */
export function Tag({ children, tone }: { children: ReactNode; tone?: "gold" | "cyan" | "muted" }) {
  return <span className={`tag${tone ? ` tag--${tone}` : ""}`}>{children}</span>
}

/** Definition list of technical facts, rendered as a ruled table. */
export function Facts({ rows, className = "" }: { rows: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <dl className={`facts ${className}`}>
      {rows.map(([k, v], i) => (
        <div key={i} className="facts__row">
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Section opener: index number, title, optional kicker. Asymmetric by design. */
export function SectionHead({ index, title, kicker, id }: { index: string; title: ReactNode; kicker?: ReactNode; id?: string }) {
  return (
    <header className="section-head" id={id}>
      <span className="section-head__index mono">§{index}</span>
      <h2 className="section-head__title">{title}</h2>
      {kicker && <p className="section-head__kicker">{kicker}</p>}
    </header>
  )
}

/** Page opener used by every inner page. */
export function PageHead({ kicker, title, children }: { kicker: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="page-head frame">
      <p className="page-head__kicker mono">{kicker}</p>
      <h1 className="page-head__title display">{title}</h1>
      {children && <div className="page-head__lede">{children}</div>}
    </header>
  )
}

/**
 * Archival image with museum caption and provenance.
 * `path` is the archive-relative path; the original stays under /legacy/.
 */
export function ArchivalFigure({
  path, alt, fig, title, children, date, archive, sizes = "(min-width: 1100px) 60vw, 100vw", className = "", eager = false,
}: {
  path: string; alt: string; fig?: string; title?: ReactNode; children?: ReactNode; date?: string
  archive?: "live" | "wayback"; sizes?: string; className?: string; eager?: boolean
}) {
  const m = MEDIA[path]
  if (!m) throw new Error(`archive media missing: ${path}`)
  const first = m.files[0]
  return (
    <figure className={`archival ${className}`}>
      <a className="archival__img" href={`/legacy/${path}`} aria-label={`Original file: ${path}`}>
        <picture>
          <source type="image/webp" srcSet={m.files.map((f) => `${f.webp} ${f.w}w`).join(", ")} sizes={sizes} />
          <img src={m.fallback} width={first.w} height={first.h} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />
        </picture>
      </a>
      <figcaption className="archival__caption">
        {(fig || title) && (
          <p className="archival__title">
            {fig && <span className="mono archival__fig">{fig}</span>}
            {title && <span className="archival__name">{title}</span>}
          </p>
        )}
        {children && <div className="caption">{children}</div>}
        <p className="archival__meta mono">
          <span>{path}</span>
          <span>{m.width}×{m.height}</span>
          {date && <span>{date}</span>}
          {archive && <span>{archive === "wayback" ? "recovered via Wayback Machine" : "live capture 2026-09-30"}</span>}
        </p>
      </figcaption>
    </figure>
  )
}

/** Source listing with a file header. `lang` is informational only. */
export function SourceListing({ file, lang, children, note, className = "" }: { file: string; lang: string; children: string; note?: ReactNode; className?: string }) {
  const lines = children.replace(/\n$/, "").split("\n")
  return (
    <figure className={`listing ${className}`}>
      <div className="listing__head mono">
        <span>{file}</span>
        <span>{lang} · {lines.length} lines</span>
      </div>
      <pre className="listing__body" tabIndex={0} aria-label={`Source of ${file}`}>
        <code>
          {lines.map((l, i) => (
            <span key={i} className="listing__line">
              <span className="listing__no" aria-hidden="true">{i + 1}</span>
              {l || " "}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
      {note && <figcaption className="caption">{note}</figcaption>}
    </figure>
  )
}

/** Shell commands. */
export function Commands({ children, title }: { children: string; title?: string }) {
  return (
    <figure className="listing listing--shell">
      {title && <div className="listing__head mono"><span>{title}</span><span>shell</span></div>}
      <pre className="listing__body" tabIndex={0}><code>{children.trim()}</code></pre>
    </figure>
  )
}

export function formatBytes(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`
  if (n >= 1e3) return `${Math.round(n / 1e3)} KB`
  return `${n} B`
}
