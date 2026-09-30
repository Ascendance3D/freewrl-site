import { StrictMode } from "react"
import { hydrateRoot, createRoot } from "react-dom/client"
import App from "./App"
import { preload } from "./pages/registry"
import { normalize } from "./router"
import "./styles/index.css"

const root = document.getElementById("root")!
const app = (
  <StrictMode>
    <App path={location.pathname} />
  </StrictMode>
)
preload(normalize(location.pathname)).then(() => {
  if (root.hasChildNodes()) hydrateRoot(root, app)
  else createRoot(root).render(app) // dev server: no prerendered HTML
})
