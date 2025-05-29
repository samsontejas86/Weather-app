import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

const Satellite = ({ radius, speed, offset }: { radius: number; speed: number; offset: number }) => {
  const satelliteRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (satelliteRef.current) {
      const time = clock.getElapsedTime() * speed + offset;
      satelliteRef.current.position.x = Math.cos(time) * radius;
      satelliteRef.current.position.z = Math.sin(time) * radius;
      satelliteRef.current.position.y = Math.sin(time * 0.5) * (radius * 0.2);
    }
  });

  return (
    <mesh ref={satelliteRef}>
      <boxGeometry args={[0.1, 0.1, 0.3]} />
      <meshStandardMaterial color="#88ccff" />
    </mesh>
  );
};

export const Globe = () => {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={new THREE.TextureLoader().load('/earth-texture.jpg')}
          bumpMap={new THREE.TextureLoader().load('/earth-bump.jpg')}
          bumpScale={0.15}
          specularMap={new THREE.TextureLoader().load('/earth-specular.jpg')}
          specular={new THREE.Color('#909090')}
          shininess={10}
        />
      </mesh>

      <Satellite radius={3.5} speed={0.5} offset={0} />
      <Satellite radius={3.8} speed={0.3} offset={2} />
      <Satellite radius={4.2} speed={0.2} offset={4} />

      <ambientLight intensity={0.1} />
      <pointLight position={[100, 10, 10]} intensity={0.8} />
    </>
  );
}; 