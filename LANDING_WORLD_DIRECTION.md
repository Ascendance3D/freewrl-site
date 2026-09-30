# Landing world — direction

The homepage hero world (`public/worlds/freewrl-landing.wrl`). It replaced the earlier
`hand-and-eye.wrl`. Ryan approved the visuals on 2026-09-30. It was integrated on branch
`redesign/final-integration`.

- Source of truth: `scripts/gen-landing-world.mjs` (`npm run world:hero`)
- Output: `public/worlds/freewrl-landing.wrl` (the generator is deterministic: same source, same bytes)
- Review harness: `qa/landing-world.mjs` (captures every Viewpoint of the real homepage viewer; can swap in another world by request routing)

## Design goal

Show more than a logo: a small place that someone could build. The FreeWRL hand-and-eye
stays the focal point. It floats inside a gold dial above a round stage. A stepped plaza,
a slab tower, a portal, a fan of fins, a mast with a target sign and a skyline surround it.
The statement is "the Web can contain worlds," made from about 60 plain VRML97 shapes.

## Silhouette plan

- **Centre:** the dial, an open gold ring (r 6.1) with 24 tick marks. The gap at the
  bottom lets the cyan axis rise from the stage to the eye. From the hero view the ring
  frames the mark completely.
- **Left:** a vertical slab tower with a white edge line, two cantilevered decks pointing
  at the dial (one blue with a gold end, one black), and a leaning blue fin behind.
- **Right:** a fan of five broad fins (one magenta) and a thin mast with crossbars and a
  gold and cyan target sign.
- **Top:** one suspended blue slab with a gold edge, tilted 7°, and a cyan cable to the tower.
- **Horizon:** 13 dark blocks and two far fins against a lighter blue horizon band.

## Architecture plan

Boxes for slabs, decks, mast and portal. `IndexedFaceSet` for fins, rings, the ramp, the
skyline prisms and the orbit marker. `IndexedLineSet` for the floor plan, cables, the axis
and the ticks. No realistic buildings, people, vehicles, trees, text or textures.

## Mark placement

The mark keeps the current construction unchanged: five Cylinder+Sphere capsules around a
flattened Sphere eye, with the same finger angles, radii and Glass appearance. The eyeball
gains a small emissive lift so that it keeps its value without a headlight. The eye sits
at the origin, so EXAMINE navigation turns the world around the mark with no X3D-only
`centerOfRotation`. The floor is at y = -7.6. The mark floats above the stage, inside the dial.

## Colour palette

11 shared appearances (`DEF` once, `USE` after), plus the mark's 5:

| Role | Use |
|---|---|
| INK | tower decks, fins, mast, portal, skyline, base slab |
| DEEP_BLUE | tower, platform, stage, far fins |
| RESEARCH_BLUE | decks, suspended slab, lintel, fins |
| PAPER_WHITE | tower edge, the Y axis |
| ANNOTATION_GOLD | the dial, edges, target rings, the X axis |
| FREEWRL_CYAN | gyro ring, target rings, the Z axis |
| MARK_ORANGE | orbit marker, axis origin (small only) |
| ACCENT_MAGENTA | one fin (a single hot note) |
| LINE_CYAN / LINE_BLUE / LINE_GOLD | unlit lines (floor plan, cables, axis, ticks) |

## Floor design

A dark base slab (76 × 72) carries a blue stepped platform and a two-step round stage with
gold rim lines. The floor lines are a target plan: 20 radials and three rings centred on the
stage. From the hero view they converge on the mark. The old hero's grid survives in one
quarter (the right rear), and a low ramp and a plinth with an x/y/z marker sit in the
foreground.

## Animation plan

One `TimeSensor` named `Clock` (72 s loop) drives everything. The homepage viewer's
Pause button and reduced-motion handling stop the TimeSensor named `Clock`, so pausing it
stills the whole world with no site change.

- The cyan gyro ring (tilted 60°) turns about Y, through the dial.
- A small orange marker orbits the mark at r 7.6 on a tilted path, turning the other way.
- The mark, dial and architecture do not move.

VRML97 starts the clock at time 0, so the loop phase depends on the wall clock at load.
Every phase was checked to read well when paused.

## Viewpoints

1. **Plaza** (hero): low, slightly left, looking a little up. The dial frames the mark,
   the tower frames the left side and the fins and mast the right, and the floor radials
   lead in. Composed to hold at 4:5 (phone), 4:3 (tablet) and the desktop column.
2. **Under the tower:** closer, from the left front above the marker plinth. The tower,
   decks and leaning fin fill the left half, and the mark sits in the dial on the right.
3. **Through the portal:** from the front right. The mark is seen through the portal jambs
   and under the lintel.
4. **From above:** the plan. It shows the stage, platform, target floor, grid quarter,
   ramp and marker as one place.

## Compatibility plan

- VRML97 only: Transform, Shape, Appearance, Material, Box, Sphere, Cylinder,
  IndexedFaceSet, IndexedLineSet, Background, Viewpoint, NavigationInfo,
  DirectionalLight ×2, TimeSensor, OrientationInterpolator, ROUTE. No Script, Text,
  textures, Fog, Extrusion, PROTO or X3D fields.
- `solid FALSE` on every IndexedFaceSet, so winding cannot drop faces in any browser.
- `headlight FALSE`, with two directional lights (warm key, cool fill). Material
  `ambientIntensity` is raised (0.4–0.6) so shaded faces keep their colour. This is the
  CTNG lesson below.
- No z-fighting pairs: coplanar details are offset by ≥ 0.02.

## Expected complexity (measured, see the final report)

About 49 KB raw and 11 KB gzip, 67 Shape nodes, and about 12k triangles. Most of the
triangles are the mark's 12 Spheres (832 each in X_ITE). Everything else costs about 2k.

## Methods borrowed from ctng-syd-1

- Strong diagonal silhouettes from thin triangular fins, as a fan
- Rings and targets as graphic signs (syd1's yellow loops, the target sign)
- An open plaza in front of the landmark, with radiating ground lines leading to it
- Long cable lines that cross the sky
- One key light and high material `ambientIntensity`, so shaded faces do not go black
  in X_ITE (BUILD-NOTES, "Assembly" table)
- Shared appearances via DEF/USE
- Viewpoints composed as pictures with explicit field of view, not automatic cameras

## Methods deliberately not borrowed

- The Blender → exporter → assembler pipeline: this world is a small hand-readable
  generator, in keeping with the site's "view source" message
- The texture atlas and runtime graphics (the CTNG world has one atlas and 45 painted
  appearances). The world has no textures and no lettering.
- Walk-scale navigation, avatar sizing and circulation (ramps to code, deck routes): the
  homepage world is an EXAMINE object, not a walkable district
- The warm orange sky, the Syd Mead forms, the CTNG layout and any Cybertown signage or
  wording
- Multiple environment-state files
- CTNG's size: 628 IndexedFaceSets and about 500 KB
