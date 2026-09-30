import { Layout } from "./components/Layout"
import Build from "./pages/Build"
import Conformance from "./pages/Conformance"
import Contribute from "./pages/Contribute"
import Download from "./pages/Download"
import History from "./pages/History"
import Home from "./pages/Home"
import Lab from "./pages/Lab"
import Learn from "./pages/Learn"
import NotFound from "./pages/NotFound"
import Tests from "./pages/Tests"
import Use from "./pages/Use"
import { RouterProvider, useRouter } from "./router"

const PAGES: Record<string, () => React.JSX.Element> = {
  "/": Home, "/download": Download, "/use": Use, "/build": Build, "/lab": Lab, "/learn": Learn,
  "/conformance": Conformance, "/tests": Tests, "/history": History, "/contribute": Contribute,
}

function Page() {
  const { path } = useRouter()
  const P = PAGES[path] ?? NotFound
  return <P key={path} />
}

export default function App({ path }: { path: string }) {
  return (
    <RouterProvider initialPath={path}>
      <Layout>
        <Page />
      </Layout>
    </RouterProvider>
  )
}
