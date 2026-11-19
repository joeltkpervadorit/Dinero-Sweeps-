import { SOCIAL_LINKS } from '@/components/landing-page/constants';

/* One set of social icons, used by the Follow Us section and the footer (`className` is the wrapper class). */
export default function SocialLinks({ className }) {
  return (
    <div className={className}>
      {SOCIAL_LINKS.map(({ name, label, icon, href }) => {
        const img = <img src={icon} alt="" width="40" height="40" />;
        if (!href) {
          return <span key={name} className="social-placeholder" role="img" aria-label={`${label} profile coming soon`} title="Coming soon">{img}</span>;
        }
        return <a key={name} href={href} aria-label={label} target="_blank" rel="noopener noreferrer">{img}</a>;
      })}
    </div>
  );
}
