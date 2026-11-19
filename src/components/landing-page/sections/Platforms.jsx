
const previews = [
  ['blue-dragon-777.webp', '01'], ['cash-machine-slot.webp', '02'],
  ['golden-queen.webp', '03'], ['fish-hunter.webp', '04'],
  ['olympus-strike.webp', '05'], ['dragon-tiger.webp', '06'],
  ['lucky-fortune.webp', '07'], ['pirate-treasure.webp', '08'],
  ['wild-west-slots.webp', '09'], ['sweet-bonanza.webp', '10'],
  ['roulette-royale.webp', '11'],
];

export default function Platforms() {
  return (
    <section className="sec plsec" id="platforms" aria-label="Platform previews">
      <div className="wrap sh">
        <span className="kick">Platform previews</span>
        <h2 className="h2 rv"><span className="ln"><i>One lobby.</i></span><span className="ln"><i><em>More to come.</em></i></span></h2>
        <p className="lead">Platform details will be published here when the lineup is confirmed.</p>
      </div>
      <input type="checkbox" id="plm" className="tg" aria-label="Show all platform previews" />
      <div className="roll">
        {previews.map(([image, number], index) => (
          <div className={`rl${index > 5 ? ' more' : ''}`} key={number}>
            <a className="rl-m" href="#lobby" aria-label={`View platform preview ${number}`}>
              <img src={`/assets/${image}`} alt="" width="352" height="294" loading="lazy" decoding="async" />
              <span className="rl-t">Platform preview {number}</span>
            </a>
            <span className="rl-a"><a className="rl-go" href="#lobby" aria-label={`View platform preview ${number}`}><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></a></span>
            <span className="rl-l"><a href="#lobby">View games</a></span>
          </div>
        ))}
      </div>
      <div className="wrap plf"><label className="btn gh" htmlFor="plm">Show all previews</label></div>
      <div className="wrap" style={{ textAlign: 'center', paddingTop: '10px' }}><a className="lnk" href="#lobby">View game previews <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></a></div>
    </section>
  );
}
