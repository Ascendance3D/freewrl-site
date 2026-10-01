export const SITE = {
  name: "FreeWRL",
  origin: "https://freewrl.org",
  github: "https://github.com/Ascendance3D/freewrl",
  issues: "https://github.com/Ascendance3D/freewrl/issues",
  discussions: "https://github.com/Ascendance3D/freewrl/discussions",
  releases: "https://github.com/Ascendance3D/freewrl/releases",
  upstream: "https://sourceforge.net/projects/freewrl/",
  upstreamSite: "https://freewrl.sourceforge.io/",
  // Where the historical tests/ corpus is served: R2 bucket freewrl-tests, keys
  // relative to tests/ (see TEST_CORPUS.md). No directory indexes there, so link
  // folders as <dir>/index.html.
  testsBase: "https://tests.freewrl.org/",
}

// URL of a path relative to tests/, each segment percent-encoded (spaces, $, +, [], ...).
export const testsUrl = (path: string) => SITE.testsBase + path.split("/").map(encodeURIComponent).join("/")

export type RouteMeta = { path: string; nav?: string; title: string; description: string }

export const ROUTES: RouteMeta[] = [
  {
    path: "/",
    title: "FreeWRL — the open-source native VRML and X3D browser",
    description:
      "FreeWRL is the open-source native browser for VRML97 and X3D worlds. Download it, build it, learn to make worlds, and explore its history since 1998.",
  },
  { path: "/download", nav: "Download", title: "Download — FreeWRL", description: "Current FreeWRL releases with checksums. Today: a signed macOS Apple Silicon beta. Linux builds from source." },
  { path: "/use", nav: "Use", title: "Use — FreeWRL", description: "Open worlds, move around them, and the keyboard and mouse controls of FreeWRL, checked against the current source." },
  { path: "/build", nav: "Build", title: "Build — FreeWRL", description: "Build FreeWRL 6.7 from source on Ubuntu 24.04 and on Apple Silicon macOS." },
  { path: "/lab", nav: "Lab", title: "Lab: live VRML and X3D examples · FreeWRL", description: "Live VRML97 and X3D examples in your browser, with source. Web previews are rendered by X_ITE; download the files to open them in FreeWRL." },
  { path: "/learn", nav: "Learn", title: "Make something: learn VRML and X3D · FreeWRL", description: "Change one number, change a world. A small hands-on introduction to VRML: a shape, an object, a room, a world." },
  { path: "/conformance", nav: "Conformance", title: "Conformance — FreeWRL", description: "Node-by-node X3D support as claimed by the upstream FreeWRL project, kept apart from results measured on current builds." },
  { path: "/tests", title: "Test corpus — FreeWRL", description: "The historical FreeWRL test corpus: 1.14 GB in 38 X3D component folders, kept with their original paths." },
  { path: "/history", nav: "History", title: "History & credits — FreeWRL", description: "FreeWRL since 1998: Tuomas J. Lukka, John A. Stewart and CRC Canada, and everyone credited in the project's own pages." },
  { path: "/contribute", nav: "Contribute", title: "Contribute — FreeWRL", description: "Code, testing, documentation, example worlds, lessons and platform maintainers: how to help FreeWRL today." },
]

export const findRoute = (path: string) => ROUTES.find((r) => r.path === path)
