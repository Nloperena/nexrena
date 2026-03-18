export type ConceptType = 'flow' | 'mesh' | 'orbit';

export interface ConceptConfig {
  type: ConceptType;
  primaryColor: string;
  glowOpacity: number;
  glowRadius: number;
  glowX: number;
  glowY: number;
  speedMultiplier: number;
  nodes: number;
  lines: number;
  dashPattern: string;
  scale: number;
}

/**
 * Very simple string hashing for stable generation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit int
  }
  return Math.abs(hash);
}

/**
 * Given an integer hash, generate a pseudo-random float between 0 and 1
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate a consistent SVG concept configuration based on the route pathname
 */
export function getConceptConfigForRoute(pathname: string): ConceptConfig {
  // Normalize pathname (remove trailing slashes, clean up)
  const cleanPath = pathname.toLowerCase().trim().replace(/\/+$/, '') || '/';
  
  const seed = hashString(cleanPath);
  
  const types: ConceptType[] = ['flow', 'mesh', 'orbit'];
  // First seeded random picks the layout type
  const typeIndex = Math.floor(seededRandom(seed) * types.length);
  const type = types[typeIndex];

  // Colors: stick closely to brand, maybe slight variations in opacity/tone
  // Gold: #b89354 (dark), #c9a96e (base), #f5d796 (light)
  const colors = ['#b89354', '#c9a96e', '#f5d796'];
  const primaryColor = colors[Math.floor(seededRandom(seed + 1) * colors.length)];

  return {
    type,
    primaryColor,
    glowOpacity: 0.15 + (seededRandom(seed + 2) * 0.2),       // 0.15 to 0.35
    glowRadius: 100 + (seededRandom(seed + 3) * 150),         // 100 to 250
    glowX: 200 + (seededRandom(seed + 4) * 800),              // 200 to 1000
    glowY: 150 + (seededRandom(seed + 5) * 350),              // 150 to 500
    speedMultiplier: 0.7 + (seededRandom(seed + 6) * 0.8),    // 0.7 to 1.5
    nodes: 2 + Math.floor(seededRandom(seed + 7) * 4),        // 2 to 5
    lines: 3 + Math.floor(seededRandom(seed + 8) * 5),        // 3 to 7
    dashPattern: `${8 + Math.floor(seededRandom(seed + 9) * 10)} ${10 + Math.floor(seededRandom(seed + 10) * 15)}`,
    scale: 0.8 + (seededRandom(seed + 11) * 0.5),             // 0.8 to 1.3
  };
}
