
/* Phone-only quick actions under the hero (PlayJuwa-style app shortcuts). Hidden on desktop. */
const ITEMS = [
  { id: 'games-hot', href: '#lobby', img: '/assets/ui-flame.webp', t: 'Games', s: 'Play now', hot: true },
  { id: 'games-browse', href: '#lobby', img: '/assets/icon-spin-wheel-wheel.webp', t: 'Games', s: 'Browse', spin: true },
  { id: 'rewards', href: '#promotions', img: '/assets/prop-gift-box.webp', t: 'Rewards', s: 'Details pending' },
  { id: 'lobby', href: '#lobby', img: '/assets/prop-trophy.webp', t: 'Lobby', s: 'Explore' },
];

export default function QuickActions() {
  return (
    <nav className="qa" aria-label="Quick actions">
      {ITEMS.map((it, i) => (
        <a key={it.id} className="qa-b" href={it.href} style={{ '--q': i }}>
          {it.hot ? <span className="qa-hot">Hot</span> : null}
          <span className={'qa-ic' + (it.spin ? ' qa-spin' : '')}><img src={it.img} alt="" width="40" height="40" /></span>
          <b className="qa-t">{it.t}</b>
          <small className="qa-s">{it.s}</small>
        </a>
      ))}
    </nav>
  );
}
