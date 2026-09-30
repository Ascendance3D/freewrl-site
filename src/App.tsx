import { createElement } from "react"
import { Layout } from "./components/Layout"
import { getPage } from "./pages/registry"
import { RouterProvider, useRouter } from "./router"

function Page() {
  const { path } = useRouter()
  return createElement(getPage(path), { key: path })
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
