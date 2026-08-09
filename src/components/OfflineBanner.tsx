import { useEffect, useState, type ReactNode } from 'react';

interface OfflineBannerProps {
  children: ReactNode;
}

/** Shows a friendly message when the browser is offline (per spec edge case). */
export function OfflineBanner({ children }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => {
      console.debug('[OfflineBanner] browser back online');
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.debug('[OfflineBanner] browser offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="app-card offline-banner" role="alert">
        <h1>Fun Math</h1>
        <p>You are offline. Check your internet and try again.</p>
        <p>Once the app loads, you can practice without internet!</p>
      </div>
    );
  }

  return <>{children}</>;
}
