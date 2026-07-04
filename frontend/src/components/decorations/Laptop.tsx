import * as React from "react";

export function Laptop(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 -38 800 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-60"
      {...props}
    >
      {" "}
      <defs>
        {" "}
        <radialGradient id="laptopFade" cx="50%" cy="50%" r="50%">
          {" "}
          <stop offset="0%" stopColor="white" stopOpacity="1" />{" "}
          <stop offset="65%" stopColor="white" stopOpacity="0.85" />{" "}
          <stop offset="100%" stopColor="white" stopOpacity="0.15" />{" "}
        </radialGradient>{" "}
        <mask id="maskLaptop">
          {" "}
          <rect width="800" height="500" fill="url(#laptopFade)" />{" "}
        </mask>{" "}
      </defs>{" "}
      <g mask="url(#maskLaptop)">
        {" "}
        <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15">
          {" "}
          <pattern
            id="gridLaptop"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            {" "}
            <path d="M 20 0 L 0 0 0 20" fill="none" />{" "}
          </pattern>{" "}
          <rect width="800" height="500" fill="url(#gridLaptop)" />{" "}
          <line
            x1="0"
            y1="250"
            x2="800"
            y2="250"
            strokeOpacity="0.4"
            strokeDasharray="10 5"
          />{" "}
          <line
            x1="400"
            y1="0"
            x2="400"
            y2="500"
            strokeOpacity="0.4"
            strokeDasharray="10 5"
          />{" "}
        </g>{" "}
        <g stroke="currentColor">
          {" "}
          <rect
            x="250"
            y="110"
            width="300"
            height="190"
            rx="6"
            strokeWidth="1.2"
            strokeOpacity="0.9"
            fill="currentColor"
            fillOpacity="0.02"
          />{" "}
          <rect
            x="256"
            y="116"
            width="288"
            height="175"
            rx="2"
            strokeWidth="0.8"
            strokeOpacity="0.6"
          />{" "}
          <circle
            cx="400"
            cy="113"
            r="1.5"
            fill="currentColor"
            fillOpacity="0.7"
          />{" "}
          <g strokeWidth="0.5" strokeOpacity="0.3">
            {" "}
            <rect
              x="270"
              y="130"
              width="70"
              height="40"
              strokeDasharray="2 2"
            />{" "}
            <line x1="270" y1="185" x2="430" y2="185" strokeDasharray="4 2" />{" "}
            <line x1="270" y1="195" x2="380" y2="195" strokeDasharray="4 2" />{" "}
            <line x1="270" y1="205" x2="410" y2="205" strokeDasharray="4 2" />{" "}
            <rect
              x="470"
              y="130"
              width="60"
              height="100"
              strokeDasharray="1 3"
            />{" "}
            <line x1="390" y1="203.5" x2="410" y2="203.5" strokeOpacity="0.5" />{" "}
            <line
              x1="400"
              y1="193.5"
              x2="400"
              y2="213.5"
              strokeOpacity="0.5"
            />{" "}
          </g>{" "}
          <g fill="currentColor" fillOpacity="0.03">
            {" "}
            <polygon
              points="250,303 550,303 590,380 210,380"
              strokeWidth="1.2"
              strokeOpacity="0.9"
            />{" "}
            <polygon
              points="210,380 590,380 590,385 210,385"
              strokeWidth="0.8"
              strokeOpacity="0.5"
              fillOpacity="0.06"
            />{" "}
          </g>{" "}
          <polygon
            points="270,313 530,313 555,355 245,355"
            strokeWidth="0.8"
            strokeOpacity="0.5"
          />{" "}
          <g strokeWidth="0.5" strokeOpacity="0.25">
            {" "}
            <line x1="264" y1="322" x2="536" y2="322" />{" "}
            <line x1="257" y1="332" x2="543" y2="332" />{" "}
            <line x1="250" y1="343" x2="550" y2="343" />{" "}
            <line x1="310" y1="313" x2="290" y2="355" />{" "}
            <line x1="350" y1="313" x2="340" y2="355" />{" "}
            <line x1="400" y1="313" x2="400" y2="355" />{" "}
            <line x1="450" y1="313" x2="460" y2="355" />{" "}
            <line x1="490" y1="313" x2="510" y2="355" />{" "}
          </g>{" "}
          <polygon
            points="365,362 435,362 440,375 360,375"
            strokeWidth="0.8"
            strokeOpacity="0.6"
          />{" "}
          <g
            strokeWidth="0.5"
            strokeOpacity="0.5"
            fontFamily="monospace"
            fontSize="8"
            opacity="0.7"
          >
            {" "}
            <line
              x1="230"
              y1="110"
              x2="230"
              y2="300"
              strokeDasharray="2 2"
            />{" "}
            <line x1="225" y1="110" x2="235" y2="110" />{" "}
            <line x1="225" y1="300" x2="235" y2="300" />{" "}
            <text
              x="215"
              y="210"
              transform="rotate(-90 215 210)"
              textAnchor="middle"
            >
              16:10 RATIO
            </text>{" "}
            <text x="400" y="95" textAnchor="middle">
              [ FIG 01: MOBILE WORKSTATION ELEVATION ]
            </text>{" "}
          </g>{" "}
        </g>{" "}
        <g stroke="currentColor" strokeWidth="0.6" opacity="0.4">
          {" "}
          <circle cx="50" cy="50" r="5" fill="none" />
          <line x1="40" y1="50" x2="60" y2="50" />
          <line x1="50" y1="40" x2="50" y2="60" />{" "}
          <circle cx="750" cy="450" r="5" fill="none" />
          <line x1="740" y1="450" x2="760" y2="450" />
          <line x1="750" y1="440" x2="750" y2="460" />{" "}
        </g>{" "}
      </g>{" "}
    </svg>
  );
}
