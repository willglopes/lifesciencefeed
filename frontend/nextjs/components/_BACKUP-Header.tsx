// src/components/Header.tsx
import React from 'react';
import Link from 'next/link';
import TopBanner from './TopBanner';
import BottomBanner from './BottomBanner';
import Navbar from './Navbar';

export default function Header() {
  return (
    <>
      {/* Top banner */}
      <TopBanner />

      {/* Bottom banner */}
      <BottomBanner />

      {/* Main header */}
      <header className="bg-gray-100 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          {/* Logo */}
          <Link href="/" legacyBehavior>
            <a className="flex items-center">
              <img
                src="/images/lifesciencefeed.png"
                alt="Life Science Feed"
                className="h-14 w-auto"
              />
            </a>
          </Link>

          {/* Right side: Navbar + Auth */}
          <div className="flex items-center space-x-6">
            {/* Navigation menu */}
            <Navbar />

            {/* Login/Register */}
            <Link href="/login" legacyBehavior>
              <a>
                <button className="px-4 py-2 border rounded text-gray-500 hover:bg-gray-300">
                  Login / Register
                </button>
              </a>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
