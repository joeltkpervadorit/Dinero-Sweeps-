export default function Doors() {
  return (
    <section className="sec" aria-label="What's Waiting For You?" style={{"paddingTop": "24px"}}>
      <div className="wrap sh">
        <span className="kick">What’s waiting for you</span>
        <h2 className="h2 rv"><span className="ln"><i>Three doors.</i></span><span className="ln"><i><em>All of them open.</em></i></span></h2>
      </div>
      <div className="hs-x pox">
        <article className="po">
          <div className="po-im"><span className="art"><img src="/media/cta-welcome.webp" alt="Dino with a magical welcome gift box" loading="lazy" data-asset="cta-welcome" /></span></div>
          <div className="po-tx">
            <span className="po-n">DOOR 01</span>
            <h3 className="h3">First time here?</h3>
            <p>Jump in and claim your exclusive welcome rewards.</p>
            <a className="btn sm" href="/signup">Start playing</a>
          </div>
        </article>
        <article className="po">
          <div className="po-im"><span className="art"><img src="/media/cta-daily-rewards.webp" alt="Dino celebrating daily rewards with a calendar and chest" loading="lazy" data-asset="cta-daily-rewards" /></span></div>
          <div className="po-tx">
            <span className="po-n">DOOR 02</span>
            <h3 className="h3">Something fresh, every day</h3>
            <p>Come back daily and unlock your bonus.</p>
            <a className="btn sm" href="/signup">Check in now</a>
          </div>
        </article>
        <article className="po">
          <div className="po-im"><span className="art"><img src="/media/cta-tournament.webp" alt="Dino with a golden trophy in a tournament arena" loading="lazy" data-asset="cta-tournament" /></span></div>
          <div className="po-tx">
            <span className="po-n">DOOR 03</span>
            <h3 className="h3">Tournament glory awaits</h3>
            <p>Compete, climb the ranks and go for the biggest wins.</p>
            <a className="btn sm" href="/signup">Join the fun</a>
          </div>
        </article>
      </div>
    </section>
  );
}
