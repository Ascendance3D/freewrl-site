import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react"
import { preload } from "./pages/registry"
import { findRoute, SITE } from "./routes"

// Minimal History-API router. Pages are prerendered to static HTML, so this
// only takes over navigation after hydration.

const RouterContext = createContext<{ path: string; navigate: (to: string) => void }>({
  path: "/",
  navigate: () => {},
})

export function normalize(path: string) {
  const p = path.replace(/\/index\.html$/, "/").replace(/\/+$/, "")
  return p === "" ? "/" : p
}

function applyHead(path: string) {
  const route = findRoute(path)
  document.title = route ? route.title : `Not found — ${SITE.name}`
  const set = (sel: string, attr: string, value: string) => document.querySelector(sel)?.setAttribute(attr, value)
  if (route) {
    const url = SITE.origin + (path === "/" ? "/" : `${path}/`)
    set('meta[name="description"]', "content", route.description)
    set('link[rel="canonical"]', "href", url)
    set('meta[property="og:title"]', "content", route.title)
    set('meta[property="og:description"]', "content", route.description)
    set('meta[property="og:url"]', "content", url)
  }
}

export function RouterProvider({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [path, setPath] = useState(normalize(initialPath))

  useEffect(() => {
    const onPop = () => {
      const next = normalize(location.pathname)
      void preload(next).then(() => { setPath(next); applyHead(next) })
    }
    addEventListener("popstate", onPop)
    return () => removeEventListener("popstate", onPop)
  }, [])

  const navigate = (to: string) => {
    const url = new URL(to, location.href)
    const next = normalize(url.pathname)
    void preload(next).then(() => {
      if (next !== path || url.hash === "") {
        history.pushState(null, "", url.pathname + url.search + url.hash)
        setPath(next)
        applyHead(next)
      }
      requestAnimationFrame(() => {
      const target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null
      if (target) target.scrollIntoView()
      else scrollTo(0, 0)
      // move focus to the new page so screen readers announce it
      const main = document.getElementById("main")
      if (!url.hash && main) main.focus({ preventScroll: true })
      })
    })
  }

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
}

export const useRouter = () => useContext(RouterContext)

/** Internal link. Plain <a> for anything the SPA does not own (/legacy/, files). */
export function Link({ to, children, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { navigate, path } = useRouter()
  const spa = to.startsWith("/") && !to.startsWith("/legacy") && !/\.[a-z0-9]+$/i.test(to.split(/[?#]/)[0])
  const [pathPart, hash] = to.split("#")
  const href = spa && pathPart !== "/" && !pathPart.endsWith("/") ? `${pathPart}/${hash ? `#${hash}` : ""}` : to
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    rest.onClick?.(e)
    if (!spa || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(href)
  }
  const current = spa && normalize(to.split("#")[0]) === path ? "page" : undefined
  return (
    <a href={href} aria-current={current} {...rest} onClick={onClick}>
      {children}
    </a>
  )
}
