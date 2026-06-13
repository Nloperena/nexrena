/** Lightweight portal-style process visuals — SMIL loops, paused off-screen via SVGSVGElement.pauseAnimations(). */

export const processDiscoverySvg = `
<svg class="process-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="pd-glow" cx="50%" cy="50%" r="45%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0"/>
    </radialGradient>
    <path id="pd-scan" d="M120,560 C360,420 480,300 620,340 S900,200 1080,160" fill="none"/>
  </defs>
  <rect width="1200" height="800" fill="#0C0F12"/>
  <g opacity="0.12" stroke="#3D4A5C" stroke-width="1">
    <path d="M0 200 H1200 M0 400 H1200 M0 600 H1200"/>
    <path d="M240 0 V800 M600 0 V800 M960 0 V800"/>
  </g>
  <circle cx="600" cy="400" r="260" fill="url(#pd-glow)"/>
  <use href="#pd-scan" stroke="#7A5C2D" stroke-width="1" stroke-dasharray="4 8" opacity="0.35"/>
  <use href="#pd-scan" stroke="#B89354" stroke-width="2" opacity="0.45"/>
  <circle r="3.5" fill="#F5D796">
    <animateMotion dur="5s" repeatCount="indefinite"><mpath href="#pd-scan"/></animateMotion>
  </circle>
  <g transform="translate(620,340)">
    <circle r="36" fill="none" stroke="#F5D796" stroke-width="1" opacity="0.5">
      <animate attributeName="r" values="24;48" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0" dur="2.4s" repeatCount="indefinite"/>
    </circle>
    <circle r="5" fill="#F5D796"/>
    <path d="M-14 0 H14 M0 -14 V14" stroke="#F5D796" stroke-width="1.2" opacity="0.7"/>
  </g>
</svg>`;

export const processStrategySvg = `
<svg class="process-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ps-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0"/>
    </radialGradient>
    <path id="ps-route" d="M160,520 L380,360 L580,420 L920,240" fill="none"/>
  </defs>
  <rect width="1200" height="800" fill="#0C0F12"/>
  <g opacity="0.15" fill="none" stroke="#3D4A5C" stroke-width="1">
    <circle cx="600" cy="400" r="120"/>
    <circle cx="600" cy="400" r="220"/>
    <path d="M160 400 H1040 M600 120 V680" stroke-dasharray="5 5"/>
  </g>
  <circle cx="600" cy="400" r="300" fill="url(#ps-glow)"/>
  <path d="M160,520 C280,620 340,480 380,360" fill="none" stroke="#3D4A5C" stroke-width="2" stroke-dasharray="6 6" opacity="0.35"/>
  <use href="#ps-route" stroke="#3D4A5C" stroke-width="2" opacity="0.3"/>
  <use href="#ps-route" stroke="#C9A96E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle r="3" fill="#ffffff">
    <animateMotion dur="4s" repeatCount="indefinite"><mpath href="#ps-route"/></animateMotion>
  </circle>
  <g transform="translate(160,520)"><circle r="8" fill="#0C0F12" stroke="#7A8A9E" stroke-width="2"/></g>
  <g transform="translate(380,360)"><circle r="10" fill="#0C0F12" stroke="#F5D796" stroke-width="2"/><circle r="3" fill="#F5D796"/></g>
  <g transform="translate(580,420)"><circle r="10" fill="#0C0F12" stroke="#F5D796" stroke-width="2"/><circle r="3" fill="#F5D796"/></g>
  <g transform="translate(920,240)">
    <circle r="14" fill="#0C0F12" stroke="#C9A96E" stroke-width="2"/>
    <circle r="28" fill="none" stroke="#F5D796" stroke-width="1" stroke-dasharray="8 12" opacity="0.6">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="18s" repeatCount="indefinite"/>
    </circle>
  </g>
</svg>`;

export const processExecutionSvg = `
<svg class="process-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="pe-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="#0C0F12"/>
  <circle cx="600" cy="400" r="280" fill="url(#pe-glow)"/>
  <g transform="translate(600,400)" opacity="0.25" stroke="#3D4A5C" stroke-width="1">
    <path d="M-180,-120 H180 M-180,0 H180 M-180,120 H180"/>
    <path d="M-180,-120 V120 M-60,-120 V120 M60,-120 V120 M180,-120 V120"/>
  </g>
  <g transform="translate(600,400)">
    <circle r="160" fill="none" stroke="#7A8A9E" stroke-width="1.5" opacity="0.35"/>
    <circle r="160" fill="none" stroke="#F5D796" stroke-width="3" stroke-linecap="round" stroke-dasharray="120 885" opacity="0.8">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite"/>
    </circle>
    <rect x="-70" y="20" width="140" height="90" fill="#3D4A5C" fill-opacity="0.35" stroke="#7A8A9E" stroke-width="1.5" rx="2"/>
    <rect x="-55" y="-30" width="110" height="70" fill="#B89354" fill-opacity="0.5" stroke="#C9A96E" stroke-width="2" rx="2">
      <animate attributeName="y" values="-30;-38;-30" dur="2.5s" repeatCount="indefinite"/>
    </rect>
    <rect x="-40" y="-80" width="80" height="55" fill="#F5D796" fill-opacity="0.85" stroke="#F5D796" stroke-width="2" rx="2">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
    </rect>
  </g>
  <g transform="translate(320,260)" opacity="0.65">
    <rect width="110" height="36" rx="4" fill="#1E2530" stroke="#3D4A5C"/>
    <circle cx="18" cy="18" r="5" fill="#F5D796"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/></circle>
    <rect x="36" y="16" width="58" height="4" rx="2" fill="#7A8A9E"/>
  </g>
</svg>`;

export const processDeliverySvg = `
<svg class="process-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pd-trail" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F5D796"/>
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0"/>
    </linearGradient>
    <path id="pd-curve" d="M280,620 C480,620 560,420 820,180" fill="none"/>
    <path id="pd-curve2" d="M280,620 C400,500 520,320 720,200" fill="none"/>
  </defs>
  <rect width="1200" height="800" fill="#0C0F12"/>
  <g transform="translate(280,620)">
    <path d="M40,60 L-60,20 L-60,-80 L40,-40 Z" fill="#C9A96E" fill-opacity="0.15" stroke="#B89354"/>
    <path d="M40,60 L80,10 L80,-90 L40,-40 Z" fill="#C9A96E" fill-opacity="0.08" stroke="#B89354"/>
    <path d="M40,-40 L-60,-80 L0,-120 L80,-90 Z" fill="#F5D796" fill-opacity="0.25" stroke="#F5D796"/>
    <circle cy="-60" r="10" fill="#F5D796">
      <animate attributeName="r" values="8;14;8" dur="2.2s" repeatCount="indefinite"/>
    </circle>
  </g>
  <use href="#pd-curve" stroke="#3D4A5C" stroke-width="2" opacity="0.35"/>
  <use href="#pd-curve" stroke="url(#pd-trail)" stroke-width="6" stroke-linecap="round"/>
  <use href="#pd-curve2" stroke="#3D4A5C" stroke-width="1" opacity="0.3"/>
  <use href="#pd-curve2" stroke="#C9A96E" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
  <circle r="3" fill="#ffffff">
    <animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#pd-curve"/></animateMotion>
  </circle>
  <circle r="2.5" fill="#F5D796" opacity="0.8">
    <animateMotion dur="4.5s" begin="-1.5s" repeatCount="indefinite"><mpath href="#pd-curve2"/></animateMotion>
  </circle>
</svg>`;
