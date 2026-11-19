export default function Promotions() {
  return (
    <section className="sec wrap" id="promotions" aria-label="Promotions" style={{"paddingTop": "24px"}}>
      <div className="pmg">
        <article className="pm pm1">
          <div className="pm-art"><span className="pm-tag"><i />Rewards</span><span className="art"><img src="/assets/promo-rewards.webp" alt="Dino presenting a chest of rewards" loading="lazy" data-asset="promo-rewards" /></span><img className="pm-cn c1" src="/assets/prop-crown-coin.webp" alt="" aria-hidden="true" loading="lazy" /><img className="pm-cn c2" src="/assets/prop-crown-coin.webp" alt="" aria-hidden="true" loading="lazy" /><img className="pm-cn c3" src="/assets/prop-pink-gem.webp" alt="" aria-hidden="true" loading="lazy" /></div>
          <div className="pm-tx">
            <span className="kick">Rewards &amp; promotions</span>
            <h3 className="h3">Promotions are <em>coming soon.</em></h3>
            <p>Confirmed offer details will be published here when available.</p>
            <span className="btn" aria-disabled="true">Coming soon</span>
          </div>
        </article>
        <article className="pm pm2">
          <div className="pm-art"><span className="pm-tag"><i />Tournaments</span><span className="art"><img src="/assets/promo-tournament.webp" alt="Dino celebrating beside a golden tournament trophy" loading="lazy" data-asset="promo-tournament" /></span><img className="pm-cn c1" src="/assets/prop-crown-coin.webp" alt="" aria-hidden="true" loading="lazy" /><img className="pm-cn c2" src="/assets/prop-crown-coin.webp" alt="" aria-hidden="true" loading="lazy" /><img className="pm-cn c3" src="/assets/prop-pink-gem.webp" alt="" aria-hidden="true" loading="lazy" /></div>
          <div className="pm-tx">
            <span className="kick">Tournaments</span>
            <h3 className="h3">Tournaments are <em>coming soon.</em></h3>
            <p>Tournament details are pending confirmation.</p>
            <span className="btn" aria-disabled="true">Coming soon</span>
          </div>
        </article>
      </div>
    </section>
  );
}
