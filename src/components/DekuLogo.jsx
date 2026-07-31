import React from 'react';

export default function DekuLogo({ className = "w-6 h-6", textClassName = "" }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Open ring with top-right arc gap */}
        <path 
          d="M 66 22 A 36 36 0 1 0 78 34" 
          stroke="currentColor" 
          strokeWidth="10" 
          strokeLinecap="round" 
        />
        {/* Orbiting dot in top-right gap */}
        <circle cx="76" cy="22" r="8.5" fill="currentColor" />
      </svg>
    </div>
  );
}
