"use client";

export function OceanBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 ocean-gradient" />

      {/* Ocean shimmer effect */}
      <div className="absolute inset-0 ocean-shimmer" />

      {/* Animated SVG waves at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64">
        {/* Back wave - most transparent, slowest */}
        <svg
          className="absolute bottom-0 w-[200%] h-full wave-animation-3"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            className="fill-primary/[0.02] dark:fill-primary/[0.03]"
          />
        </svg>

        {/* Middle wave - slightly more visible */}
        <svg
          className="absolute bottom-0 w-[200%] h-full wave-animation-2"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 C180,100 360,0 540,50 C720,100 900,0 1080,50 C1260,100 1440,0 1440,50 L1440,100 L0,100 Z"
            className="fill-primary/[0.03] dark:fill-primary/[0.04]"
          />
        </svg>

        {/* Front wave - most visible, fastest */}
        <svg
          className="absolute bottom-0 w-[200%] h-full wave-animation-1"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,40 C144,80 288,0 432,40 C576,80 720,0 864,40 C1008,80 1152,0 1296,40 C1440,80 1440,40 1440,40 L1440,80 L0,80 Z"
            className="fill-primary/[0.04] dark:fill-primary/[0.05]"
          />
        </svg>
      </div>
    </div>
  );
}
