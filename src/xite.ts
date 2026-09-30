import { XITE_BASE, XITE_VERSION } from "./generated-xite"

export { XITE_VERSION }

// Loose types: we use a small part of the X_ITE browser API.
export type XiteBrowser = {
  loadURL(url: string[] | unknown): Promise<void>
  createX3DFromString(source: string): Promise<XiteScene>
  replaceWorld(scene: XiteScene | null): Promise<void>
  currentScene: XiteScene
  setBrowserOption(name: string, value: unknown): void
  firstViewpoint(): void
  nextViewpoint(): void
  viewAll(layer?: unknown, transitionTime?: number): void
  beginUpdate(): void
  endUpdate(): void
}
export type XiteScene = { getNamedNode(name: string): Record<string, unknown> }
export type X3DCanvasElement = HTMLElement & { browser: XiteBrowser }

export type X3DNamespace = { MFString: new (...urls: string[]) => unknown }

let loading: Promise<X3DNamespace> | null = null

/** Load X_ITE once, on demand. It registers the <x3d-canvas> element. */
export function loadXite(): Promise<X3DNamespace> {
  if (!loading) {
    const url = `${XITE_BASE}x_ite.min.mjs`
    loading = import(/* @vite-ignore */ url).then((m: { default: X3DNamespace }) => m.default)
    loading.catch(() => { loading = null })
  }
  return loading
}

let webgl: boolean | null = null
export function hasWebGL(): boolean {
  if (webgl !== null) return webgl
  try {
    const c = document.createElement("canvas")
    const gl = (c.getContext("webgl2") ?? c.getContext("webgl")) as WebGLRenderingContext | null
    webgl = !!gl
    gl?.getExtension("WEBGL_lose_context")?.loseContext()
  } catch {
    webgl = false
  }
  return webgl
}

export const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches

// Start heavy viewers one at a time so a long page does not spin up
// several WebGL contexts and parsers in the same frame.
let queue: Promise<unknown> = Promise.resolve()
export function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(job, job)
  queue = run.catch(() => undefined)
  return run
}

/** Stop scene clocks named in `names` (reduced motion). Missing names are fine. */
export function pauseClocks(scene: XiteScene | null | undefined, names: string[]) {
  for (const n of names) {
    try {
      const node = scene?.getNamedNode(n)
      if (node) node.enabled = false
    } catch {
      /* not in this scene */
    }
  }
}
