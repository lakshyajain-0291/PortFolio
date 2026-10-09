/**
 * Mutable bridge between the DOM (GSAP ScrollTrigger, pointer, hover) and the
 * WebGL scene. Written by DOM code, read every frame inside useFrame — no React
 * re-renders involved.
 */
export const sceneState = {
  /** 0–1 progress through the whole page */
  scroll: 0,
  /** 0–1 how centred the GitHub stats section is in the viewport */
  focus: 0,
  /** Normalised pointer, -1…1 on both axes */
  pointer: { x: 0, y: 0 },
  /** Repository name highlighted from the DOM legend */
  highlighted: null as string | null,
  /** Hidden easter-egg state */
  overdrive: false,
};
