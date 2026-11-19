export default function Faq() {
  return (
    <section className="sec wrap faq" id="faq" aria-label="Frequently Asked Questions">
      <div className="sh">
        <span className="kick">Frequently asked questions</span>
        <h2 className="h2 rv"><span className="ln"><i>Good questions.</i></span><span className="ln"><i><em>Straight answers.</em></i></span></h2>
        <span className="lnk">Landing page FAQ <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></span>
      </div>
      <div className="fqs">
        <details className="fq">
          <summary>What devices can I play Dinero Sweeps on?<span className="fq-i" aria-hidden="true" /></summary>
          <p>Dinero Sweeps works on mobile, tablet, and desktop — any device with a modern web browser.</p>
        </details>
        <details className="fq">
          <summary>Can I install Dinero Sweeps on my device?<span className="fq-i" aria-hidden="true" /></summary>
          <p>Yes. On mobile, use your browser&apos;s &quot;Add to Home Screen&quot; option. On desktop Chrome, use &quot;Install app&quot; from the menu when available.</p>
        </details>
        <details className="fq">
          <summary>Is Dinero Sweeps free to play?<span className="fq-i" aria-hidden="true" /></summary>
          <p>Participation, purchase, and offer terms will be published once they have been confirmed.</p>
        </details>
        <details className="fq">
          <summary>How do I create an account?<span className="fq-i" aria-hidden="true" /></summary>
          <p>Account creation is not currently available on this landing page. Account details and bonus availability require a future confirmed integration.</p>
        </details>
        <details className="fq">
          <summary>What is the minimum age to play?<span className="fq-i" aria-hidden="true" /></summary>
          <p>You must be 18 years of age or older to participate. Some states may require a higher minimum age. Void where prohibited by law.</p>
        </details>
      </div>
    </section>
  );
}
