export default function GameLobby() {
  return (
    <section className="gms" id="lobby" aria-label="Games">
      <i className="bulbs" aria-hidden="true" />
      <div className="wrap sh">
        <span className="kick">Pick your game</span>
        <h2 className="h2 rv"><span className="ln"><i>The <em>game lobby</em></i></span></h2>
        <p className="lead">Fish tables, slots and table classics — tap any game to start.</p>
      </div>
      <div className="wrap glw">
        <input className="gt-i" type="radio" name="gt" id="gt-all" defaultChecked />
        <input className="gt-i" type="radio" name="gt" id="gt-fish" />
        <input className="gt-i" type="radio" name="gt" id="gt-slots" />
        <input className="gt-i" type="radio" name="gt" id="gt-table" />
        <div className="gtabs" aria-label="Filter games">
          <label htmlFor="gt-all">All <b>12</b></label>
          <label htmlFor="gt-slots">Slots <b>7</b></label>
          <label htmlFor="gt-fish">Fish &amp; arcade <b>2</b></label>
          <label htmlFor="gt-table">Table <b>3</b></label>
        </div>
        <div className="glg">
          <a className="gc-t" data-c="fish" href="/signup" aria-label="Play Fish Hunter — sign up"><span className="ga"><img src="/media/fish-hunter.webp" alt="Fish Hunter game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Fish Hunter</span><span className="gk">Fish &amp; arcade</span></a>
          <a className="gc-t" data-c="fish" href="/signup" aria-label="Play Pirate Treasure — sign up"><span className="ga"><img src="/media/pirate-treasure.webp" alt="Pirate Treasure game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Pirate Treasure</span><span className="gk">Fish &amp; arcade</span></a>
          <a className="gc-t" data-c="slots" href="/signup" aria-label="Play Cash Machine — sign up"><span className="ga"><img src="/media/cash-machine-slot.webp" alt="Cash Machine game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Cash Machine</span><span className="gk">Slots</span></a>
          <a className="gc-t" data-c="slots" href="/signup" aria-label="Play Golden Queen — sign up"><span className="ga"><img src="/media/golden-queen.webp" alt="Golden Queen game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Golden Queen</span><span className="gk">Slots</span></a>
          <a className="gc-t" data-c="slots" href="/signup" aria-label="Play Blue Dragon 777 — sign up"><span className="ga"><img src="/media/blue-dragon-777.webp" alt="Blue Dragon 777 game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Blue Dragon 777</span><span className="gk">Slots</span></a>
          <a className="gc-t" data-c="slots" href="/signup" aria-label="Play Olympus Strike — sign up"><span className="ga"><img src="/media/olympus-strike.webp" alt="Olympus Strike game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Olympus Strike</span><span className="gk">Slots</span></a>
          <a className="gc-t" data-c="slots" href="/signup" aria-label="Play Lucky Fortune — sign up"><span className="ga"><img src="/media/lucky-fortune.webp" alt="Lucky Fortune game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Lucky Fortune</span><span className="gk">Slots</span></a>
          <a className="gc-t" data-c="table" href="/signup" aria-label="Play Dragon Tiger — sign up"><span className="ga"><img src="/media/dragon-tiger.webp" alt="Dragon Tiger game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Dragon Tiger</span><span className="gk">Table</span></a>
          <a className="gc-t" data-c="slots" href="/signup" aria-label="Play Wild West Slots — sign up"><span className="ga"><img src="/media/wild-west-slots.webp" alt="Wild West Slots game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Wild West Slots</span><span className="gk">Slots</span></a>
          <a className="gc-t" data-c="slots" href="/signup" aria-label="Play Sweet Bonanza — sign up"><span className="ga"><img src="/media/sweet-bonanza.webp" alt="Sweet Bonanza game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Sweet Bonanza</span><span className="gk">Slots</span></a>
          <a className="gc-t" data-c="table" href="/signup" aria-label="Play Dice Deluxe — sign up"><span className="ga"><img src="/media/dice-deluxe.webp" alt="Dice Deluxe game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Dice Deluxe</span><span className="gk">Table</span></a>
          <a className="gc-t" data-c="table" href="/signup" aria-label="Play Roulette Royale — sign up"><span className="ga"><img src="/media/roulette-royale.webp" alt="Roulette Royale game artwork" width="352" height="294" loading="lazy" decoding="async" /></span><span className="gn">Roulette Royale</span><span className="gk">Table</span></a>
        </div>
        <div className="gft"><a className="lnk" href="/signup">Show all games <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></a></div>
      </div>
    </section>
  );
}
