import {useEffect} from 'react';

type ZoomDirection = 'in' | 'out';

function detectZoom(): number {
  if (typeof window === 'undefined') return 100;

  if (window.visualViewport?.scale) {
    return Math.round(window.visualViewport.scale * 100);
  }

  if (window.devicePixelRatio) {
    return Math.round(window.devicePixelRatio * 100);
  }

  return Math.round((screen.width / window.innerWidth) * 100);
}

export default function useZoomTracker(
  onZoomChange?: (zoom: {zoomPercent: number; direction: ZoomDirection}) => void
) {
  useEffect(() => {
    let lastZoom = detectZoom();

    const logZoomChange = (zoomPercent: number, direction: ZoomDirection) => {
      const payload = {
        zoomPercent,
        direction,
      };

      if (onZoomChange) {
        onZoomChange(payload);
      } else {
        console.log('BrowserZoomChanged', payload);
      }
    };

    const checkZoom = () => {
      const currentZoom = detectZoom();
      if (currentZoom !== lastZoom) {
        const direction = currentZoom > lastZoom ? 'in' : 'out';
        logZoomChange(currentZoom, direction);
        lastZoom = currentZoom;
      }
    };

    // Use both interval + visualViewport events for reliability
    const interval = setInterval(checkZoom, 300);
    window.visualViewport?.addEventListener('resize', checkZoom);

    return () => {
      clearInterval(interval);
      window.visualViewport?.removeEventListener('resize', checkZoom);
    };
  }, [onZoomChange]);
}
