import { useEffect } from 'react';
import './lib/gsap-setup.js';
import { initMotion } from './lib/motion.js';
import IconSprite from './components/IconSprite.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import Atmosphere from './components/Atmosphere.jsx';
import Hero from './components/Hero.jsx';
import Ticker from './components/Ticker.jsx';
import WishOne from './components/WishOne.jsx';
import Platforms from './components/Platforms.jsx';
import GameLobby from './components/GameLobby.jsx';
import WishTwo from './components/WishTwo.jsx';
import WhyPlay from './components/WhyPlay.jsx';
import Promotions from './components/Promotions.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import Doors from './components/Doors.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import WishThree from './components/WishThree.jsx';
import TrustFeatures from './components/TrustFeatures.jsx';
import Testimonials from './components/Testimonials.jsx';
import Faq from './components/Faq.jsx';
import FollowUs from './components/FollowUs.jsx';
import Disclaimer from './components/Disclaimer.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import Mascot from './mascot/Mascot.jsx';
import GenieSmoke from './effects/genie-smoke/react/GenieSmoke.jsx';
import PageSound from './audio/PageSound.jsx';
import Intro from './components/Intro.jsx';
import { initCardTilt } from './effects/cardTilt.js';

export default function App() {
  useEffect(() => { initMotion(); return initCardTilt(); }, []);
  return (
    <>
    <div className="ds">
      <IconSprite />
      <SiteHeader />
      <main>
        <Atmosphere />
        <Hero />
        <Ticker />
        <WishOne />
        <Platforms />
        <GameLobby />
        <div className="c2">
          <WishTwo />
          <WhyPlay />
          <Promotions />
          <HowToPlay />
          <Doors />
          <Leaderboard />
        </div>
        <div className="c3">
          <WishThree />
          <TrustFeatures />
          <Testimonials />
          <Faq />
          <FollowUs />
          <Disclaimer />
        </div>
      </main>
      <SiteFooter />
    </div>
    <Mascot />
    <GenieSmoke />
    <PageSound />
    <Intro />
    </>
  );
}
