import { PageHead } from "../components/primitives"
import { Link } from "../router"

export default function NotFound() {
  return (
    <PageHead kicker="404 · not found" title={<>No world at this address.</>}>
      <p>
        If you followed an old link to freewrl.sourceforge.io, the page may be in the <a href="/legacy/">archived old site</a>.
        Test files are listed on the <Link to="/tests">test corpus</Link> page. Or go <Link to="/">home</Link>.
      </p>
    </PageHead>
  )
}
