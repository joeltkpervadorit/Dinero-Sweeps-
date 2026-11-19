// No sitemap entry: sitemap URLs must be absolute and the production domain is not known to this repository.
export default function robots() {
  return { rules: { userAgent: '*', allow: '/' } };
}
