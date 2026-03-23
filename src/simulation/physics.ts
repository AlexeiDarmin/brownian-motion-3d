import { Vector3 } from "three";
import type { Particle, Simulation } from "./particle";
import { CONFIG } from "./config";

const _diff = new Vector3();

function resolveElasticCollision(a: Particle, b: Particle): void {
  _diff.copy(a.position).sub(b.position);
  const dist = _diff.length();
  const minDist = a.radius + b.radius;

  if (dist === 0 || dist >= minDist) return;

  // Normal vector from b to a
  const nx = _diff.x / dist;
  const ny = _diff.y / dist;
  const nz = _diff.z / dist;

  // Relative velocity of a w.r.t. b along collision normal
  const dvx = a.velocity.x - b.velocity.x;
  const dvy = a.velocity.y - b.velocity.y;
  const dvz = a.velocity.z - b.velocity.z;
  const relVelNormal = dvx * nx + dvy * ny + dvz * nz;

  // Don't resolve if particles are separating
  if (relVelNormal > 0) return;

  // Elastic collision impulse scalar
  const impulse = (2 * relVelNormal) / (a.mass + b.mass);

  a.velocity.x -= impulse * b.mass * nx;
  a.velocity.y -= impulse * b.mass * ny;
  a.velocity.z -= impulse * b.mass * nz;
  b.velocity.x += impulse * a.mass * nx;
  b.velocity.y += impulse * a.mass * ny;
  b.velocity.z += impulse * a.mass * nz;

  // Overlap correction — push apart proportional to inverse mass
  const overlap = minDist - dist;
  const totalMass = a.mass + b.mass;
  const corrA = overlap * (b.mass / totalMass);
  const corrB = overlap * (a.mass / totalMass);
  a.position.x += nx * corrA;
  a.position.y += ny * corrA;
  a.position.z += nz * corrA;
  b.position.x -= nx * corrB;
  b.position.y -= ny * corrB;
  b.position.z -= nz * corrB;
}

function wallBounce(p: Particle): void {
  const half = CONFIG.BOUNDS / 2;

  if (p.position.x - p.radius < -half) {
    p.position.x = -half + p.radius;
    p.velocity.x = Math.abs(p.velocity.x);
  } else if (p.position.x + p.radius > half) {
    p.position.x = half - p.radius;
    p.velocity.x = -Math.abs(p.velocity.x);
  }

  if (p.position.y - p.radius < -half) {
    p.position.y = -half + p.radius;
    p.velocity.y = Math.abs(p.velocity.y);
  } else if (p.position.y + p.radius > half) {
    p.position.y = half - p.radius;
    p.velocity.y = -Math.abs(p.velocity.y);
  }

  if (p.position.z - p.radius < -half) {
    p.position.z = -half + p.radius;
    p.velocity.z = Math.abs(p.velocity.z);
  } else if (p.position.z + p.radius > half) {
    p.position.z = half - p.radius;
    p.velocity.z = -Math.abs(p.velocity.z);
  }
}

export function updateSimulation(sim: Simulation, delta: number): void {
  const all = sim.small;
  const large = sim.large;

  // Move all particles
  for (const p of all) {
    p.position.x += p.velocity.x * delta;
    p.position.y += p.velocity.y * delta;
    p.position.z += p.velocity.z * delta;
  }
  large.position.x += large.velocity.x * delta;
  large.position.y += large.velocity.y * delta;
  large.position.z += large.velocity.z * delta;

  // Collisions: small vs large
  for (const p of all) {
    resolveElasticCollision(p, large);
  }

  // Collisions: small vs small
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      resolveElasticCollision(all[i], all[j]);
    }
  }

  // Wall bounces
  for (const p of all) {
    wallBounce(p);
  }
  wallBounce(large);
}
