export interface CandleCoordinates {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  hasMoved: boolean;
  blackoutRequested: boolean;
}

export const candleCoords: CandleCoordinates = {
  x: typeof window !== 'undefined' ? window.innerWidth * 0.5 : 600,
  y: typeof window !== 'undefined' ? window.innerHeight * 0.42 : 380,
  targetX: typeof window !== 'undefined' ? window.innerWidth * 0.5 : 600,
  targetY: typeof window !== 'undefined' ? window.innerHeight * 0.42 : 380,
  vx: 0,
  vy: 0,
  hasMoved: false,
  blackoutRequested: false,
};

export function requestBlackout(): void {
  candleCoords.blackoutRequested = true;
}
