// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopBanner from './TopBanner';
import BottomBanner from './BottomBanner';
import MainNavbar from './MainNavbar';
import BannerAd from './BannerAd';



export default function Header() {
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 100);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <TopBanner />
      <BottomBanner />
      <BannerAd adSlot="header-banner" />

      <header
        className={`bg-white shadow-md sticky top-0 z-50 transition-all duration-300 ${
          shrunk ? 'py-2' : 'py-6'
        }`}
      >
        <div className="container mx-auto grid grid-cols-3 items-end px-4">
          {/* LEFT */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{dateString}</span>
            {shrunk && (
              <Link href="/">
                <img
                  src="/images/lifesciencefeed.png"
                  alt="Life Science Feed"
                  className="h-8 w-auto"
                />
              </Link>
            )}
          </div>

          {/* CENTER */}
          {!shrunk ? (
            <div className="justify-self-center flex flex-col items-center">
              <Link href="/">
                <img
                  src="/images/lifesciencefeed.png"
                  alt="Life Science Feed"
                  className="h-30 w-auto"
                />
              </Link>
              <span className="mt-1 text-sm font-serif">
                Trusted medical journalism
              </span>
            </div>
          ) : (
            <div className="justify-self-center flex flex-col items-center pb-1">
                <div className="w-[30vw] flex">

                <Link href="/therapy-areas" className="text-center hover:text-gray-900">
                  Therapy Areas
                </Link>
                <span className="px-7">&bull;</span>
                                <Link href="/therapy-areas" className="text-center hover:text-gray-900">
                  Disease Areas
                </Link>
                <span className="px-7">&bull;</span>
                <Link href="/categories" className="text-center hover:text-gray-900">
                  Categories
                </Link>
                <span className="px-7">&bull;</span>
                <Link href="/contact" className="text-center hover:text-gray-900">
                  Contact Us
                </Link>


              </div>
              </div>
          )}

          {/* RIGHT */}
          <div className="justify-self-end flex text-sm text-gray-800">
            {shrunk ? (
              <>
                <div className="w-full flex space-x-4 items-center">
                             
          <Link
            href="/subscribe"
            className="items-center px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
          >
            Subscribe
          </Link>
          <Link
            href="/signin"
            className="px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
          >
            Sign In
          </Link>
        
                <Link href="/about" className="flex-1 text-right px-2 hover:text-gray-900">
                  About Us
                </Link>
              </div>
              </>
            ) : (
              <Link href="/about" className="flex-1 text-left px-2 hover:text-gray-900">
                About Us
              </Link>
            )}
          </div>
        </div>
      </header>

      <MainNavbar />
    </>
  );
}
