import Link from 'next/link';
import SocialLinks from '@/components/landing-page/components/SocialLinks.jsx';
import RubLamp from '@/components/landing-page/components/RubLamp.jsx';

const platformLabels = Array.from({ length: 11 }, (_, index) => `Platform details pending ${index + 1}`);
const pageLinks = [
  ['Blog', '#lobby'], ['Promotions', '#promotions'], ['FAQ', '#faq'],
  ['Responsible Gaming', '#faq'], ['Help Center', '#faq'],
  ['Stores', '#lobby'], ['Providers', '#platforms'], ['VIP information pending', null],
  ['Game Lobby', '#lobby'], ['Support details pending', null],
];

function Chevron({ className = 'nf-ch', small = true }) {
  return <svg className={className} width={small ? '8' : '11'} height={small ? '13' : '17'} viewBox="0 0 10 16" aria-hidden="true"><path d="M2 2l6 6-6 6" /></svg>;
}

export default function SiteFooter() {
  return (
    <footer className="nf">
      <div className="nf-in">
        <div className="nf-pay" aria-label="Payment options pending confirmation">
          <img src="/assets/pay-visa.webp" alt="" aria-hidden="true" /><img src="/assets/pay-mastercard.webp" alt="" aria-hidden="true" />
          <img src="/assets/pay-google-pay.webp" alt="" aria-hidden="true" /><img src="/assets/pay-apple-pay.webp" alt="" aria-hidden="true" />
          <img className="nf-sm" src="/assets/pay-bank.webp" alt="" aria-hidden="true" /><img src="/assets/pay-bitcoin.webp" alt="" aria-hidden="true" />
        </div>
        <div className="nf-dv" aria-hidden="true"><i /><svg width="26" height="26" viewBox="0 0 30 30"><path d="M15 3c-5 6-11 9-11 14 0 3.2 2.4 5.5 5.4 5.5 2 0 3.4-1 4.2-2L12 27h6l-1.6-6.5c.8 1 2.2 2 4.2 2 3 0 5.4-2.3 5.4-5.5 0-5-6-8-11-14z" /></svg><i /></div>
        <div className="nf-gr">
          <div className="nf-card nf-lc">
            <img className="nf-mk" src="/assets/logo-mark.svg" alt="" />
            <div><Link className="nf-wm" href="/" aria-label="Dinero Sweeps home"><span className="nf-d">DINERO</span><span className="nf-s">SWEEPS</span></Link><p className="nf-tg">Free Sweepstakes Casino</p></div>
          </div>
          <nav className="nf-card" aria-label="Platforms">
            <div className="nf-hd"><h3>Platforms</h3><Chevron className="nf-ch nf-chl" small={false} /></div>
            <div className="nf-cols"><ul>{platformLabels.slice(0, 6).map((label) => <li key={label}><a className="nf-a" href="#platforms"><span>{label}</span><Chevron /></a></li>)}</ul><ul>{platformLabels.slice(6).concat(['All platform details pending']).map((label) => <li key={label}><a className="nf-a" href="#platforms"><span>{label}</span><Chevron /></a></li>)}</ul></div>
          </nav>
          <nav className="nf-card" aria-label="Pages">
            <div className="nf-hd"><h3>Pages</h3><Chevron className="nf-ch nf-chl" small={false} /></div>
            <div className="nf-cols"><ul>{pageLinks.slice(0, 5).map(([label, href]) => <li key={label}>{href ? <a className="nf-a" href={href}><span>{label}</span><Chevron /></a> : <span className="nf-a"><span>{label}</span></span>}</li>)}</ul><ul>{pageLinks.slice(5).map(([label, href]) => <li key={label}>{href ? <a className="nf-a" href={href}><span>{label}</span><Chevron /></a> : <span className="nf-a"><span>{label}</span></span>}</li>)}</ul></div>
          </nav>
          <nav className="nf-card nf-cc" aria-label="Contact">
            <div className="nf-hd"><h3>Contact</h3><Chevron className="nf-ch nf-chl" small={false} /></div>
            <div className="nf-ct"><ul className="nf-cl">
              <li><span className="nf-ca"><img src="/assets/ui-mail-white.webp" alt="" /><span>Contact details pending confirmation</span></span></li>
              <li><a className="nf-ca" href="#faq"><img src="/assets/ui-headset-white.webp" alt="" /><span>Help center</span></a></li>
              <li><span className="nf-ca"><img src="/assets/ui-chat-white.webp" alt="" /><span>Support options pending</span></span></li>
              <li><a className="nf-ca" href="#faq"><img src="/assets/ui-shield-white.webp" alt="" /><span>Responsible Gaming</span></a></li>
            </ul><SocialLinks className="nf-so" /></div>
          </nav>
        </div>
        <div className="nf-sp"><RubLamp /></div>
        <div className="nf-bd"><img src="/assets/badge-18plus.webp" alt="18+ Only" title="18+ Only" /><img src="/assets/badge-shield.webp" alt="Security" title="Security" /><img src="/assets/badge-secure-chip.webp" alt="Secure" title="Secure" /><img src="/assets/badge-gc.webp" alt="Gold Coins" title="Gold Coins" /></div>
        <div className="nf-lg">
          <p>Eligibility, purchase, and promotion terms will be published once confirmed. Please refer to the <a href="#faq">FAQ</a> for current information. Intended for adults 18 and older.</p>
          <p className="nf-cp">© 2026 Dinero Sweeps | All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
