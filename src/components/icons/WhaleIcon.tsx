import { SVGProps } from "react";

interface WhaleIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function WhaleIcon({ className, ...props }: WhaleIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Whale body */}
      <path d="M3 12c0 3.5 4 7 10 7s8-3 8-6c0-2-1-4-3-5" />
      {/* Whale head/nose */}
      <path d="M21 8c0-2-2-4-5-4-2 0-4 1-6 3" />
      {/* Whale belly curve */}
      <path d="M3 12c0-2 2-5 7-6" />
      {/* Tail fin */}
      <path d="M3 12c-1.5-1-2-3-1-5 1 1 2.5 1.5 4 1" />
      {/* Spout */}
      <path d="M16 4c0-1.5 0.5-2.5 1-3" />
      <path d="M18 3c0.5-0.8 1-1.5 1.5-2" />
      {/* Eye */}
      <circle cx="17" cy="7" r="0.5" fill="currentColor" />
      {/* Flipper */}
      <path d="M10 14c-1 1-1 2 0 3" />
    </svg>
  );
}
