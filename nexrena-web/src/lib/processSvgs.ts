export const processDiscoverySvg = `
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="discGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="discScan" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5D796" stop-opacity="0" />
      <stop offset="50%" stop-color="#C9A96E" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#F5D796" stop-opacity="0" />
    </linearGradient>
  </defs>

  <style>
    .disc-ring { animation: discRingAnim 10s linear infinite; transform-origin: 600px 400px; }
    .disc-ring-reverse { animation: discRingReverse 15s linear infinite; transform-origin: 600px 400px; }
    .disc-pulse { animation: discPulse 4s ease-in-out infinite alternate; }
    .disc-scan-line { animation: discScanAnim 6s ease-in-out infinite alternate; }
    
    @keyframes discRingAnim { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes discRingReverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
    @keyframes discPulse { 0% { opacity: 0.4; stroke-width: 1; } 100% { opacity: 1; stroke-width: 3; } }
    @keyframes discScanAnim { 0% { transform: translateY(-300px); } 100% { transform: translateY(300px); } }
    @media (prefers-reduced-motion: reduce) {
      .disc-ring, .disc-ring-reverse, .disc-pulse, .disc-scan-line { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 400) scale(1.5)">
    <circle cx="0" cy="0" r="300" fill="url(#discGlow)" />
    
    <!-- Outer Grid -->
    <path d="M-400 0 H400 M0 -400 V400" stroke="#3D4A5C" stroke-width="0.5" opacity="0.4" />
    <path d="M-200 -200 L200 200 M-200 200 L200 -200" stroke="#3D4A5C" stroke-width="0.5" opacity="0.2" />

    <!-- Scanner Rings -->
    <g class="disc-ring">
      <circle cx="0" cy="0" r="180" fill="none" stroke="#7A8A9E" stroke-width="1" stroke-dasharray="4 8" opacity="0.6" />
      <path d="M-180 0 A180 180 0 0 1 180 0" fill="none" stroke="#C9A96E" stroke-width="2" />
    </g>

    <g class="disc-ring-reverse">
      <circle cx="0" cy="0" r="240" fill="none" stroke="#3D4A5C" stroke-width="1.5" />
      <path d="M0 240 A240 240 0 0 0 240 0" fill="none" stroke="#F5D796" stroke-width="3" />
      <circle cx="240" cy="0" r="6" fill="#F5D796" />
      <circle cx="0" cy="240" r="6" fill="#F5D796" />
    </g>

    <!-- Central Lens/Eye -->
    <circle cx="0" cy="0" r="80" fill="none" stroke="#C9A96E" class="disc-pulse" />
    <circle cx="0" cy="0" r="60" fill="none" stroke="#B89354" stroke-width="1" opacity="0.5" />
    <circle cx="0" cy="0" r="20" fill="#F5D796" class="disc-pulse" />

    <!-- Scanner Line -->
    <rect x="-300" y="0" width="600" height="2" fill="url(#discScan)" class="disc-scan-line" />
  </g>
</svg>
`;

export const processStrategySvg = `
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="stratGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#3D4A5C" stop-opacity="0.2" />
    </linearGradient>
  </defs>

  <style>
    .strat-draw { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: stratDrawAnim 8s ease-out infinite alternate; }
    .strat-node { animation: stratNodePulse 4s infinite alternate; }
    .strat-layer { animation: stratLayerFloat 6s ease-in-out infinite alternate; }
    
    @keyframes stratDrawAnim { 0% { stroke-dashoffset: 2000; } 100% { stroke-dashoffset: 0; } }
    @keyframes stratNodePulse { 0% { r: 3; opacity: 0.5; } 100% { r: 7; opacity: 1; } }
    @keyframes stratLayerFloat { 0% { transform: translateY(0) rotateX(60deg) rotateZ(45deg); } 100% { transform: translateY(-20px) rotateX(60deg) rotateZ(45deg); } }
    @media (prefers-reduced-motion: reduce) {
      .strat-draw, .strat-node, .strat-layer { animation: none !important; stroke-dashoffset: 0; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 450) scale(1.4)">
    
    <!-- Base Blueprint Grid -->
    <g transform="rotateX(60deg) rotateZ(45deg)" opacity="0.2" stroke="#3D4A5C" stroke-width="1">
      <path d="M-400 -400 L400 -400 M-400 -200 L400 -200 M-400 0 L400 0 M-400 200 L400 200 M-400 400 L400 400" />
      <path d="M-400 -400 L-400 400 M-200 -400 L-200 400 M0 -400 L0 400 M200 -400 L200 400 M400 -400 L400 400" />
    </g>

    <!-- Elevated Architecture Layers -->
    <g class="strat-layer" style="animation-delay: 0s;">
      <path d="M-200 -100 L0 -300 L200 -100 L0 100 Z" fill="none" stroke="#C9A96E" stroke-width="2" class="strat-draw" />
      <path d="M-200 -100 L0 100 L200 -100" fill="none" stroke="#B89354" stroke-width="1" opacity="0.5" />
      <circle cx="0" cy="-300" r="5" fill="#F5D796" class="strat-node" />
      <circle cx="-200" cy="-100" r="5" fill="#F5D796" class="strat-node" style="animation-delay: 1s;" />
      <circle cx="200" cy="-100" r="5" fill="#F5D796" class="strat-node" style="animation-delay: 2s;" />
      <circle cx="0" cy="100" r="5" fill="#F5D796" class="strat-node" style="animation-delay: 3s;" />
    </g>

    <g class="strat-layer" style="animation-delay: -2s;" transform="translate(0, -100)">
      <path d="M-150 -50 L0 -200 L150 -50 L0 100 Z" fill="url(#stratGrad)" opacity="0.2" />
      <path d="M-150 -50 L0 -200 L150 -50 L0 100 Z" fill="none" stroke="#F5D796" stroke-width="1.5" class="strat-draw" style="animation-delay: -2s;" />
    </g>

    <g class="strat-layer" style="animation-delay: -4s;" transform="translate(0, -200)">
      <path d="M-100 0 L0 -100 L100 0 L0 100 Z" fill="none" stroke="#C9A96E" stroke-width="3" class="strat-draw" style="animation-delay: -4s;" />
      <circle cx="0" cy="-100" r="8" fill="#F5D796" />
    </g>

    <!-- Vertical Connector Lines -->
    <path d="M0 -300 V-500" stroke="#7A8A9E" stroke-width="1" stroke-dasharray="5 5" class="strat-draw" />
    <path d="M-200 -100 V-300" stroke="#7A8A9E" stroke-width="1" stroke-dasharray="5 5" class="strat-draw" />
    <path d="M200 -100 V-300" stroke="#7A8A9E" stroke-width="1" stroke-dasharray="5 5" class="strat-draw" />
  </g>
</svg>
`;

export const processExecutionSvg = `
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="execGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="1" />
      <stop offset="100%" stop-color="#B89354" stop-opacity="0.2" />
    </linearGradient>
  </defs>

  <style>
    .exec-gear { animation: execGearSpin 20s linear infinite; transform-origin: 0 0; }
    .exec-gear-reverse { animation: execGearSpinReverse 15s linear infinite; transform-origin: 0 0; }
    .exec-piston { animation: execPistonPump 2s ease-in-out infinite alternate; }
    .exec-flow { stroke-dasharray: 40 40; animation: execFlowAnim 2s linear infinite; }
    
    @keyframes execGearSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes execGearSpinReverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
    @keyframes execPistonPump { 0% { transform: translateY(0); } 100% { transform: translateY(-60px); } }
    @keyframes execFlowAnim { 0% { stroke-dashoffset: 80; } 100% { stroke-dashoffset: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .exec-gear, .exec-gear-reverse, .exec-piston, .exec-flow { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 400) scale(1.5)">
    
    <!-- Background Tracks -->
    <path d="M-400 200 L400 200" stroke="#3D4A5C" stroke-width="4" />
    <path d="M-400 -200 L400 -200" stroke="#3D4A5C" stroke-width="4" />

    <!-- Massive Gear Left -->
    <g transform="translate(-180, 0)">
      <g class="exec-gear">
        <circle cx="0" cy="0" r="140" fill="none" stroke="#3D4A5C" stroke-width="20" stroke-dasharray="40 20" />
        <circle cx="0" cy="0" r="120" fill="none" stroke="#1E2530" stroke-width="40" />
        <circle cx="0" cy="0" r="80" fill="none" stroke="url(#execGrad)" stroke-width="8" />
        <path d="M-80 0 L80 0 M0 -80 L0 80 M-56 -56 L56 56 M-56 56 L56 -56" stroke="#C9A96E" stroke-width="6" />
        <circle cx="0" cy="0" r="30" fill="#0C0F12" stroke="#F5D796" stroke-width="4" />
      </g>
    </g>

    <!-- Medium Gear Right -->
    <g transform="translate(140, -80)">
      <g class="exec-gear-reverse">
        <circle cx="0" cy="0" r="90" fill="none" stroke="#7A8A9E" stroke-width="15" stroke-dasharray="25 15" />
        <circle cx="0" cy="0" r="75" fill="none" stroke="#1E2530" stroke-width="20" />
        <circle cx="0" cy="0" r="50" fill="none" stroke="#B89354" stroke-width="4" />
        <path d="M-50 0 L50 0 M0 -50 L0 50 M-35 -35 L35 35 M-35 35 L35 -35" stroke="#C9A96E" stroke-width="4" />
        <circle cx="0" cy="0" r="20" fill="#0C0F12" stroke="#F5D796" stroke-width="3" />
      </g>
    </g>

    <!-- Pistons / Actuators -->
    <g transform="translate(200, 150)">
      <rect x="-15" y="-50" width="30" height="100" fill="#1E2530" stroke="#3D4A5C" stroke-width="2" />
      <g class="exec-piston">
        <rect x="-8" y="-120" width="16" height="120" fill="#C9A96E" />
        <circle cx="0" cy="-120" r="12" fill="#F5D796" />
      </g>
    </g>

    <g transform="translate(-300, -150)">
      <rect x="-15" y="-50" width="30" height="100" fill="#1E2530" stroke="#3D4A5C" stroke-width="2" />
      <g class="exec-piston" style="animation-delay: -1s;">
        <rect x="-8" y="-120" width="16" height="120" fill="#C9A96E" />
        <circle cx="0" cy="-120" r="12" fill="#F5D796" />
      </g>
    </g>

    <!-- Energy Flows -->
    <path d="M-180 0 L140 -80" stroke="#F5D796" stroke-width="3" class="exec-flow" />
    <path d="M-300 -150 L-180 0" stroke="#C9A96E" stroke-width="2" class="exec-flow" style="animation-direction: reverse;" />
    <path d="M140 -80 L200 150" stroke="#C9A96E" stroke-width="2" class="exec-flow" />

  </g>
</svg>
`;

export const processDeliverySvg = `
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="delGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F5D796" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#C9A96E" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="delTrail" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5D796" stop-opacity="1" />
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0" />
    </linearGradient>
  </defs>

  <style>
    .del-launch { animation: delLaunchAnim 4s ease-out infinite; }
    .del-pulse { animation: delCorePulse 2s infinite alternate; }
    .del-particles { animation: delParticleFlow 3s linear infinite; }
    
    @keyframes delLaunchAnim {
      0% { transform: translateY(200px) scale(0.8); opacity: 0; }
      20% { opacity: 1; }
      100% { transform: translateY(-400px) scale(1.2); opacity: 0; }
    }
    @keyframes delCorePulse { 0% { r: 30; opacity: 0.8; } 100% { r: 40; opacity: 1; } }
    @keyframes delParticleFlow { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .del-launch, .del-pulse, .del-particles { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 400) scale(1.5)">
    
    <!-- Background Environment -->
    <path d="M0 -500 V500" stroke="#3D4A5C" stroke-width="1" opacity="0.3" />
    <path d="M-100 -500 V500 M100 -500 V500" stroke="#3D4A5C" stroke-width="0.5" opacity="0.15" />
    <path d="M-200 -500 V500 M200 -500 V500" stroke="#3D4A5C" stroke-width="0.5" opacity="0.1" />

    <!-- Launch Mechanism -->
    <g class="del-launch">
      
      <!-- Energy Trail -->
      <path d="M0 0 L0 300" stroke="url(#delTrail)" stroke-width="8" stroke-linecap="round" />
      <path d="M-20 20 L-20 200" stroke="url(#delTrail)" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      <path d="M20 20 L20 200" stroke="url(#delTrail)" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      
      <!-- Core Payload -->
      <circle cx="0" cy="0" r="150" fill="url(#delGlow)" />
      
      <polygon points="0,-60 -40,20 0,40 40,20" fill="none" stroke="#F5D796" stroke-width="3" />
      <polygon points="0,-40 -25,15 0,30 25,15" fill="#C9A96E" opacity="0.4" />
      
      <circle cx="0" cy="0" r="35" fill="#F5D796" class="del-pulse" />
      <circle cx="0" cy="0" r="15" fill="#ffffff" />
      
      <!-- Surrounding Rings -->
      <ellipse cx="0" cy="0" rx="80" ry="20" fill="none" stroke="#C9A96E" stroke-width="2" />
      <ellipse cx="0" cy="0" rx="80" ry="20" fill="none" stroke="#F5D796" stroke-width="1" transform="rotate(90)" />

    </g>

    <!-- Speed/Data Lines -->
    <path d="M-80 -400 V400" stroke="#C9A96E" stroke-width="2" stroke-dasharray="20 80" class="del-particles" opacity="0.5" />
    <path d="M80 -400 V400" stroke="#C9A96E" stroke-width="2" stroke-dasharray="10 90" class="del-particles" opacity="0.5" style="animation-duration: 2s;" />
    <path d="M-150 -400 V400" stroke="#B89354" stroke-width="1" stroke-dasharray="30 70" class="del-particles" opacity="0.3" style="animation-duration: 4s;" />
    <path d="M150 -400 V400" stroke="#B89354" stroke-width="1" stroke-dasharray="15 85" class="del-particles" opacity="0.3" style="animation-duration: 2.5s;" />

  </g>
</svg>
`;
