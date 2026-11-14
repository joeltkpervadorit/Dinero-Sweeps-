import QuickActions from './QuickActions.jsx';

export default function Hero() {
  return (
    <div className="top">
      <input type="checkbox" id="wbx" className="tg" aria-label="Show welcome bonus" />
      <section className="hx" aria-labelledby="hx-h">
        <a className="hx-art" href="/signup" aria-label="Welcome to Dinero Sweeps. Sign up for 10,000 Gold Coins and 2 Sweepstakes Coins. Verify your account to redeem."><img className="hx-m" data-asset="hero-mobile" src="/media/hero-mobile-art.jpg" alt="" /><img className="hx-d" data-asset="hero-desktop" src="/media/hero-desktop-art.jpg" alt="" /></a>
        <div className="hx-fx" aria-hidden="true"><span className="cn k1"><img src="/media/prop-crown-coin.webp" alt="" /></span><span className="cn k2"><img src="/media/prop-crown-coin.webp" alt="" /></span><span className="cn k3"><img src="/media/prop-crown-coin.webp" alt="" /></span></div>
        <div className="hx-c">
          <h1 id="hx-h" className="sr">Dinero Sweeps — free sweepstakes casino games</h1>
          <span className="kick">Free-to-play social casino</span>
          <p className="hx-t" aria-hidden="true"><span className="ln"><i>Tonight,</i></span><span className="ln"><i>the lamp</i></span><span className="ln"><i>is <em>yours.</em></i></span></p>
          <p className="hx-s">Slots, fish games and eleven game platforms in one glowing lobby. Always free to play — and there’s a welcome gift with your name on it.</p>
          <label className="hx-bn" htmlFor="wbx"><img src="/media/prop-gift-box.webp" alt="" /><span><span className="hx-bt">Welcome bonus</span><span className="hx-bv">10,000 GC + 2 SC</span></span><span className="hx-bg"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></span></label>
          <div className="hx-cta">
            <a className="btn hx-su" href="/signup">Sign up free <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></a>
            <a className="btn gh hx-li" href="/login">Log in</a>
          </div>
          <p className="hx-18"><img src="/media/badge-18plus.webp" alt="" /><span>18+ only. No purchase necessary. Void where prohibited. Verify your account to redeem.</span></p>
        </div>
      </section>
      <QuickActions />
      <label className="wbo" htmlFor="wbx" aria-hidden="true" />
      <div className="wb" role="dialog" aria-label="Welcome Bonus">
        <label className="wbc" htmlFor="wbx" aria-label="Close"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x" /></svg></label>
        <span className="kick">Welcome bonus</span>
        <p className="wbk">CLAIM UP TO</p>
        <p className="wbv"><b>10,000.00</b> Free GC + <b>2.00</b> Free SC</p>
        <ul className="wbl">
          <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> 100% Purchase Bonus</li>
          <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> Instant VIP Tier Upgrade</li>
        </ul>
        <a className="btn" href="/signup">Sign Up!</a>
      </div>
    </div>
  );
}
