// components/BannerAd.tsx - Fixed version without duplicate exports

import { useEffect, useRef, useState } from 'react';

interface BannerAdProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  width?: number;
  height?: number;
}

export default function BannerAd({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = {},
  className = "",
  width = 970,
  height = 90
}: BannerAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const initAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple attempts
    if (initAttempted.current || adLoaded || adError) {
      return;
    }

    const initializeAd = () => {
      try {
        // Check if we're in the browser
        if (typeof window === 'undefined') {
          return;
        }

        // Check if the ad element exists
        if (!adRef.current) {
          return;
        }

        // Check if adsbygoogle is available
        if (!window.adsbygoogle) {
          // If not available, try again later
          setTimeout(initializeAd, 500);
          return;
        }

        // Mark as attempted to prevent multiple tries
        initAttempted.current = true;

        // Check if the ad slot is valid
        if (!adSlot || adSlot === "1234567890" || adSlot === "0987654321") {
          console.warn('BannerAd: Using placeholder ad slot ID. Replace with actual ad slot from AdSense.');
          setAdError(true);
          return;
        }

        // Initialize the ad
        window.adsbygoogle.push({});
        setAdLoaded(true);

      } catch (error) {
        console.error('BannerAd initialization error:', error);
        setAdError(true);
        initAttempted.current = true;
      }
    };

    // Start initialization after a delay to ensure script is loaded
    const timer = setTimeout(initializeAd, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [adSlot, adLoaded, adError]);

  // Show placeholder if ad failed to load or using placeholder slot
  if (adError || adSlot === "1234567890" || adSlot === "0987654321") {
    return (
      <div className="flex justify-center items-center w-full">
        <div 
        className={`bg-gray-50 border-1 border-solid border-gray-300 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="text-center text-gray-300">
          <div className="text-sm font-medium">Advertisement</div>
          <div className="text-xs mt-1">
            {adError ? 'Ad Load Error' : 'Placeholder Ad'}
          </div>
        </div>
      </div></div>
    );
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: `${width}px`,
          height: `${height}px`,
          ...style
        }}
        data-ad-client="ca-pub-3386217398063878"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

// Safe version that completely avoids errors in development
export function SafeBannerAd({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = {},
  className = "",
  width = 970,
  height = 90
}: BannerAdProps) {
  const [showAd, setShowAd] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Only show ads in production or on non-localhost domains
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
    
    if (isProduction && !isLocalhost) {
      setShowAd(true);
    }
  }, []);

  // Don't render anything on server side
  if (!isClient) {
    return null;
  }

  // Show placeholder instead of real ad in development
  if (!showAd) {
    return (
      <div 
        className={`bg-gray-100 border-1 border-gray-300 rounded-lg flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">📢</div>
          <div className="text-sm font-medium">Advertisement</div>
          <div className="text-xs mt-1">
            {width}x{height} • {adFormat}
          </div>
        </div>
      </div>
    );
  }

  return <BannerAd {...{ adSlot, adFormat, fullWidthResponsive, style, className, width, height }} />;
}

// Declare global type for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

