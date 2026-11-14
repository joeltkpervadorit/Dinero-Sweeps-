import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/landing.css';
import './styles/mobile.css';

// No <StrictMode>: the GSAP choreography is imperative and must initialise once. (The mascot cleans up after itself.)
createRoot(document.getElementById('root')).render(<App />);
