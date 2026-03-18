export const homeSvg = `
<svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="homeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="homeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#B89354" stop-opacity="0" />
      <stop offset="50%" stop-color="#F5D796" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#B89354" stop-opacity="0" />
    </linearGradient>
  </defs>
  
  <style>
    .home-pulse { animation: homePulseAnim 4s ease-in-out infinite alternate; }
    .home-dash { 
      stroke-dasharray: 100 200; 
      animation: homeDashAnim 8s linear infinite; 
    }
    .home-dash-reverse {
      stroke-dasharray: 150 250;
      animation: homeDashAnimReverse 12s linear infinite;
    }
    
    @keyframes homePulseAnim {
      0% { transform: scale(0.95); opacity: 0.7; }
      100% { transform: scale(1.05); opacity: 1; }
    }
    @keyframes homeDashAnim {
      0% { stroke-dashoffset: 300; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes homeDashAnimReverse {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 400; }
    }
    @media (prefers-reduced-motion: reduce) {
      .home-pulse, .home-dash, .home-dash-reverse { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(850, 337)">
    <circle cx="0" cy="0" r="400" fill="url(#homeGlow)" class="home-pulse" />
    
    <circle cx="0" cy="0" r="180" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.3" />
    <circle cx="0" cy="0" r="260" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.2" />
    
    <path d="M-600 0 L600 0" stroke="url(#homeLineGrad)" stroke-width="1.5" class="home-dash" />
    <path d="M-400 -200 L400 200" stroke="url(#homeLineGrad)" stroke-width="1.5" class="home-dash-reverse" />
    <path d="M-400 200 L400 -200" stroke="url(#homeLineGrad)" stroke-width="1.5" class="home-dash" />
    
    <circle cx="0" cy="0" r="8" fill="#F5D796" class="home-pulse" />
    <circle cx="0" cy="0" r="24" fill="none" stroke="#C9A96E" stroke-width="2" class="home-pulse" />
  </g>
</svg>
`;

export const workSvg = `
<svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="workGridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0" />
      <stop offset="50%" stop-color="#C9A96E" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0" />
    </linearGradient>
  </defs>
  
  <style>
    .work-pan { animation: workPanAnim 20s linear infinite; }
    .work-node { animation: workNodePulse 3s ease-in-out infinite alternate; }
    .work-scan { animation: workScanAnim 6s ease-in-out infinite alternate; }
    
    @keyframes workPanAnim {
      0% { transform: translateY(0); }
      100% { transform: translateY(-100px); }
    }
    @keyframes workNodePulse {
      0% { opacity: 0.3; r: 3; }
      100% { opacity: 1; r: 5; }
    }
    @keyframes workScanAnim {
      0% { transform: translateX(-200px); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateX(800px); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .work-pan, .work-node, .work-scan { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(700, 100)">
    <g class="work-pan">
      <!-- Grid Lines -->
      <path d="M0 0 V600 M100 0 V600 M200 0 V600 M300 0 V600 M400 0 V600" stroke="url(#workGridGrad)" stroke-width="1" />
      <path d="M-100 100 H500 M-100 200 H500 M-100 300 H500 M-100 400 H500 M-100 500 H500" stroke="#3D4A5C" stroke-width="1" opacity="0.2" />
      
      <!-- Nodes -->
      <circle cx="100" cy="200" r="4" fill="#F5D796" class="work-node" style="animation-delay: 0s" />
      <circle cx="300" cy="100" r="4" fill="#F5D796" class="work-node" style="animation-delay: 1s" />
      <circle cx="200" cy="400" r="4" fill="#F5D796" class="work-node" style="animation-delay: 2s" />
      <circle cx="400" cy="300" r="4" fill="#F5D796" class="work-node" style="animation-delay: 0.5s" />
      
      <!-- Connecting High-value Paths -->
      <path d="M100 200 L300 100 L400 300 L200 400 Z" fill="none" stroke="#C9A96E" stroke-width="1.5" opacity="0.4" />
    </g>
    
    <!-- Scanner -->
    <rect x="0" y="0" width="2" height="600" fill="#F5D796" class="work-scan" opacity="0.6" />
  </g>
</svg>
`;

export const servicesSvg = `
<svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="svcFluidGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="svcFluid1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5D796" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="svcFluid2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#B89354" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="svcFluid3" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#3D4A5C" stop-opacity="0" />
    </linearGradient>
  </defs>

  <style>
    .svc-stream { stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: svcStreamAnim 6s ease-in-out infinite alternate; }
    .svc-stream-delayed-1 { stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: svcStreamAnim 7s ease-in-out infinite alternate; animation-delay: -2s; }
    .svc-stream-delayed-2 { stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: svcStreamAnim 8s ease-in-out infinite alternate; animation-delay: -4s; }
    
    .svc-pulse-path { stroke-dasharray: 20 40; animation: svcPulseDash 15s linear infinite; }
    .svc-pulse-path-reverse { stroke-dasharray: 20 40; animation: svcPulseDashReverse 20s linear infinite; }
    
    .svc-center-glow { animation: svcCenterPulse 3s ease-in-out infinite alternate; }
    .svc-ring-spin { animation: svcRingSpinAnim 24s linear infinite; transform-origin: 0 0; }
    
    @keyframes svcStreamAnim {
      0% { stroke-dashoffset: 1200; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes svcPulseDash {
      0% { stroke-dashoffset: 600; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes svcPulseDashReverse {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 600; }
    }
    @keyframes svcCenterPulse {
      0% { opacity: 0.6; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1.05); }
    }
    @keyframes svcRingSpinAnim {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .svc-stream, .svc-stream-delayed-1, .svc-stream-delayed-2, .svc-pulse-path, .svc-pulse-path-reverse, .svc-center-glow, .svc-ring-spin { 
        animation: none !important; stroke-dashoffset: 0; 
      }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />

  <g transform="translate(850, 337)">
    <circle cx="0" cy="0" r="450" fill="url(#svcFluidGlow)" />

    <!-- Base intricate orbital curves -->
    <path d="M-300,0 C-300,-165 -165,-300 0,-300 C165,-300 300,-165 300,0 C300,165 165,300 0,300 C-165,300 -300,165 -300,0" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.15" transform="scale(1.2) rotate(15)" />
    <path d="M-250,0 C-250,-138 -138,-250 0,-250 C138,-250 250,-138 250,0 C250,138 138,250 0,250 C-138,250 -250,138 -250,0" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.25" transform="scale(1.5) rotate(-30) scale(1, 0.5)" />
    
    <!-- Fluid flowing paths from outer edges to center -->
    <!-- Curve 1 (Left swooping up) -->
    <path d="M-600,100 C-300,350 -100,-200 0,0" fill="none" stroke="#3D4A5C" stroke-width="2" opacity="0.3" />
    <path d="M-600,100 C-300,350 -100,-200 0,0" fill="none" stroke="url(#svcFluid1)" stroke-width="4" stroke-linecap="round" class="svc-stream" />
    <path d="M-600,100 C-300,350 -100,-200 0,0" fill="none" stroke="#F5D796" stroke-width="1" class="svc-pulse-path" opacity="0.8" />

    <!-- Curve 2 (Top right swooping down) -->
    <path d="M300,-400 C400,-100 -150,200 0,0" fill="none" stroke="#3D4A5C" stroke-width="2" opacity="0.3" />
    <path d="M300,-400 C400,-100 -150,200 0,0" fill="none" stroke="url(#svcFluid2)" stroke-width="4" stroke-linecap="round" class="svc-stream-delayed-1" />
    <path d="M300,-400 C400,-100 -150,200 0,0" fill="none" stroke="#C9A96E" stroke-width="1" class="svc-pulse-path-reverse" opacity="0.8" />

    <!-- Curve 3 (Bottom right sweeping left and up) -->
    <path d="M500,300 C100,500 -200,100 0,0" fill="none" stroke="#3D4A5C" stroke-width="2" opacity="0.3" />
    <path d="M500,300 C100,500 -200,100 0,0" fill="none" stroke="url(#svcFluid3)" stroke-width="4" stroke-linecap="round" class="svc-stream-delayed-2" />
    <path d="M500,300 C100,500 -200,100 0,0" fill="none" stroke="#F5D796" stroke-width="1" class="svc-pulse-path" opacity="0.8" />

    <!-- Central Cohesive Core -->
    <g class="svc-center-glow">
      <circle cx="0" cy="0" r="50" fill="none" stroke="#C9A96E" stroke-width="1" opacity="0.4" />
      <g class="svc-ring-spin">
        <circle cx="0" cy="0" r="35" fill="none" stroke="#F5D796" stroke-width="1.5" stroke-dasharray="20 10 5 10" />
        <circle cx="25" cy="25" r="4" fill="#F5D796" />
        <circle cx="-25" cy="-25" r="4" fill="#B89354" />
      </g>
      <circle cx="0" cy="0" r="18" fill="#F5D796" opacity="0.9" />
      <circle cx="0" cy="0" r="8" fill="#0C0F12" />
    </g>
  </g>
</svg>
`;

export const industriesSvg = `
<svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="indGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#1E2530" stop-opacity="0.1" />
    </linearGradient>
  </defs>
  
  <style>
    .ind-wave { animation: indWaveAnim 8s ease-in-out infinite alternate; }
    
    @keyframes indWaveAnim {
      0% { transform: translateY(0px) scaleY(1); }
      100% { transform: translateY(15px) scaleY(1.05); }
    }
    @media (prefers-reduced-motion: reduce) {
      .ind-wave { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 200) scale(1.5)" fill="none" stroke-width="1.5">
    <g class="ind-wave" style="animation-delay: 0s">
      <path d="M0 0 L200 100 L0 200 L-200 100 Z" stroke="#3D4A5C" opacity="0.3" />
    </g>
    <g class="ind-wave" style="animation-delay: 1s">
      <path d="M0 40 L180 130 L0 220 L-180 130 Z" stroke="#B89354" opacity="0.5" />
    </g>
    <g class="ind-wave" style="animation-delay: 2s">
      <path d="M0 80 L160 160 L0 240 L-160 160 Z" stroke="#C9A96E" opacity="0.8" />
      <polygon points="0,80 160,160 0,240 -160,160" fill="url(#indGrad)" />
    </g>
    <g class="ind-wave" style="animation-delay: 3s">
      <path d="M0 120 L140 190 L0 260 L-140 190 Z" stroke="#F5D796" opacity="1" />
    </g>
  </g>
</svg>
`;

export const resourcesSvg = `
<svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="resFlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5D796" stop-opacity="0" />
      <stop offset="80%" stop-color="#C9A96E" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#B89354" stop-opacity="0" />
    </linearGradient>
  </defs>
  
  <style>
    .res-flow { 
      stroke-dasharray: 60 120;
      animation: resFlowAnim 4s linear infinite; 
    }
    
    @keyframes resFlowAnim {
      0% { stroke-dashoffset: -180; }
      100% { stroke-dashoffset: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .res-flow { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(850, 0)">
    <!-- Background tracks -->
    <path d="M-150 0 C -150 300, 0 400, 0 675" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.2" />
    <path d="M-50 0 C -50 250, 0 350, 0 675" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.2" />
    <path d="M50 0 C 50 300, 0 400, 0 675" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.2" />
    <path d="M150 0 C 150 250, 0 350, 0 675" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.2" />
    
    <!-- Active flows -->
    <path d="M-150 0 C -150 300, 0 400, 0 675" fill="none" stroke="url(#resFlowGrad)" stroke-width="2" class="res-flow" style="animation-duration: 5s" />
    <path d="M-50 0 C -50 250, 0 350, 0 675" fill="none" stroke="url(#resFlowGrad)" stroke-width="3" class="res-flow" style="animation-duration: 3.5s" />
    <path d="M50 0 C 50 300, 0 400, 0 675" fill="none" stroke="url(#resFlowGrad)" stroke-width="1.5" class="res-flow" style="animation-duration: 4.5s" />
    <path d="M150 0 C 150 250, 0 350, 0 675" fill="none" stroke="url(#resFlowGrad)" stroke-width="2.5" class="res-flow" style="animation-duration: 4s" />
    
    <!-- Collection pool -->
    <ellipse cx="0" cy="550" rx="120" ry="40" fill="#C9A96E" opacity="0.05" />
    <ellipse cx="0" cy="550" rx="60" ry="20" fill="#C9A96E" opacity="0.1" />
  </g>
</svg>
`;

export const aboutSvg = `
<svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0" />
      <stop offset="50%" stop-color="#F5D796" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0" />
    </linearGradient>
  </defs>
  
  <style>
    .about-breathe { animation: aboutBreatheAnim 8s ease-in-out infinite alternate; }
    .about-pan { animation: aboutPanAnim 30s linear infinite; }
    
    @keyframes aboutBreatheAnim {
      0% { d: path("M-300 337 Q 0 100, 300 337 T 900 337"); opacity: 0.5; }
      100% { d: path("M-300 337 Q 0 500, 300 337 T 900 337"); opacity: 1; }
    }
    @keyframes aboutPanAnim {
      0% { transform: translateX(0); }
      100% { transform: translateX(-200px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .about-breathe, .about-pan { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <!-- Geometric Structure -->
  <g class="about-pan" opacity="0.15" stroke="#7A8A9E" stroke-width="1">
    <path d="M0 0 V675 M100 0 V675 M200 0 V675 M300 0 V675 M400 0 V675 M500 0 V675 M600 0 V675 M700 0 V675 M800 0 V675 M900 0 V675 M1000 0 V675 M1100 0 V675 M1200 0 V675 M1300 0 V675 M1400 0 V675" />
  </g>
  
  <!-- Organic Human Element -->
  <g transform="translate(600, 0)">
    <path d="M-300 337 Q 0 100, 300 337 T 900 337" fill="none" stroke="url(#aboutGrad)" stroke-width="3" class="about-breathe" />
    <path d="M-300 337 Q 0 500, 300 337 T 900 337" fill="none" stroke="url(#aboutGrad)" stroke-width="1.5" class="about-breathe" style="animation-direction: alternate-reverse; animation-duration: 6s;" />
  </g>
</svg>
`;

export const contactSvg = `
<svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="contactGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0" />
    </radialGradient>
  </defs>
  
  <style>
    .contact-ping { animation: contactPingAnim 4s ease-out infinite; }
    .contact-signal { stroke-dasharray: 20 40; animation: contactSignalAnim 3s linear infinite; }
    
    @keyframes contactPingAnim {
      0% { r: 10; opacity: 1; stroke-width: 3; }
      100% { r: 250; opacity: 0; stroke-width: 0.5; }
    }
    @keyframes contactSignalAnim {
      0% { stroke-dashoffset: 60; }
      100% { stroke-dashoffset: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .contact-ping, .contact-signal { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(900, 337)">
    <circle cx="0" cy="0" r="300" fill="url(#contactGlow)" />
    
    <!-- Incoming Signals -->
    <path d="M-900 -200 L-40 -10" stroke="#3D4A5C" stroke-width="1" opacity="0.3" />
    <path d="M-900 -200 L-40 -10" stroke="#C9A96E" stroke-width="1.5" class="contact-signal" />
    
    <path d="M-900 200 L-40 10" stroke="#3D4A5C" stroke-width="1" opacity="0.3" />
    <path d="M-900 200 L-40 10" stroke="#C9A96E" stroke-width="1.5" class="contact-signal" style="animation-duration: 4s; stroke-dasharray: 10 30;" />
    
    <path d="M0 400 L0 40" stroke="#3D4A5C" stroke-width="1" opacity="0.3" />
    <path d="M0 400 L0 40" stroke="#C9A96E" stroke-width="1.5" class="contact-signal" style="animation-duration: 2.5s;" />
    
    <!-- Receiver Node -->
    <circle cx="0" cy="0" r="10" fill="none" stroke="#F5D796" class="contact-ping" style="animation-delay: 0s" />
    <circle cx="0" cy="0" r="10" fill="none" stroke="#C9A96E" class="contact-ping" style="animation-delay: 1.5s" />
    <circle cx="0" cy="0" r="10" fill="none" stroke="#B89354" class="contact-ping" style="animation-delay: 3s" />
    
    <circle cx="0" cy="0" r="8" fill="#F5D796" />
  </g>
</svg>
`;

export const defaultSvg = `
<svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0C0F12" />
  <circle cx="850" cy="337" r="200" fill="#1A1E26" />
  <path d="M650 337 H1050" stroke="#C9A96E" stroke-width="1" opacity="0.2" />
</svg>
`;

export function getSvgForRoute(pathname: string): string {
  const path = pathname.toLowerCase().trim().replace(/\/+$/, '') || '/';
  
  if (path === '/') return homeSvg;
  if (path.startsWith('/work')) return workSvg;
  if (path.startsWith('/services')) return servicesSvg;
  if (path.startsWith('/industries')) return industriesSvg;
  if (path.startsWith('/resources')) return resourcesSvg;
  if (path.startsWith('/about')) return aboutSvg;
  if (path.startsWith('/contact')) return contactSvg;
  
  return defaultSvg;
}
