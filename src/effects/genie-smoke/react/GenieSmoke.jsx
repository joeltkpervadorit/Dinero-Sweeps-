import { useEffect } from 'react';
import { initGenieSmoke } from '../genie-smoke.js';

/* Drop <GenieSmoke /> once, anywhere in your app (e.g. in App.jsx or the root layout).
   Pass any option to tune it: <GenieSmoke alpha={0.4} tapPuffs={12} /> */
export default function GenieSmoke(props) {
  useEffect(() => {
    const destroy = initGenieSmoke(props);
    return destroy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
