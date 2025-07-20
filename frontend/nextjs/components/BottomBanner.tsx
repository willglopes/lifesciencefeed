// src/components/BottomBanner.tsx
import React, { useState } from 'react';
import Link from 'next/link';

export default function BottomBanner() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="bg-white border-t py-2">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Left: Search toggle and field (absolute so it doesn't push other items) */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(prev => !prev)}
            className="bg-gray-100 p-1 hover:bg-gray-200 rounded text-gray-900 focus:outline-none"
          >
             <svg
  xmlns="http://www.w3.org/2000/svg"
  aria-label="Search"
  className="mySearchIcon w-4 h-4"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <circle cx="11" cy="11" r="8"></circle>
  <path d="m21 21-4.35-4.35"></path>

              <path id="Vector" d="M15 15L21 21M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z" fill="none"/>
            </svg>
          </button>
          {showSearch && (
            <input
              type="text"
              placeholder="Search..."
              className="absolute left-full top-0 ml-2 border border-gray-200 rounded w-64 z-10 px-4 py-1 bg-white text-gray-700 text-sm rounded hover:bg-gray-100"
            />
          )}
        </div>

        {/* Center: simple menu */}
        <div className="flex space-x-2">
          <Link href="/newsletter" className="text-gray-700 text-sm hover:text-gray-900">
            Newsletter
          </Link>
          <span className="text-gray-400">&bull;</span>
          <Link href="/subscriber-only" className="text-gray-700 text-sm hover:text-gray-900">
            Subscriber Only
          </Link>
        </div>

        {/* Right: action buttons */}
        <div className="flex space-x-2">
          <Link
            href="/subscribe"
            className="px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
          >
            Subscribe
          </Link>
          <Link
            href="/signin"
            className="px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
