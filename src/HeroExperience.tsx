import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";
import { Room } from "./Room";

function HeroLights({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  return (
    <>
      <ambientLight intensity={isDark ? 0.6 : 1.5} color={isDark ? "#1a1a40" : "#ffffff"} />
      <spotLight
        position={[2, 8, 6]}
        angle={0.25}
        penumbra={0.4}
        intensity={isDark ? 80 : 120}
        color={isDark ? "#ffffff" : "#fff7ed"}
      />
      <spotLight
        position={[4, 7, 4]}
        angle={0.35}
        penumbra={0.5}
        intensity={isDark ? 60 : 80}
        color="#4cc9f0"
      />
      <spotLight
        position={[-4, 7, 5]}
        angle={0.4}
        penumbra={0.8}
        intensity={isDark ? 80 : 100}
        color="#9d4edd"
      />
      <pointLight position={[0, 2, 0]} intensity={isDark ? 20 : 30} color="#00f2fe" />
      <pointLight position={[1, 3, -2]} intensity={isDark ? 15 : 20} color="#7209b7" />
    </>
  );
}

function FloatingRoom() {
  const roomRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const isSmallScreen = viewport.width < 8;
  const isVerySmall = viewport.width < 5.5;

  const scale = isVerySmall ? 0.65 : isSmallScreen ? 0.8 : 1.1;
  const posY = isSmallScreen ? -2.4 : -3.2;

  useFrame((state) => {
    if (roomRef.current) {
      roomRef.current.rotation.y = -Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });

  return (
    <group ref={roomRef} scale={scale} position={[0, posY, 0]} rotation={[0, -Math.PI / 4, 0]}>
      <Room />
    </group>
  );
}

export function HeroExperience({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <Canvas 
      camera={{ position: [0, 1, 14], fov: 42 }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
    >
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
      />
      <Suspense fallback={null}>
        <HeroLights theme={theme} />
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
          <FloatingRoom />
        </Float>
      </Suspense>
    </Canvas>
  );
}
