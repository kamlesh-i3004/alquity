import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NodeProps {
  position: [number, number, number];
  color: string;
}

function Node({ position, color }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function ConnectionLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Line>(null);
  
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);
  
  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 }))} ref={ref} />
  );
}

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  
  const nodes = useMemo(() => {
    const nodeArray: [number, number, number][] = [];
    for (let i = 0; i < 50; i++) {
      nodeArray.push([
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ]);
    }
    return nodeArray;
  }, []);

  const connections = useMemo(() => {
    const connArray: { start: [number, number, number]; end: [number, number, number] }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i][0] - nodes[j][0], 2) +
          Math.pow(nodes[i][1] - nodes[j][1], 2) +
          Math.pow(nodes[i][2] - nodes[j][2], 2)
        );
        if (dist < 3) {
          connArray.push({ start: nodes[i], end: nodes[j] });
        }
      }
    }
    return connArray;
  }, [nodes]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.02;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((position, i) => (
        <Node key={i} position={position} color="#6E56F8" />
      ))}
      {connections.map((conn, i) => (
        <ConnectionLine key={i} start={conn.start} end={conn.end} color="#6E56F8" />
      ))}
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const geometry = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.03} color="#C084FC" transparent opacity={0.6} />
    </points>
  );
}

export default function NeuralBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <NeuralNetwork />
        <ParticleField />
      </Canvas>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black pointer-events-none" />
      
      {/* Subtle Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(110, 86, 248, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(110, 86, 248, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}
