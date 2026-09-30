// QA browsers answer the Cloudflare Web Analytics beacon host with an empty script,
// so QA runs never send visits and do not depend on that host being reachable.
export const stubAnalytics = (target) =>
  target.route(/^https:\/\/static\.cloudflareinsights\.com\//, (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "/* stub beacon */" }))
