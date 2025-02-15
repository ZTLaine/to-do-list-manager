"use client"

import * as React from "react"

export function AnimatedGradient() {
  return (
    <div className="fixed inset-0 -z-10">
      <svg
        className="h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="animate-gradient-shift-1">
              <animate
                attributeName="stop-color"
                values="#1a237e;#311b92;#4a148c;#311b92;#1a237e"
                dur="10s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" className="animate-gradient-shift-2">
              <animate
                attributeName="stop-color"
                values="#000051;#1a237e;#000051;#1a237e;#000051"
                dur="10s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
          </filter>
        </defs>
        <g filter="url(#goo)">
          <rect width="100%" height="100%" fill="url(#grad1)" />
          <circle className="animate-blob" cx="50" cy="50" r="50" fill="#311b92" opacity="0.5">
            <animate
              attributeName="cx"
              values="50;55;45;50"
              dur="15s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="50;45;55;50"
              dur="15s"
              repeatCount="indefinite"
            />
          </circle>
          <circle className="animate-blob" cx="50" cy="50" r="35" fill="#1a237e" opacity="0.5">
            <animate
              attributeName="cx"
              values="50;45;55;50"
              dur="15s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="50;55;45;50"
              dur="15s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>
    </div>
  )
} 