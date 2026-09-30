import { useEffect, useRef, useState, type ReactNode } from "react"
import { enqueue, hasWebGL, loadXite, pauseClocks, prefersReducedMotion, XITE_VERSION, type X3DCanvasElement } from "../xite"

type Status = "idle" | "waiting" | "loading" | "ready" | "error" | "nowebgl"

export type ViewerProps = {
  /** URL of a .wrl / .x3d / .x3dv world. */
  src?: string
  /** Or: world source text (used by the Learn page). */
  source?: string
  /** File name shown in the label bar. */
  file: string
  /** Short technical facts: encoding, size, origin. */
  facts?: string[]
  /** Accessible description of what the world shows. */
  alt: string
  poster?: { src: string; alt: string }
  aspect?: string
  /** "visible": start when scrolled near; "click": wait for the reader. */
  start?: "visible" | "click"
  sizeLabel?: string
  /** DEF names of TimeSensors to stop under reduced motion / pause. */
  clocks?: string[]
  label?: string
  caption?: ReactNode
  /** Link to the raw file, so it can be opened in FreeWRL. */
  download?: string
  tone?: "dark" | "light"
  onSourceError?: (message: string | null) => void
  className?: string
}

export function XiteViewer(props: ViewerProps) {
  const { src, source, file, facts = [], alt, poster, aspect, start = "visible", sizeLabel, clocks = [], label, caption, download, tone = "dark", className = "" } = props
  const figure = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const canvas = useRef<X3DCanvasElement | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string>("")
  const [paused, setPaused] = useState(false)
  const [wanted, setWanted] = useState(false)
  const sourceRef = useRef(source)
  sourceRef.current = source
  const errRef = useRef(props.onSourceError)
  errRef.current = props.onSourceError

  // Decide when to start.
  useEffect(() => {
    if (!hasWebGL()) { setStatus("nowebgl"); return }
    if (start !== "visible") return
    const el = figure.current
    if (!el || typeof IntersectionObserver === "undefined") { setWanted(true); return }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setWanted(true); io.disconnect() }
    }, { rootMargin: "240px" })
    io.observe(el)
    return () => io.disconnect()
  }, [start])

  // Create the X_ITE canvas once wanted; tear it down on unmount.
  useEffect(() => {
    if (!wanted) return
    let dead = false
    setStatus("waiting")
    enqueue(async () => {
      if (dead) return
      setStatus("loading")
      const X3D = await loadXite()
      if (dead || !host.current) return
      const el = document.createElement("x3d-canvas") as X3DCanvasElement
      el.setAttribute("splashScreen", "false")
      el.setAttribute("contextMenu", "false")
      el.setAttribute("notifications", "false")
      el.setAttribute("update", "auto") // X_ITE pauses when off-screen or tab hidden
      el.setAttribute("tabindex", "0")
      el.setAttribute("role", "img")
      el.setAttribute("aria-label", alt)
      host.current.appendChild(el)
      canvas.current = el
      const browser = el.browser
      if (sourceRef.current !== undefined) {
        const scene = await browser.createX3DFromString(sourceRef.current)
        await browser.replaceWorld(scene)
      } else if (src) {
        await browser.loadURL(new X3D.MFString(src))
      }
      if (dead) return
      if (prefersReducedMotion() && clocks.length) { pauseClocks(browser.currentScene, clocks); setPaused(true) }
      setStatus("ready")
    }).catch((e: unknown) => {
      if (dead) return
      setError(e instanceof Error ? e.message : String(e))
      setStatus("error")
    })
    return () => {
      dead = true
      const el = canvas.current
      canvas.current = null
      if (!el) return
      // Order matters: stop rendering, detach, clear the world, and only then
      // release the GPU context. Losing it first makes X_ITE's resize handler throw.
      const canvases = [...(el.shadowRoot?.querySelectorAll("canvas") ?? [])]
      const release = () => {
        for (const c of canvases) {
          const gl = (c.getContext("webgl2") ?? c.getContext("webgl")) as WebGLRenderingContext | null
          gl?.getExtension("WEBGL_lose_context")?.loseContext()
        }
      }
      try { el.browser.endUpdate() } catch { /* already stopped */ }
      el.remove()
      Promise.resolve()
        .then(() => el.browser.replaceWorld(null))
        .catch(() => undefined)
        .then(() => setTimeout(release, 250))
    }
    // src/alt/clocks are fixed per viewer instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted])

  // Live source updates (Learn page): rebuild the world, keep the last good one on error.
  useEffect(() => {
    if (status !== "ready" || source === undefined || !canvas.current) return
    let stale = false
    const browser = canvas.current.browser
    const t = setTimeout(async () => {
      try {
        const scene = await browser.createX3DFromString(source)
        if (stale) return
        await browser.replaceWorld(scene)
        if (paused) pauseClocks(browser.currentScene, clocks)
        errRef.current?.(null)
      } catch (e) {
        if (!stale) errRef.current?.(e instanceof Error ? e.message : String(e))
      }
    }, 180)
    return () => { stale = true; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, status])

  const togglePause = () => {
    const scene = canvas.current?.browser.currentScene
    for (const n of clocks) {
      try { const node = scene?.getNamedNode(n); if (node) node.enabled = paused } catch { /* ignore */ }
    }
    setPaused(!paused)
  }

  const live = status === "ready"
  return (
    <figure ref={figure} className={`viewer viewer--${tone} ${className}`} data-status={status}>
      <div className="viewer__stage" style={aspect ? { aspectRatio: aspect } : undefined}>
        <div ref={host} className="viewer__host" />
        {!live && (
          <div className="viewer__cover">
            {poster && <img src={poster.src} alt={poster.alt} className="viewer__poster" loading="lazy" decoding="async" />}
            <div className="viewer__state" role="status">
              {status === "idle" && start === "click" && (
                <button type="button" className="btn btn--live" onClick={() => setWanted(true)}>
                  Load live world{sizeLabel ? ` (${sizeLabel})` : ""}
                </button>
              )}
              {status === "idle" && start === "visible" && <span className="mono">Live world loads when you scroll here</span>}
              {(status === "waiting" || status === "loading") && <span className="mono viewer__loading">Loading {file} in X_ITE…</span>}
              {status === "nowebgl" && (
                <p className="viewer__msg">
                  This browser has no WebGL, so the live preview is off. The world file still opens in FreeWRL.
                </p>
              )}
              {status === "error" && (
                <p className="viewer__msg">
                  The web preview could not load this world. <span className="mono">{error.slice(0, 160)}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="viewer__bar">
        <div className="viewer__labels mono">
          {label && <span className="viewer__fig">{label}</span>}
          <span className="viewer__file">{file}</span>
          {facts.map((f) => <span key={f}>{f}</span>)}
        </div>
        <div className="viewer__tools">
          {live && (
            <>
              <button type="button" className="tool" onClick={() => canvas.current?.browser.firstViewpoint()}>Reset view</button>
              <button type="button" className="tool" onClick={() => canvas.current?.browser.nextViewpoint()}>Next viewpoint</button>
              {clocks.length > 0 && (
                <button type="button" className="tool" aria-pressed={paused} onClick={togglePause}>
                  {paused ? "Play motion" : "Pause motion"}
                </button>
              )}
            </>
          )}
          {download && <a className="tool" href={download} download>Download file</a>}
        </div>
      </div>
      <p className="viewer__credit mono">
        <span>Web preview: X_ITE {XITE_VERSION}</span>
        <span>Native viewer: FreeWRL</span>
        {live && <span className="viewer__hint">Drag to turn · wheel or pinch to zoom</span>}
      </p>
      {caption && <figcaption className="caption">{caption}</figcaption>}
    </figure>
  )
}
