import React, { useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

function applyColor(scene, hex) {
  if (!scene) return;
  const color = new THREE.Color(hex);
  scene.traverse(node => {
    if (node.isMesh && node.material) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach(m => { if (m.color) { m.color.set(color); m.needsUpdate = true; } });
    }
  });
}

function EdgeCrossCharm({ charmData }) {
  const { nodes } = useGLTF('/Edge Cross.glb');
  const meshNode = nodes['Thanh gia left'] || Object.values(nodes).find(n => n.isMesh);
  if (!meshNode) return null;
  return (
    <group position={charmData.position} quaternion={new THREE.Quaternion(...charmData.quaternion)} scale={[1.5, 1.5, 1.5]}>
      <group rotation={[0, charmData.rotationZ || 0, 0]}>
        <mesh geometry={meshNode.geometry} position={[0, 0.05, 0]}>
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function HeartCharm({ charmData }) {
  const { nodes } = useGLTF('/Heart.glb');
  const rawNode = nodes['Sphere.001'] || Object.values(nodes).find(n => n.isMesh);
  const centeredGeo = useMemo(() => {
    if (!rawNode?.geometry) return null;
    const geo = rawNode.geometry.clone();
    geo.center(); geo.computeBoundingBox(); geo.computeBoundingSphere();
    return geo;
  }, [rawNode]);
  if (!centeredGeo) return null;
  return (
    <group position={charmData.position} quaternion={new THREE.Quaternion(...charmData.quaternion)} scale={[0.13, 0.13, 0.13]}>
      <group rotation={[0, charmData.rotationZ || 0, 0]}>
        <mesh geometry={centeredGeo} position={[0, 0.5, 0]}>
          <meshStandardMaterial color="#e91e8c" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

function DynamicCharm({ charmData }) {
  const url = charmData.url || charmData.type;
  const { nodes } = useGLTF(url);
  const rawNode = useMemo(() => Object.values(nodes).find(n => n.isMesh), [nodes]);
  const centeredGeo = useMemo(() => {
    if (!rawNode?.geometry) return null;
    const geo = rawNode.geometry.clone();
    geo.center(); geo.computeBoundingBox(); geo.computeBoundingSphere();
    return geo;
  }, [rawNode]);
  const SF = useMemo(() => {
    if (!centeredGeo) return 1;
    centeredGeo.computeBoundingBox();
    const size = new THREE.Vector3();
    centeredGeo.boundingBox.getSize(size);
    const max = Math.max(size.x, size.y, size.z);
    return max > 0 ? (0.2 / max) : 1; 
  }, [centeredGeo]);
  if (!centeredGeo || !rawNode) return null;
  const isStone = url.includes("stone");
  return (
    <group position={charmData.position} quaternion={new THREE.Quaternion(...charmData.quaternion)} scale={[SF, SF, SF]}>
      <group rotation={[0, charmData.rotationZ || 0, 0]}>
        <mesh geometry={centeredGeo} position={[0, 0.5, 0]}>
          <meshStandardMaterial 
            color={isStone ? "#e2e8f0" : "#ffffff"} 
            metalness={isStone ? 0.9 : 0.1} 
            roughness={isStone ? 0.1 : 0.6} 
          />
        </mesh>
      </group>
    </group>
  );
}

function Scene({ skinColor, baseNailColor, placedCharms, drawnMarks, baseStyle }) {
  const handData = useGLTF('/HandIDK_4.glb');
  const nailData = useGLTF(baseStyle || '/nail/NailIDK_4.glb');

  useEffect(() => { applyColor(handData.scene, skinColor || '#FDDBB4'); }, [skinColor, handData.scene]);
  useEffect(() => { applyColor(nailData.scene, baseNailColor || '#cc3366'); }, [baseNailColor, nailData.scene]);

  return (
    <group>
      <primitive object={handData.scene} />
      <primitive object={nailData.scene} />
      {drawnMarks&&drawnMarks.map(stroke => (
        stroke.points.length > 1 && (
          <Line
            key={stroke.id}
            points={stroke.points}
            color={stroke.color}
            lineWidth={stroke.size * 100}
            segments={false}
          />
        )
      ))}
      {(placedCharms || []).map(c =>
        c.type === 'edgecross' ? <EdgeCrossCharm key={c.id} charmData={c} /> :
        c.type === 'heart' ? <HeartCharm key={c.id} charmData={c} /> :
        (c.type && c.type.startsWith('/')) ? <Suspense key={c.id} fallback={null}><DynamicCharm charmData={c} /></Suspense> : null
      )}
    </group>
  );
}

/**
 * NailViewer3D — Read-only 3D viewer for a saved design.
 * Props:
 *   designDataJson: string (JSON) or object — { skinColor, baseNailColor, placedCharms }
 *   style: optional CSS object for the outer div
 */
export default function NailViewer3D({ designDataJson, style = {} }) {
  const designData = useMemo(() => {
    if (!designDataJson) return null;
    try {
      return typeof designDataJson === 'string' ? JSON.parse(designDataJson) : designDataJson;
    } catch (e) {
      console.error('NailViewer3D: invalid designDataJson', e);
      return null;
    }
  }, [designDataJson]);

  if (!designData) {
    return (
      <div style={{ ...defaultStyle, ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12 }}>
        No 3D design data
      </div>
    );
  }

  return (
    <div style={{ ...defaultStyle, ...style }}>
      <Canvas
        camera={{ position: [0.5, 6, -45], fov: 35 }}
        frameloop="demand"
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
      >
        <Environment preset="studio" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, -10]} intensity={1.5} />
        <ContactShadows position={[0, -0.05, 0]} opacity={0.4} scale={12} blur={2} far={8} color="#000" />
        <Suspense fallback={null}>
          <Scene
            skinColor={designData.skinColor}
            baseNailColor={designData.baseNailColor}
            placedCharms={designData.placedCharms}
            drawnMarks={designData.drawnMarks}
            baseStyle={designData.baseStyle}
          />
        </Suspense>
        {/* OrbitControls — allows rotate, zoom, pan */}
        <OrbitControls
          makeDefault
          target={[0, 0.5, -2]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.7}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}

const defaultStyle = {
  width: '100%',
  height: '100%',
  background: '#dcdcdc',
  borderRadius: 10,
  overflow: 'hidden',
};

useGLTF.preload('/HandIDK_4.glb');
useGLTF.preload('/nail/NailIDK_4.glb');
useGLTF.preload('/nail/R_RSquare_Nails  .glb');
useGLTF.preload('/nail/R_Ribbon Nails  .glb');
useGLTF.preload('/nail/basicnail.glb');
useGLTF.preload('/Edge Cross.glb');
useGLTF.preload('/Heart.glb');
