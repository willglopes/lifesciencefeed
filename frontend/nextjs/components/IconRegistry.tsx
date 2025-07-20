// src/components/IconRegistry.tsx
import React from 'react';

// Fallback inline icons for menu and close
const IconPaths: Record<string, React.ReactElement> = {
  menu: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 8h16M4 16h16"
      stroke="currentColor"
      strokeWidth={2}
    />
  ),
  close: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 6l12 12M6 18L18 6"
      stroke="currentColor"
      strokeWidth={2}
    />
  ),
};

export type IconName = keyof typeof IconPaths;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, width = 24, height = 24, ...props }: IconProps) {
  const path = IconPaths[name];
  if (!path) return null;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {path}
    </svg>
  );
}

export default Icon;
