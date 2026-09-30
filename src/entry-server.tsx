import { renderToString } from "react-dom/server"
import App from "./App"
import { preloadAll } from "./pages/registry"
import { ROUTES, SITE } from "./routes"

await preloadAll()

export { ROUTES, SITE }
export function render(path: string) {
  return renderToString(<App path={path} />)
}
