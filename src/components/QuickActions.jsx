/* Phone-only quick actions under the hero (PlayJuwa-style app shortcuts). Hidden on desktop. */
const ITEMS = [
  { href: '#lobby', img: '/media/ui-flame.webp', t: 'Games', s: 'Play now', hot: true },
  { href: '/signup', img: '/media/icon-spin-wheel-wheel.webp', t: 'Daily spin', s: 'Free daily', spin: true },
  { href: '/promotions', img: '/media/prop-gift-box.webp', t: 'Rewards', s: 'Promos' },
  { href: '/signup', img: '/media/prop-trophy.webp', t: 'Tourneys', s: 'Win big' },
];

export default function QuickActions() {
  return (
    <nav className="qa" aria-label="Quick actions">
      {ITEMS.map((it, i) => (
        <a key={it.t} className="qa-b" href={it.href} style={{ '--q': i }}>
          {it.hot ? <span className="qa-hot">Hot</span> : null}
          <span className={'qa-ic' + (it.spin ? ' qa-spin' : '')}><img src={it.img} alt="" width="40" height="40" /></span>
          <b className="qa-t">{it.t}</b>
          <small className="qa-s">{it.s}</small>
        </a>
      ))}
    </nav>
  );
}
