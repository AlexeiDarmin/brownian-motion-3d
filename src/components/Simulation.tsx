import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  InstancedMesh,
  Mesh,
  Object3D,
  SphereGeometry,
  MeshStandardMaterial,
} from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { createSimulation } from "../simulation/particle";
import { updateSimulation } from "../simulation/physics";
import { CONFIG } from "../simulation/config";

const _dummy = new Object3D();

interface SimulationProps {
  count?: number;
  smallSpeed?: number;
}

export function Simulation({
  count = CONFIG.SMALL_PARTICLE_COUNT,
  smallSpeed = CONFIG.SMALL_SPEED,
}: SimulationProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const largeMeshRef = useRef<Mesh>(null);
  const trailRef = useRef<number[]>([]);

  const sim = useMemo(() => {
    trailRef.current = [];
    return createSimulation(count);
  }, [count]);

  // Keep small particle speeds in sync with the control
  const prevSpeedRef = useRef(smallSpeed);
  if (prevSpeedRef.current !== smallSpeed) {
    const ratio = smallSpeed / prevSpeedRef.current;
    for (const p of sim.small) {
      p.velocity.multiplyScalar(ratio);
    }
    prevSpeedRef.current = smallSpeed;
  }

  const smallGeo = useMemo(
    () => new SphereGeometry(CONFIG.SMALL_RADIUS, 8, 6),
    []
  );
  const smallMat = useMemo(
    () => new MeshStandardMaterial({ color: "#4fc3f7" }),
    []
  );

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    const dt = Math.min(delta, 0.05);

    updateSimulation(sim, dt);

    // Update small particle instance matrices
    for (let i = 0; i < sim.small.length; i++) {
      const p = sim.small[i];
      _dummy.position.set(p.position.x, p.position.y, p.position.z);
      _dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Update large particle mesh
    if (largeMeshRef.current) {
      largeMeshRef.current.position.set(
        sim.large.position.x,
        sim.large.position.y,
        sim.large.position.z
      );
    }

    // Record trail
    const trail = trailRef.current;
    const lp = sim.large.position;
    trail.push(lp.x, lp.y, lp.z);
  });

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[smallGeo, smallMat, count]}
        frustumCulled={false}
      />
      <mesh ref={largeMeshRef}>
        <sphereGeometry args={[CONFIG.LARGE_RADIUS, 32, 24]} />
        <meshStandardMaterial color="#ff7043" />
      </mesh>
      <Trail trailRef={trailRef} />
    </>
  );
}

function Trail({
  trailRef,
}: {
  trailRef: React.RefObject<number[]>;
}) {
  const lineRef = useRef<Line2 | null>(null);
  const materialRef = useRef<LineMaterial>(
    new LineMaterial({
      color: 0xa855f7,
      linewidth: 3,
      worldUnits: false,
    })
  );

  useFrame(({ size }) => {
    const trail = trailRef.current;
    if (!lineRef.current || !trail || trail.length < 6) return;

    materialRef.current.resolution.set(size.width, size.height);

    const line = lineRef.current;
    const geom = new LineGeometry();
    geom.setPositions(trail);
    const old = line.geometry;
    line.geometry = geom;
    old.dispose();
    line.computeLineDistances();
  });

  const initLine = useMemo(() => {
    const geom = new LineGeometry();
    geom.setPositions([0, 0, 0, 0, 0, 0]);
    const l = new Line2(geom, materialRef.current);
    l.frustumCulled = false;
    return l;
  }, []);

  return <primitive object={initLine} ref={lineRef} />;
}
