import type { ReactNode } from "react"
import captures from "../data/captures.json"

type Capture = {
  world: string; viewpoint: string; alt: string; title: string; label: string; date: string; detail: string
  width: number; height: number; files: { w: number; h: number; webp: string }[]; fallback: string
}
const CAPTURES = captures as Record<string, Capture>

function capture(id: string) {
  const c = CAPTURES[id]
  if (!c) throw new Error(`capture missing: ${id}`)
  return c
}

function CapturePicture({ c, sizes, eager }: { c: Capture; sizes: string; eager?: boolean }) {
  const first = c.files[0]
  return (
    <picture>
      <source type="image/webp" srcSet={c.files.map((f) => `${f.webp} ${f.w}w`).join(", ")} sizes={sizes} />
      <img src={c.fallback} width={first.w} height={first.h} alt={c.alt} loading={eager ? "eager" : "lazy"} decoding="async" />
    </picture>
  )
}

/**
 * A real FreeWRL window capture with caption and provenance.
 * The image links to the full-size WebP. Captures are listed in media-src/captures/captures.json.
 */
export function CaptureFigure({
  id, fig, title, children, sizes = "(min-width: 1100px) 60vw, 100vw", eager = false, className = "",
}: { id: string; fig?: string; title?: ReactNode; children?: ReactNode; sizes?: string; eager?: boolean; className?: string }) {
  const c = capture(id)
  const full = c.files[c.files.length - 1]
  return (
    <figure className={`capture ${className}`}>
      <a className="capture__img" href={full.webp} aria-label={`Full-size capture: ${c.title}`}>
        <CapturePicture c={c} sizes={sizes} eager={eager} />
      </a>
      <figcaption className="capture__caption">
        <p className="capture__title">
          {fig && <span className="mono capture__fig">{fig}</span>}
          <span className="capture__name">{title ?? c.title}</span>
        </p>
        {children && <div className="caption">{children}</div>}
        <p className="capture__meta mono" title={c.detail}>
          <span>{c.label}</span>
          <span>{c.world}</span>
          <span>captured {c.date}</span>
        </p>
      </figcaption>
    </figure>
  )
}

/** Two to four captures side by side, each with its own caption. */
export function CaptureGallery({ items, label }: { items: { id: string; fig?: string; caption?: ReactNode }[]; label: string }) {
  return (
    <ul className={`shots shots--${items.length}`} aria-label={label}>
      {items.map((it) => (
        <li key={it.id}>
          <CaptureFigure id={it.id} fig={it.fig} sizes={`(min-width: 1100px) ${Math.round(60 / items.length)}vw, (min-width: 760px) 50vw, 100vw`}>
            {it.caption}
          </CaptureFigure>
        </li>
      ))}
    </ul>
  )
}

/**
 * A short silent screen recording. Nothing downloads until the visitor presses play
 * (preload="none"); the poster is a capture. `children` describe what happens, for
 * anyone who cannot watch it.
 */
export function DemoVideo({
  src, poster, fig, title, length, children,
}: { src: string; poster: string; fig?: string; title: ReactNode; length: string; children: ReactNode }) {
  const p = capture(poster)
  const img = p.files.find((f) => f.w === 960) ?? p.files[p.files.length - 1]
  return (
    <figure className="capture capture--video">
      <div className="capture__img">
        <video controls muted playsInline preload="none" poster={img.webp} width={img.w} height={img.h} style={{ aspectRatio: `${img.w} / ${img.h}` }}>
          <source src={src} type="video/mp4" />
          <a href={src}>Download the clip (MP4)</a>
        </video>
      </div>
      <figcaption className="capture__caption">
        <p className="capture__title">
          {fig && <span className="mono capture__fig">{fig}</span>}
          <span className="capture__name">{title}</span>
        </p>
        <div className="caption">{children}</div>
        <p className="capture__meta mono" title={p.detail}>
          <span>{p.label}</span>
          <span>{length}, no sound</span>
          <span>recorded {p.date}</span>
          <span><a href={src}>MP4</a></span>
        </p>
      </figcaption>
    </figure>
  )
}

/** A capture this site still needs. Says what is missing instead of showing a stand-in. */
export function PendingMedia({ kind, title, children }: { kind: "Screenshot" | "Video"; title: ReactNode; children: ReactNode }) {
  return (
    <figure className="pending">
      <div className="pending__frame">
        <p className="mono pending__kind">{kind} still to be captured</p>
        <p className="pending__title">{title}</p>
      </div>
      <figcaption className="caption">{children}</figcaption>
    </figure>
  )
}
