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
  <defs>
    <radialGradient id="stratGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0" />
    </radialGradient>
  </defs>

  <style>
    .strat-path { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: stratPathDraw 4s cubic-bezier(0.4, 0, 0.2, 1) forwards infinite alternate; }
    .strat-node { opacity: 0; transform: scale(0.5); animation: stratNodeLock 4s cubic-bezier(0.4, 0, 0.2, 1) forwards infinite alternate; }
    .strat-ring { animation: stratRingSpin 20s linear infinite; transform-origin: 0 0; }
    
    @keyframes stratPathDraw { 0%, 20% { stroke-dashoffset: 1000; } 80%, 100% { stroke-dashoffset: 0; } }
    @keyframes stratNodeLock { 0%, 50% { opacity: 0; transform: scale(0.5); } 80%, 100% { opacity: 1; transform: scale(1); } }
    @keyframes stratRingSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { 
      .strat-path { animation: none !important; stroke-dashoffset: 0; } 
      .strat-node { animation: none !important; opacity: 1; transform: scale(1); }
      .strat-ring { animation: none !important; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 400)">
    <circle cx="0" cy="0" r="350" fill="url(#stratGlow)" />
    
    <!-- Background Radar / Topography Grid -->
    <g opacity="0.15" fill="none" stroke="#3D4A5C" stroke-width="1">
      <circle cx="0" cy="0" r="100" />
      <circle cx="0" cy="0" r="200" />
      <circle cx="0" cy="0" r="300" />
      <path d="M-400 0 L400 0 M0 -400 L0 400" stroke-dasharray="5 5" />
    </g>

    <!-- Faded "rejected" paths (the noise we cut through) -->
    <g fill="none" stroke="#3D4A5C" stroke-width="2" stroke-dasharray="6 6" opacity="0.3">
      <path d="M-300 100 L-150 150 L50 200 L300 -100" />
      <path d="M-300 100 L-50 -150 L100 -50 L250 -200" />
      <path d="M-300 100 L-200 0 L0 -100 L150 -50 L300 -100" />
    </g>

    <!-- The Chosen Roadmap (Solid, direct, golden) -->
    <path d="M-300 100 L-100 -50 L100 50 L300 -100" fill="none" stroke="#C9A96E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="strat-path" />

    <!-- Milestones (Scope Locked) -->
    <g transform="translate(-300, 100)" class="strat-node" style="animation-delay: 0s">
      <circle cx="0" cy="0" r="8" fill="#0C0F12" stroke="#7A8A9E" stroke-width="2" />
    </g>

    <g transform="translate(-100, -50)" class="strat-node" style="animation-delay: 1s">
      <circle cx="0" cy="0" r="12" fill="#0C0F12" stroke="#F5D796" stroke-width="2" />
      <circle cx="0" cy="0" r="4" fill="#F5D796" />
      <!-- Target Lock bracket -->
      <path d="M-20 -10 L-20 -20 L-10 -20 M20 -10 L20 -20 L10 -20 M-20 10 L-20 20 L-10 20 M20 10 L20 20 L10 20" fill="none" stroke="#F5D796" stroke-width="1.5" />
    </g>

    <g transform="translate(100, 50)" class="strat-node" style="animation-delay: 2s">
      <circle cx="0" cy="0" r="12" fill="#0C0F12" stroke="#F5D796" stroke-width="2" />
      <circle cx="0" cy="0" r="4" fill="#F5D796" />
      <!-- Target Lock bracket -->
      <path d="M-20 -10 L-20 -20 L-10 -20 M20 -10 L20 -20 L10 -20 M-20 10 L-20 20 L-10 20 M20 10 L20 20 L10 20" fill="none" stroke="#F5D796" stroke-width="1.5" />
    </g>

    <g transform="translate(300, -100)" class="strat-node" style="animation-delay: 3s">
      <circle cx="0" cy="0" r="16" fill="#0C0F12" stroke="#C9A96E" stroke-width="3" />
      <circle cx="0" cy="0" r="6" fill="#F5D796" />
      <g class="strat-ring">
        <circle cx="0" cy="0" r="28" fill="none" stroke="#F5D796" stroke-width="1.5" stroke-dasharray="10 20 30 10" />
      </g>
    </g>
  </g>
</svg>
`;

export const processExecutionSvg = `
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="execGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C9A96E" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0C0F12" stop-opacity="0" />
    </radialGradient>
  </defs>

  <style>
    .exec-sprint-loop { stroke-dasharray: 1800; animation: sprintLoopAnim 4s linear infinite; }
    .exec-block { opacity: 0; animation: blockBuildAnim 4s step-end infinite; }
    .exec-pulse { animation: corePulse 2s ease-in-out infinite alternate; }
    
    @keyframes sprintLoopAnim { 0% { stroke-dashoffset: 1800; } 100% { stroke-dashoffset: 0; } }
    @keyframes blockBuildAnim {
      0% { opacity: 0; transform: translateY(-20px); }
      5% { opacity: 1; transform: translateY(0); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes corePulse { 0% { fill-opacity: 0.2; } 100% { fill-opacity: 0.6; } }
    
    @media (prefers-reduced-motion: reduce) { 
      .exec-sprint-loop { animation: none !important; stroke-dashoffset: 0; } 
      .exec-block { animation: none !important; opacity: 1; transform: translateY(0); }
      .exec-pulse { animation: none !important; fill-opacity: 0.6; }
    }
  </style>

  <rect width="100%" height="100%" fill="#0C0F12" />
  
  <g transform="translate(600, 400)">
    <circle cx="0" cy="0" r="300" fill="url(#execGlow)" />

    <!-- Open Transparent Grid (Iterate in the open) -->
    <g transform="scale(1.5) rotateX(60deg) rotateZ(45deg)">
      <!-- Base Canvas Grid -->
      <g stroke="#3D4A5C" stroke-width="1" opacity="0.3">
        <path d="M-150,-150 L150,-150 M-150,-50 L150,-50 M-150,50 L150,50 M-150,150 L150,150" />
        <path d="M-150,-150 L-150,150 M-50,-150 L-50,150 M50,-150 L50,150 M150,-150 L150,150" />
      </g>
      
      <!-- Sprint Cycle Track surrounding the build -->
      <circle cx="0" cy="0" r="180" fill="none" stroke="#7A8A9E" stroke-width="2" opacity="0.3" />
      <circle cx="0" cy="0" r="180" fill="none" stroke="#F5D796" stroke-width="4" stroke-linecap="round" class="exec-sprint-loop" style="stroke-dasharray: 200 930;" />

      <!-- Modular Build sequence (Weekly progress visible) -->
      <!-- Week 1 Block -->
      <g class="exec-block" style="animation-delay: 0s;">
        <rect x="-50" y="-50" width="100" height="100" fill="#3D4A5C" fill-opacity="0.4" stroke="#7A8A9E" stroke-width="1.5" />
      </g>
      
      <!-- Week 2 Block (Stacked) -->
      <g class="exec-block" style="animation-delay: 1s;" transform="translate(0, 0) scale(0.8)">
        <rect x="-50" y="-50" width="100" height="100" fill="#B89354" fill-opacity="0.6" stroke="#C9A96E" stroke-width="2" />
      </g>
      
      <!-- Week 3 Block (Core) -->
      <g class="exec-block" style="animation-delay: 2s;" transform="translate(0, 0) scale(0.5)">
        <rect x="-50" y="-50" width="100" height="100" fill="#F5D796" stroke="#F5D796" stroke-width="3" class="exec-pulse" />
      </g>
      
      <!-- Connecting nodes -->
      <circle cx="-150" cy="0" r="4" fill="#C9A96E" opacity="0.5" />
      <circle cx="150" cy="0" r="4" fill="#C9A96E" opacity="0.5" />
      <circle cx="0" cy="-150" r="4" fill="#C9A96E" opacity="0.5" />
      <circle cx="0" cy="150" r="4" fill="#C9A96E" opacity="0.5" />
    </g>

    <!-- UI Overlays showing "Openness" -->
    <g transform="translate(-300, -200)" opacity="0.7">
      <rect x="0" y="0" width="120" height="40" rx="4" fill="#1E2530" stroke="#3D4A5C" stroke-width="1" />
      <circle cx="20" cy="20" r="6" fill="#F5D796" class="exec-pulse" />
      <rect x="40" y="18" width="60" height="4" rx="2" fill="#7A8A9E" />
    </g>
    
    <g transform="translate(200, 150)" opacity="0.7">
      <rect x="0" y="0" width="100" height="40" rx="4" fill="#1E2530" stroke="#3D4A5C" stroke-width="1" />
      <circle cx="20" cy="20" r="6" fill="#C9A96E" class="exec-pulse" style="animation-delay: -1s;" />
      <rect x="40" y="18" width="40" height="4" rx="2" fill="#7A8A9E" />
    </g>

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
