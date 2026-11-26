// Plain numeric state tweened by GSAP ScrollTrigger in Experience.tsx.
// Kept separate from PourScene.ts so the main bundle never imports Three.js eagerly.

export interface PourState {
  tilt: number // bottle Z rotation (rad)
  roll: number // bottle axial rotation keeping label legible (rad)
  px: number // bottle pivot X (meters)
  py: number // bottle pivot Y (meters)
  streamHead: number // 0..1 leading tip of the wine stream
  streamTail: number // 0..1 trailing end leaving the bottle lip
  fill: number // 0..1 wine level inside the crystal bowl
  swirl: number // 0..1 surface swirl / ripple intensity
  camX: number
  camY: number
  camZ: number
  lookX: number
  lookY: number
  glow: number // rim + candle warmth multiplier
}

export type WineKind = 'red' | 'rose' | 'white'

/** Shared pour pose coordinates so GSAP timeline & 3D Bezier stream stay locked to 0.1mm. */
export const POUR_POSE = {
  px: 0.074,
  py: 0.296,
  tilt: 1.74,
  roll: 0.08,
} as const

export const createPourState = (): PourState => ({
  tilt: 0,
  roll: -0.14,
  px: 0.126,
  py: 0.18,
  streamHead: 0,
  streamTail: 0,
  fill: 0.02,
  swirl: 0,
  camX: 0.044,
  camY: 0.232,
  camZ: 0.86,
  lookX: 0.032,
  lookY: 0.148,
  glow: 0.6,
})
