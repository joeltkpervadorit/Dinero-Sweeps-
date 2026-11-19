import SocialLinks from '@/components/landing-page/components/SocialLinks.jsx';

export default function FollowUs() {
  return (
    <section className="fol" aria-label="Follow Us Now!">
      <div className="fol-mq" aria-hidden="true">
        <div className="fol-tr"><span>Follow <em>the</em> glow</span><span>Follow <em>the</em> glow</span><span>Follow <em>the</em> glow</span><span>Follow <em>the</em> glow</span></div>
      </div>
      <div className="fol-c">
        <h2 className="sr">Follow us now</h2>
        <p className="lead">Official social profiles will be linked here when they are confirmed.</p>
        <SocialLinks className="soc" />
      </div>
    </section>
  );
}
