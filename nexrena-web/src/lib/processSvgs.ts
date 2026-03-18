export const processDiscoverySvg = `
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="discLens" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0" />
    </radialGradient>
  </defs>

  <style>
    .disc-node { animation: nodePulse 4s ease-in-out infinite alternate; }
    .disc-scan { animation: scanPan 8s ease-in-out infinite alternate; }
    .disc-line { stroke-dasharray: 100; animation: lineFlow 4s linear infinite; }
    
    @keyframes nodePulse { 0% { opacity: 0.2; r: 2; } 100% { opacity: 1; r: 5; } }
    @keyframes scanPan { 0% { transform: translate(-100px, 50px) scale(0.9); } 100% { transform: translate(150px, -80px) scale(1.1); } }
    @keyframes lineFlow { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
    @media (prefers-reduced-motion: reduce) { .disc-node, .disc-scan, .disc-line { animation: none !important; } }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 400)">
    <!-- Noise / Competitors (Dim and chaotic) -->
    <g opacity="0.3" stroke="#3D4A5C" stroke-width="1">
      <path d="M-400,200 L-200,100 L-300,-100 L-100,-200 L100,-100 L300,-200 L400,0 L200,200 Z" fill="none" />
      <path d="M-200,100 L-100,-200 M100,-100 L400,0 M-300,-100 L100,-100" fill="none" stroke-dasharray="4 4" />
      <circle cx="-400" cy="200" r="3" />
      <circle cx="-200" cy="100" r="3" />
      <circle cx="-300" cy="-100" r="3" />
      <circle cx="-100" cy="-200" r="3" />
      <circle cx="100" cy="-100" r="3" />
      <circle cx="300" cy="-200" r="3" />
      <circle cx="400" cy="0" r="3" />
      <circle cx="200" cy="200" r="3" />
    </g>

    <!-- The Scanning Lens locking onto the core opportunity -->
    <g class="disc-scan">
      <circle cx="0" cy="0" r="250" fill="url(#discLens)" />
      <circle cx="0" cy="0" r="250" fill="none" stroke="#C9A96E" stroke-width="1" opacity="0.3" stroke-dasharray="10 20" />
      <circle cx="0" cy="0" r="180" fill="none" stroke="#7A8A9E" stroke-width="0.5" opacity="0.2" />
      
      <!-- The Found Gap / Target Base forming inside the lens -->
      <path d="M-100,50 L0,-50 L100,0 L50,100 Z" fill="none" stroke="#F5D796" stroke-width="2" class="disc-line" />
      <path d="M-100,50 L0,-50 L100,0 L50,100 Z" fill="#C9A96E" opacity="0.1" />
      
      <circle cx="-100" cy="50" r="4" fill="#F5D796" class="disc-node" style="animation-delay: 0s;" />
      <circle cx="0" cy="-50" r="4" fill="#F5D796" class="disc-node" style="animation-delay: 1s;" />
      <circle cx="100" cy="0" r="4" fill="#F5D796" class="disc-node" style="animation-delay: 2s;" />
      <circle cx="50" cy="100" r="4" fill="#F5D796" class="disc-node" style="animation-delay: 3s;" />

      <!-- Center target lock -->
      <circle cx="12" cy="25" r="12" fill="none" stroke="#F5D796" stroke-width="1.5" />
      <circle cx="12" cy="25" r="3" fill="#F5D796" />
      <path d="M2,25 L-8,25 M22,25 L32,25 M12,15 L12,5 M12,35 L12,45" stroke="#F5D796" stroke-width="1.5" />
    </g>
  </g>
</svg>
`;

export const processStrategySvg = `
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <style>
    .strat-draw { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: stratDraw 6s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate; }
    .strat-draw-delayed { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: stratDraw 6s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate; animation-delay: 1.5s; }
    .strat-node { opacity: 0; animation: nodeAppear 6s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate; }
    
    @keyframes stratDraw { 0%, 20% { stroke-dashoffset: 1000; } 80%, 100% { stroke-dashoffset: 0; } }
    @keyframes nodeAppear { 0%, 50% { opacity: 0; transform: scale(0.5); } 80%, 100% { opacity: 1; transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { .strat-draw, .strat-draw-delayed { animation: none !important; stroke-dashoffset: 0; } .strat-node { animation: none !important; opacity: 1; } }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 400) scale(1.2)">
    <!-- Base gap shape from Discovery (now stabilized) -->
    <path d="M-100,50 L0,-50 L100,0 L50,100 Z" fill="none" stroke="#7A8A9E" stroke-width="1.5" opacity="0.4" />
    <path d="M-100,50 L100,0 M0,-50 L50,100" fill="none" stroke="#3D4A5C" stroke-width="1" stroke-dasharray="4 4" opacity="0.5" />
    
    <!-- Blueprint projecting upwards from the base -->
    <g stroke-linecap="round" stroke-linejoin="round">
      <!-- Vertical pillars -->
      <path d="M50,100 L50,-100" fill="none" stroke="#C9A96E" stroke-width="2" class="strat-draw" />
      <path d="M-100,50 L-100,-150" fill="none" stroke="#C9A96E" stroke-width="2" class="strat-draw" />
      <path d="M100,0 L100,-200" fill="none" stroke="#C9A96E" stroke-width="2" class="strat-draw" />
      <path d="M0,-50 L0,-250" fill="none" stroke="#C9A96E" stroke-width="1" class="strat-draw" opacity="0.5" />

      <!-- Top platform connecting them forming the solid roadmap -->
      <path d="M50,-100 L-100,-150 L0,-250 L100,-200 Z" fill="none" stroke="#F5D796" stroke-width="2.5" class="strat-draw-delayed" />
      
      <!-- Isometric Cross bracing for structural integrity -->
      <path d="M-100,-150 L100,-200" fill="none" stroke="#B89354" stroke-width="1.5" class="strat-draw-delayed" stroke-dasharray="6 6" />
      <path d="M0,-250 L50,-100" fill="none" stroke="#B89354" stroke-width="1.5" class="strat-draw-delayed" stroke-dasharray="6 6" />
    </g>

    <!-- Nodes locking in at the top -->
    <circle cx="-100" cy="-150" r="5" fill="#F5D796" class="strat-node" style="animation-delay: 1.5s;" />
    <circle cx="0" cy="-250" r="5" fill="#F5D796" class="strat-node" style="animation-delay: 1.7s;" />
    <circle cx="100" cy="-200" r="5" fill="#F5D796" class="strat-node" style="animation-delay: 1.9s;" />
    <circle cx="50" cy="-100" r="5" fill="#F5D796" class="strat-node" style="animation-delay: 2.1s;" />
  </g>
</svg>
`;

export const processExecutionSvg = `
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="execGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0.8" />
    </linearGradient>
    <linearGradient id="execGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#B89354" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0.8" />
    </linearGradient>
    <linearGradient id="execGradTop" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#F5D796" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0.2" />
    </linearGradient>
  </defs>

  <style>
    .exec-flow { stroke-dasharray: 40 80; stroke-dashoffset: 120; animation: execFlowAnim 1.5s linear infinite; }
    .exec-flow-reverse { stroke-dasharray: 40 80; stroke-dashoffset: 0; animation: execFlowAnimReverse 2s linear infinite; }
    .exec-pulse { animation: execCorePulse 2s ease-in-out infinite alternate; }
    
    @keyframes execFlowAnim { 100% { stroke-dashoffset: 0; } }
    @keyframes execFlowAnimReverse { 100% { stroke-dashoffset: 120; } }
    @keyframes execCorePulse { 0% { opacity: 0.7; } 100% { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .exec-flow, .exec-flow-reverse, .exec-pulse { animation: none !important; } }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 400) scale(1.2)">
    <!-- Back faces (dimmer/darker) of the solidified structure -->
    <path d="M-100,50 L0,-50 L0,-250 L-100,-150 Z" fill="#0C0F12" stroke="#3D4A5C" stroke-width="1" opacity="0.5" />
    <path d="M0,-50 L100,0 L100,-200 L0,-250 Z" fill="#0C0F12" stroke="#3D4A5C" stroke-width="1" opacity="0.5" />

    <!-- Solidified Structure Faces -->
    <!-- Left face -->
    <path d="M50,100 L-100,50 L-100,-150 L50,-100 Z" fill="url(#execGradLeft)" stroke="#C9A96E" stroke-width="1.5" />
    <!-- Right face -->
    <path d="M50,100 L100,0 L100,-200 L50,-100 Z" fill="url(#execGradRight)" stroke="#B89354" stroke-width="1.5" />
    <!-- Top face -->
    <path d="M50,-100 L-100,-150 L0,-250 L100,-200 Z" fill="url(#execGradTop)" stroke="#F5D796" stroke-width="2" class="exec-pulse" />

    <!-- Internal wireframe details -->
    <path d="M50,100 L0,-50 M-100,50 L100,0" fill="none" stroke="#C9A96E" stroke-width="1" opacity="0.3" stroke-dasharray="4 4" />

    <!-- High-speed data execution tracks along the edges -->
    <path d="M-100,50 L-100,-150 L50,-100 L100,-200 L100,0" fill="none" stroke="#F5D796" stroke-width="3" class="exec-flow" />
    <path d="M-100,-150 L0,-250 L100,-200" fill="none" stroke="#C9A96E" stroke-width="2" class="exec-flow-reverse" />
    
    <!-- Central execution core running up the front pillar -->
    <path d="M50,100 L50,-100" fill="none" stroke="#ffffff" stroke-width="4" class="exec-flow" style="animation-duration: 1s; stroke-dasharray: 20 60;" />

    <circle cx="50" cy="-100" r="8" fill="#F5D796" class="exec-pulse" />
    <circle cx="-100" cy="-150" r="5" fill="#F5D796" />
    <circle cx="100" cy="-200" r="5" fill="#F5D796" />
  </g>
</svg>
`;

export const processDeliverySvg = `
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="delTrail1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F5D796" stop-opacity="1" />
      <stop offset="100%" stop-color="#C9A96E" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="delTrail2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="1" />
      <stop offset="100%" stop-color="#B89354" stop-opacity="0" />
    </linearGradient>
    <radialGradient id="delCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F5D796" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0" />
    </radialGradient>
  </defs>

  <style>
    .del-flow { stroke-dasharray: 600 1200; animation: delFlowAnim 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
    .del-flow-2 { stroke-dasharray: 400 1200; animation: delFlowAnim 4s cubic-bezier(0.4, 0, 0.2, 1) infinite; animation-delay: 1s; }
    .del-pulse { animation: delCorePulse 2s ease-in-out infinite alternate; }
    
    @keyframes delFlowAnim { 0% { stroke-dashoffset: 1800; } 100% { stroke-dashoffset: 0; } }
    @keyframes delCorePulse { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.1); opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .del-flow, .del-flow-2, .del-pulse { animation: none !important; } }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(250, 600)">
    
    <!-- The Launchpad (Miniature of the Execution structure, now glowing and active) -->
    <g class="del-pulse" transform="translate(0, 50)">
      <!-- Left face -->
      <path d="M50,100 L-100,50 L-100,-150 L50,-100 Z" fill="#C9A96E" opacity="0.2" stroke="#B89354" stroke-width="1" />
      <!-- Right face -->
      <path d="M50,100 L100,0 L100,-200 L50,-100 Z" fill="#C9A96E" opacity="0.1" stroke="#B89354" stroke-width="1" />
      <!-- Top face -->
      <path d="M50,-100 L-100,-150 L0,-250 L100,-200 Z" fill="#F5D796" opacity="0.3" stroke="#F5D796" stroke-width="2" />
    </g>

    <!-- Launch Core -->
    <circle cx="0" cy="-100" r="200" fill="url(#delCore)" />
    <circle cx="0" cy="-100" r="12" fill="#F5D796" class="del-pulse" />
    <circle cx="0" cy="-100" r="30" fill="none" stroke="#F5D796" stroke-width="2" opacity="0.5" class="del-pulse" style="animation-delay: -1s;" />

    <!-- Massive Compounding Curves sweeping Up and Right -->
    <!-- Curve 1 -->
    <path d="M0,-100 C 300,-100, 400,-250, 800,-600" fill="none" stroke="#3D4A5C" stroke-width="2" opacity="0.4" />
    <path d="M0,-100 C 300,-100, 400,-250, 800,-600" fill="none" stroke="url(#delTrail1)" stroke-width="8" stroke-linecap="round" class="del-flow" />
    
    <!-- Curve 2 -->
    <path d="M0,-100 C 200,-200, 300,-400, 600,-700" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.4" />
    <path d="M0,-100 C 200,-200, 300,-400, 600,-700" fill="none" stroke="url(#delTrail2)" stroke-width="4" stroke-linecap="round" class="del-flow-2" />

    <!-- Curve 3 -->
    <path d="M0,-100 C 400,-50, 600,-150, 1000,-400" fill="none" stroke="#3D4A5C" stroke-width="1" opacity="0.4" />
    <path d="M0,-100 C 400,-50, 600,-150, 1000,-400" fill="none" stroke="#C9A96E" stroke-width="5" stroke-linecap="round" class="del-flow" style="animation-duration: 3.5s; animation-delay: 0.5s;" />

  </g>
</svg>
`;
