import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0820', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <p>Page not found</p>
        <Link href="/" style={{ color: '#ff85f8' }}>Back to home</Link>
      </div>
    </div>
  );
}
