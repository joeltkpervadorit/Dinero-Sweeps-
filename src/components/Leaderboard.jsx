export default function Leaderboard() {
  return (
    <section className="sec wrap lbs" aria-label="Leaderboard">
      <div className="sh">
        <span className="kick">Updates every 30 minutes</span>
        <h2 className="h2 rv"><span className="ln"><i>The <em>leaderboard</em></i></span></h2>
      </div>
      <div className="lb">
        <input type="radio" name="lbt" id="lb1" className="tg" aria-label="All" defaultChecked />
        <input type="radio" name="lbt" id="lb2" className="tg" aria-label="Normal Wins" />
        <input type="radio" name="lbt" id="lb3" className="tg" aria-label="High Rollers" />
        <input type="radio" name="lbt" id="lb4" className="tg" aria-label="Rare Wins" />
        <div className="tabs"><i className="ind" aria-hidden="true" /><label htmlFor="lb1">All</label><label htmlFor="lb2">Normal Wins</label><label htmlFor="lb3">High Rollers</label><label htmlFor="lb4">Rare Wins</label></div>
        <div className="lbh"><span>Rank</span><span>Player</span><span className="xd">Time</span><span className="xd">Total Wagered</span><span className="xd">Multiplier</span><span>Total Win</span></div>
        <div className="lw">
          <span className="rk">1</span>
          <span className="lp"><i className="sk" style={{"width": "70%"}} /></span>
          <div className="lm"><span className="lc">—</span><span className="lc">—</span><span className="lc">—</span></div>
          <span className="tw">—</span>
        </div>
        <div className="lw">
          <span className="rk">2</span>
          <span className="lp"><i className="sk" style={{"width": "55%"}} /></span>
          <div className="lm"><span className="lc">—</span><span className="lc">—</span><span className="lc">—</span></div>
          <span className="tw">—</span>
        </div>
        <div className="lw">
          <span className="rk">3</span>
          <span className="lp"><i className="sk" style={{"width": "64%"}} /></span>
          <div className="lm"><span className="lc">—</span><span className="lc">—</span><span className="lc">—</span></div>
          <span className="tw">—</span>
        </div>
        <div className="lw">
          <span className="rk">4</span>
          <span className="lp"><i className="sk" style={{"width": "48%"}} /></span>
          <div className="lm"><span className="lc">—</span><span className="lc">—</span><span className="lc">—</span></div>
          <span className="tw">—</span>
        </div>
        <div className="lw">
          <span className="rk">5</span>
          <span className="lp"><i className="sk" style={{"width": "60%"}} /></span>
          <div className="lm"><span className="lc">—</span><span className="lc">—</span><span className="lc">—</span></div>
          <span className="tw">—</span>
        </div>
        <p className="lbn">Live results load here.</p>
      </div>
    </section>
  );
}
