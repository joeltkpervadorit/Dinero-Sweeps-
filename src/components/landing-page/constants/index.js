/* Social profiles. Leave `href` empty until the real profile URL is confirmed:
   an icon without a URL renders as a non-interactive placeholder rather than a dead "#" link. */
export const SOCIAL_LINKS = [
  { name: 'Facebook', label: 'Facebook', icon: '/assets/social-facebook.webp', href: '' },
  { name: 'Instagram', label: 'Instagram', icon: '/assets/social-instagram.webp', href: '' },
  { name: 'X', label: 'X / Twitter', icon: '/assets/social-x.webp', href: '' },
  { name: 'TikTok', label: 'TikTok', icon: '/assets/social-tiktok.webp', href: '' },
];

/* Promo code shown by the secret lamp. Set NEXT_PUBLIC_LAMP_BONUS_CODE (or VITE_LAMP_BONUS_CODE) to a code
   the business actually honours; it is public by design (it is displayed to visitors). When unset, the lamp does not show a code. */
export const LAMP_BONUS_CODE =
  process.env.NEXT_PUBLIC_LAMP_BONUS_CODE || process.env.VITE_LAMP_BONUS_CODE || '';
