import '@/components/landing-page/styles/landing-page.css';
import '@/components/landing-page/styles/landing-page-mobile.css';
import '@/components/landing-page/styles/landing-page-extras.css';
import IconSprite from '@/components/landing-page/components/IconSprite.jsx';
import SiteHeader from '@/components/landing-page/sections/SiteHeader.jsx';
import Atmosphere from '@/components/landing-page/sections/Atmosphere.jsx';
import Hero from '@/components/landing-page/sections/Hero.jsx';
import Ticker from '@/components/landing-page/sections/Ticker.jsx';
import WishOne from '@/components/landing-page/sections/WishOne.jsx';
import Platforms from '@/components/landing-page/sections/Platforms.jsx';
import GameLobby from '@/components/landing-page/sections/GameLobby.jsx';
import WishTwo from '@/components/landing-page/sections/WishTwo.jsx';
import WhyPlay from '@/components/landing-page/sections/WhyPlay.jsx';
import Promotions from '@/components/landing-page/sections/Promotions.jsx';
import HowToPlay from '@/components/landing-page/sections/HowToPlay.jsx';
import Doors from '@/components/landing-page/sections/Doors.jsx';
import Leaderboard from '@/components/landing-page/sections/Leaderboard.jsx';
import WishThree from '@/components/landing-page/sections/WishThree.jsx';
import TrustFeatures from '@/components/landing-page/sections/TrustFeatures.jsx';
import Faq from '@/components/landing-page/sections/Faq.jsx';
import FollowUs from '@/components/landing-page/sections/FollowUs.jsx';
import Disclaimer from '@/components/landing-page/sections/Disclaimer.jsx';
import SiteFooter from '@/components/landing-page/sections/SiteFooter.jsx';
import Mascot from '@/components/landing-page/mascot/Mascot.jsx';
import GenieSmoke from '@/components/landing-page/GenieSmoke/GenieSmoke.jsx';
import PageSound from '@/components/landing-page/PageSound/PageSound.jsx';
import Intro from '@/components/landing-page/sections/Intro.jsx';
import LandingEffects from '@/components/landing-page/LandingEffects.jsx';

export default function LandingShell() {
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
      <LandingEffects />
    </>
  );
}
