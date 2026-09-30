import csv, json, os, re
from PIL import Image
A='/home/ryan/Projects/cybertown/freewrl/archive-freewrl-site'
B=A+'/browse/freewrl.sourceforge.io/'
man={}
for r in csv.DictReader(open(A+'/URL_MANIFEST.csv')):
    lp=r['local_path']
    m=re.match(r'(raw|wayback)/freewrl\.sourceforge\.io/(.*)',lp)
    if not m: continue
    ts=re.search(r'/web/(\d{14})id_',r['url'])
    man[m.group(2)]=(r['source'],ts.group(1) if ts else None)
def arc(p):
    return man.get(p,('unknown',None))[0]
def wbdate(p):
    t=man.get(p,(None,None))[1]
    return f"{t[:4]}-{t[4:6]}-{t[6:8]}" if t else None

T=[]
def t(date,event,src,archive=None):
    T.append({"date":date,"event":event,"source":src,"archive":archive or arc(src)})
t("1998","Tuomas J. Lukka writes the original FreeWRL VRML browser; early files carry 'Copyright (C) 1998 Tuomas J. Lukka'.","CREDITS.html")
t("7 Jul 1998","Tuomas Lukka sets out FreeWRL's license intent on the www-vrml mailing list: GPL applies to changes to FreeWRL modules, not across published APIs.","intent.html")
t("Dec 1998","Tuomas Lukka's article 'An introduction to VRML' appears in 'LJ #12/98'; its example app.pl ships with release 0.19.","README.html")
t("15 Jan 1999","FreeWRL 0.18 is released, the first version released by John Stewart (CRC Canada).","news.html")
t("circa 1999 - Apr 2010","John A. Stewart manages the FreeWRL project.","contact.html")
t("23 Mar 1999","Release 0.19: large gains in EAI (External Authoring Interface) support.","news.html")
t("13 Aug 1999","Release 0.20: EXTERNPROTO support, better JavaScript, EAI working with Netscape for local files, and shared virtual worlds.","news.html")
t("17 Dec 1999","Release 0.21 with Red Hat 6.1 install notes; Polhemus Fastrak tracker integration works.","news.html")
t("5 Jan 2000","Release 0.22, which builds on a stock Red Hat 6.1 distribution.","news.html")
t("26 Jan 2000","The Shared Multicast virtual-worlds paper is posted to the site.","news.html")
t("7 Apr 2000","Shared Multicast Virtual World code v1.0 is released.","news.html")
t("July 2000","John Stewart presents FreeWRL at the Ottawa Linux Symposium; release 0.25 adds PixelTexture and better backgrounds.","news.html")
t("1 Aug 2000","FreeWRL project registered on SourceForge (per the saved SourceForge project page, archived as index.htm).","index.htm")
t("4 Aug 2000","Development moves to SourceForge (freewrl.sourceforge.net); web pages stay with CRC.","news.html")
t("4 Aug 2000","First commit in the upstream repository history ('Initial revision', SourceForge user rcoscali).","freewrl-git (git log, read-only)","repo")
t("Sep - Nov 2000","Releases 0.26 and 0.27: texture fixes, EAI and Java bindings work, first SAI work.","news.html")
t("27 Mar 2001","Release 0.28: bug fixes, speed, better rendering and EAI, more test worlds.","news.html")
t("4 Jan 2007","Version 1.18.10; Daniel Kraft's new VRML parser is in place, with X3D (FDIS 19775-1:2004) component tracking.","currentstatus.html")
t("circa 2007","The 'Townsquare' model shows real-time navigation through an image-heavy virtualized landscape is possible.","examples.html")
t("27 May 2008","CRC Canada contracted by the U.S. Department of Defense (Contract N00244-08-P-1769) to add high-resolution geospatial 3D rendering to FreeWRL.","examples.html")
t("May 2008","Wolztyn, Poland panorama (4096x823) displayed on the inside of a Cylinder; it led in 2009 to a 360-degree imaging sub-project around Ottawa.","examples.html")
t("July 2009","FreeWRL-MIDI/Reason interface released for OS X; FreeWRL 1.19.2 or later is MIDI/Reason enabled.","midi.html")
t("28 Jul 2009","'Using the EAI C interface' document, version 1.01.","Using_the_EAI_C_interface.html")
t("23 Sep 2009","Canada's Parliament buildings photographed for the 360-degree image sub-project.","examples.html")
t("31 Mar 2010","John Stewart (CRC Canada) writes 'FreeWRL EAI Interface Design and Function', with notes from Dave Joubert.","FreeWRL_EAI_internal_design_and_functionality.html")
t("22 May 2011","Windows build notes: Doug Sanden and Michel Briand port FreeWRL to Windows.","windowsBuild.html")
t("21 Jul 2011","iPhone/iPod/iPad build of FreeWRL/FreeX3D in progress.","build_iPhone.html")
t("Aug 2011","FreeWRL iPhone app demonstrated at SIGGRAPH 2011 in Vancouver; the port moved from fixed-function OpenGL to OpenGL ES with load-time shaders.","examples.html")
t("8 Dec 2012","FreeX3D Android app: tablet layouts, ISO 8859-1 text, user-set texture sizes.","FreeX3D/index.html")
t("9 Feb 2013","FreeX3D: first SpotLight/PointLight/DirectionalLight work; choice of fast or best (Phong/Gouraud) rendering.","FreeX3D/index.html")
t("6 Apr 2013","FreeX3D release 14 on Google Play: FillProperties shape manipulations.","FreeX3D/index.html")
t("21 Apr 2013","FreeX3D release 15 on Google Play: STL manifold and watertight tests.","FreeX3D/index.html")
t("21 Jul 2013","FreeX3D adds the X3D CAD component (CADAssembly, CADFace, CADLayer, CADPart, IndexedQuadSet, QuadSet).","FreeX3D/index.html")
t("10 Aug 2013","Work continues on the library, cross-platform support and the FreeX3D Android app; CAD and Programmable Shaders components added; move to current OpenGL standards.","index.html")
t("31 Oct 2013","Ubuntu build and install revisited toward a V2.0 release; OSX build used for testing shader-based rendering.","index.html")
t("Apr 2014","TURNTABLE navigation and a non-standard LineSensor node added.","index.html")
t("May 2014","Stereo up-down viewports added for interlaced shutter glasses, alongside side-by-side, quad-buffer and anaglyph.","index.html")
t("Aug 2014","Duktape JavaScript engine option added for platforms without SpiderMonkey.","index.html")
t("Oct 2014","Navigation, PROTOs, sound, Inline IMPORT/EXPORT and the JavaScript interface improved.","index.html")
t("Aug 2015","Version 3.0: server-side rendering toy, frame-rate target, pinnable menubar, statusbar options.","index.html")
t("Sep 2015","Version 3.1: --want option for statusbar/menubar, touch toggling, improved help.","index.html")
t("2016","iOS and OSX builds no longer supported; Apple once distributed FreeWRL, but support lapsed when CRC stopped VR and 3D visualization research.","examples.html")
t("Aug 2016","No recent binary release; users directed to the git 'develop' branch.","index.html")
t("Jan 2017","Version 4.0 ('Kelp Forest'): 101 more node types, plus non-spec Teapot and Effect nodes.","index.html")
t("July 2023","Version 6.0 ('web3dv4'): most of the Web3D X3D 4.0 specification working.","index.html")
t("Aug 2023","Version 6.1: MIDI 2.0 UMP (Universal MIDI Packet) support; example scenes in tests/43_MIDI.","index.html")
t("Jan 2024","Version 6.5: GPU-accelerated humanoid skinning, with --skin F to fall back to CPU.","index.html")
t("20 Apr 2024","Upstream 'Version 6.7' commit on SourceForge develop (b3254b11e); SourceForge project page 'Last Update: 2024-04-20'.","README.md (freewrl-git)","repo")
t("Sep 2026","Ascendance Open Worlds fork (maintained by Ryan Bundy) promotes its FreeWRL 6.7 line, with native Apple Silicon macOS support, to master.","README.md (freewrl-git)","repo")
t("29-30 Sep 2026","Full local archive of freewrl.sourceforge.io captured (4,059 live files plus 64 recovered from the Wayback Machine).","ARCHIVE_REPORT.md","repo")

P=[]
def p(name,role,src,period=None):
    P.append({"name":name,"role":role,"period":period,"source":src})
p("Tuomas J. Lukka","Original author of FreeWRL; wrote the license intent","CREDITS.html","1998")
p("John A. Stewart","Managed the FreeWRL project (CRC Canada); released 0.18 onward; later FreeX3D Android developer contact","contact.html","circa 1999 - April 2010")
p("Remi Cohen-Scali","Many node additions and fixes; EXTERNPROTO work; PixelTexture implementation","CREDITS.html")
p("Etienne Grossmann","Perl scripting; serial slide code; image-sequence saving and screen dump; many additions","CREDITS.html")
p("Bob Kozdemba","Non-convex polygon tessellation code","CREDITS.html")
p("Dan Ratta","Polhemus help (of Polhemus)","CREDITS.html")
p("Nadav Cohen","Author of the terminal-emulator program from which the serial interface code was taken","CREDITS.html")
p("John Breen","New WALK viewer; NavigationInfo and viewpoint fixes","CREDITS.html")
p("Robin Williams","Numerical improvements to rendering (2nd-degree equations and trig)","CREDITS.html")
p("Bernhard Reiter","Extrusion genpolyrep code, general tessellation code, code cleanup","CREDITS.html")
p("Ed","Documentation and install changes (credited by first name only)","CREDITS.html")
p("Marijn Ros","Work on EXTERNPROTOs and comment handling","CREDITS.html")
p("James A. Soerlie","genJS.pm portability fix (v0.17)","README.html")
p("Eric Bohm","Fix to get JavaScript working on Alpha (v0.17)","README.html")
p("Herbert Rosmanith","Java classpath documentation (v0.15)","README.html")
p("William R. Ward","Window colormap creation fix","README.html")
p("catty","Removed reliance on libwww (v0.23; credited by handle)","README.html")
p("fba","Helped resolve /tmp texture file ownership (v0.23; credited by handle)","README.html")
p("Mike Fletcher","Correspondent in the 1998 www-vrml thread quoted in the license intent","intent.html","1998")
p("Daniel Kraft","Wrote the VRML parser integrated by version 1.18.10","currentstatus.html","2007")
p("Sarah Dumoulin","Listed as document author in the metadata of 'Using the EAI C interface'","Using_the_EAI_C_interface.html","2009")
p("Dave Joubert","Notes on EAI design; original author of the Ubuntu build notes","FreeWRL_EAI_internal_design_and_functionality.html","2010")
p("Doug Sanden","Windows port; MSVC library bundle; FreeWRL_Launcher; text code for the navigation UI; Ubuntu 14.04 build notes","windowsBuild.html","2011")
p("Michel Briand","Windows port; Debian packaging; URL-resolving code and notes","windowsBuild.html","2011")
p("Ian Stakenvicius","Packages FreeWRL for Gentoo","install_LinuxRelease.html")
p("Chris Willing","Contributor to Ubuntu 14.04/14.10, Mint 17.1 and Debian 7.8 build notes","ubuntu_src.html")
p("Roy Kyrillos","Feedback on the Ubuntu build notes","ubuntu_src.html")
p("Jiangxin Hu","Feedback on the Ubuntu build notes","ubuntu_src.html")
p("Adrian Rossiter","Author of the ring-tangle IndexedFaceSet model shown in screenshots (antiprism.com)","examples.html")
p("Tom Smith","Wrote 'Mechanical Drawing in 3D Using Perl and VRML', with a Fedora Core 13 FreeWRL install log, copied to the site","TomSmithCore13.html")
p("Larry Ewing","Creator of the Linux Penguin logo on which the FreeWRL logo was based","links.html")
p("Brutzman","Cited (with 'Daily') as source of the SpotLight test model from X3dGraphics.com X3D for Web Authors examples","FreeX3D/examples.html")
p("Daily","Cited (with 'Brutzman') as source of the SpotLight test model; spelled as on the page","FreeX3D/examples.html")
p("Drayde","Author of the LOVE STL model (Thingiverse) used in FreeX3D FillProperties examples","FreeX3D/examples.html")
p("Ryan Bundy","Maintains the Ascendance Open Worlds modernization fork of FreeWRL","README.md (freewrl-git)","2026")

O=[
 {"name":"Communications Research Centre Canada (CRC)","role":"John Stewart's employer; FreeWRL 'partly produced by employees of CRC' and released as open source; hosted the early home page (www.crc.ca/FreeWRL); source headers read 'Copyright 2009 CRC Canada'","source":"links.html"},
 {"name":"SourceForge","role":"Project host from Aug 2000 (registered 2000-08-01): CVS, later Git, file releases and project web","source":"news.html"},
 {"name":"Web3D Consortium","role":"Maintains the VRML/X3D specifications; appears on the FreeWRL poster; FreeX3D key-fob model courtesy Web3D","source":"links.html"},
 {"name":"U.S. Department of Defense (FISC San Diego)","role":"Contracted CRC Canada (N00244-08-P-1769, 27 May 2008) for high-resolution geospatial rendering additions","source":"examples.html"},
 {"name":"X3D Earth","role":"Source of the '7 Layers Plus' geospatial model","source":"examples.html"},
 {"name":"Apple","role":"At one time distributed FreeWRL for its desktop systems","source":"examples.html"},
 {"name":"Polhemus","role":"Tracker vendor; Dan Ratta of Polhemus credited; Fastrak integration in 0.21","source":"CREDITS.html"},
 {"name":"Mozilla","role":"Mozilla JS (SpiderMonkey) bundled; some files under the Mozilla Public License","source":"CREDITS.html"},
 {"name":"Propellerhead Software (Reason)","role":"Reason software used in the FreeWRL MIDI interactivity work","source":"midi.html"},
 {"name":"Ottawa Linux Symposium","role":"John Stewart presented FreeWRL there in July 2000","source":"news.html"},
 {"name":"SIGGRAPH 2011 (Vancouver)","role":"Venue where the FreeWRL iPhone app was demonstrated","source":"examples.html"},
 {"name":"Google Play","role":"Distribution channel for the FreeX3D Android app","source":"FreeX3D/index.html"},
 {"name":"Ascendance Open Worlds","role":"Runs the modernization fork of FreeWRL 6.7 (Apple Silicon macOS)","source":"README.md (freewrl-git)"},
]
L=[
 {"what":"1998: Tuomas Lukka's intent - GPL applies to modifications of FreeWRL modules and does not cross published APIs; proprietary extensions possible through agreed APIs.","source":"intent.html"},
 {"what":"1998-2001 docs: distributed under the GNU Library General Public License, except files under the Mozilla Public License.","source":"CREDITS.html"},
 {"what":"Footer on current live pages: GNU Library General Public License version 2 or any later version; 'Copyright (C) 1998, 1999...2009 Tuomas J. Lukka, John Stewart and others'.","source":"index.html"},
 {"what":"FreeWRL described as 'released under the LGPL License', linking to the GNU LGPL version 3 text (page captured 2009).","source":"newnodes.html"},
 {"what":"SourceForge project page lists the license as LGPLv2.","source":"index.htm"},
 {"what":"Current source headers: GNU LGPL version 3 or later; most files 'Copyright 2009 CRC Canada'; bundled third-party code keeps its own licenses. The Ascendance fork uses the same license.","source":"README.md (freewrl-git)"},
 {"what":"The FreeWRL logo was based on the Linux Penguin logo by Larry Ewing.","source":"links.html"},
]

def img(path,caption,sourcePage,date=None):
    w,h=Image.open(B+path).size
    a=arc(path)
    if date is None and a=='wayback': date="by "+wbdate(path)+" (Wayback capture)"
    return {"path":path,"caption":caption,"date":date,"sourcePage":sourcePage,"archive":a,"width":w,"height":h}
I=[
 img("FreeWRL_poster.jpg","CRC poster 'FreeWRL - VRML 3D and Beyond': CNN's Space Station, music synthesizer, digital data glove, CNN's F-18 Hornet and a flying chair (text read from the image; no surviving caption).",None),
 img("2001.jpg","FreeWRL window showing a space station model (no surviving caption; described from image).",None),
 img("OSX-screen.gif","FreeWRL rendering the same space-station model on Mac OS X (no surviving caption; described from image).",None),
 img("NCK.jpg","FreeWRL VRML/X3D browser window beside 'MARS2 CNC Testmonitor' control panels (no surviving caption; described from image).",None),
 img("tictactoe.gif","Tic-tac-toe board of spheres and cones rendered in FreeWRL (no surviving caption; described from image).",None),
 img("nav_area.jpg","Photo-textured model of a navigation equipment console (no surviving caption; described from image).",None),
 img("synth.gif","3D music-synthesizer scene of cylinders and spheres, also shown on the FreeWRL poster as 'Music Synthesizer' (described from image).",None),
 img("aboutPlugins.png","Firefox 'Installed plug-ins' page listing the FreeWRL X3D/VRML plugin (npfreewrl.so, 'V3.1 VRML/X3D with FreeWRL. from http://www.crc.ca/FreeWRL').",None),
 img("Test.png","test.wrl cone loaded from freewrl.sourceforge.net inside Firefox via the FreeWRL plugin, HUD reading 'EXAMINE' (described from image).",None),
 img("freewrl_screenshot3.jpg","Early FreeWRL scene with a sphere, box, avatar figure and 3D 'Java' text (no surviving caption; described from image).",None),
 img("1ej6-vrml.png","Molecular surface model rendered in FreeWRL; filename refers to structure 1ej6 (described from image).",None),
 img("animated_blimp.gif","Animated FreeWRL scene: shapes against a gradient sky (no surviving caption; described from image).",None),
 img("welcome.jpg","FreeWRL X3D/VRML welcome banner with the FreeWRL eye logo.","midi.html"),
 img("images/ring_tangle.jpg","Large series of IndexedFaceSets expanded via PROTOs; model by Adrian Rossiter.","examples.html"),
 img("images/PolandPano-Turntablef.jpg","Panoramic photo taken in Wolztyn, Poland in May 2008 (4096x823), mapped inside a Cylinder in FreeWRL.","examples.html","May 2008"),
 img("images/iPhone-running2.png","FreeWRL running on the old iPhone app (test 16); buttons Quit, Vp, Wk, Ex; demonstrated at SIGGRAPH 2011.","examples.html","2011"),
 img("images/venus.jpg","Un-attributed VRML model showing sphere mapping with X3D TextureCoordinateGenerator.","examples.html"),
 img("FreeX3D/images/Toon-Screenshot_2013-08-11-09-39-56.png","Toon shader on the SGI teapot: colours assigned by ranges of light intensity.","examples.html","11 Aug 2013"),
 img("FreeX3D/images/Sobel_Screenshot_2013-08-10-09-41-49.png","Sobel edge-detector shader applied to the 'Lenna' test image.","examples.html","10 Aug 2013"),
 img("FreeX3D/images/VertexDeformer-Screenshot_2013-08-10-09-40-43.png","Vertex deformer: flat 20x20 IndexedFaceSet deformed on the GPU, driven by a TimeSensor.","examples.html","10 Aug 2013"),
 img("FreeX3D/images/CADExample2s.png","FreeX3D Android: Web3D Consortium key fob, ready for 3D printing at Shapeways.","FreeX3D/index.html","2013"),
 img("FreeX3D/images/FP_6_2013-04-06-15-46-21.png","FreeX3D on a Nexus 7: STL model hatched with a green brick FillProperties pattern.","FreeX3D/examples.html","6 Apr 2013"),
 img("images/FragmentVertexSpotLight.png","SpotLight sweeping two black squares: per-vertex lighting (left) vs per-fragment lighting (right).","examples.html"),
 img("images/a10-a.jpg","Aircraft model rendered in FreeWRL (a10-a.wrl, VRML 1.0 translated from a 3DS model); not linked from any surviving page.",None),
 img("images/screenshot_Jan2023_2.jpg","In-app options panel, available on all platforms, for changing options mid-run.","use.html","2023"),
 img("rewire/blimpScene.jpg","blimpScene.wrl sending AudioControl values to Propellerhead Reason (MIDI/ReWire tutorial).","rewire/tutorials.html"),
 img("crc_wordmark_en.gif","Communications Research Centre Canada wordmark.",None),
]
for i in I:
    if i["sourcePage"] is None: i["sourcePage"]="(orphan image; no surviving referring page)"

def ex(title,model,shot,desc,enc,shader,notes):
    return {"title":title,"model":model,"screenshot":shot,"description":desc,"sizeBytes":os.path.getsize(B+model),"encoding":enc,"usesShaders":shader,"archive":arc(model),"selfContained":notes[0],"webViewerNotes":notes[1]}
FS="Shader uses FreeWRL-specific fw_* uniforms/attributes; will not compile in X_ITE/X3DOM without rewriting."
GL="Shader uses legacy desktop GLSL built-ins (gl_NormalMatrix, gl_Vertex, ftransform, gl_LightSource); will not compile as WebGL GLSL ES without rewriting. Geometry still loads."
E=[
 ex("Toon Shader teapot","FreeX3D/models/teapot-Toon.wrl","FreeX3D/images/Toon-Screenshot_2013-08-11-09-39-56.png","The old SGI teapot with a shader that assigns colours based on ranges of light intensity.","VRML97",True,(True,"Shader parts list external shaders/toon.vs|fs first with an inline data: fallback. "+GL)),
 ex("Teapot without shaders","FreeX3D/models/teapot-noShaders.wrl","FreeX3D/images/Toon-Screenshot_2013-08-11-09-39-56.png","The same teapot model without the shader, for comparison.","VRML97",False,(True,"No textures, inlines or shaders; best candidate for a web viewer.")),
 ex("Fragment vs. vertex lighting - two cylinders","FreeX3D/models/TwoCylinders.wrl","FreeX3D/images/PGScreenshot_2013-08-10-09-36-54.png","Two cylinders rotating around each other, one with per-fragment lighting, the other lit per vertex.","VRML97",True,(True,"External phong/*.vs|fs with data: fallback. "+GL)),
 ex("Vertex Deformer (ProgramShader)","FreeX3D/models/flutter2-ProgramShader.x3d","FreeX3D/images/VertexDeformer-Screenshot_2013-08-10-09-40-43.png","A flat 20x20 IndexedFaceSet deformed in the vertex shader; a TimeSensor feeds the shader.","X3D XML",True,(True,"Inline data: shaders. ProgramShader is rarely supported by web viewers. "+GL)),
 ex("Vertex Deformer (ComposedShader)","FreeX3D/models/flutter2-ComposedShader.x3d","FreeX3D/images/VertexDeformer-Screenshot_2013-08-10-09-40-43.png","The same vertex deformer written as a ComposedShader.","X3D XML",True,(True,"Inline data: shaders. "+GL)),
 ex("Sobel Edge Detector","FreeX3D/models/sobel-ComposedShader.wrl","FreeX3D/images/Sobel_Screenshot_2013-08-10-09-41-49.png","'Lenna' used as input to a Sobel operator for edge finding; the 512x512 image size is hard-coded in the shader.","VRML97",True,(False,"Needs ../images/Lenna.png (archived at FreeX3D/images/Lenna.png). "+FS)),
 ex("Fragment vs. vertex SpotLight - Better (high vertex count)","images/SpotLight2.wrl","images/FragmentVertexSpotLight.png","A SpotLight sweeps two identical black squares: vertex lighting on the left, fragment lighting on the right.","VRML97",True,(True,"External gouraud/*.vs|fs with data: fallback. "+FS)),
 ex("Fragment vs. vertex SpotLight - Poor (16 vertices)","images/SpotLight3.wrl","images/FragmentVertexSpotLight.png","16-vertex version; vertex lighting looks poor.","VRML97",True,(True,FS)),
 ex("Fragment vs. vertex SpotLight - Abysmal (4 vertices)","images/SpotLight4.wrl","images/FragmentVertexSpotLight.png","4-vertex version; the SpotLight never hits a vertex, so vertex lighting never shows it.","VRML97",True,(True,FS)),
 ex("Terrain - original view","images/normalTerrain.wrl","images/FishEyeTerrain.png","A normal generated 3D terrain.","VRML97",False,(True,"No shaders or textures, but 6.3 MB of geometry.")),
 ex("Terrain - GLSL fish-eye view","images/fisheyeTerrain.wrl","images/FishEyeTerrain.png","The terrain with a GLSL vertex shader giving a fish-eye view; a PositionInterpolator animates the Viewpoint.","VRML97",True,(True,"6.3 MB. "+FS)),
 ex("GLSL Vertex Shader (200x200 grid)","images/flutter.x3d","images/vertexShader.jpg","A 200x200 IndexedFaceSet with z=0 on all vertices, moved by a vertex shader.","X3D XML",True,(True,"2.5 MB, inline data: shaders. "+GL)),
 ex("Poland panorama turntable","images/PolandPano-Turntable.wrl","images/PolandPanos.jpg","Wolztyn, Poland panorama (May 2008) mapped inside a Cylinder; WALK mode with speed 0 so the viewer only turns.","VRML97",False,(False,"Needs PolandPano-Turntablef.jpg (4096x823, archived beside it in images/). Tiny and web-friendly otherwise.")),
 ex("Sphere-mapped Venus","images/venus.wrl","images/venus.jpg","Un-attributed VRML model; an example of sphere mapping in the X3D TextureCoordinateGenerator node.","VRML97",False,(False,"References spheremap.jpg, which is NOT in the archive.")),
 ex("Toon sphere (Tomas Mikula example)","tomasMikulaExample.x3dv",None,"Unlinked X3D classic-encoding toon shader example found on the site (no page text).","X3D classic",True,(True,"Inline data: shaders. "+GL)),
 ex("Simple cone (test.wrl)","test.wrl","Test.png","A default-material Cone, 'Copyright (C) 1998 Tuomas J. Lukka'; shown loaded in Firefox in Test.png.","VRML97",False,(True,"Fully self-contained; loads in any viewer.")),
 ex("A-10 style aircraft (VRML 1.0)","images/a10-a.wrl","images/a10-a.jpg","Unlinked VRML 1.0 file 'Translated from TriMesh 3DS model'.","VRML 1.0",False,(True,"VRML 1.0 - X_ITE/X3DOM do not read it without conversion.")),
]
Q=[
 {"text":"I'm not anti-commercial, just anti-freezing-my-source.","source":"intent.html"},
 {"text":"From circa 1999 to April 2010, the FreeWRL project was managed by John A. Stewart.","source":"contact.html"},
 {"text":"With royalty free open standards, your models will continue to render, year after year.","source":"index.html"},
 {"text":"FreeWRL has had a long track record, is here to stay.","source":"index.html"},
 {"text":"Development is now handled on SourceForge.net; http://freewrl.sourceforge.net. Web pages will stay with CRC.","source":"news.html"},
 {"text":"Just got married. But working again on FreeWRL...","source":"news.html"},
 {"text":"V0.11 - Onset of promiscuity -- we can plugin to netscape!!!","source":"README.html"},
 {"text":"V0.01 \"some things work\"","source":"README.html"},
 {"text":"get mentioned in the CREDITS file, the coolest place on the web ;)","source":"README.html"},
 {"text":"It is based on the FreeWRL rendering engine, of which one estimate pegs at over a million downloads.","source":"FreeX3D/index.html"},
 {"text":"We noticed that musicians were able to use computers with ease.","source":"midi.html"},
 {"text":"This model was significant as it showed (circa 2007) that real-time navigation through a virtualized landscape was possible.","source":"examples.html"},
 {"text":"FreeWRL is partly produced by employees of CRC, and is released as Open Source to the world community.","source":"links.html"},
]
out={"timeline":T,"people":P,"organizations":O,"licenseHistory":L,"images":I,"examples":E,"quotes":Q,
 "_notes":{"archiveRoot":"archive-freewrl-site/browse/freewrl.sourceforge.io/","archiveField":"live = raw/ capture 2026-09-29/30; wayback = recovered from Wayback Machine; repo = outside the site archive (freewrl-git README / git log / ARCHIVE_REPORT.md)","gitHistory":"Upstream commit authors by SourceForge username (freewrl-git git log): crc_canada dominant 2000-2012; rcoscali 2000; ayla 2001-2003; sdumoulin 2003-2010; couannette 2008-2011; dug9 2009-2024 and dominant from 2013; istakenv 2009-2012; davejoubert 2010. Usernames are not mapped to people by the archive sources.","sourceforgeMaintainers":"SourceForge project page lists couannette, crc_canada, cwilling, dug9 and 5 others (index.htm).","wwwFlags":"Wayback-sourced pages CREDITS/news/README/GOALS/intent are 2001 captures of freewrl.sourceforge.net."}}
bad=[x for x in json.dumps(out).split() if '@' in x]
assert not bad, bad
json.dump(out,open('/tmp/fwsite/history.json','w'),indent=1,ensure_ascii=False)
print(len(T),len(P),len(O),len(I),len(E),len(Q))
for x in T+I+E:
    if x.get('archive')=='unknown': print('UNKNOWN',x)
