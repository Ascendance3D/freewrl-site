// Lesson worlds for /learn. Each lesson is a VRML97 template whose numbers
// come from controls. Parameter values are marked so the page can highlight
// exactly the text a control changes.

export type Part = string | { key: string; text: string }
export type Built = { text: string; parts: Part[] }

function vrml(strings: TemplateStringsArray, ...values: Part[]): Built {
  const parts: Part[] = []
  strings.forEach((s, i) => {
    parts.push(s)
    if (i < values.length) parts.push(values[i])
  })
  return { parts, text: parts.map((p) => (typeof p === "string" ? p : p.text)).join("") }
}

const n = (v: number) => String(Number(v.toFixed(2)))
const p = (key: string, text: string): Part => ({ key, text })

export const COLORS: Record<string, [number, number, number]> = {
  cobalt: [0.1, 0.18, 0.55],
  gold: [0.95, 0.76, 0.19],
  cyan: [0.12, 0.62, 1],
  orange: [1, 0.48, 0.1],
  white: [0.92, 0.92, 0.9],
  ink: [0.08, 0.08, 0.1],
}
export const rgb = (name: string) => COLORS[name].map(n).join(" ")

export type Control =
  | { key: string; label: string; kind: "range"; min: number; max: number; step: number; unit?: string }
  | { key: string; label: string; kind: "color" }
  | { key: string; label: string; kind: "choice"; options: string[] }

export type Values = Record<string, number | string>

export type Lesson = {
  id: string
  title: string
  goal: string
  explain: string[]
  controls: Control[]
  initial: Values
  build: (v: Values) => Built
  clocks?: string[]
}

const num = (v: Values, k: string) => Number(v[k])
const str = (v: Values, k: string) => String(v[k])

function geometry(v: Values): Part[] {
  const s = num(v, "size")
  switch (str(v, "shape")) {
    case "Sphere": return ["Sphere { radius ", p("size", n(s / 2)), " }"]
    case "Cone": return ["Cone { bottomRadius ", p("size", n(s / 2)), " height ", p("size", n(s)), " }"]
    case "Cylinder": return ["Cylinder { radius ", p("size", n(s / 2)), " height ", p("size", n(s)), " }"]
    default: return ["Box { size ", p("size", `${n(s)} ${n(s)} ${n(s)}`), " }"]
  }
}

function join(...chunks: (Built | Part[] | string)[]): Built {
  const parts: Part[] = []
  for (const c of chunks) {
    if (typeof c === "string") parts.push(c)
    else if (Array.isArray(c)) parts.push(...c)
    else parts.push(...c.parts)
  }
  return { parts, text: parts.map((x) => (typeof x === "string" ? x : x.text)).join("") }
}

function table(v: Values, indent = ""): Built {
  const h = num(v, "height"), w = num(v, "width")
  const lx = n(w / 2 - 0.15), lz = n(0.45), ly = n(h / 2)
  const leg = (x: string, z: string) =>
    `${indent}    Transform { translation ${x} ${ly} ${z} children USE Leg }\n`
  return join(
    vrml`${indent}DEF Table Transform {
${indent}  children [
${indent}    Transform { # the top
${indent}      translation 0 ${p("height", n(h))} 0
${indent}      children Shape {
${indent}        appearance Appearance { material Material { diffuseColor ${p("color", rgb(str(v, "color")))} } }
${indent}        geometry Box { size ${p("width", n(w))} 0.1 1.1 }
${indent}      }
${indent}    }
${indent}    Transform { translation -${lx} ${ly} -${lz}
${indent}      children DEF Leg Shape {
${indent}        appearance Appearance { material Material { diffuseColor 0.15 0.15 0.17 } }
${indent}        geometry Cylinder { radius 0.05 height ${p("height", n(h))} }
${indent}      }
${indent}    }
`,
    leg(lx, `-${lz}`), leg(`-${lx}`, lz), leg(lx, lz),
    `${indent}  ]\n${indent}}\n`,
  )
}

function room(v: Values): Built {
  return join(
    vrml`PointLight { location 0 2.6 0 intensity ${p("light", n(num(v, "light")))} color ${p("lightColor", rgb(str(v, "lightColor")))} radius 12 }

Transform { # floor
  children Shape {
    appearance Appearance { material Material { diffuseColor 0.55 0.5 0.45 } }
    geometry Box { size 6 0.1 6 }
  }
}
DEF Wall Transform { # back wall
  translation 0 1.5 -3
  children Shape {
    appearance DEF Plaster Appearance { material Material { diffuseColor ${p("walls", rgb(str(v, "walls")))} } }
    geometry Box { size 6 3 0.1 }
  }
}
Transform { # left wall
  translation -3 1.5 0  rotation 0 1 0 1.5708
  children Shape { appearance USE Plaster geometry Box { size 6 3 0.1 } }
}
Transform { # right wall
  translation 3 1.5 0  rotation 0 1 0 1.5708
  children Shape { appearance USE Plaster geometry Box { size 6 3 0.1 } }
}
`,
    table({ height: 0.8, width: 1.6, color: "gold" }),
  )
}

export const LESSONS: Lesson[] = [
  {
    id: "shape",
    title: "Make a shape",
    goal: "One shape. Change its kind, its size and its colour.",
    explain: [
      "Every VRML97 file starts with the line #VRML V2.0 utf8.",
      "A Shape has two parts. appearance says how it looks. geometry says what it is.",
      "diffuseColor takes three numbers from 0 to 1: red, green and blue. 1 0 0 is pure red.",
    ],
    controls: [
      { key: "shape", label: "Geometry", kind: "choice", options: ["Box", "Sphere", "Cone", "Cylinder"] },
      { key: "size", label: "Size", kind: "range", min: 0.4, max: 4, step: 0.1, unit: "m" },
      { key: "color", label: "diffuseColor", kind: "color" },
    ],
    initial: { shape: "Box", size: 2, color: "cobalt" },
    build: (v) =>
      join(
        vrml`#VRML V2.0 utf8

Background { skyColor 0.94 0.93 0.9 }
Viewpoint { position 2.8 2.1 4.6 orientation -0.55 0.821 0.154 0.659 }

Shape {
  appearance Appearance {
    material Material { diffuseColor ${p("color", rgb(str(v, "color")))} }
  }
  geometry `,
        geometry(v),
        "\n}\n",
      ),
  },
  {
    id: "object",
    title: "Build an object",
    goal: "A table: one Box and four legs. The legs are one shape, used four times.",
    explain: [
      "Transform moves everything inside it. translation 0 0.8 0 lifts the top 0.8 metres.",
      "DEF Leg gives a shape a name. USE Leg draws it again without writing it again.",
      "Make the table taller: the top and the legs follow, because both use the same number.",
    ],
    controls: [
      { key: "height", label: "Table height", kind: "range", min: 0.3, max: 2, step: 0.05, unit: "m" },
      { key: "width", label: "Top width", kind: "range", min: 0.8, max: 3, step: 0.1, unit: "m" },
      { key: "color", label: "Top colour", kind: "color" },
    ],
    initial: { height: 0.8, width: 1.6, color: "gold" },
    build: (v) =>
      join(
        "#VRML V2.0 utf8\n\nBackground { skyColor 0.94 0.93 0.9 }\nViewpoint { position 2.2 2 3.6 orientation -0.517 0.843 0.145 0.644 }\n\n",
        table(v),
      ),
  },
  {
    id: "room",
    title: "Build a room",
    goal: "A floor, three walls, a light and the table. Now light matters.",
    explain: [
      "A PointLight shines from one spot in every direction, like a bulb.",
      "intensity goes from 0 (off) to 1 (full). Turn it down and the room gets dark.",
      "The three walls share one appearance, named Plaster. Change the wall colour once, and all three change.",
    ],
    controls: [
      { key: "light", label: "Light intensity", kind: "range", min: 0, max: 1, step: 0.05 },
      { key: "lightColor", label: "Light colour", kind: "color" },
      { key: "walls", label: "Wall colour", kind: "color" },
    ],
    initial: { light: 0.8, lightColor: "white", walls: "white" },
    build: (v) =>
      join(
        "#VRML V2.0 utf8\n\nNavigationInfo { headlight FALSE }\nBackground { skyColor 0.05 0.05 0.07 }\nViewpoint { position 0 1.7 6.5 orientation 1 0 0 -0.12 }\n\n",
        room(v),
      ),
  },
  {
    id: "world",
    title: "Build a world",
    goal: "Take the room outside. Add a sky, the ground, and something that moves.",
    explain: [
      "Background paints the sky. skyColor is the colour straight up.",
      "A TimeSensor is a clock. ROUTE connects its output to an OrientationInterpolator, which turns the sculpture.",
      "cycleInterval is the time for one full turn, in seconds. Smaller is faster.",
    ],
    controls: [
      { key: "sky", label: "Sky colour", kind: "color" },
      { key: "speed", label: "cycleInterval", kind: "range", min: 2, max: 30, step: 1, unit: "s" },
      { key: "light", label: "Light intensity", kind: "range", min: 0, max: 1, step: 0.05 },
    ],
    initial: { sky: "cobalt", speed: 8, light: 0.8, lightColor: "white", walls: "white" },
    clocks: ["Clock"],
    build: (v) =>
      join(
        vrml`#VRML V2.0 utf8

NavigationInfo { headlight FALSE type [ "EXAMINE" "ANY" ] }
Background { skyColor ${p("sky", rgb(str(v, "sky")))} groundColor 0.2 0.25 0.15 }
Viewpoint { position 8 4.5 11 orientation -0.355 0.927 0.124 0.724 }
DirectionalLight { direction -0.3 -1 -0.5 intensity 0.5 }

Transform { # ground
  translation 0 -0.06 0
  children Shape {
    appearance Appearance { material Material { diffuseColor 0.25 0.35 0.2 } }
    geometry Box { size 30 0.05 30 }
  }
}

DEF Sculpture Transform { # outside, by the open side of the room
  translation 0 1.2 4.5
  children Shape {
    appearance Appearance { material Material { diffuseColor 0.12 0.62 1 emissiveColor 0.02 0.2 0.35 } }
    geometry Box { size 0.9 0.9 0.9 }
  }
}
DEF Clock TimeSensor { cycleInterval ${p("speed", n(num(v, "speed")))} loop TRUE }
DEF Turn OrientationInterpolator {
  key [ 0 0.5 1 ]
  keyValue [ 1 1 0 0, 1 1 0 3.1416, 1 1 0 6.2832 ]
}
ROUTE Clock.fraction_changed TO Turn.set_fraction
ROUTE Turn.value_changed TO Sculpture.set_rotation

`,
        room(v),
      ),
  },
]

// The Learn page runs whatever the reader types. Keep that to shapes,
// colours, transforms, lights and clocks: nothing that fetches a URL or
// runs a script.
const BLOCKED = /\b(Script|Inline|Anchor|EXTERNPROTO|ImageTexture|MovieTexture|AudioClip|Sound|url|ecmascript|javascript|vrmlscript|LoadSensor)\b/

export function checkSource(text: string): string | null {
  if (text.length > 20000) return "This lesson editor takes up to 20,000 characters."
  if (!text.trimStart().startsWith("#VRML V2.0")) return "The first line must be #VRML V2.0 utf8."
  const m = BLOCKED.exec(text)
  if (m) return `“${m[1]}” is turned off in this editor. Here you can use shapes, colours, transforms, lights and clocks. FreeWRL itself can open files that use ${m[1]}.`
  return null
}
