
export default function Doors() {
  return (
    <section className="sec" aria-label="What's Waiting For You?" style={{"paddingTop": "24px"}}>
      <div className="wrap sh">
        <span className="kick">What’s waiting for you</span>
        <h2 className="h2 rv"><span className="ln"><i>Three doors.</i></span><span className="ln"><i><em>All of them open.</em></i></span></h2>
      </div>
      <div className="hs-x pox">
        <article className="po">
          <div className="po-im"><span className="art"><img src="/assets/cta-welcome.webp" alt="Dino with a magical welcome gift box" loading="lazy" data-asset="cta-welcome" /></span></div>
          <div className="po-tx">
            <span className="po-n">DOOR 01</span>
            <h3 className="h3">First time here?</h3>
            <p>Browse the landing page game presentation.</p>
            <a className="btn sm" href="#lobby">Explore games</a>
          </div>
        </article>
        <article className="po">
          <div className="po-im"><span className="art"><img src="/assets/cta-daily-rewards.webp" alt="Dino celebrating daily rewards with a calendar and chest" loading="lazy" data-asset="cta-daily-rewards" /></span></div>
          <div className="po-tx">
            <span className="po-n">DOOR 02</span>
            <h3 className="h3">Daily rewards coming soon</h3>
            <p>Daily reward details are not yet confirmed.</p>
            <span className="btn sm" aria-disabled="true">Details pending</span>
          </div>
        </article>
        <article className="po">
          <div className="po-im"><span className="art"><img src="/assets/cta-tournament.webp" alt="Dino with a golden trophy in a tournament arena" loading="lazy" data-asset="cta-tournament" /></span></div>
          <div className="po-tx">
            <span className="po-n">DOOR 03</span>
            <h3 className="h3">Tournaments coming soon</h3>
            <p>Tournament details are not yet confirmed.</p>
            <span className="btn sm" aria-disabled="true">Details pending</span>
          </div>
        </article>
      </div>
    </section>
  );
}
