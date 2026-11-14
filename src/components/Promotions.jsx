export default function Promotions() {
  return (
    <section className="sec wrap" aria-label="Promotions" style={{"paddingTop": "24px"}}>
      <div className="pmg">
        <article className="pm pm1">
          <div className="pm-art"><span className="art"><img src="/media/promo-rewards.webp" alt="Dino presenting a chest of rewards" loading="lazy" data-asset="promo-rewards" /></span></div>
          <div className="pm-tx">
            <span className="kick">Rewards &amp; promotions</span>
            <h3 className="h3">Every visit comes with <em>something extra.</em></h3>
            <p>Promotions, daily login rewards, spin-the-wheel surprises, challenges and VIP benefits. There is always a new perk waiting.</p>
            <a className="btn" href="/promotions">Explore all promotions</a>
          </div>
        </article>
        <article className="pm pm2">
          <div className="pm-art"><span className="art"><img src="/media/promo-tournament.webp" alt="Dino celebrating beside a golden tournament trophy" loading="lazy" data-asset="promo-tournament" /></span></div>
          <div className="pm-tx">
            <span className="kick">Tournaments</span>
            <h3 className="h3">Take a seat at the <em>big table.</em></h3>
            <p>Join tournaments, challenge other players, climb the leaderboards and chase exclusive rewards.</p>
            <a className="btn" href="/signup">Join the tournament</a>
          </div>
        </article>
      </div>
    </section>
  );
}
