// Permanent redirect of every alternate FreeWRL host (www.freewrl.org,
// freewrl.com, www.freewrl.com) to https://freewrl.org, preserving path + query.
// One hop for http and https input.
const CANONICAL = "https://freewrl.org";

export default {
  fetch(request) {
    const url = new URL(request.url);
    // Never attached to the canonical host; refuse rather than loop if it ever is.
    if (url.hostname === "freewrl.org") {
      return new Response("Misdirected Request", { status: 421 });
    }
    return Response.redirect(CANONICAL + url.pathname + url.search, 308);
  },
};
