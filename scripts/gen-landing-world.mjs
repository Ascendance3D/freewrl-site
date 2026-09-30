// Generates public/worlds/freewrl-landing.wrl — the landing world for freewrl.org:
// the FreeWRL hand-and-eye mark (same construction as the earlier hand-and-eye.wrl) held inside
// a gold dial over a stepped plaza, framed by a slab tower, a portal, a fin fan and a mast.
// Plain VRML97: primitives, IndexedFaceSet, IndexedLineSet, one TimeSensor. No textures,
// no Script, no Text. Deterministic: same source, same bytes.
// Original work for freewrl.org; same licence as the site content.
// Run: node scripts/gen-landing-world.mjs [--out path]
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const outArg = process.argv.indexOf("--out")
const OUT = outArg > 0 ? process.argv[outArg + 1] : fileURLToPath(new URL("../public/worlds/freewrl-landing.wrl", import.meta.url))

const f = (n) => { const v = Number(n.toFixed(3)); return Object.is(v, -0) ? 0 : v }
const v3 = (p) => p.map(f).join(" ")
const deg = (d) => (d * Math.PI) / 180
const TAU = Math.PI * 2

// ---- scene frame -----------------------------------------------------------
// The eye sits at the origin so EXAMINE turns the world around the mark.
const FLOOR = -7.6

// ---- materials: one DEF per role, USE after ---------------------------------
// ambientIntensity is raised on lit surfaces so faces turned from the key light
// stay blue instead of going black (VRML ambient = light x material x diffuse).
const MATS = {
  INK: "diffuseColor 0.03 0.04 0.09 specularColor 0.1 0.12 0.2 shininess 0.2 ambientIntensity 0.6",
  DEEP_BLUE: "diffuseColor 0.07 0.11 0.36 specularColor 0.15 0.2 0.4 shininess 0.25 ambientIntensity 0.6",
  RESEARCH_BLUE: "diffuseColor 0.12 0.22 0.68 emissiveColor 0.02 0.04 0.14 specularColor 0.3 0.35 0.6 shininess 0.3 ambientIntensity 0.6",
  PAPER_WHITE: "diffuseColor 0.9 0.92 0.96 emissiveColor 0.22 0.24 0.3 ambientIntensity 0.5",
  ANNOTATION_GOLD: "diffuseColor 0.95 0.74 0.16 emissiveColor 0.42 0.3 0.04 specularColor 1 0.9 0.6 shininess 0.5 ambientIntensity 0.5",
  FREEWRL_CYAN: "diffuseColor 0.18 0.77 1 emissiveColor 0.1 0.55 0.85 ambientIntensity 0.4",
  MARK_ORANGE: "diffuseColor 1 0.48 0.08 emissiveColor 0.7 0.26 0.02",
  ACCENT_MAGENTA: "diffuseColor 0.85 0.12 0.62 emissiveColor 0.3 0.02 0.2 ambientIntensity 0.5",
  // unlit line colours (IndexedLineSet uses emissiveColor only)
  LINE_CYAN: "emissiveColor 0.18 0.72 1",
  LINE_BLUE: "emissiveColor 0.14 0.24 0.66",
  LINE_GOLD: "emissiveColor 0.95 0.74 0.2",
}
const defined = new Set()
function app(name) {
  if (defined.has(name)) return `USE ${name}`
  defined.add(name)
  return `DEF ${name} Appearance { material Material { ${MATS[name]} } }`
}

// ---- geometry helpers --------------------------------------------------------
const add = (a, b) => a.map((c, i) => c + b[i])
const sub = (a, b) => a.map((c, i) => c - b[i])
const mul = (a, s) => a.map((c) => c * s)
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a) => mul(a, 1 / Math.hypot(...a))

function box(name, pos, size, rot = null) {
  const r = rot ? ` rotation ${v3(rot.slice(0, 3))} ${f(rot[3])}` : ""
  return `Transform { translation ${v3(pos)}${r} children Shape { appearance ${app(name)} geometry Box { size ${v3(size)} } } }`
}
function cyl(name, pos, radius, height, opts = "", rot = null) {
  const r = rot ? ` rotation ${v3(rot.slice(0, 3))} ${f(rot[3])}` : ""
  return `Transform { translation ${v3(pos)}${r} children Shape { appearance ${app(name)} geometry Cylinder { radius ${f(radius)} height ${f(height)}${opts} } } }`
}
// A mesh: points + faces (each an index list). Flat unless crease is given.
function mesh(name, pts, faces, crease = 0) {
  const c = crease ? ` creaseAngle ${crease}` : ""
  return `Shape { appearance ${app(name)} geometry IndexedFaceSet { solid FALSE${c}
      coord Coordinate { point [ ${pts.map(v3).join(", ")} ] }
      coordIndex [ ${faces.map((fc) => fc.join(" ") + " -1").join(" ")} ] } }`
}
// Many meshes of one appearance merged into one Shape.
function merged(name, parts, crease = 0) {
  const pts = [], faces = []
  for (const [p, fs] of parts) { const o = pts.length; pts.push(...p); for (const fc of fs) faces.push(fc.map((i) => i + o)) }
  return mesh(name, pts, faces, crease)
}
function lines(name, segs) {
  const pts = [], idx = []
  for (const s of segs) { const o = pts.length; pts.push(...s); idx.push(s.map((_, i) => o + i).join(" ") + " -1") }
  return `Shape { appearance ${app(name)} geometry IndexedLineSet {
      coord Coordinate { point [ ${pts.map(v3).join(", ")} ] }
      coordIndex [ ${idx.join(" ")} ] } }`
}
// Thin triangular fin: base centre b, base half-width along w, tip t, thickness along n.
function fin(b, w, t, n) {
  const h = mul(n, 0.5)
  const P = [sub(b, w), add(b, w), t].flatMap((p) => [add(p, h), sub(p, h)])
  return [P, [[0, 2, 4], [1, 5, 3], [0, 1, 3, 2], [2, 3, 5, 4], [4, 5, 1, 0]]]
}
// Prism from a convex footprint polygon (x,z pairs) between y0 and y1.
function prism(foot, y0, y1) {
  const n = foot.length
  const P = [...foot.map(([x, z]) => [x, y0, z]), ...foot.map(([x, z]) => [x, y1, z])]
  const F = [foot.map((_, i) => n - 1 - i), foot.map((_, i) => n + i)]
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; F.push([i, j, n + j, n + i]) }
  return [P, F]
}
// Ramp: full height h at z0, down to the floor at z1, between x0 and x1.
function wedge(x0, x1, z0, z1, y, h) {
  const P = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y + h, z0], [x1, y + h, z0]]
  return [P, [[0, 1, 2, 3], [0, 4, 5, 1], [4, 3, 2, 5], [0, 3, 4], [1, 5, 2]]]
}
// Flat ring band (washer with depth) in the XY plane, arc a0..a1 (radians).
function ring(r0, r1, depth, a0 = 0, a1 = TAU, seg = 48) {
  const full = Math.abs(a1 - a0 - TAU) < 1e-9
  const n = full ? seg : seg + 1, d = depth / 2, P = [], F = []
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / seg, c = Math.cos(a), s = Math.sin(a)
    P.push([c * r0, s * r0, d], [c * r1, s * r1, d], [c * r0, s * r0, -d], [c * r1, s * r1, -d])
  }
  for (let i = 0; i < seg; i++) {
    const A = i * 4, B = ((i + 1) % n) * 4
    F.push([A, A + 1, B + 1, B], [A + 2, B + 2, B + 3, A + 3], [A + 1, A + 3, B + 3, B + 1], [A, B, B + 2, A + 2])
  }
  if (!full) { const L = (n - 1) * 4; F.push([0, 2, 3, 1], [L, L + 1, L + 3, L + 2]) }
  return [P, F]
}
// Flat annulus in the XY plane (sign faces).
function annulus(r0, r1, seg = 28) {
  const P = [], F = []
  for (let i = 0; i < seg; i++) { const a = (TAU * i) / seg; P.push([Math.cos(a) * r0, Math.sin(a) * r0, 0], [Math.cos(a) * r1, Math.sin(a) * r1, 0]) }
  for (let i = 0; i < seg; i++) { const A = i * 2, B = ((i + 1) % seg) * 2; F.push([A, A + 1, B + 1, B]) }
  return [P, F]
}
const circle = (r, y, seg = 72, cx = 0, cz = 0) => Array.from({ length: seg + 1 }, (_, i) => [cx + Math.cos((TAU * i) / seg) * r, y, cz + Math.sin((TAU * i) / seg) * r])
const octa = (s) => [[[s, 0, 0], [-s, 0, 0], [0, s * 1.5, 0], [0, -s * 1.5, 0], [0, 0, s], [0, 0, -s]],
  [[0, 2, 4], [4, 2, 1], [1, 2, 5], [5, 2, 0], [4, 3, 0], [1, 3, 4], [5, 3, 1], [0, 3, 5]]]

// Viewpoint orientation that looks from `pos` at `at` with +Y up.
function lookAt(pos, at) {
  const z = norm(sub(pos, at)), x = norm(cross([0, 1, 0], z)), y = cross(z, x)
  const R = [[x[0], y[0], z[0]], [x[1], y[1], z[1]], [x[2], y[2], z[2]]]
  const ang = Math.acos(Math.min(1, Math.max(-1, (R[0][0] + R[1][1] + R[2][2] - 1) / 2)))
  if (ang < 1e-6) return [0, 0, 1, 0]
  const ax = norm([R[2][1] - R[1][2], R[0][2] - R[2][0], R[1][0] - R[0][1]])
  return [...ax, ang]
}
function viewpoint(def, desc, pos, at, fov) {
  const o = lookAt(pos, at)
  return `DEF ${def} Viewpoint { description "${desc}" position ${v3(pos)} orientation ${v3(o.slice(0, 3))} ${f(o[3])} fieldOfView ${fov} }`
}

// ---- the mark (unchanged construction from gen-hero-world.mjs) ----------------
const FINGERS = [[168, 1.35, 2.2], [127, 1.45, 2.7], [93, 1.45, 3.1], [62, 1.45, 2.8], [33, 1.4, 2.3]]
const R = 0.3
function finger([a, r0, len], i) {
  const t = deg(a)
  const cx = Math.cos(t) * (r0 + len / 2), cy = Math.sin(t) * (r0 + len / 2)
  return `      Transform { # finger ${i + 1}
        translation ${f(cx)} ${f(cy)} 0
        rotation 0 0 1 ${f(t - Math.PI / 2)}
        children [
          Shape { appearance USE Glass geometry Cylinder { radius ${R} height ${len} top FALSE bottom FALSE } }
          Transform { translation 0 ${len / 2} 0 children Shape { appearance USE Glass geometry Sphere { radius ${R} } } }
          Transform { translation 0 ${-len / 2} 0 children Shape { appearance USE Glass geometry Sphere { radius ${R} } } }
        ]
      }`
}
const MARK = `DEF Hand Transform { # the FreeWRL mark: eye at the origin, five fingers around it
  children [
    Transform { # eyeball, flattened so the iris sits on its face
      scale 1 1 0.62
      children Shape {
        appearance Appearance { material Material { diffuseColor 0.62 0.76 0.95 emissiveColor 0.12 0.16 0.24 specularColor 1 1 1 shininess 0.8 } }
        geometry Sphere { radius 1.15 }
      }
    }
    Transform { # iris
      translation 0 0 0.735 rotation 1 0 0 1.5708
      children Shape {
        appearance Appearance { material DEF Iris Material { diffuseColor 0.04 0.28 0.85 emissiveColor 0.02 0.14 0.48 specularColor 0.25 0.3 0.4 shininess 0.3 } }
        geometry Cylinder { radius 0.64 height 0.06 }
      }
    }
    Transform { # pupil
      translation 0 0 0.775 rotation 1 0 0 1.5708
      children Shape {
        appearance Appearance { material Material { diffuseColor 0 0 0 specularColor 0.15 0.15 0.15 shininess 0.5 } }
        geometry Cylinder { radius 0.3 height 0.04 }
      }
    }
    Transform { # catch-light
      translation -0.26 0.28 0.8
      children Shape { appearance Appearance { material Material { diffuseColor 1 1 1 emissiveColor 0.9 0.95 1 } } geometry Sphere { radius 0.08 } }
    }
    Transform { # the five fingers
      children [
        Shape { appearance DEF Glass Appearance { material Material { diffuseColor 0.1 0.62 1 emissiveColor 0.04 0.4 0.78 specularColor 0.9 0.97 1 shininess 0.7 } } }
${FINGERS.map(finger).join("\n")}
      ]
    }
  ]
}`

// ---- the dial: gold outer ring (still), cyan inner ring (turns) ---------------
const DIAL_R = 6.1
const ticks = []
for (let i = 0; i < 24; i++) {
  const a = (TAU * i) / 24, long = i % 6 === 0
  const r0 = DIAL_R + 0.45, r1 = DIAL_R + (long ? 1.25 : 0.75)
  ticks.push([[Math.cos(a) * r0, Math.sin(a) * r0, 0], [Math.cos(a) * r1, Math.sin(a) * r1, 0]])
}
// The gold ring opens at the bottom where the axis comes up from the stage.
const GAP = deg(26)
const DIAL = `Transform { # the dial: an open gold ring around the mark, with tick marks
  children [
    ${merged("ANNOTATION_GOLD", [ring(DIAL_R, DIAL_R + 0.32, 0.32, -Math.PI / 2 + GAP / 2, (3 * Math.PI) / 2 - GAP / 2, 60)], 0.6)}
    ${lines("LINE_GOLD", ticks)}
  ]
}
DEF Gyro Transform { # a thin cyan ring that turns slowly through the dial
  children Transform { rotation 1 0 0 1.0472 children ${merged("FREEWRL_CYAN", [ring(5.2, 5.34, 0.1, 0, TAU, 40)], 0.6)} }
}
DEF Orbit Transform { # a small orange marker circling the mark
  children Transform { rotation 0 0 1 -0.35 children Transform { translation 7.6 0 0 children ${merged("MARK_ORANGE", [octa(0.28)])} } }
}`

// ---- the plaza -----------------------------------------------------------------
const STAGE_TOP = FLOOR + 1.0
const radials = [], rings = []
for (let i = 0; i < 20; i++) {
  const a = (TAU * i) / 20 + deg(9)
  radials.push([[Math.cos(a) * 9.5, FLOOR + 0.02, Math.sin(a) * 9.5], [Math.cos(a) * 30, FLOOR + 0.02, Math.sin(a) * 30]])
}
for (const r of [13, 19, 27]) rings.push(circle(r, FLOOR + 0.02, 72))
const grid = [] // the old hero's grid, kept as one quarter of the plaza
for (let x = 8; x <= 28; x += 2) grid.push([[x, FLOOR + 0.03, -30], [x, FLOOR + 0.03, -8]])
for (let z = -30; z <= -8; z += 2) grid.push([[8, FLOOR + 0.03, z], [28, FLOOR + 0.03, z]])
const axis = [[[0, STAGE_TOP, 0], [0, -1.2, 0]]]
for (let y = STAGE_TOP + 1; y < -1.4; y += 1) axis.push([[-0.35, y, 0], [0.35, y, 0]])

const PLAZA = `Transform { # the plaza: base slab, stepped platform, round stage
  children [
    ${box("INK", [0, FLOOR - 0.4, -6], [76, 0.8, 72])}
    ${box("DEEP_BLUE", [0, FLOOR + 0.2, -1], [22, 0.4, 16])}
    ${cyl("RESEARCH_BLUE", [0, FLOOR + 0.55, 0], 4.6, 0.3)}
    ${cyl("DEEP_BLUE", [0, FLOOR + 0.85, 0], 3.3, 0.3)}
    ${lines("LINE_GOLD", [circle(4.62, FLOOR + 0.71, 64), circle(3.32, STAGE_TOP + 0.01, 64)])}
    ${lines("LINE_CYAN", axis)}
    ${lines("LINE_BLUE", [...radials, ...rings, ...grid])}
    ${merged("DEEP_BLUE", [wedge(-6.5, -3.5, 7, 17, FLOOR, 0.4)])}
  ]
}`

// ---- architecture ------------------------------------------------------------------
// West: a slab tower with two cantilevered decks and a leaning fin behind it.
const WEST = `Transform { # west: slab tower, cantilevered decks, leaning fin
  children [
    ${merged("RESEARCH_BLUE", [fin([-19, FLOOR, -16], [2.2, 0, 0], [-9, 22, -19], [0, 0, 0.4])])}
    ${box("DEEP_BLUE", [-14.5, FLOOR + 13, -9], [3.4, 26, 3.4])}
    ${box("PAPER_WHITE", [-12.76, FLOOR + 13, -9], [0.08, 26, 0.5])}
    ${box("RESEARCH_BLUE", [-10, 3.5, -8], [9, 0.5, 4.2])}
    ${box("ANNOTATION_GOLD", [-5.52, 3.5, -8], [0.06, 0.5, 4.22])}
    ${box("INK", [-11, 9.2, -10.5], [11, 0.5, 3.2])}
    ${box("INK", [-7.5, FLOOR + 5.55, -8], [0.3, 11.1, 0.3])}
    ${lines("LINE_CYAN", [[[-10, 3.78, -5.9], [-5.6, 3.78, -5.9]]])}
  ]
}`
// East: a fan of broad fins, and a mast carrying a target sign.
const fan = [[-14, 17, 1.5, "DEEP_BLUE"], [2, 24, 1.9, "RESEARCH_BLUE"], [18, 19, 1.6, "INK"], [34, 14, 1.4, "ACCENT_MAGENTA"], [52, 10, 1.2, "DEEP_BLUE"]]
const FAN_BASE = [18, FLOOR, -12]
const fanParts = {}
for (const [a, h, w, m] of fan) {
  const t = deg(a)
  const tip = add(FAN_BASE, [Math.sin(t) * h * 0.6, h * Math.cos(t * 0.5), -1.5 + Math.sin(t) * 1.5])
  ;(fanParts[m] ??= []).push(fin(add(FAN_BASE, [Math.sin(t) * 1.2, 0, 0]), [w * Math.cos(t), 0, 0], tip, [0, 0, 0.3]))
}
const target = [0.2, 0.55, 0.9, 1.25].map((r, i) => [annulus(r, r + 0.18), i])
const EAST = `Transform { # east: fin fan, mast, target sign
  children [
    ${Object.entries(fanParts).map(([m, parts]) => merged(m, parts)).join("\n    ")}
    ${box("INK", [10.5, FLOOR + 8.5, -6], [0.3, 17, 0.3])}
    ${box("INK", [10.5, FLOOR + 12, -6], [2.4, 0.16, 0.16])}
    ${box("INK", [10.5, FLOOR + 14, -6], [3.4, 0.16, 0.16])}
    Transform { # target sign
      translation 10.5 ${f(FLOOR + 17.2)} -5.9
      children [
        ${cyl("INK", [0, 0, -0.06], 1.6, 0.08, "", [1, 0, 0, Math.PI / 2])}
        ${merged("ANNOTATION_GOLD", target.filter(([, i]) => i % 2 === 0).map(([p]) => p))}
        ${merged("FREEWRL_CYAN", target.filter(([, i]) => i % 2 === 1).map(([p]) => p))}
      ]
    }
    ${lines("LINE_CYAN", [[[10.5, FLOOR + 17, -6], [26, FLOOR, 4]]])}
  ]
}`
// Portal: two jambs and a lintel on the plaza's front-right, framing the eye.
const PORTAL = `Transform { # portal: jambs and lintel, front right
  translation 8.2 0 10.2
  rotation 0 1 0 ${f(deg(36.5))}
  children [
    ${box("INK", [-2.4, FLOOR + 5, 0], [0.7, 10, 1.2])}
    ${box("INK", [2.4, FLOOR + 3.75, 0], [0.7, 7.5, 1.2])}
    ${box("RESEARCH_BLUE", [0.6, FLOOR + 10.1, 0], [7.4, 0.6, 1.4], [0, 0, 1, deg(-6)])}
    ${box("ANNOTATION_GOLD", [0.6, FLOOR + 9.8, 0.72], [7.4, 0.1, 0.04], [0, 0, 1, deg(-6)])}
    ${lines("LINE_CYAN", [[[-2.03, FLOOR, 0.61], [-2.03, FLOOR + 10, 0.61]]])}
  ]
}`
// Sky: one suspended slab above and behind the dial.
const SKY = `Transform { # sky structure: a suspended slab
  children [
    ${box("RESEARCH_BLUE", [2, 13.5, -17], [22, 0.5, 3.4], [0, 0, 1, deg(-7)])}
    ${box("ANNOTATION_GOLD", [2, 13.2, -15.28], [22, 0.12, 0.06], [0, 0, 1, deg(-7)])}
    ${lines("LINE_CYAN", [[[-8.9, 14.8, -17], [-14.5, FLOOR + 26, -9]], [[12.9, 12.1, -17], [18, FLOOR, -26]]])}
  ]
}`
// Skyline: dark silhouettes on the horizon, plus a few far fins.
const SKY_BLOCKS = [[-46, -52, 5, 18, 5], [-38, -58, 4, 30, 4], [-30, -50, 7, 12, 5], [-22, -62, 3, 24, 3], [-12, -56, 6, 15, 6], [-4, -66, 3, 36, 3],
  [8, -58, 8, 10, 5], [20, -60, 4, 27, 4], [28, -52, 6, 16, 6], [38, -62, 3, 34, 3], [46, -54, 7, 20, 5], [-56, -40, 4, 14, 6], [56, -42, 5, 22, 5]]
const SKYLINE = `Transform { # skyline silhouettes
  children [
    ${merged("INK", SKY_BLOCKS.map(([x, z, w, h, d]) => prism([[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2]], FLOOR, FLOOR + h)))}
    ${merged("DEEP_BLUE", [fin([-28, FLOOR, -48], [2, 0, 0], [-20, 34, -52], [0, 0, 0.4]), fin([34, FLOOR, -46], [2, 0, 0], [28, 30, -50], [0, 0, 0.4])])}
  ]
}`
// Foreground: a low plinth carrying a coordinate marker.
const FORE = `Transform { # foreground: plinth with an x, y, z marker
  children [
    ${box("INK", [-10.5, FLOOR + 0.9, 10], [6, 1.8, 4])}
    ${lines("LINE_CYAN", [[[-13.5, FLOOR + 1.81, 12.01], [-7.5, FLOOR + 1.81, 12.01]]])}
    Transform {
      translation -10.5 ${f(FLOOR + 1.8)} 10
      children [
        ${box("ANNOTATION_GOLD", [1.2, 0.08, 0], [2.4, 0.16, 0.16])}
        ${box("PAPER_WHITE", [0, 1.2, 0], [0.16, 2.4, 0.16])}
        ${box("FREEWRL_CYAN", [0, 0.08, 1.2], [0.16, 0.16, 2.4])}
        ${box("MARK_ORANGE", [0, 0.15, 0], [0.4, 0.3, 0.4])}
      ]
    }
  ]
}`

// ---- camera ------------------------------------------------------------------------
const VIEWS = [
  viewpoint("Hero", "Plaza", [-3.4, -2.1, 21.5], [1, -0.9, 0], 0.8),
  viewpoint("Near", "Under the tower", [-10.2, -3.4, 16], [-3.6, 1.2, -4], 0.95),
  viewpoint("Portal", "Through the portal", [15.5, -6.2, 21], [0, 1.2, 0], 0.78),
  viewpoint("Plan", "From above", [6, 26, 26], [0, -6, -2], 0.8),
]

const wrl = `#VRML V2.0 utf8
# freewrl-landing.wrl — the FreeWRL mark in a small world: a plaza, a dial, a tower,
# a portal, a fan of fins, a mast and a skyline. Every shape is VRML97 you can read.
# Generated by scripts/gen-landing-world.mjs for freewrl.org.
# Try: change the Gyro ring's rotation, or ACCENT_MAGENTA's diffuseColor.

WorldInfo { title "FreeWRL landing world" info [ "freewrl.org landing world" ] }
NavigationInfo { type [ "EXAMINE" "ANY" ] headlight FALSE }
Background {
  skyColor [ 0.012 0.018 0.06, 0.03 0.05 0.17, 0.08 0.14 0.42, 0.16 0.3 0.66 ]
  skyAngle [ 0.9, 1.35, 1.5708 ]
  groundColor [ 0.02 0.03 0.09, 0.02 0.03 0.09 ]
  groundAngle [ 1.5708 ]
}
${VIEWS.join("\n")}
DirectionalLight { direction 0.45 -0.55 -0.7 color 1 0.97 0.92 intensity 0.85 ambientIntensity 0.5 }
DirectionalLight { direction -0.6 -0.2 0.75 color 0.55 0.75 1 intensity 0.35 }

${MARK}

${DIAL}

${PLAZA}

${WEST}

${EAST}

${PORTAL}

${SKY}

${SKYLINE}

${FORE}

# One clock drives all motion, so pausing "Clock" stills the whole world.
DEF Clock TimeSensor { cycleInterval 72 loop TRUE }
DEF GyroTurn OrientationInterpolator { key [ 0 0.25 0.5 0.75 1 ] keyValue [ 0 1 0 0, 0 1 0 1.5708, 0 1 0 3.1416, 0 1 0 4.7124, 0 1 0 6.2832 ] }
DEF OrbitTurn OrientationInterpolator { key [ 0 0.25 0.5 0.75 1 ] keyValue [ 0 1 0 0, 0 1 0 -1.5708, 0 1 0 -3.1416, 0 1 0 -4.7124, 0 1 0 -6.2832 ] }
ROUTE Clock.fraction_changed TO GyroTurn.set_fraction
ROUTE Clock.fraction_changed TO OrbitTurn.set_fraction
ROUTE GyroTurn.value_changed TO Gyro.set_rotation
ROUTE OrbitTurn.value_changed TO Orbit.set_rotation
`
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, wrl)
console.log(`${OUT}: ${Buffer.byteLength(wrl)} bytes, ${(wrl.match(/Shape \{/g) || []).length} Shape nodes, ${defined.size} shared appearances`)
