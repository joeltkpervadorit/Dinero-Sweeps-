const MESSAGES = [
  'Game information coming soon',
  'Platform lineup pending confirmation',
  'Promotion details pending',
  'Eligibility information pending',
  'Official social links coming soon',
  '18+ only',
];

export default function Ticker() {
  const repeatedMessages = [...MESSAGES, ...MESSAGES];

  return (
    <div className="tick" aria-hidden="true">
      <div className="tick-in">
        <div className="tick-tr">{repeatedMessages.map((message, index) => <span key={`${message}-${index}`}>{message}</span>)}</div>
      </div>
    </div>
  );
}
