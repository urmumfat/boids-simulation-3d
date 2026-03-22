import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';

const LICZBA_DRAPIEZNIKOW = 3;
const rozmiar_szescianu = 70;

const COL_BLUE = new THREE.Color("#38bdf8");
const COL_GREEN = new THREE.Color("#34d399");
const COL_PREDATOR = new THREE.Color("#ef4444");

const PRZESZKODY = [
  { x: 20, y: 0, z: 0, r: 12 },
  { x: -25, y: 15, z: -30, r: 10 },
  { x: 0, y: -25, z: 15, r: 15 },
  { x: -15, y: 10, z: 25, r: 15 },
];

const dystans3D = (o1, o2) => {
  return Math.sqrt((o1.x - o2.x)**2 + (o1.y - o2.y)**2 + (o1.z - o2.z)**2);
};

const Scene = ({ params, showObstacles, showPredators, showSpecies, count }) => {
  const meshRef = useRef();
  const boidsData = useRef([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const predatorMeshRef = useRef();
  const predatorsData = useRef([]);
  const predatorDummy = useMemo(() => new THREE.Object3D(), []);

  // Geometria
  const boidGeometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.8, 2.5, 8);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  const predatorGeometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(1.5, 4, 8);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  useEffect(() => {
    const newBoids = [];
    for (let i = 0; i < count; i++) {
      newBoids.push({
        x: (Math.random() - 0.5) * rozmiar_szescianu * 2,
        y: (Math.random() - 0.5) * rozmiar_szescianu * 2,
        z: (Math.random() - 0.5) * rozmiar_szescianu * 2,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        vz: Math.random() * 2 - 1,
        species: Math.random() > 0.5 ? 1 : 0,
      });
    }
    boidsData.current = newBoids;

    const newPredators = [];
    for (let i = 0; i < LICZBA_DRAPIEZNIKOW; i++) {
      newPredators.push({
        x: (Math.random() - 0.5) * rozmiar_szescianu,
        y: (Math.random() - 0.5) * rozmiar_szescianu,
        z: (Math.random() - 0.5) * rozmiar_szescianu,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        vz: Math.random() * 2 - 1,
      });
    }
    predatorsData.current = newPredators;

  }, [count]); 

  useFrame(() => {
    if (!meshRef.current) return;
    
    const boids = boidsData.current;
    const predators = predatorsData.current;
    if (boids.length !== count) return;

    const { 
      visualRange, separationFactor, alignmentFactor, cohesionFactor, 
      speedLimit, minSpeed, speedSymulacji = 1 
    } = params;

    for (let i = 0; i < count; i++) {
      let boid = boids[i];
      let centerX = 0, centerY = 0, centerZ = 0;
      let moveX = 0, moveY = 0, moveZ = 0;
      let avgVX = 0, avgVY = 0, avgVZ = 0;
      let fleeX = 0, fleeY = 0, fleeZ = 0;
      let neighbors = 0;

      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const other = boids[j];
        const dist = dystans3D(boid, other);

        if (dist < visualRange) {
          const isSameSpecies = !showSpecies || (boid.species === other.species);

          // Separacja
          if (dist < 5) { 
            moveX += boid.x - other.x;
            moveY += boid.y - other.y;
            moveZ += boid.z - other.z;
          }

          // Spójność i Wyrównanie
          if (isSameSpecies) {
            centerX += other.x;
            centerY += other.y;
            centerZ += other.z;
            avgVX += other.vx;
            avgVY += other.vy;
            avgVZ += other.vz;
            neighbors++;
          }
        }
      }

      // Ucieczka przed drapieżnikiem
      if (showPredators) {
        const fleeRange = 35;
        const fleeFactor = 0.5;
        for (let p = 0; p < LICZBA_DRAPIEZNIKOW; p++) {
            const pred = predators[p];
            const dist = dystans3D(boid, pred);
            if (dist < fleeRange) {
                fleeX += (boid.x - pred.x);
                fleeY += (boid.y - pred.y);
                fleeZ += (boid.z - pred.z);
            }
        }
        boid.vx += fleeX * fleeFactor;
        boid.vy += fleeY * fleeFactor;
        boid.vz += fleeZ * fleeFactor;
      }

      // Aplikacja sił
      if (neighbors > 0) {
        centerX /= neighbors;
        centerY /= neighbors;
        centerZ /= neighbors;
        boid.vx += (centerX - boid.x) * cohesionFactor;
        boid.vy += (centerY - boid.y) * cohesionFactor;
        boid.vz += (centerZ - boid.z) * cohesionFactor;

        avgVX /= neighbors;
        avgVY /= neighbors;
        avgVZ /= neighbors;
        boid.vx += (avgVX - boid.vx) * alignmentFactor;
        boid.vy += (avgVY - boid.vy) * alignmentFactor;
        boid.vz += (avgVZ - boid.vz) * alignmentFactor;
      }

      boid.vx += moveX * separationFactor;
      boid.vy += moveY * separationFactor;
      boid.vz += moveZ * separationFactor;

      // Przeszkody
      if (showObstacles) {
        for (const obs of PRZESZKODY) {
          const dx = boid.x - obs.x;
          const dy = boid.y - obs.y;
          const dz = boid.z - obs.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < obs.r + 5) {
             const force = 0.5;
             boid.vx += (dx / dist) * force;
             boid.vy += (dy / dist) * force;
             boid.vz += (dz / dist) * force;
          }
        }
      }

      checkBounds(boid);
      checkSpeed(boid, minSpeed, speedLimit);

      boid.x += boid.vx * speedSymulacji;
      boid.y += boid.vy * speedSymulacji;
      boid.z += boid.vz * speedSymulacji;

      dummy.position.set(boid.x, boid.y, boid.z);
      dummy.lookAt(boid.x + boid.vx, boid.y + boid.vy, boid.z + boid.vz);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const color = (showSpecies && boid.species === 1) ? COL_GREEN : COL_BLUE;
      meshRef.current.setColorAt(i, color);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;


    // drapieżniki
    if (showPredators && predatorMeshRef.current) {
        const predSpeedLimit = speedLimit * 1.3;
        const huntRange = 60;

        for (let i = 0; i < LICZBA_DRAPIEZNIKOW; i++) {
            let pred = predators[i];
            let targetX = 0, targetY = 0, targetZ = 0;
            let countPred = 0;

            for (let j = 0; j < count; j++) {
                const prey = boids[j];
                const d = dystans3D(pred, prey);
                if (d < huntRange) {
                    targetX += prey.x;
                    targetY += prey.y;
                    targetZ += prey.z;
                    countPred++;
                }
            }

            if (countPred > 0) {
                targetX /= countPred;
                targetY /= countPred;
                targetZ /= countPred;
                const huntFactor = 0.03;
                pred.vx += (targetX - pred.x) * huntFactor;
                pred.vy += (targetY - pred.y) * huntFactor;
                pred.vz += (targetZ - pred.z) * huntFactor;
            }

            checkBounds(pred);
            checkSpeed(pred, minSpeed, predSpeedLimit);

            pred.x += pred.vx * speedSymulacji;
            pred.y += pred.vy * speedSymulacji;
            pred.z += pred.vz * speedSymulacji;

            predatorDummy.position.set(pred.x, pred.y, pred.z);
            predatorDummy.lookAt(pred.x + pred.vx, pred.y + pred.vy, pred.z + pred.vz);
            predatorDummy.updateMatrix();
            predatorMeshRef.current.setMatrixAt(i, predatorDummy.matrix);
        }
        predatorMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Dynamiczna liczba instancji przekazywana w args */}
      <instancedMesh ref={meshRef} args={[null, null, count]} geometry={boidGeometry}>
        <meshStandardMaterial color="white" roughness={0.4} />
      </instancedMesh>

      {showPredators && (
        <instancedMesh ref={predatorMeshRef} args={[null, null, LICZBA_DRAPIEZNIKOW]} geometry={predatorGeometry}>
            <meshStandardMaterial color={COL_PREDATOR} roughness={0.2} emissive="#7f1d1d" />
        </instancedMesh>
      )}
      
      <mesh>
        <boxGeometry args={[rozmiar_szescianu * 2, rozmiar_szescianu * 2, rozmiar_szescianu * 2]} />
        <meshBasicMaterial color="#b47e7e" wireframe transparent opacity={0.3} />
      </mesh>

      {showObstacles && PRZESZKODY.map((obs, index) => (
        <mesh key={index} position={[obs.x, obs.y, obs.z]}>
          <sphereGeometry args={[obs.r, 32, 32]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={0.6} roughness={0.1} />
        </mesh>
      ))}
    </>
  );
};

// Fizyka
const checkBounds = (boid) => {
    const margin = 5;
    const turnFactor = 0.5;
    if (boid.x < -rozmiar_szescianu + margin) boid.vx += turnFactor;
    if (boid.x > rozmiar_szescianu - margin) boid.vx -= turnFactor;
    if (boid.y < -rozmiar_szescianu + margin) boid.vy += turnFactor;
    if (boid.y > rozmiar_szescianu - margin) boid.vy -= turnFactor;
    if (boid.z < -rozmiar_szescianu + margin) boid.vz += turnFactor;
    if (boid.z > rozmiar_szescianu - margin) boid.vz -= turnFactor;
};

const checkSpeed = (boid, min, max) => {
    const speed = Math.sqrt(boid.vx**2 + boid.vy**2 + boid.vz**2);
    if (speed > max) {
      boid.vx = (boid.vx / speed) * max;
      boid.vy = (boid.vy / speed) * max;
      boid.vz = (boid.vz / speed) * max;
    }
    if (speed < min && speed > 0) {
      boid.vx = (boid.vx / speed) * min;
      boid.vy = (boid.vy / speed) * min;
      boid.vz = (boid.vz / speed) * min;
    }
};

const BoidsSimulation3D = () => {
  const [params, setParams] = useState({
    visualRange: 15,
    separationFactor: 0.1,
    alignmentFactor: 0.05,
    cohesionFactor: 0.01,
    speedLimit: 0.8,
    minSpeed: 0.4,
    speedSymulacji: 1.0,
  });

  const [boidCount, setBoidCount] = useState(600);
  
  const [showObstacles, setShowObstacles] = useState(false);
  const [showPredators, setShowPredators] = useState(false);
  const [showSpecies, setShowSpecies] = useState(false);

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleCountChange = (e) => {
    setBoidCount(parseInt(e.target.value, 10));
  };

  return (
    <div className="sim-container">
      
      <div className="controls-overlay">
        <div className="control-item" style={{ width: '100%', marginBottom: '5px', borderBottom: '1px solid #374151', paddingBottom: '5px' }}>
             <label className="control-label" style={{ color: '#38bdf8' }}>LICZBA OSOBNIKÓW: {boidCount}</label>
             <input 
               type="range" 
               className="control-input"
               value={boidCount} 
               min="100" 
               max="2000" 
               step="50" 
               onChange={handleCountChange} 
             />
        </div>

        <Control label="Separacja" name="separationFactor" val={params.separationFactor} min="0" max="0.5" step="0.01" onChange={handleParamChange} />
        <Control label="Wyrównanie" name="alignmentFactor" val={params.alignmentFactor} min="0" max="0.5" step="0.01" onChange={handleParamChange} />
        <Control label="Spójność" name="cohesionFactor" val={params.cohesionFactor} min="0" max="0.1" step="0.001" onChange={handleParamChange} />
        <Control label="Zasięg" name="visualRange" val={params.visualRange} min="5" max="50" step="1" onChange={handleParamChange} />
        <Control label="Prędkość osobników" name="speedLimit" val={params.speedLimit} min="0.5" max="2" step="0.1" onChange={handleParamChange} />
        <Control label="Prędkość symulacji" name="speedSymulacji" val={params.speedSymulacji} min="0.1" max="3" step="0.1" onChange={handleParamChange} />
        
        <div style={{ display: 'flex', gap: '5px', width: '100%', justifyContent: 'center', marginTop: '5px', flexWrap: 'wrap' }}>
            <ToggleButton active={showObstacles} onClick={() => setShowObstacles(!showObstacles)} label="PRZESZKODY" colorOn="#10b981" colorOff="#6b7280" />
            <ToggleButton active={showPredators} onClick={() => setShowPredators(!showPredators)} label="DRAPIEŻNIKI" colorOn="#ef4444" colorOff="#6b7280" />
            <ToggleButton active={showSpecies} onClick={() => setShowSpecies(!showSpecies)} label="GATUNKI" colorOn="#3b82f6" colorOff="#6b7280" />
        </div>
      </div>

      <Canvas camera={{ position: [60, 60, 60], fov: 50 }}>
        <color attach="background" args={['#111827']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <directionalLight position={[0, 20, 10]} intensity={1.5} />
        
        <Scene 
            params={params} 
            showObstacles={showObstacles} 
            showPredators={showPredators} 
            showSpecies={showSpecies}
            count={boidCount} 
        />
        
        <OrbitControls autoRotate autoRotateSpeed={0.5} />
        <Stats />
      </Canvas>
    
    </div>
  );
};

const Control = ({ label, name, val, min, max, step, onChange }) => (
  <div className="control-item">
    <label className="control-label">{label}</label>
    <input type="range" className="control-input" name={name} value={val} min={min} max={max} step={step} onChange={onChange} />
  </div>
);

const ToggleButton = ({ active, onClick, label, colorOn, colorOff }) => (
    <button 
        onClick={onClick}
        style={{
            backgroundColor: active ? colorOn : colorOff,
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            flex: '1 0 30%', 
            minWidth: '80px',
            height: '24px',
            marginBottom: '2px'
        }}
    >
        {active ? `UKRYJ ${label}` : `POKAŻ ${label}`}
    </button>
);

export default BoidsSimulation3D;