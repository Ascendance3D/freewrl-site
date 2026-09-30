import { useState, type ReactNode } from "react"
import { XiteViewer } from "../components/XiteViewer"
import { ArchivalFigure, Facts, PageHead, SectionHead } from "../components/primitives"
import { Link } from "../router"

type Exhibit = {
  id: string
  title: string
  file: string
  url: string
  encoding: string
  size: string
  origin: ReactNode
  credit: ReactNode
  alt: string
  about: ReactNode
  start?: "visible" | "click"
  clocks?: string[]
  aspect?: string
}

const EXHIBITS: Exhibit[] = [
  {
    id: "four-primitives",
    title: "The four primitives",
    file: "four-primitives.x3d",
    url: "/worlds/four-primitives.x3d",
    encoding: "X3D 4.0, XML encoding",
    size: "2 KB",
    origin: "Written for freewrl.org",
    credit: "freewrl.org",
    alt: "A dark blue box, a gold sphere, a light blue cone and a black cylinder in a row on a pale floor.",
    about: <>Box, Sphere, Cone and Cylinder: the four shapes every VRML97 and X3D browser knows. This one is XML. The same world in VRML syntax would use the same node names and the same numbers.</>,
    aspect: "21 / 9",
  },
  {
    id: "cone-1998",
    title: "Simple cone, 1998",
    file: "test.wrl",
    url: "/legacy/test.wrl",
    encoding: "VRML97",
    size: "329 bytes",
    origin: <>From the upstream site. <a href="/legacy/test.wrl">/legacy/test.wrl</a></>,
    credit: "Tuomas J. Lukka, 1998. GNU Library GPL.",
    alt: "A plain white cone on black, lit from the front.",
    about: <>The FreeWRL test file shown in the old Firefox plugin screenshot. A Material with no fields gets the defaults, so the cone is white. The defaults are part of the standard, so any VRML97 browser should draw the same white cone.</>,
  },
  {
    id: "teapot",
    title: "Teapot, no shaders",
    file: "teapot-noShaders.wrl",
    url: "/legacy/FreeX3D/models/teapot-noShaders.wrl",
    encoding: "VRML97",
    size: "44 KB",
    origin: <>From the FreeX3D examples on the upstream site. <a href="/legacy/FreeX3D/models/teapot-noShaders.wrl">/legacy/FreeX3D/models/</a></>,
    credit: "Upstream FreeWRL and FreeX3D developers",
    alt: "A gold teapot over a green ground under a blue-to-red graded sky.",
    about: <>The plain teapot that the upstream shader examples start from. The Toon and Sobel versions need desktop GLSL, so the web preview cannot run them. Their screenshots are below.</>,
    start: "click",
  },
  {
    id: "wolztyn",
    title: "Wolztyn panorama",
    file: "PolandPano-Turntable.wrl",
    url: "/legacy/images/PolandPano-Turntable.wrl",
    encoding: "VRML97 + JPEG texture",
    size: "288 bytes + 828 KB",
    origin: <>From the upstream examples page. <a href="/legacy/images/PolandPano-Turntable.wrl">/legacy/images/</a></>,
    credit: "Photograph taken in Wolztyn, Poland, May 2008 (upstream examples page)",
    alt: "A 360-degree photograph of a street in Wolztyn, Poland, wrapped inside a cylinder around the viewer.",
    about: <>A 4096 × 823 photograph on the inside of a Cylinder, with the viewer standing in the middle. WALK with speed 0 lets you turn but keeps you in place. The whole file is 17 lines.</>,
    start: "click",
  },
]

function SourceView({ url, file }: { url: string; file: string }) {
  const [text, setText] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const load = () => {
    if (text !== null) return
    fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((t) => setText(t.length > 12000 ? `${t.slice(0, 12000)}\n\n… (${t.length.toLocaleString("en")} characters; download for the rest)` : t))
      .catch(() => setFailed(true))
  }
  return (
    <details className="source-view" onToggle={(e) => (e.currentTarget.open ? load() : undefined)}>
      <summary className="mono">View source: {file}</summary>
      <pre className="listing__body" tabIndex={0}>
        <code>{failed ? "Could not load the file." : text ?? "Loading…"}</code>
      </pre>
    </details>
  )
}

export default function Lab() {
  return (
    <>
      <PageHead
        kicker="Examples · Lab"
        title="Turn it. Read it. Take it home."
        aside={
          <Facts
            className="facts--stack"
            rows={[
              ["On this page", `${EXHIBITS.length} live worlds, 3 shader captures`],
              ["Formats", "VRML97 .wrl, X3D XML .x3d"],
              ["Web preview", "X_ITE 16.4.1, in this browser"],
              ["More", <Link key="t" to="/tests">3,420 test files</Link>],
            ]}
          />
        }
      >
        <p>
          Real VRML97 and X3D files, live in this page. The web preview is drawn by X_ITE, a JavaScript X3D browser.
          To see a file in FreeWRL, download it and open it there. Neither program claims to draw exactly like the other.
        </p>
      </PageHead>

      {EXHIBITS.map((x, i) => (
        <section key={x.id} className="frame exhibit-row" aria-labelledby={`x-${x.id}`}>
          <div className="exhibit-row__view">
            <XiteViewer
              src={x.url}
              file={x.file}
              facts={[x.encoding, x.size]}
              alt={x.alt}
              start={x.start}
              sizeLabel={x.size}
              clocks={x.clocks}
              aspect={x.aspect}
              label={`FIG. L${i + 1}`}
              download={x.url}
              tone={i === 0 ? "light" : "dark"}
            />
          </div>
          <div className="exhibit-row__text">
            <span className="mono exhibit-row__fig">FIG. L{i + 1}</span>
            <h2 id={`x-${x.id}`} className="exhibit-row__title">{x.title}</h2>
            <p>{x.about}</p>
            <Facts className="facts--stack" rows={[["File", <code key="f">{x.file}</code>], ["Encoding", x.encoding], ["Size", x.size], ["Source", x.origin], ["Credit", x.credit]]} />
            <SourceView url={x.url} file={x.file} />
          </div>
        </section>
      ))}

      <section className="frame section railed" aria-labelledby="shaders">
        <SectionHead
          index="L5"
          id="shaders"
          title="Shaders: FreeWRL only"
          kicker="These upstream examples use FreeWRL’s own GLSL names, or older desktop GLSL. The web preview cannot run them, so here they are as screenshots. The models are in the legacy archive."
        />
        <div className="triptych">
          <ArchivalFigure path="FreeX3D/images/Toon-Screenshot_2013-08-11-09-39-56.png" fig="L5a" title="Toon shader" date="2013-08-11" archive="live"
            alt="A teapot shaded in three flat bands of pink and red on green." sizes="(min-width: 1024px) 24vw, (min-width: 760px) 33vw, 100vw">
            Colour is chosen from ranges of light intensity. Model: <a href="/legacy/FreeX3D/models/teapot-Toon.wrl">teapot-Toon.wrl</a>.
          </ArchivalFigure>
          <ArchivalFigure path="FreeX3D/images/Sobel_Screenshot_2013-08-10-09-41-49.png" fig="L5b" title="Sobel edge detector" date="2013-08-10" archive="live"
            alt="A test photograph reduced to white edge lines on black by a shader." sizes="(min-width: 1024px) 24vw, (min-width: 760px) 33vw, 100vw">
            An edge-detection shader on a test image. Model: <a href="/legacy/FreeX3D/models/sobel-ComposedShader.wrl">sobel-ComposedShader.wrl</a>.
          </ArchivalFigure>
          <ArchivalFigure path="FreeX3D/images/VertexDeformer-Screenshot_2013-08-10-09-40-43.png" fig="L5c" title="Vertex deformer" date="2013-08-10" archive="live"
            alt="A flat grid bent into waves by a vertex shader." sizes="(min-width: 1024px) 24vw, (min-width: 760px) 33vw, 100vw">
            A flat 20 × 20 IndexedFaceSet bent on the GPU, driven by a TimeSensor.
          </ArchivalFigure>
        </div>
      </section>

      <section className="frame section railed" aria-labelledby="more">
        <SectionHead index="L6" id="more" title="More worlds" />
        <div className="prose">
          <p>
            The upstream project kept more than 3,400 test files, sorted by X3D component. They are the largest body of example worlds
            FreeWRL has. <Link to="/tests">Browse the test corpus</Link>.
          </p>
          <p>
            A small world that teaches one idea, with comments in the source, is what this page needs most.
            <Link to="/contribute"> Send one in</Link>.
          </p>
        </div>
      </section>
    </>
  )
}
