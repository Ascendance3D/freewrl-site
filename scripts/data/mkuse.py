import json
ML="freex3d/src/lib/main/MainLoop.c"
VC="freex3d/src/lib/scenegraph/Viewer.c"
OP="freex3d/src/bin/options.c"
BI="freex3d/src/lib/x3d_parser/Bindable.c"
def nm(name,key,desc,v,ev): return dict(name=name,key=key,description=desc,verified=v,evidence=ev)
navModes=[
 nm("EXAMINE","e","Turn the whole model around its center, like a trackball. This is the default when the scene has no NavigationInfo.",True,f"{ML}:6473; default {VC}:195; drag {VC}:917"),
 nm("WALK","w","Move over the ground. Drag up or down to walk forward or back, left or right to turn.",True,f"{ML}:6474; {VC}:851"),
 nm("FLY","d","Move freely in 3D with the mouse or keyboard. The drag style (YAWZ, XY, YAWPITCH, ROLL) is picked from the HUD fly button.",True,f"{ML}:6475; {VC}:1842,2666"),
 nm("EXFLY","f","Fly driven by an external device: FreeWRL reads position and orientation from the file /tmp/inpdev (C:/tmp/inpdev.txt on Windows). If the file is missing it falls back to EXAMINE.",True,f"{ML}:6476; {VC}:2431; freex3d/src/lib/scenegraph/Viewer.h:63-65"),
 nm("SPHERICAL","y","Stand still and look around, as in a panorama. Press y again to switch the drag to zooming the field of view.",True,f"{ML}:6477; {VC}:429,1182"),
 nm("TURNTABLE","t","Orbit the model like a record on a turntable: no roll, so the up direction stays up.",True,f"{ML}:6478; {VC}:1065"),
 nm("EXPLORE","g","Orbit around a point you choose. Hold Ctrl and click (or press g again) to pick a new center point.",True,f"{ML}:6480; {VC}:444,1651"),
 nm("LOOKAT","m","Click an object and the viewer moves to look at it, then returns to the previous mode. Press m again to cancel.",True,f"{ML}:6479; {VC}:460,1610"),
 nm("DIST","ne","Drag up or down to move closer to or farther from the model's center, without rotating. Set from the HUD or NavigationInfo; there is no hotkey.",True,f"{VC}:1008; {BI}:280-283; freex3d/src/lib/ui/statusbarHud.c:2542-2543"),
 nm("PAN",None,"Drag the terrain under the cursor, scroll the wheel to zoom, and drag with the middle button to turn. Set from the HUD or NavigationInfo; there is no hotkey.",True,f"{VC}:1375; {BI}:284-287; freex3d/src/lib/ui/statusbarHud.c:2540-2541"),
 nm("NONE",None,"No user navigation. Only the scene itself can move the viewer. Set only by NavigationInfo.",True,f"{BI}:256-259; {VC}:1832"),
]
navModes[8]["key"]=None
def k(key,action,v,ev,old): return dict(key=key,action=action,verified=v,evidence=ev,oldDocSays=old)
keys=[
 k("e","EXAMINE mode",True,f"{ML}:6473","Switch to the Examine navigation mode"),
 k("w","WALK mode",True,f"{ML}:6474","Switch to the Walk navigation mode"),
 k("d","FLY mode (mouse and keyboard)",True,f"{ML}:6475","Switch to the Fly (Keyboard input) navigation mode"),
 k("f","EXFLY mode (external device input)",True,f"{ML}:6476","Switch to the Fly (External Sensor input) navigation mode"),
 k("y","SPHERICAL mode; press again to toggle field-of-view zoom",True,f"{ML}:6477; {VC}:429-443",None),
 k("t","TURNTABLE mode",True,f"{ML}:6478",None),
 k("g","EXPLORE mode; press again to toggle pick-a-center",True,f"{ML}:6480; {VC}:444-459",None),
 k("m","LOOKAT mode (toggle)",True,f"{ML}:6479; {VC}:460-472",None),
 k("v","Next viewpoint",True,f"{ML}:6499","Go to the next viewpoint (v or PGDN)"),
 k("b","Previous viewpoint",True,f"{ML}:6500","Go to the previous viewpoint (b or PGUP)"),
 k("Page Down","Next viewpoint",True,f"{ML}:6533","Go to the next viewpoint (v or PGDN)"),
 k("Page Up","Previous viewpoint",True,f"{ML}:6532","Go to the previous viewpoint (b or PGUP)"),
 k("Home","First viewpoint",True,f"{ML}:6530","Go to the first viewpoint"),
 k("End","Last viewpoint",True,f"{ML}:6531","Go to the last viewpoint"),
 k("/","Print the current viewpoint position and orientation to the console",True,f"{ML}:6483","Print position and orientation of the current viewpoint"),
 k("h","Toggle the headlight",True,f"{ML}:6481","Toggle the headlight (h, or NumLock on the Linux keypad)"),
 k("NumLock","Toggle the headlight (old Linux keypad shortcut)",False,"freex3d/src/lib/ui/fwCommonX11.c:661 (mapping is commented out)","'h' (or, NumLock on linux keypad) toggles the headlight"),
 k("c","Toggle collision detection",True,f"{ML}:6498","Toggle collision detection on or off"),
 k("`","Toggle logging console output to a file (freewrl_tmp/logfile.log)",True,f"{ML}:6490; {ML}:6327-6361","Toggle logging on or off"),
 k("Esc","Toggle whether keys go to the scene's KeySensor/StringSensor or to FreeWRL",True,f"{ML}:6423-6430","Toggle KeySensor / StringSensor sensitivity"),
 k("q","Quit (ignored when running as a browser plugin)",True,f"{ML}:6493","Quit the browser"),
 k("x","Save a screenshot (Linux/Windows builds; the macOS and Android frontends handle snapshots themselves)",True,f"{ML}:6505-6506; OSX_gui/FreeWRL-Desktop/FreeWRL/config.h:8",None),
 k("n","Clear the world (unload the current scene)",True,f"{ML}:6472",None),
 k("Space","Open a ':' command prompt in the console; type key,value and press Enter (e.g. keychord,yawz)",True,f"{ML}:6502; {ML}:6433-6463",None),
 k("H","Toggle the frame-rate histogram",True,f"{ML}:6482",None),
 k(".","Print profiling timers to the console",True,f"{ML}:6501",None),
 k("Arrow keys","Fly with the current arrow-key style. Default at startup is XY: left/right slides, up/down rises and sinks",True,f"{VC}:136; {VC}:1960-1965; {VC}:2025-2037","4 arrow-key fly modes YAWZ, XY, YAWPITCH, ROLL"),
 k("Shift+Left/Right arrow","Cycle the arrow-key style: YAWZ, YAWPITCH, ROLL, XY",True,f"{ML}:6541-6549; {VC}:1971-1978","change arrow fly mode with SHIFT-Arrow-Left/Right"),
 k("a / z","Move forward / back (also keypad 0 / keypad .)",True,f"{VC}:1943-1944; {VC}:1896","z translate forward/backward 'a'/'z'"),
 k("j / l","Slide left / right",True,f"{VC}:1939-1940","x translate left/right '7'/'9'"),
 k("p / ;","Move up / down",True,f"{VC}:1941-1942","y translate up/down 'p'/';'"),
 k("u / o","Turn (yaw) left / right (also keypad 4 / 6)",True,f"{VC}:1947-1948; {VC}:1896","yaw rotation left/right 'u'/'o'"),
 k("k / 8","Tilt (pitch) up / down (also keypad 2 / 8)",True,f"{VC}:1945-1946; {VC}:1896","pitch rotation down/up '8'/'k'"),
 k("7 / 9","Roll counterclockwise / clockwise (also keypad 7 / 9)",True,f"{VC}:1949-1950; {VC}:1896","roll rotation about the Z axis '7'/'9'"),
]
def m(inp,mode,action,v,ev): return {"input":inp,"mode":mode,"action":action,"verified":v,"evidence":ev}
mouse=[
 m("left drag","EXAMINE","Rotate the model freely, like a trackball",True,f"{VC}:917-990 (xy2qua trackball at 940,964)"),
 m("right drag","EXAMINE","Nothing now; zoom moved to DIST mode",True,f"{VC}:951,979 (commented out, moved to handle_dist); {VC}:1008"),
 m("left drag up/down","WALK","Walk forward / back; small drags are slow, big drags are fast",True,f"{VC}:883"),
 m("left drag left/right","WALK","Turn left / right",True,f"{VC}:884"),
 m("right drag","WALK","Slide sideways and up/down",True,f"{VC}:887-890"),
 m("left drag","FLY","Depends on the HUD drag style. Default YAWZ: up/down moves forward/back, left/right turns. XY slides, YAWPITCH turns and tilts, ROLL rolls",True,f"{VC}:1253-1273; {VC}:2666-2681; {VC}:137"),
 m("left drag up/down","DIST","Move toward / away from the center point",True,f"{VC}:1037"),
 m("left drag","TURNTABLE","Orbit around the center: left/right spins, up/down tilts",True,f"{VC}:1140-1144"),
 m("right drag up/down","TURNTABLE","Move in / out",True,f"{VC}:1148-1149"),
 m("left drag","SPHERICAL","Look around from a fixed spot",True,f"{VC}:1201-1228"),
 m("right drag up/down, or Ctrl+left drag","SPHERICAL","Zoom the field of view in / out",True,f"{VC}:1193; {VC}:1229-1234"),
 m("Ctrl+click","EXPLORE","Pick a new center point to orbit",True,f"{VC}:1663-1666"),
 m("left drag","EXPLORE","Orbit around the picked point (looks around like SPHERICAL until a point is picked)",True,f"{VC}:1668-1673"),
 m("click","LOOKAT","Move to look at the clicked object, then return to the previous mode",True,f"{VC}:1610-1632"),
 m("left drag","PAN","Drag the ground under the cursor",True,f"{VC}:1441-1463"),
 m("scroll wheel","PAN","Zoom in / out toward the cursor. The wheel does nothing in other modes",True,f"{VC}:1465-1477"),
 m("middle drag","PAN","Turn around the point under the cursor",True,f"{VC}:1379; {VC}:1480"),
]
def c(flag,action,ev): return {"flag":flag,"action":action,"evidence":ev}
cli=[
 c("-h, --help","Print all options",f"{OP}:295-298"),
 c("-v, --version","Print program and library version",f"{OP}:300-303"),
 c("-c, --fullscreen","Start full screen (on X11 only if built with the xf86vmode extension)",f"{OP}:307-328"),
 c("-g, --geometry WxH[+X+Y]","Set window size and position, e.g. 1024x768+100+50",f"{OP}:330-343"),
 c("-b, --big","Start with an 800x600 window",f"{OP}:345"),
 c("--FPS N","Cap the frame rate at N frames per second",f"{OP}:515"),
 c("--want TF","Show the status bar (T/F) and menu bar (T/F)",f"{OP}:506"),
 c("--pin TF","Pin the status bar (T/F) and menu bar (T/F) so they stay visible",f"{OP}:503"),
 c("-K, --keypress STRING","Send these keypresses once the scene is ready (e.g. 'w' to start in WALK)",f"{OP}:491"),
 c("-L, --logfile FILE","Send all console messages to FILE ('-' keeps stdout)",f"{OP}:539; {ML}:6363-6372"),
 c("--anaglyph LR","Red/cyan-style stereo; L and R are each one of R,G,B,C,A,M (e.g. RC, RB)",f"{OP}:423; {OP}:87"),
 c("--sidebyside","Side-by-side stereo in one window",f"{OP}:427"),
 c("-u, --shutter","Shutter-glasses stereo (needs quad-buffer OpenGL)",f"{OP}:408"),
 c("-y, --eyedist N / -r, --screendist N","Stereo eye separation and screen distance",f"{OP}:400-406"),
 c("-e, --eai","Enable the External Authoring Interface (no host:port argument any more)",f"{OP}:360"),
 c("-J, --javascript SM|DUK|NONE","Choose the script engine: SpiderMonkey, Duktape, or none",f"{OP}:548"),
 c("--shadingStyle N","0 flat, 1 Gouraud, 2 Phong, 3 wireframe",f"{OP}:509"),
]
disc=[
 "Old doc: keyboard x translate is '7'/'9'. Current source: j/l slide left/right; 7/9 are roll ("+VC+":1939-1950).",
 "Old doc: NumLock on the Linux keypad toggles the headlight. Current source: that X11 mapping is commented out, only 'h' works (freex3d/src/lib/ui/fwCommonX11.c:661).",
 "Old doc lists only EXAMINE, DIST, WALK, FLY. Current source adds SPHERICAL (y), TURNTABLE (t), EXPLORE (g), LOOKAT (m), PAN (HUD only), plus NONE and EXFLY.",
 "Old doc: EXAMINE up/down drag rotates about the X axis. Current source: trackball rotation about any axis; right-drag zoom was removed from EXAMINE and lives in DIST mode ("+VC+":951,979, 1008).",
 "Old doc: 'd' is 'Fly (Keyboard input)'. Current source: 'd' is FLY with both mouse drag and keys, and fly keys (a/z, j/l, arrows...) work in every mode except NONE because the key tick runs for all modes ("+VC+":2719-2724, handle_tick_fly at 2722).",
 "Old doc does not say which arrow-key style is active. Current source starts in XY (arrows slide), not YAWZ ("+VC+":136).",
 "Old doc: --eai host:port. Current source: --eai takes no argument ("+OP+":149, 360).",
 "Old doc: --server and --sig (SIGUSR1 reload). Current source: neither option exists ("+OP+":139-197).",
 "Old doc: --geometry uses X window geometry format. Current --help says WxH; the parser also accepts +X+Y offsets ("+OP+":69, 330).",
 "Old doc: --anaglyph does not render textures. Not checked against current source; drop the claim.",
 "Old doc omits many current keys: n (clear world), x (snapshot), Space (command prompt), H (FPS histogram), '.' (profiling), and debug dumps (\\ | + - $ * , =).",
 "Current --help lists short forms -A, -B, -U, -I, -w, -E, -t that are missing or argument-less in the getopt optstring; use the long forms (--anaglyph, --sidebyside, --updown, --pin, --want, --FPS, --stereo) ("+OP+":232).",
]
notes=("Hotkeys are single keypresses handled in the core, so they are the same on Linux X11, Windows and macOS once the frontend delivers them. "
 "macOS: before commit 32caaa36a the Cocoa view sent no KEYPRESS events, so no one-shot hotkey worked; fixed and QA-passed on Apple Silicon (MACOS-STATUS.md:118,190). Command+Q quits; Command chords do not trigger hotkeys. "
 "The macOS menu bar is the stock app template (Quit, Open, etc.); navigation modes, viewpoints, headlight and collision are chosen from FreeWRL's in-window HUD button bar on all desktop platforms (statusbarHud.c:2515-2560), not from OS menus. "
 "'x' snapshot is compiled out on macOS and Android (FRONTEND_DOES_SNAPSHOTS). "
 "Mouse buttons: 1=left, 2=middle, 3=right; on touch devices Ctrl+left stands in for right in SPHERICAL. "
 "A scene's NavigationInfo can restrict which modes are allowed; a hotkey for a mode the scene does not allow is ignored ("+VC+":485). "
 "Windows: the old doc mentions a FreeWRL_Launcher program; not checked here. "
 "Evidence paths are relative to freewrl/freewrl-git, read from the working tree on branch fix/linux-autotools-distcheck.")
json.dump(dict(navModes=navModes,keys=keys,mouse=mouse,cli=cli,discrepancies=disc,notes=notes),open("/tmp/fwsite/use.json","w"),indent=1)
