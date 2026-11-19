import QuickActions from '@/components/landing-page/components/QuickActions.jsx';
import HeroCoins from '@/components/landing-page/components/HeroCoins.jsx';

export default function Hero() {
  return (
    <div className="top">
      <input type="checkbox" id="wbx" className="tg" aria-label="Show welcome bonus" />
      <section className="hx" aria-labelledby="hx-h">
        <div className="hx-bg" aria-hidden="true">
          <div className="hx-art"><img className="hx-img" data-asset="hero-genie" src="/assets/hero-genie-1122.webp" alt="" /></div>
          <div className="hx-smk"><i className="s1" /><i className="s2" /><i className="s3" /></div>
          <div className="hx-shade" />
        </div>
        <HeroCoins />
        <div className="hx-fx" aria-hidden="true"><span className="cn k1"><img src="/assets/prop-crown-coin.webp" alt="" /></span><span className="cn k2"><img src="/assets/prop-crown-coin.webp" alt="" /></span><span className="cn k3"><img src="/assets/prop-crown-coin.webp" alt="" /></span></div>
        <div className="hx-c">
          <h1 id="hx-h" className="sr">Dinero Sweeps game lobby</h1>
          <span className="hx-eb">Free-to-play social casino</span>
          <p className="hx-t" aria-hidden="true"><span className="ln"><i>Tonight,</i></span><span className="ln"><i>the fun</i></span><span className="ln"><i>is <em>YOURS.</em></i></span></p>
          <p className="hx-s">Explore the Dinero Sweeps game lobby. Game and platform details are coming soon.</p>
          <div className="hx-cta">
          <a className="btn hx-su" href="#lobby">Game lineup update <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></a>
            <a className="btn gh hx-li" href="#platforms">View platforms</a>
          </div>
          <label className="hx-bn" htmlFor="wbx"><img src="/assets/prop-gift-box.webp" alt="" width="52" height="52" /><span className="hx-bd" aria-hidden="true" /><span className="hx-bw"><span className="hx-bt">Welcome offer</span><span className="hx-bv">Details pending</span></span><span className="hx-bg2"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></span></label>
          <p className="hx-18"><img src="/assets/badge-18plus.webp" alt="" /><span>18+ only. Participation and eligibility terms will be published when confirmed.</span></p>
        </div>
      </section>
      <QuickActions />
      <label className="wbo" htmlFor="wbx" aria-hidden="true" />
      <div className="wb" role="dialog" aria-label="Welcome Bonus">
        <label className="wbc" htmlFor="wbx" aria-label="Close"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x" /></svg></label>
        <span className="kick">Welcome bonus</span>
        <p className="wbk">WELCOME OFFER</p>
        <p className="wbv">Offer details are pending confirmation.</p>
        <ul className="wbl">
          <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> Offer details to be confirmed</li>
          <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> Terms to be confirmed</li>
        </ul>
        <a className="btn" href="#lobby">Browse games</a>
      </div>
    </div>
  );
}
