import { renderToString } from "react-dom/server"
import App from "./App"
import { ROUTES, SITE } from "./routes"

export { ROUTES, SITE }
export function render(path: string) {
  return renderToString(<App path={path} />)
}
