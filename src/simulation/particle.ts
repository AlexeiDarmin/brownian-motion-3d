import { Vector3 } from "three";
import { CONFIG } from "./config";

export interface Particle {
  position: Vector3;
  velocity: Vector3;
  radius: number;
  mass: number;
}

export interface Simulation {
  small: Particle[];
  large: Particle;
}

export function createSmallParticle(): Particle {
  const { BOUNDS, SMALL_RADIUS, SMALL_MASS, SMALL_SPEED, LARGE_RADIUS } =
    CONFIG;
  const half = BOUNDS / 2;

  // Place randomly but avoid overlapping the large particle at the center
  let position: Vector3;
  do {
    position = new Vector3(
      (Math.random() - 0.5) * (BOUNDS - SMALL_RADIUS * 2),
      (Math.random() - 0.5) * (BOUNDS - SMALL_RADIUS * 2),
      (Math.random() - 0.5) * (BOUNDS - SMALL_RADIUS * 2)
    );
  } while (position.length() < LARGE_RADIUS + SMALL_RADIUS + 0.5);

  // Clamp inside bounds
  position.clamp(
    new Vector3(-half + SMALL_RADIUS, -half + SMALL_RADIUS, -half + SMALL_RADIUS),
    new Vector3(half - SMALL_RADIUS, half - SMALL_RADIUS, half - SMALL_RADIUS)
  );

  // Random direction on a sphere (uniform)
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const velocity = new Vector3(
    Math.sin(phi) * Math.cos(theta) * SMALL_SPEED,
    Math.sin(phi) * Math.sin(theta) * SMALL_SPEED,
    Math.cos(phi) * SMALL_SPEED
  );

  return { position, velocity, radius: SMALL_RADIUS, mass: SMALL_MASS };
}

export function createLargeParticle(): Particle {
  return {
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
    radius: CONFIG.LARGE_RADIUS,
    mass: CONFIG.LARGE_MASS,
  };
}

export function createSimulation(count: number): Simulation {
  return {
    small: Array.from({ length: count }, () => createSmallParticle()),
    large: createLargeParticle(),
  };
}
