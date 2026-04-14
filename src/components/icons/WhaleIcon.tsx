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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Humpback whale body - distinctive curved shape with hump */}
      <path d="M2 13c1-3 4-5 8-5 3 0 5 1 7 2 2 1.5 4 2 5 1" />
      {/* Belly/underside curve */}
      <path d="M2 13c0 2 2 4 6 5 3 0.5 6 0 9-1.5" />
      {/* Head and distinctive humpback jaw */}
      <path d="M19 11c1 0 2-0.5 2.5-1.5" />
      {/* Long pectoral fin - distinctive humpback feature */}
      <path d="M8 13c-2 2-4 5-5.5 7" />
      {/* Small dorsal fin/hump on back */}
      <path d="M12 8c0-0.5 0.5-1 1-1" />
      {/* Tail fluke */}
      <path d="M2 13c-0.5-1.5 0-3 1-4" />
      <path d="M2 13c-1 0.5-1.5 2-1 3.5" />
      {/* Eye */}
      <circle cx="18" cy="10" r="0.5" fill="currentColor" />
      {/* Spout/blow */}
      <path d="M20 6c0.5-1.5 0-3-0.5-4" />
      <path d="M21.5 5c0.5-1 0.5-2 0-3" />
    </svg>
  );
}
