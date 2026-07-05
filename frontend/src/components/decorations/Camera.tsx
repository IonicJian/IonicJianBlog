import * as React from "react";

export function Camera(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="20 51 800 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-50"
      {...props}
    >
      {" "}
      <defs>
        {" "}
        <radialGradient id="cameraFade" cx="50%" cy="50%" r="50%">
          {" "}
          <stop offset="0%" stopColor="white" stopOpacity="1" />{" "}
          <stop offset="65%" stopColor="white" stopOpacity="0.85" />{" "}
          <stop offset="100%" stopColor="white" stopOpacity="0.15" />{" "}
        </radialGradient>{" "}
        <mask id="maskCamera">
          {" "}
          <rect width="800" height="500" fill="url(#cameraFade)" />{" "}
        </mask>{" "}
      </defs>{" "}
      <g mask="url(#maskCamera)">
        {" "}
        <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15">
          {" "}
          <pattern
            id="gridCamera"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            {" "}
            <path d="M 20 0 L 0 0 0 20" fill="none" />{" "}
          </pattern>{" "}
          <rect width="800" height="500" fill="url(#gridCamera)" />{" "}
          <line
            x1="0"
            y1="250"
            x2="800"
            y2="250"
            strokeOpacity="0.4"
            strokeDasharray="20 4 4 4"
          />{" "}
          <line
            x1="330"
            y1="0"
            x2="330"
            y2="500"
            strokeOpacity="0.2"
            strokeDasharray="10 5"
          />{" "}
        </g>{" "}
        <g stroke="currentColor">
          {" "}
          <g fill="currentColor" fillOpacity="0.03">
            {" "}
            <rect
              x="310"
              y="210"
              width="45"
              height="80"
              rx="3"
              strokeWidth="1.2"
              strokeOpacity="0.9"
            />{" "}
            <path
              d="M 310 215 L 304 215 L 304 225 L 310 230"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />{" "}
            <rect
              x="307"
              y="235"
              width="3"
              height="50"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />{" "}
            <rect
              x="325"
              y="205"
              width="16"
              height="5"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />{" "}
            <path
              d="M 355 225 L 362 225 L 362 285 L 355 285"
              strokeWidth="1"
              strokeOpacity="0.8"
            />{" "}
          </g>{" "}
          <g strokeWidth="0.5" strokeOpacity="0.5">
            {" "}
            <circle cx="330" cy="218" r="3.5" fill="none" />{" "}
            <line x1="324" y1="218" x2="336" y2="218" />{" "}
            <line
              x1="330"
              y1="180"
              x2="330"
              y2="210"
              strokeDasharray="2 2"
              strokeOpacity="0.4"
            />{" "}
            <rect
              x="362"
              y="225"
              width="6"
              height="50"
              strokeWidth="0.9"
              strokeOpacity="0.8"
            />{" "}
          </g>{" "}
          <g fill="currentColor" fillOpacity="0.02">
            {" "}
            <polygon
              points="368,225 382,218 382,282 368,275"
              strokeWidth="1"
              strokeOpacity="0.8"
            />{" "}
            <rect
              x="382"
              y="218"
              width="55"
              height="64"
              strokeWidth="1"
              strokeOpacity="0.9"
            />{" "}
            <g strokeWidth="0.5" strokeOpacity="0.3">
              {" "}
              <line
                x1="387"
                y1="218"
                x2="387"
                y2="282"
                strokeDasharray="1 3"
              />{" "}
              <line x1="392" y1="218" x2="392" y2="282" strokeDasharray="1 3" />{" "}
              <line x1="397" y1="218" x2="397" y2="282" strokeDasharray="1 3" />{" "}
              <line x1="402" y1="218" x2="402" y2="282" strokeDasharray="1 3" />{" "}
              <line x1="407" y1="218" x2="407" y2="282" strokeDasharray="1 3" />{" "}
              <line x1="412" y1="218" x2="412" y2="282" strokeDasharray="1 3" />{" "}
              <line x1="417" y1="218" x2="417" y2="282" strokeDasharray="1 3" />{" "}
              <line x1="422" y1="218" x2="422" y2="282" strokeDasharray="1 3" />{" "}
              <line x1="427" y1="218" x2="427" y2="282" strokeDasharray="1 3" />{" "}
              <line
                x1="432"
                y1="218"
                x2="432"
                y2="282"
                strokeDasharray="1 3"
              />{" "}
            </g>{" "}
            <rect
              x="437"
              y="218"
              width="15"
              height="64"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />{" "}
            <rect
              x="452"
              y="218"
              width="35"
              height="64"
              strokeWidth="1"
              strokeOpacity="0.9"
            />{" "}
            <g strokeWidth="0.5" strokeOpacity="0.3">
              {" "}
              <line x1="457" y1="218" x2="457" y2="282" />{" "}
              <line x1="462" y1="218" x2="462" y2="282" />{" "}
              <line x1="467" y1="218" x2="467" y2="282" />{" "}
              <line x1="472" y1="218" x2="472" y2="282" />{" "}
              <line x1="477" y1="218" x2="477" y2="282" />{" "}
              <line x1="482" y1="218" x2="482" y2="282" />{" "}
            </g>{" "}
            <rect
              x="487"
              y="218"
              width="25"
              height="64"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />{" "}
            <rect
              x="512"
              y="220"
              width="4"
              height="60"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />{" "}
            <path
              d="M 516 225 Q 523 250 516 275"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />{" "}
            <polygon
              points="516,219 576,204 561,229 561,271 576,296 516,281"
              strokeWidth="1"
              strokeOpacity="0.9"
              fill="currentColor"
              fillOpacity="0.04"
              strokeLinejoin="round"
            />{" "}
            <polygon
              points="518,222 572,208 558,231 558,269 572,292 518,278"
              strokeWidth="0.5"
              strokeOpacity="0.4"
              fill="none"
            />{" "}
          </g>{" "}
          <g strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="4 4">
            {" "}
            <line x1="520" y1="250" x2="680" y2="180" />{" "}
            <line x1="520" y1="250" x2="680" y2="320" />{" "}
            <path
              d="M 640 197 Q 660 250 640 303"
              strokeDasharray="2 2"
              strokeOpacity="0.5"
            />{" "}
          </g>{" "}
          <g
            strokeWidth="0.8"
            strokeOpacity="0.5"
            fontFamily="monospace"
            fontSize="8"
            opacity="0.8"
          >
            {" "}
            <line x1="330" y1="165" x2="576" y2="165" />{" "}
            <line x1="330" y1="160" x2="330" y2="170" />{" "}
            <line x1="576" y1="160" x2="576" y2="170" />{" "}
            <line
              x1="576"
              y1="170"
              x2="576"
              y2="200"
              strokeDasharray="2 2"
              strokeWidth="0.5"
            />{" "}
            <text x="453" y="157" textAnchor="middle">
              OPTICAL LENGTH: 246mm (W/ HOOD)
            </text>{" "}
            <text x="315" y="325">
              BODY: ILCE-7C
            </text>{" "}
            <text x="430" y="325">
              LENS: 28-200mm f/2.8-5.6
            </text>{" "}
            <text x="585" y="253" fontSize="7">
              Ø67
            </text>{" "}
            <text x="550" y="115" textAnchor="middle">
              [ FIG 02: CAMERA SYSTEM ARCHITECTURE ]
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
