// components/HeroCTA.tsx
import Link from 'next/link';

interface HeroCTAProps {
  className?: string;
}

export default function HeroCTA({ className = "" }: HeroCTAProps) {
  return (
    <div className={`rounded-lg max-w-2xl ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-serif text-lg">LifeScienceFeed</span>
        <span className="text-sm uppercase tracking-wide">NEWS & PERSPECTIVE</span>
      </div>
      
      <h2 className="text-xl lg:text-2xl font-light text-gray-800 mb-4 leading-relaxed">
        Your only reliable one-stop shop for medical news, clinical reference, and education.
      </h2>
      
      <div className="flex flex-wrap gap-4 items-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">
          Sign up for FREE
        </button>
        
        <div className="text-sm text-white">
          Already a member? 
          <Link href="/login" className="text-white hover:text-blue-800 ml-1 font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

// Alternative: More compact version for logged-in users
export function LoggedInWelcome({ userName }: { userName?: string }) {
  return (
    <div className="bg-white bg-opacity-95 rounded-lg p-4 max-w-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-blue-600 font-semibold text-lg">LifeScience</span>
        <span className="text-gray-600 text-sm uppercase tracking-wide">NEWS & PERSPECTIVE</span>
      </div>
      
      <h2 className="text-lg font-light text-gray-800">
        Welcome back{userName ? `, ${userName}` : ''}! 
        <span className="block text-sm text-gray-600 mt-1">
          Stay updated with the latest medical research and insights.
        </span>
      </h2>
    </div>
  );
}

