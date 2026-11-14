export default function WhyPlay() {
  return (
    <section className="sec wrap whys" aria-label="Why Play at Dinero Sweeps?">
      <div className="sh">
        <span className="kick">Why play at Dinero Sweeps</span>
        <h2 className="h2 rv"><span className="ln"><i>Five good reasons</i></span><span className="ln"><i>to <em>stay a while.</em></i></span></h2>
        <p className="lead">Social casino and platform games built for nonstop entertainment — and a smooth experience, so you can focus on playing.</p>
      </div>
      <div className="stack">
        <article className="wp wp1" style={{"--i": "0"}}>
          <span className="wp-n" aria-hidden="true">01</span>
          <img className="ill" src="/media/icon-free-to-play.webp" alt="" aria-hidden="true" width="280" height="280" />
          <h3 className="h3">Free to play</h3>
          <p>Casino-style entertainment, anytime. No purchase required. Log in daily, collect rewards and play just for fun.</p>
        </article>
        <article className="wp wp2" style={{"--i": "1"}}>
          <span className="wp-n" aria-hidden="true">02</span>
          <img className="ill" src="/media/icon-weekly-releases.webp" alt="" aria-hidden="true" width="280" height="280" />
          <h3 className="h3">New games, every week</h3>
          <p>Explore slots, table games and fish tables, with fresh releases dropping every week.</p>
          <div className="chips"><span className="chip">Slots</span><span className="chip">Table games</span><span className="chip">Fish tables</span></div>
        </article>
        <article className="wp wp3" style={{"--i": "2"}}>
          <span className="wp-n" aria-hidden="true">03</span>
          <img className="ill" src="/media/icon-trusted.webp" alt="" aria-hidden="true" width="280" height="280" />
          <h3 className="h3">Trusted by players</h3>
          <p>Join players who choose Dinero Sweeps for smooth gameplay, fair play and reliable support.</p>
        </article>
        <article className="wp wp4" style={{"--i": "3"}}>
          <span className="wp-n" aria-hidden="true">04</span>
          <span className="ill wheelx" aria-hidden="true"><img className="whl" src="/media/icon-spin-wheel-wheel.webp" alt="" width="320" height="320" /><img src="/media/icon-spin-wheel-pointer.webp" alt="" width="320" height="320" /></span>
          <h3 className="h3">Spin the wheel</h3>
          <p>Come back every day for a free spin. No purchase needed. Every spin is a chance to boost your rewards.</p>
        </article>
        <article className="wp wp5" style={{"--i": "4"}}>
          <span className="wp-n" aria-hidden="true">05</span>
          <img className="ill" src="/media/icon-refer-earn.webp" alt="" aria-hidden="true" width="280" height="280" />
          <h3 className="h3">Refer &amp; earn</h3>
          <p>Invite friends to join Dinero Sweeps and earn rewards when they sign up and play.</p>
        </article>
      </div>
    </section>
  );
}
