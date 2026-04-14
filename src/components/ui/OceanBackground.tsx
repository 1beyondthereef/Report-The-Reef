"use client";

export function OceanBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Soft gradient - white to pale ocean blue */}
      <div className="absolute inset-0 ocean-gradient-serene" />

      {/* Large, gentle animated waves at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-96 md:h-[32rem]">
        {/* Back wave - largest, slowest */}
        <svg
          className="absolute bottom-0 w-[200%] h-full wave-serene-3"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,110 C240,145 480,75 720,110 C960,145 1200,75 1440,110 L1440,180 L0,180 Z"
            className="fill-[hsl(210_50%_75%/0.32)] dark:fill-[hsl(210_40%_35%/0.22)]"
          />
        </svg>

        {/* Middle wave - gentle curve */}
        <svg
          className="absolute bottom-0 w-[200%] h-full wave-serene-2"
          viewBox="0 0 1440 150"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,85 C180,115 360,55 540,85 C720,115 900,55 1080,85 C1260,115 1440,55 1440,85 L1440,150 L0,150 Z"
            className="fill-[hsl(205_55%_70%/0.28)] dark:fill-[hsl(205_45%_30%/0.18)]"
          />
        </svg>

        {/* Front wave - most visible */}
        <svg
          className="absolute bottom-0 w-[200%] h-full wave-serene-1"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,65 C144,95 288,35 432,65 C576,95 720,35 864,65 C1008,95 1152,35 1296,65 C1440,95 1440,65 1440,65 L1440,120 L0,120 Z"
            className="fill-[hsl(200_60%_65%/0.24)] dark:fill-[hsl(200_50%_25%/0.14)]"
          />
        </svg>
      </div>

      {/* Subtle light reflection */}
      <div className="absolute inset-0 ocean-light" />
    </div>
  );
}
