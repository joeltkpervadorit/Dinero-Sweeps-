import Image from 'next/image';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="hd">
      <Link className="logo" href="/" aria-label="Dinero Sweeps home"><Image src="/assets/logo-neon.png" alt="Dinero Sweeps" width={440} height={304} sizes="72px" priority /></Link>
      <span className="hd-act" aria-hidden="true">Wish <b className="hd-n">1</b> of 3 · <span className="hd-w">Play</span></span>
      <nav className="hda" aria-label="Game lobby">
        <Link className="hdl" href="#lobby"><span className="hdu"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-user" /></svg></span>Games</Link>
        <Link className="btn sm" href="#lobby">Explore</Link>
      </nav>
      <div className="meter" aria-hidden="true"><i><b /></i><i><b /></i><i><b /></i></div>
    </header>
  );
}
