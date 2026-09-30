import type { ComponentType } from "react"
import NotFound from "./NotFound"

// Each page is its own chunk, so the home page does not ship the
// conformance table or the history data. The client loads the current
// page before hydrating, and the next page before switching to it.
type Page = ComponentType
const LOADERS: Record<string, () => Promise<{ default: Page }>> = {
  "/": () => import("./Home"),
  "/download": () => import("./Download"),
  "/use": () => import("./Use"),
  "/build": () => import("./Build"),
  "/lab": () => import("./Lab"),
  "/learn": () => import("./Learn"),
  "/conformance": () => import("./Conformance"),
  "/tests": () => import("./Tests"),
  "/history": () => import("./History"),
  "/contribute": () => import("./Contribute"),
}
const cache = new Map<string, Page>()

export async function preload(path: string) {
  const load = LOADERS[path]
  if (load && !cache.has(path)) cache.set(path, (await load()).default)
}
export const preloadAll = () => Promise.all(Object.keys(LOADERS).map(preload))
export const getPage = (path: string): Page => cache.get(path) ?? NotFound
