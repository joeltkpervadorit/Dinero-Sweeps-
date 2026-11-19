import Link from 'next/link';

const art = [
  '/assets/cash-machine-slot.webp', '/assets/golden-queen.webp', '/assets/blue-dragon-777.webp',
  '/assets/olympus-strike.webp', '/assets/lucky-fortune.webp', '/assets/wild-west-slots.webp',
  '/assets/sweet-bonanza.webp', '/assets/fish-hunter.webp', '/assets/pirate-treasure.webp',
  '/assets/dragon-tiger.webp', '/assets/dice-deluxe.webp', '/assets/roulette-royale.webp',
];
const categories = [
  ['lobby-slots', 'Slots', 'Game previews'],
  ['lobby-fish', 'Fish games', 'Game previews'],
  ['lobby-war', 'War games', 'Game previews'],
  ['lobby-table', 'Table & card', 'Game previews'],
  ['lobby-arcade', 'Arcade & keno', 'Game previews'],
];

function Arrow() {
  return <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg>;
}

function GameCard({ number, image }) {
  return (
    <Link className="gc-t" href="#lobby" aria-label={`Game preview ${number}; title to be confirmed`}>
      <span className="ga"><img src={image} alt="" width="352" height="294" loading="lazy" decoding="async" /></span>
      <span className="gn">Game preview {number}</span>
    </Link>
  );
}

export default function GameLobby() {
  return (
    <section className="gms" id="lobby" aria-label="Game previews">
      <i className="bulbs" aria-hidden="true" />
      <div className="wrap sh">
        <span className="kick">Game previews</span>
        <h2 className="h2 rv"><span className="ln"><i>The <em>game lobby</em></i></span></h2>
        <p className="lead">Game titles and availability will be confirmed before launch.</p>
      </div>
      <div className="wrap glw">
        {categories.map(([id, title, blurb]) => (
          <div className="gcat" id={id} key={id}>
            <div className="gch">
              <i className="bulbs" aria-hidden="true" /><i className="bulbs b2" aria-hidden="true" />
              <img className="gch-i" src={art[categories.findIndex((category) => category[0] === id)]} alt="" width="96" height="96" loading="lazy" decoding="async" />
              <div className="gch-tx"><span className="gch-n">Titles pending confirmation</span><h3>{title}</h3><p>{blurb}</p></div>
              <span className="gch-a">Preview <Arrow /></span>
            </div>
            <div className="glg">
              {Array.from({ length: 18 }, (_, index) => {
                const number = `${String(categories.findIndex((category) => category[0] === id) + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
                return <GameCard key={number} number={number} image={art[(index + categories.findIndex((category) => category[0] === id)) % art.length]} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
