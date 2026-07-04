import * as React from "react";

export function Bookcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="-20 0 800 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-75"
      {...props}
    >
      {" "}
      <defs>
        {" "}
        <radialGradient id="bookshelfFade" cx="50%" cy="50%" r="50%">
          {" "}
          <stop offset="0%" stopColor="white" stopOpacity="1" />{" "}
          <stop offset="65%" stopColor="white" stopOpacity="0.7" />{" "}
          <stop offset="100%" stopColor="white" stopOpacity="0" />{" "}
        </radialGradient>{" "}
        <mask id="fadeMask">
          {" "}
          <rect width="800" height="500" fill="url(#bookshelfFade)" />{" "}
        </mask>{" "}
      </defs>{" "}
      <g mask="url(#fadeMask)">
        {" "}
        <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12">
          {" "}
          <line x1="100" y1="0" x2="100" y2="500" strokeDasharray="2 4" />{" "}
          <line x1="200" y1="0" x2="200" y2="500" strokeDasharray="2 4" />{" "}
          <line x1="300" y1="0" x2="300" y2="500" strokeDasharray="2 4" />{" "}
          <line x1="400" y1="0" x2="400" y2="500" strokeDasharray="2 4" />{" "}
          <line x1="500" y1="0" x2="500" y2="500" strokeDasharray="2 4" />{" "}
          <line x1="600" y1="0" x2="600" y2="500" strokeDasharray="2 4" />{" "}
          <line x1="700" y1="0" x2="700" y2="500" strokeDasharray="2 4" />{" "}
          <line x1="0" y1="100" x2="800" y2="100" strokeDasharray="2 4" />{" "}
          <line x1="0" y1="200" x2="800" y2="200" strokeDasharray="2 4" />{" "}
          <line x1="0" y1="360" x2="800" y2="360" />{" "}
          <line x1="0" y1="400" x2="800" y2="400" strokeDasharray="2 4" />{" "}
        </g>{" "}
        <g stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.35">
          {" "}
          <line x1="130" y1="80" x2="670" y2="80" />{" "}
          <line x1="130" y1="73" x2="130" y2="87" />{" "}
          <line x1="670" y1="73" x2="670" y2="87" />{" "}
          <line x1="130" y1="95" x2="130" y2="115" strokeDasharray="2 2" />{" "}
          <line x1="670" y1="95" x2="670" y2="115" strokeDasharray="2 2" />{" "}
          <line x1="485" y1="110" x2="525" y2="110" strokeDasharray="2 2" />{" "}
          <line x1="515" y1="110" x2="515" y2="360" />{" "}
          <line x1="510" y1="110" x2="520" y2="110" />{" "}
          <line x1="510" y1="360" x2="520" y2="360" />{" "}
          <path
            d="M 320 360 A 35 35 0 0 0 310 326"
            strokeDasharray="2 2"
          />{" "}
        </g>{" "}
        <g stroke="currentColor">
          {" "}
          <line
            x1="100"
            y1="360"
            x2="700"
            y2="360"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />{" "}
          <line
            x1="100"
            y1="368"
            x2="700"
            y2="368"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />{" "}
          <path
            d="M 160 368 L 160 395 L 185 368 Z"
            strokeWidth="0.8"
            strokeOpacity="0.5"
            fill="currentColor"
            fillOpacity="0.03"
          />{" "}
          <line
            x1="165"
            y1="373"
            x2="170"
            y2="368"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />{" "}
          <line
            x1="165"
            y1="383"
            x2="180"
            y2="368"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />{" "}
          <path
            d="M 640 368 L 640 395 L 615 368 Z"
            strokeWidth="0.8"
            strokeOpacity="0.5"
            fill="currentColor"
            fillOpacity="0.03"
          />{" "}
          <line
            x1="635"
            y1="373"
            x2="630"
            y2="368"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />{" "}
          <line
            x1="635"
            y1="383"
            x2="620"
            y2="368"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />{" "}
        </g>{" "}
        <g stroke="currentColor" fill="currentColor">
          {" "}
          <g strokeWidth="0.9" strokeOpacity="0.75" fillOpacity="0.02">
            {" "}
            <rect x="130" y="180" width="36" height="180" rx="1" />{" "}
            <line
              x1="130"
              y1="200"
              x2="166"
              y2="200"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />{" "}
            <line
              x1="130"
              y1="204"
              x2="166"
              y2="204"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />{" "}
            <line
              x1="130"
              y1="340"
              x2="166"
              y2="340"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />{" "}
            <line
              x1="130"
              y1="344"
              x2="166"
              y2="344"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />{" "}
            <rect
              x="137"
              y="220"
              width="22"
              height="45"
              strokeWidth="0.6"
              strokeDasharray="1 1"
              strokeOpacity="0.4"
            />{" "}
          </g>{" "}
          <g strokeWidth="0.8" strokeOpacity="0.6" fillOpacity="0.04">
            {" "}
            <rect x="169" y="220" width="18" height="140" rx="0.5" />{" "}
            <line
              x1="178"
              y1="230"
              x2="178"
              y2="350"
              strokeDasharray="4 2"
              strokeOpacity="0.3"
            />{" "}
          </g>{" "}
          <g strokeWidth="0.9" strokeOpacity="0.8" fillOpacity="0.03">
            {" "}
            <rect x="190" y="150" width="48" height="210" rx="2" />{" "}
            <circle cx="197" cy="180" r="2.5" strokeWidth="0.8" />{" "}
            <circle cx="197" cy="255" r="2.5" strokeWidth="0.8" />{" "}
            <circle cx="197" cy="330" r="2.5" strokeWidth="0.8" />{" "}
            <line
              x1="205"
              y1="160"
              x2="205"
              y2="350"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />{" "}
            <rect
              x="212"
              y="190"
              width="18"
              height="80"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />{" "}
          </g>{" "}
          <g
            transform="translate(240, 360) rotate(15) translate(-240, -360)"
            strokeWidth="0.9"
            strokeOpacity="0.85"
            fillOpacity="0.04"
          >
            {" "}
            <rect x="240" y="170" width="32" height="190" rx="1" />{" "}
            <line x1="240" y1="185" x2="272" y2="185" strokeOpacity="0.5" />{" "}
            <line x1="240" y1="345" x2="272" y2="345" strokeOpacity="0.5" />{" "}
            <path
              d="M 252 360 L 252 375 L 257 370 L 262 375 L 262 360"
              strokeWidth="0.6"
              strokeOpacity="0.6"
            />{" "}
          </g>{" "}
          <g strokeWidth="0.8" strokeOpacity="0.7" fillOpacity="0.02">
            {" "}
            <rect x="345" y="190" width="28" height="170" rx="1" />{" "}
            <rect
              x="351"
              y="210"
              width="16"
              height="30"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />{" "}
            <line
              x1="359"
              y1="220"
              x2="359"
              y2="230"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />{" "}
          </g>{" "}
          <g strokeWidth="0.8" strokeOpacity="0.7" fillOpacity="0.02">
            {" "}
            <rect x="375" y="190" width="28" height="170" rx="1" />{" "}
            <rect
              x="381"
              y="210"
              width="16"
              height="30"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />{" "}
            <line
              x1="386"
              y1="220"
              x2="386"
              y2="230"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />{" "}
            <line
              x1="392"
              y1="220"
              x2="392"
              y2="230"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />{" "}
          </g>{" "}
          <g strokeWidth="1" strokeOpacity="0.9" fillOpacity="0.05">
            {" "}
            <rect x="406" y="110" width="55" height="250" rx="2" />{" "}
            <rect
              x="414"
              y="130"
              width="39"
              height="210"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              strokeOpacity="0.3"
            />{" "}
            <circle
              cx="433.5"
              cy="170"
              r="10"
              strokeWidth="0.7"
              strokeOpacity="0.5"
            />{" "}
            <path
              d="M 433.5 163 L 433.5 177 M 426.5 170 L 440.5 170"
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />{" "}
            <line
              x1="414"
              y1="210"
              x2="453"
              y2="210"
              strokeDasharray="1 2"
              strokeOpacity="0.4"
            />{" "}
            <line
              x1="414"
              y1="220"
              x2="453"
              y2="220"
              strokeDasharray="1 2"
              strokeOpacity="0.4"
            />{" "}
            <line
              x1="414"
              y1="230"
              x2="453"
              y2="230"
              strokeDasharray="1 2"
              strokeOpacity="0.4"
            />{" "}
          </g>{" "}
          <g strokeWidth="0.8" strokeOpacity="0.6" fillOpacity="0.02">
            {" "}
            <rect x="464" y="200" width="22" height="160" rx="0.5" />{" "}
            <line
              x1="475"
              y1="210"
              x2="475"
              y2="350"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />{" "}
          </g>{" "}
          <g strokeWidth="0.8" strokeOpacity="0.75" fillOpacity="0.03">
            {" "}
            <rect x="489" y="160" width="38" height="200" rx="1" />{" "}
            <line x1="489" y1="180" x2="527" y2="180" strokeOpacity="0.4" />{" "}
            <line x1="489" y1="340" x2="527" y2="340" strokeOpacity="0.4" />{" "}
            <rect
              x="502"
              y="230"
              width="12"
              height="12"
              strokeWidth="0.6"
              strokeOpacity="0.5"
            />{" "}
          </g>{" "}
          <g strokeWidth="1" strokeOpacity="0.6">
            {" "}
            <path
              d="M 527 360 L 560 360 L 560 355 L 535 320 L 527 320 Z"
              fill="currentColor"
              fillOpacity="0.04"
            />{" "}
          </g>{" "}
        </g>{" "}
        <g
          fill="currentColor"
          opacity="0.4"
          fontFamily="monospace"
          fontSize="9"
        >
          <text x="535" y="235" textAnchor="start">
            H:250mm
          </text>{" "}
          <text x="295" y="340" textAnchor="end">
            15.4°
          </text>{" "}
          <g stroke="currentColor" strokeWidth="0.6" opacity="0.6">
            {" "}
            <circle cx="100" cy="100" r="4" fill="none" />{" "}
            <line x1="92" y1="100" x2="108" y2="100" />{" "}
            <line x1="100" y1="92" x2="100" y2="108" />{" "}
            <circle cx="700" cy="360" r="4" fill="none" />{" "}
            <line x1="692" y1="360" x2="708" y2="360" />{" "}
            <line x1="700" y1="352" x2="700" y2="368" />{" "}
          </g>{" "}
          <text x="110" y="103">
            FIG 01.0
          </text>{" "}
          <text x="670" y="380">
            REF: BASE-01
          </text>{" "}
        </g>{" "}
      </g>{" "}
    </svg>
  );
}
