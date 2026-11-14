export default function HowToPlay() {
  return (
    <section className="sec wrap how" aria-label="How to Play">
      <div className="sh">
        <span className="kick">Three easy steps</span>
        <h2 className="h2 rv"><span className="ln"><i>From hello to play</i></span><span className="ln"><i>in <em>three moves.</em></i></span></h2>
      </div>
      <div className="stp">
        <span className="stl" aria-hidden="true"><b /></span>
        <article className="st">
          <span className="stn">1</span>
          <span className="st-big" aria-hidden="true">01</span>
          <div className="st-im"><span className="art"><img src="/media/how-to-play-step-01.webp" alt="Dino presenting golden welcome coins" loading="lazy" data-asset="how-to-play-step-01" /></span></div>
          <h3 className="h3">Sign up and get:</h3>
          <ul className="stu">
            <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> 10,000 Gold Coins</li>
            <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> 2 Sweepstakes Coins</li>
            <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> Bonus on your first purchase</li>
          </ul>
          <a className="btn" href="/signup">Claim now</a>
        </article>
        <article className="st">
          <span className="stn">2</span>
          <span className="st-big" aria-hidden="true">02</span>
          <div className="st-im"><span className="art"><img src="/media/how-to-play-step-02.webp" alt="Dino pointing to fish games and slot machines" loading="lazy" data-asset="how-to-play-step-02" /></span></div>
          <h3 className="h3">Play slots, fish, tables and more</h3>
          <ul className="stu">
            <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> Use Gold Coins (GC) for fun.</li>
            <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> Use Sweepstakes Coins (SC) for prize play.</li>
          </ul>
        </article>
        <article className="st">
          <span className="stn">3</span>
          <span className="st-big" aria-hidden="true">03</span>
          <div className="st-im"><span className="art"><img src="/media/how-to-play-step-03.webp" alt="Dino presenting a golden redemption card" loading="lazy" data-asset="how-to-play-step-03" /></span></div>
          <h3 className="h3">Redeem your SC</h3>
          <ul className="stu">
            <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> Debit card.</li>
            <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> Bank.</li>
            <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> Gift cards.</li>
            <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> After you meet the play requirements.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
