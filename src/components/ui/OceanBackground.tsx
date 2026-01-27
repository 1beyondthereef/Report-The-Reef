"use client";

export function OceanBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Ultra-soft gradient - white to barely-there aqua */}
      <div className="absolute inset-0 ocean-gradient-serene" />

      {/* Subtle light shimmer */}
      <div className="absolute inset-0 ocean-light" />

      {/* Minimal, slow-breathing waves at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 md:h-56">
        {/* Back wave - barely visible, slowest */}
        <svg
          className="absolute bottom-0 w-[200%] h-full wave-serene-3"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,70 Q360,50 720,70 T1440,70 L1440,100 L0,100 Z"
            className="fill-[hsl(190_50%_85%/0.08)] dark:fill-[hsl(190_40%_50%/0.06)]"
          />
        </svg>

        {/* Middle wave - soft, gentle curve */}
        <svg
          className="absolute bottom-0 w-[200%] h-full wave-serene-2"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,55 Q360,40 720,55 T1440,55 L1440,80 L0,80 Z"
            className="fill-[hsl(187_55%_80%/0.06)] dark:fill-[hsl(187_45%_45%/0.05)]"
          />
        </svg>

        {/* Front wave - most visible but still subtle */}
        <svg
          className="absolute bottom-0 w-[200%] h-full wave-serene-1"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,40 Q360,30 720,40 T1440,40 L1440,60 L0,60 Z"
            className="fill-[hsl(185_60%_75%/0.05)] dark:fill-[hsl(185_50%_40%/0.04)]"
          />
        </svg>
      </div>
    </div>
  );
}
