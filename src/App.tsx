import { useControls, Leva } from "leva";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Simulation } from "./components/Simulation";
import { BoundaryBox } from "./components/BoundaryBox";
import { CONFIG } from "./simulation/config";
import "./App.css";

function App() {
  const { count, smallSpeed, langevin } = useControls({
    count: {
      value: CONFIG.SMALL_PARTICLE_COUNT,
      min: 10,
      max: 2000,
      step: 10,
    },
    smallSpeed: { value: CONFIG.SMALL_SPEED, min: 1, max: 30, step: 0.5 },
    langevin: { value: false, label: "Langevin Equation" },
  });

  return (
    <>
      <Leva titleBar={{ title: "Controls" }} theme={{ sizes: { controlWidth: "150px", rootWidth: "340px" } }} />      <header id="header">
        <h1>3D Brownian Motion</h1>
        <p>
          Small particles collide with a larger particle in three dimensions,
          causing the jittering random walk known as Brownian motion. An
          emergent effect of elastic collisions.
        </p>
        <p>
          The Langevin equation mode applies random forces and drag directly
          to the large particle, reproducing Brownian motion without
          simulating the small particles.
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
          <Simulation key={`${count}-${langevin}`} count={count} smallSpeed={smallSpeed} langevin={langevin} />
          <BoundaryBox />
          <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>
    </>
  );
}

export default App;
