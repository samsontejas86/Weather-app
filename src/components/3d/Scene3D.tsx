import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useWeatherStore } from '../../store/weatherStore';

function Clouds({ radius }: { radius: number }) {
  const cloudsRef = useRef<THREE.Mesh>(null);
  const cloudsTexture = useTexture('/earth-clouds.jpg');

  useFrame(({ clock }) => {
    if (cloudsRef.current) {
      // Rotate clouds slightly faster than Earth
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshPhysicalMaterial
        map={cloudsTexture}
        transparent={true}
        opacity={0.4}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Atmosphere({ radius }: { radius: number }) {
  return (
    <mesh scale={[1.1, 1.1, 1.1]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshPhongMaterial
        color="#4444ff"
        transparent={true}
        opacity={0.1}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function WeatherMarker({ lat, lon, radius }: { lat: number; lon: number; radius: number }) {
  const { currentWeather, temperatureUnit } = useWeatherStore();
  const [currentTime, setCurrentTime] = React.useState<string>('');

  // Weather icon mapping function
  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '🌨️',
      '13n': '🌨️',
      '50d': '🌫️',
      '50n': '🌫️',
    };
    return iconMap[iconCode] || '☁️';
  };

  // Update time every second
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      });
      setCurrentTime(timeString);
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert lat/lon to 3D position
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  // Get temperature based on unit
  const temp = currentWeather ? (
    temperatureUnit === 'fahrenheit'
      ? (currentWeather.current.temp * 9/5) + 32
      : currentWeather.current.temp
  ) : 0;

  return (
    <group position={[x, y, z]}>
      {/* Marker pin */}
      <mesh scale={[0.05, 0.05, 0.05]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Pulse effect */}
      <mesh scale={[0.1, 0.1, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color="#ff4444" 
          transparent={true} 
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Weather info billboard */}
      {currentWeather && (
        <Html
          position={[0, 0.2, 0]}
          center
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '10px',
            borderRadius: '8px',
            color: 'white',
            width: '200px',
            textAlign: 'center',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <div>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>
              {currentTime}
            </div>
            <div style={{ fontSize: '24px', margin: '8px 0' }}>
              {getWeatherIcon(currentWeather.current.weather[0].icon)}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {Math.round(temp)}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
              {currentWeather.current.weather[0].description}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const { selectedLocation } = useWeatherStore();
  const earthTexture = useTexture({
    map: '/earth-day.jpg',
    normalMap: '/earth-normal.jpg',
    roughnessMap: '/earth-roughness.jpg',
  });

  const radius = 2;

  // Calculate target rotation based on selected location
  useEffect(() => {
    if (earthRef.current && selectedLocation) {
      const { lat, lon } = selectedLocation;
      const targetLongitude = -lon * (Math.PI / 180); // Convert to radians and negate for correct direction
      earthRef.current.rotation.y = targetLongitude;
    }
  }, [selectedLocation]);

  useFrame(({ clock }) => {
    if (earthRef.current) {
      // Slow continuous rotation
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhysicalMaterial 
          map={earthTexture.map}
          normalMap={earthTexture.normalMap}
          roughnessMap={earthTexture.roughnessMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          metalness={0.1}
          roughness={0.8}
          clearcoat={0.1}
          clearcoatRoughness={0.4}
          envMapIntensity={0.4}
        />
      </mesh>
      
      {/* Clouds layer */}
      <Clouds radius={radius} />
      
      {/* Atmosphere glow */}
      <Atmosphere radius={radius} />

      {/* Location marker */}
      {selectedLocation && (
        <WeatherMarker 
          lat={selectedLocation.lat} 
          lon={selectedLocation.lon} 
          radius={radius * 1.01} 
        />
      )}
    </group>
  );
}

interface SatelliteProps {
  initialPosition: [number, number, number];
  orbitSpeed?: number;
  orbitRadius?: number;
  orbitInclination?: number;
  type?: 'weather' | 'communication' | 'navigation';
}

function Satellite({ 
  initialPosition, 
  orbitSpeed = 0.5, 
  orbitRadius = 4,
  orbitInclination = 0,
  type = 'weather'
}: SatelliteProps) {
  const satelliteRef = useRef<THREE.Group>(null);
  const scale = 0.04; // Make satellites much smaller relative to Earth

  useFrame(({ clock }) => {
    if (satelliteRef.current) {
      const time = clock.getElapsedTime() * orbitSpeed;
      
      // Calculate position with orbital inclination
      const x = Math.cos(time) * orbitRadius;
      const y = Math.sin(time) * Math.sin(orbitInclination) * orbitRadius;
      const z = Math.sin(time) * Math.cos(orbitInclination) * orbitRadius;
      
      satelliteRef.current.position.set(x, y, z);
      satelliteRef.current.rotation.y = time;
      
      // Make satellite always face the direction of movement
      const tangent = new THREE.Vector3(-Math.sin(time), 0, Math.cos(time));
      satelliteRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(1, 0, 0),
        tangent.normalize()
      );
    }
  });

  const getSatelliteColors = () => {
    switch (type) {
      case 'weather':
        return { body: '#dddddd', panels: '#1155aa' };
      case 'communication':
        return { body: '#cccccc', panels: '#22aa22' };
      case 'navigation':
        return { body: '#bbbbbb', panels: '#aa5511' };
      default:
        return { body: '#dddddd', panels: '#1155aa' };
    }
  };

  const colors = getSatelliteColors();

  return (
    <group ref={satelliteRef}>
      {/* Main body */}
      <mesh scale={[scale * 2, scale, scale]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={colors.body}
          metalness={0.9}
          roughness={0.4}
        />
      </mesh>
      
      {/* Solar panels */}
      <group position={[scale * 1.2, 0, 0]}>
        <mesh scale={[scale * 0.1, scale * 3, scale * 1]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={colors.panels}
            metalness={0.8} 
            roughness={0.2}
          />
        </mesh>
      </group>
      <group position={[-scale * 1.2, 0, 0]}>
        <mesh scale={[scale * 0.1, scale * 3, scale * 1]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={colors.panels}
            metalness={0.8} 
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Antenna */}
      <mesh position={[0, scale * 0.7, 0]} scale={[scale * 0.1, scale * 0.4, scale * 0.1]}>
        <cylinderGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colors.body} metalness={0.9} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Sun() {
  return (
    <mesh position={[50, 30, 50]}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshBasicMaterial color="#ffdd99" />
      <pointLight 
        intensity={2} 
        distance={200} 
        decay={1}
      />
    </mesh>
  );
}

export function Scene3D() {
  const { selectedLocation } = useWeatherStore();

  // Calculate initial camera position based on selected location
  const getCameraPosition = (): [number, number, number] => {
    if (selectedLocation) {
      const { lat, lon } = selectedLocation;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(8 * Math.sin(phi) * Math.cos(theta));
      const y = 8 * Math.cos(phi);
      const z = 8 * Math.sin(phi) * Math.sin(theta);
      return [x, y, z];
    }
    return [0, 0, 8];
  };

  // Define different satellite orbits
  const satellites = [
    // Weather satellites in polar orbit
    { pos: [4, 0, 0], speed: 0.4, radius: 3, inclination: Math.PI / 2, type: 'weather' },
    { pos: [4, 0, 0], speed: 0.4, radius: 3, inclination: -Math.PI / 2, type: 'weather' },
    { pos: [-4, 0, 0], speed: 0.4, radius: 3.2, inclination: Math.PI / 2, type: 'weather' },
    
    // Communication satellites in geosynchronous orbit
    { pos: [5, 0, 0], speed: 0.2, radius: 4, inclination: 0.1, type: 'communication' },
    { pos: [-5, 0, 0], speed: 0.2, radius: 4, inclination: -0.1, type: 'communication' },
    { pos: [0, 0, 5], speed: 0.2, radius: 4.2, inclination: 0.2, type: 'communication' },
    
    // Navigation satellites in medium orbit
    { pos: [3.5, 0, 0], speed: 0.3, radius: 3.5, inclination: Math.PI / 4, type: 'navigation' },
    { pos: [-3.5, 0, 0], speed: 0.3, radius: 3.5, inclination: -Math.PI / 4, type: 'navigation' },
    { pos: [0, 0, 3.5], speed: 0.3, radius: 3.7, inclination: Math.PI / 3, type: 'navigation' },
    { pos: [0, 0, -3.5], speed: 0.3, radius: 3.7, inclination: -Math.PI / 3, type: 'navigation' },
  ];

  return (
    <Canvas 
      camera={{ position: getCameraPosition(), fov: 45 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#000011']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[50, 30, 50]} 
        intensity={1.5}
        castShadow
      />
      
      {/* Environment lighting */}
      <hemisphereLight 
        color="#aaaaff"
        groundColor="#000033" 
        intensity={0.3} 
      />
      
      {/* Controls */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={true}
        minDistance={4}
        maxDistance={20}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
      
      {/* Scene Objects */}
      <Stars 
        radius={100} 
        depth={50} 
        count={7000} 
        factor={4} 
        saturation={0.5} 
        fade 
        speed={1} 
      />
      <Sun />
      <Earth />
      
      {/* Render all satellites */}
      {satellites.map((sat, index) => (
        <Satellite
          key={index}
          initialPosition={sat.pos as [number, number, number]}
          orbitSpeed={sat.speed}
          orbitRadius={sat.radius}
          orbitInclination={sat.inclination}
          type={sat.type as 'weather' | 'communication' | 'navigation'}
        />
      ))}
    </Canvas>
  );
} 