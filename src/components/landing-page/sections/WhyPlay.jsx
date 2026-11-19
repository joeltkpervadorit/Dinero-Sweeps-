export default function WhyPlay() {
  return (
    <section className="sec wrap whys" aria-label="Why Play at Dinero Sweeps?">
      <div className="sh">
        <span className="kick">Why play at Dinero Sweeps</span>
        <h2 className="h2 rv"><span className="ln"><i>Five good reasons</i></span><span className="ln"><i>to <em>stay a while.</em></i></span></h2>
        <p className="lead">Game and platform information will be published once the lineup is confirmed.</p>
      </div>
      <div className="stack">
        <article className="wp wp1" style={{"--i": "0"}}>
          <span className="wp-n" aria-hidden="true">01</span>
          <img className="ill" src="/assets/icon-free-to-play.webp" alt="" aria-hidden="true" width="280" height="280" />
          <h3 className="h3">Game information</h3>
          <p>Game details and participation terms are pending confirmation.</p>
        </article>
        <article className="wp wp2" style={{"--i": "1"}}>
          <span className="wp-n" aria-hidden="true">02</span>
          <img className="ill" src="/assets/icon-weekly-releases.webp" alt="" aria-hidden="true" width="280" height="280" />
          <h3 className="h3">Platform information</h3>
          <p>The game catalog is not available yet.</p>

        </article>
        <article className="wp wp3" style={{"--i": "2"}}>
          <span className="wp-n" aria-hidden="true">03</span>
          <img className="ill" src="/assets/icon-trusted.webp" alt="" aria-hidden="true" width="280" height="280" />
          <h3 className="h3">Player information</h3>
          <p>Service details will be published when confirmed.</p>
        </article>
        <article className="wp wp4" style={{"--i": "3"}}>
          <span className="wp-n" aria-hidden="true">04</span>
          <span className="ill wheelx" aria-hidden="true"><img className="whl" src="/assets/icon-spin-wheel-wheel.webp" alt="" width="320" height="320" /><img src="/assets/icon-spin-wheel-pointer.webp" alt="" width="320" height="320" /></span>
          <h3 className="h3">Promotions</h3>
          <p>Promotion details are pending confirmation.</p>
        </article>
        <article className="wp wp5" style={{"--i": "4"}}>
          <span className="wp-n" aria-hidden="true">05</span>
          <img className="ill" src="/assets/icon-refer-earn.webp" alt="" aria-hidden="true" width="280" height="280" />
          <h3 className="h3">Rewards</h3>
          <p>Reward program details are pending confirmation.</p>
        </article>
      </div>
    </section>
  );
}
