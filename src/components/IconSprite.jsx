export default function IconSprite() {
  return (
    <svg className="sr" width="0" height="0" aria-hidden="true">
      <defs>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <path d="M5 12l4 4 10-10" />
        </symbol>
        <symbol id="i-x" viewBox="0 0 24 24">
          <path d="M6 6l12 12M18 6L6 18" />
        </symbol>
        <symbol id="i-play" viewBox="0 0 24 24">
          <path d="M8 5l11 7-11 7z" />
        </symbol>
        <symbol id="i-user" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </symbol>
      </defs>
    </svg>
  );
}
