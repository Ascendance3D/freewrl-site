import { Commands, Facts, PageHead, SectionHead } from "../components/primitives"
import { SITE } from "../routes"

export default function Build() {
  return (
    <>
      <PageHead kicker="Build" title={<>Build it yourself.</>}>
        <p>
          FreeWRL 6.7 builds on Ubuntu 24.04 with autotools, and on Apple Silicon macOS with Xcode.
          The steps below are the ones used and checked in the project’s pull requests.
        </p>
      </PageHead>

      <section className="frame section railed" aria-labelledby="linux">
        <SectionHead index="01" id="linux" title="Linux" kicker="Tested: Ubuntu 24.04, x86_64, GCC 13.3. X11 window, Duktape JavaScript." />
        <div className="split">
          <Commands title="Build and install">{`git clone ${SITE.github}.git
cd freewrl/freex3d
./autogen.sh            # needed in a Git checkout
mkdir build && cd build
../configure --with-target=x11 --with-javascript=duk
make -j$(nproc)
sudo make install

freewrl --version        # Program version: 6.7.0`}</Commands>
          <div className="prose">
            <h3 className="mono">Packages</h3>
            <p>
              The list below is read from <code>configure.ac</code>. It has <strong>not</strong> been checked on a clean
              system yet. If <code>configure</code> stops, it names the library it could not find.
            </p>
            <Commands>{`sudo apt install build-essential autoconf automake libtool pkg-config \\
  zlib1g-dev libjpeg-dev libpng-dev libfreetype-dev libxml2-dev \\
  libx11-dev libxt-dev libxmu-dev libxaw7-dev libgl-dev libglu1-mesa-dev \\
  libfontconfig-dev libopenal-dev libalut-dev libode-dev`}</Commands>
          </div>
        </div>
        <Facts
          className="facts--wide"
          rows={[
            ["--with-target", "x11 (tested) or motif (needs libmotif-dev)"],
            ["--with-javascript", "duk: bundled Duktape (tested). stub: no scripts. sm (SpiderMonkey) does not configure on current systems."],
            ["--enable-plugin", "The old NPAPI browser plugin. No current browser loads it; nothing is built."],
            ["make dist / distcheck", "Both pass. A release tarball builds with ./configure && make, without autogen.sh."],
            ["Known", "132 compiler warnings. No Linux CI yet. The run test used Xvfb and Mesa, not a real GPU."],
          ]}
        />
      </section>

      <section className="frame section railed" aria-labelledby="macos">
        <SectionHead index="02" id="macos" title="macOS, Apple Silicon" kicker="macOS 14 or newer, Xcode, no Homebrew needed." />
        <div className="split">
          <Commands title="Dependencies, then the app">{`git clone ${SITE.github}.git && cd freewrl
tools/macos-deps/build.sh -p ~/freewrl-deps
cd OSX_gui/FreeWRL-Desktop
xcodebuild -project FreeWRL.xcodeproj -scheme FreeWRL \\
  -configuration Release ARCHS=arm64 CODE_SIGN_IDENTITY=- \\
  FW_DEPS=$HOME/freewrl-deps build`}</Commands>
          <div className="prose">
            <p>
              <code>build.sh</code> builds FreeType 2.14.3, ODE 0.16.6 and freealut 1.1.0 from pinned, checksummed sources.
              Audio uses Apple’s OpenAL framework. Textures are decoded by the bundled stb_image.
            </p>
            <Commands title="A self-contained app you can sign">{`tools/macos-package/package.sh -D ~/freewrl-deps -z`}</Commands>
          </div>
        </div>
      </section>

      <section className="frame section railed" aria-labelledby="limits">
        <SectionHead index="03" id="limits" title="Limits" />
        <ul className="prose changes">
          <li>macOS stops at OpenGL 4.1. There is no Metal renderer. Lines are always one pixel wide.</li>
          <li>On macOS, humanoid (HAnim) skinning runs on the CPU.</li>
          <li>TIFF and WebP textures are not decoded on macOS. Those shapes draw without texture.</li>
          <li>Windows project files (Visual Studio 2022) are in <code>freex3d/projectfiles_2022/</code>. They have not been tested recently.</li>
        </ul>
      </section>

      <section className="frame section railed" aria-labelledby="legacy-build">
        <SectionHead index="04" id="legacy-build" title="Old build notes" />
        <p className="prose">
          The upstream site had build pages for Ubuntu 12.04, Windows (2011), macOS on Intel and the iPhone. They are
          history, not instructions: <a href="/legacy/install_Linux.html">Linux</a>, <a href="/legacy/ubuntu_src.html">Ubuntu from source</a>,
          <a href="/legacy/windowsBuild.html"> Windows</a>, <a href="/legacy/build_OSX.html">OS X</a>, <a href="/legacy/build_iPhone.html">iPhone</a>.
        </p>
      </section>
    </>
  )
}
