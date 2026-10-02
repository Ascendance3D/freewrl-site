import { useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode, type TouchEvent } from "react"
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

/** Every capture modal on the page, in reading order. */
const pageLightboxes = () => [...document.querySelectorAll<HTMLDialogElement>("dialog.lightbox")]

/**
 * A real FreeWRL window capture with caption and provenance.
 * Clicking the image opens the full-size WebP in a centered modal; without JavaScript the link opens it directly.
 * In the modal, Previous/Next (buttons, arrow keys or a swipe) step through every capture on the page.
 * Captures are listed in media-src/captures/captures.json.
 */
export function CaptureFigure({
  id, fig, title, children, sizes = "(min-width: 1100px) 60vw, 100vw", eager = false, className = "",
}: { id: string; fig?: string; title?: ReactNode; children?: ReactNode; sizes?: string; eager?: boolean; className?: string }) {
  const c = capture(id)
  const full = c.files[c.files.length - 1]
  const dialog = useRef<HTMLDialogElement>(null)
  const touchX = useRef<number | null>(null)
  const [pos, setPos] = useState({ n: 0, of: 0 })
  const show = () => {
    const all = pageLightboxes()
    setPos({ n: all.indexOf(dialog.current!) + 1, of: all.length })
    dialog.current?.showModal()
  }
  const open = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    show()
  }
  // hand over to the neighbouring capture's modal; the browser keeps the page scroll locked throughout
  const step = (by: number) => {
    const all = pageLightboxes()
    const next = all[(all.indexOf(dialog.current!) + by + all.length) % all.length]
    if (!next || next === dialog.current) return
    dialog.current?.close()
    next.dispatchEvent(new CustomEvent("lightbox:open"))
  }
  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1) }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1) }
  }
  const touchStart = (e: TouchEvent) => { touchX.current = e.touches[0].clientX }
  const touchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
  }
  const bind = (el: HTMLDialogElement | null) => {
    dialog.current = el
    if (el && !el.dataset.bound) { el.dataset.bound = "1"; el.addEventListener("lightbox:open", show) }
  }
  return (
    <figure className={`capture ${className}`}>
      <a className="capture__img" href={full.webp} aria-label={`View full size: ${c.title}`} aria-haspopup="dialog" onClick={open}>
        <CapturePicture c={c} sizes={sizes} eager={eager} />
      </a>
      <dialog ref={bind} className="lightbox" aria-label={c.title} onKeyDown={key} onTouchStart={touchStart} onTouchEnd={touchEnd}
        onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close() }}>
        <form method="dialog" className="lightbox__bar">
          <p className="lightbox__title">
            {fig && <span className="mono lightbox__fig">{fig}</span>}
            {title ?? c.title}
          </p>
          <button className="lightbox__close" autoFocus>Close ✕</button>
        </form>
        <div className="lightbox__stage">
          <img src={full.webp} width={full.w} height={full.h} alt={c.alt} loading="lazy" decoding="async" />
          {pos.of > 1 && <>
            <button type="button" className="lightbox__nav lightbox__nav--prev" aria-label="Previous image" onClick={() => step(-1)}>‹</button>
            <button type="button" className="lightbox__nav lightbox__nav--next" aria-label="Next image" onClick={() => step(1)}>›</button>
          </>}
        </div>
        <p className="lightbox__meta mono">
          {pos.of > 1 && <span aria-live="polite">{pos.n} / {pos.of}</span>}
          <span>{c.label}</span>
          <span>{c.world}</span>
          <span>{full.w} × {full.h}</span>
          <span><a href={full.webp}>Open image file</a></span>
        </p>
      </dialog>
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
          <CaptureFigure id={it.id} fig={it.fig} sizes="(min-width: 1100px) 20vw, (min-width: 900px) 30vw, (min-width: 560px) 50vw, 100vw">
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
