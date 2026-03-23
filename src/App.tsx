import { useControls } from "leva";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Simulation } from "./components/Simulation";
import { BoundaryBox } from "./components/BoundaryBox";
import { CONFIG } from "./simulation/config";
import "./App.css";

function App() {
  const { count, smallSpeed } = useControls({
    count: {
      value: CONFIG.SMALL_PARTICLE_COUNT,
      min: 10,
      max: 2000,
      step: 10,
    },
    smallSpeed: { value: CONFIG.SMALL_SPEED, min: 1, max: 30, step: 0.5 },
  });

  return (
    <>
      <header id="header">
        <h1>3D Brownian Motion</h1>
        <p>
          Small particles collide with a larger particle in three dimensions,
          causing the jittering random walk known as Brownian motion. An
          emergent effect of elastic collisions.
        </p>
      </header>
      <div id="canvas-container">
        <Canvas
          camera={{
            position: [30, 22, 30],
            fov: 50,
            near: 0.1,
            far: 200,
          }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[20, 30, 20]} intensity={1} />
          <pointLight position={[-15, -10, -15]} intensity={0.3} />
          <Simulation key={count} count={count} smallSpeed={smallSpeed} />
          <BoundaryBox />
          <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>
    </>
  );
}

export default App;
