import Link from 'next/link';

const steps = [
  { image: 'how-to-play-step-01.webp', alt: 'Dino presenting golden welcome coins', title: 'Welcome information', details: ['Offer terms pending confirmation', 'Coin amounts pending confirmation', 'Purchase terms pending confirmation'] },
  { image: 'how-to-play-step-02.webp', alt: 'Dino pointing to fish games and slot machines', title: 'Game information', details: ['Game titles pending confirmation', 'Availability details pending confirmation'] },
  { image: 'how-to-play-step-03.webp', alt: 'Dino presenting a golden redemption card', title: 'Redemption information', details: ['Redemption options pending confirmation', 'Eligibility and play terms pending confirmation'] },
];

export default function HowToPlay() {
  return (
    <section className="sec wrap how" aria-label="How to Play">
      <div className="sh">
        <span className="kick">Three easy steps</span>
        <h2 className="h2 rv"><span className="ln"><i>From hello to play</i></span><span className="ln"><i>in <em>three moves.</em></i></span></h2>
      </div>
      <div className="stp">
        <span className="stl" aria-hidden="true"><b /></span>
        {steps.map((step, index) => (
          <article className="st" key={step.title}>
            <span className="stn">{index + 1}</span>
            <span className="st-big" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div className="st-im"><span className="art"><img src={`/assets/${step.image}`} alt={step.alt} loading="lazy" data-asset={step.image.replace('.webp', '')} /></span></div>
            <h3 className="h3">{step.title}</h3>
            <ul className="stu">
              {step.details.map((detail) => <li key={detail}><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check" /></svg> {detail}</li>)}
            </ul>
            {index === 0 && <Link className="btn" href="#lobby">Browse game previews</Link>}
          </article>
        ))}
      </div>
    </section>
  );
}
