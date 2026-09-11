import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Icosahedron, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

const AICore = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const orbitRigRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.15;
      coreRef.current.rotation.y += delta * 0.25;
      const pulse = 0.5 + Math.sin(t * 1.2) * 0.15;
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = 0.35 + pulse * 0.5;
      }
    }

    if (shellRef.current) {
      shellRef.current.rotation.x -= delta * 0.08;
      shellRef.current.rotation.y -= delta * 0.18;
      shellRef.current.rotation.z += delta * 0.06;
      const shellScale = 1 + Math.sin(t * 0.8) * 0.03;
      shellRef.current.scale.setScalar(shellScale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.3;
      const ringPulse = 1 + Math.sin(t * 1.6) * 0.02;
      ringRef.current.scale.setScalar(ringPulse);
    }

    if (orbitRigRef.current) {
      orbitRigRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={orbitRigRef}>
      <group>
        <Sphere ref={coreRef} args={[1, 96, 96]}>
          <meshStandardMaterial
            color="#6366f1"
            emissive="#4f46e5"
            emissiveIntensity={0.6}
            roughness={0.15}
            metalness={0.9}
            envMapIntensity={1.2}
          />
        </Sphere>

        <Icosahedron ref={shellRef} args={[1.45, 1]}>
          <meshBasicMaterial
            color="#a78bfa"
            wireframe
            transparent
            opacity={0.55}
          />
        </Icosahedron>

        <Torus ref={ringRef} args={[1.9, 0.015, 16, 256]} rotation={[Math.PI / 2.2, 0, 0]}>
          <meshBasicMaterial color="#818cf8" transparent opacity={0.85} />
        </Torus>

        <Torus args={[2.15, 0.008, 12, 256]} rotation={[Math.PI / 1.8, Math.PI / 6, 0]}>
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0.5} />
        </Torus>

        <OrbitingCluster index={0} color="#a855f7" emissiveColor="#7c3aed" />
        <OrbitingCluster index={1} color="#3b82f6" emissiveColor="#2563eb" />
        <OrbitingCluster index={2} color="#06b6d4" emissiveColor="#0891b2" />
      </group>
    </group>
  );
};

interface OrbitingClusterProps {
  index: number;
  color: string;
  emissiveColor: string;
}

const OrbitingCluster = ({ index, color, emissiveColor }: OrbitingClusterProps) => {
  const pivotRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);

  const { radius, inclination, speed, size, trailCount } = useMemo(() => {
    const data = [
      { radius: 2.4, inclination: 0.55, speed: 0.55, size: 0.17, trailCount: 50 },
      { radius: 2.9, inclination: -0.42, speed: 0.40, size: 0.14, trailCount: 60 },
      { radius: 3.3, inclination: 0.28, speed: 0.30, size: 0.20, trailCount: 70 },
    ];
    return data[index % data.length];
  }, [index]);

  const trailGeometry = useMemo(() => {
    const positions = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [trailCount]);

  const positionsRef = useRef<Array<[number, number, number]>>(
    Array.from({ length: trailCount }, () => [0, 0, 0])
  );

  useFrame((state, delta) => {
    if (pivotRef.current) {
      pivotRef.current.rotation.y += delta * speed;
      const t = state.clock.getElapsedTime() * speed + index * 2;

      const x = Math.cos(t) * radius;
      const z = Math.sin(t) * radius;
      const y = Math.sin(t) * Math.sin(inclination) * radius * 0.6;

      const sphere = pivotRef.current.children[0] as THREE.Object3D;
      if (sphere) {
        sphere.position.set(x, y, z);
        sphere.rotation.x += delta * 1.2;
        sphere.rotation.y += delta * 1.8;
      }

      positionsRef.current.unshift([x, y, z]);
      positionsRef.current.pop();

      if (trailRef.current) {
        const posAttr = trailRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < trailCount; i++) {
          arr[i * 3] = positionsRef.current[i][0];
          arr[i * 3 + 1] = positionsRef.current[i][1];
          arr[i * 3 + 2] = positionsRef.current[i][2];
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group rotation={[inclination, 0, 0]}>
      <group ref={pivotRef}>
        <group>
          <Sphere args={[size, 32, 32]}>
            <meshStandardMaterial
              color={color}
              emissive={emissiveColor}
              emissiveIntensity={1.1}
              roughness={0.15}
              metalness={0.85}
            />
          </Sphere>
        </group>
      </group>
      <points ref={trailRef} geometry={trailGeometry}>
        <pointsMaterial
          size={0.045}
          color={color}
          transparent
          opacity={0.75}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

const BackgroundStars = () => {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 18 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const palette = [
        new THREE.Color('#a78bfa'),
        new THREE.Color('#60a5fa'),
        new THREE.Color('#22d3ee'),
        new THREE.Color('#ffffff'),
      ];
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.008;
      ref.current.rotation.x += delta * 0.003;
    }
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial
        size={0.07}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const SceneLighting = () => {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  useFrame((state) => {
    if (keyRef.current) {
      const t = state.clock.getElapsedTime() * 0.2;
      keyRef.current.position.x = Math.cos(t) * 6;
      keyRef.current.position.z = Math.sin(t) * 6;
    }
  });
  return (
    <>
      <ambientLight intensity={0.35} color="#c7d2fe" />
      <directionalLight
        ref={keyRef}
        position={[6, 5, 6]}
        intensity={1.4}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[-5, -3, -4]} intensity={0.9} color="#a855f7" distance={20} />
      <pointLight position={[4, -4, 3]} intensity={0.7} color="#06b6d4" distance={20} />
      <pointLight position={[0, 5, 0]} intensity={0.6} color="#818cf8" distance={18} />
    </>
  );
};

const ThreeScene = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[null as any]} />
        <fog attach="fog" args={['#020617', 10, 50]} />
        <SceneLighting />
        <BackgroundStars />
        <AICore />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.35}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(2 * Math.PI) / 3}
        />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
