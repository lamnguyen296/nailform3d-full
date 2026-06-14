// Original 3D Nail Configurator - preserved at route /3d-configurator
// Paste original App.jsx content (the React Three Fiber 3D editor) here.
// The original code was in nailform3d/src/App.jsx before migration.

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows, Line, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { useAuth } from "./context/AuthContext";
import ModelIcon from "./components/ModelIcon";

const GLOBAL_CSS = `
  .hscroll{overflow-x:auto;overflow-y:hidden;}
  .hscroll::-webkit-scrollbar{display:none;}
  .hscroll{-ms-overflow-style:none;scrollbar-width:none;}
  .swatch-btn{flex-shrink:0;width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;position:relative;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.3s ease,outline 0.2s ease;box-shadow:inset 0 -3px 6px rgba(0,0,0,0.25),inset 0 2px 4px rgba(255,255,255,0.2),0 2px 6px rgba(0,0,0,0.2);}
  .swatch-btn:hover{transform:scale(1.15);}
  .swatch-btn.active{transform:scale(1.4)!important;outline:3px solid #fff;outline-offset:2px;box-shadow:inset 0 -3px 6px rgba(0,0,0,0.25),inset 0 2px 4px rgba(255,255,255,0.2),0 0 0 5px rgba(255,255,255,0.35),0 0 18px rgba(255,255,255,0.5);z-index:10;}
  .swatch-wrap{position:relative;padding:6px;flex-shrink:0;}
  .pro-badge{position:absolute;bottom:4px;right:4px;font-size:6px;font-weight:800;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:1px 3px;border-radius:3px;pointer-events:none;letter-spacing:0.3px;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);}
`;
if (typeof document !== "undefined") {
  const tag = document.getElementById("nf-global-css") || document.createElement("style");
  tag.id = "nf-global-css"; tag.textContent = GLOBAL_CSS; document.head.appendChild(tag);
}

function hslToHex(h,s,l){s/=100;l/=100;const a=s*Math.min(l,1-l);const f=n=>{const k=(n+h/30)%12;const c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,"0");};return`#${f(0)}${f(8)}${f(4)}`;}
const ROWS=5,COLS=6;
function isPro(row,col){if(row===0)return true;if(row===ROWS-1)return true;if(col===COLS-1)return true;return false;}
const FAMILIES=[
  {name:"Nude",dot:"#E8C5A0",h:25,sMin:8,sMax:42,lMax:95,lMin:40},
  {name:"Pink",dot:"#F4A7B9",h:345,sMin:30,sMax:92,lMax:94,lMin:34},
  {name:"Red",dot:"#E53935",h:0,sMin:50,sMax:100,lMax:90,lMin:10},
  {name:"Coral",dot:"#FF7043",h:16,sMin:52,sMax:100,lMax:88,lMin:16},
  {name:"Orange",dot:"#FFA726",h:32,sMin:58,sMax:100,lMax:88,lMin:18},
  {name:"Purple",dot:"#AB47BC",h:280,sMin:25,sMax:86,lMax:92,lMin:16},
  {name:"Blue",dot:"#42A5F5",h:220,sMin:32,sMax:88,lMax:92,lMin:16},
  {name:"Teal",dot:"#26C6DA",h:185,sMin:30,sMax:80,lMax:90,lMin:16},
  {name:"Green",dot:"#66BB6A",h:128,sMin:26,sMax:80,lMax:90,lMin:16},
  {name:"Brown",dot:"#8D6E63",h:20,sMin:20,sMax:58,lMax:52,lMin:6},
];
function generatePalette() {
  return FAMILIES.map((fam, fi) => ({
    ...fam,
    index: fi,
    colors: Array.from({ length: ROWS }, (_, row) =>
      Array.from({ length: COLS }, (_, col) => {
        const lPct = row / (ROWS - 1);
        const sPct = col / (COLS - 1);
        const l = fam.lMax - lPct * (fam.lMax - fam.lMin);
        const s = fam.sMin + sPct * (fam.sMax - fam.sMin);
        return {
          id: `${fi}_${row}_${col}`,
          hex: hslToHex(fam.h, s, l),
          pro: isPro(row, col)
        };
      })
    ).flat()
  }));
}
const PALETTE_FAMILIES = generatePalette();
const SKIN_TONES=[{id:"s1",hex:"#FDDBB4",label:"Porcelain"},{id:"s2",hex:"#F5C28A",label:"Ivory"},{id:"s3",hex:"#E8A96A",label:"Sand"},{id:"s4",hex:"#C8834A",label:"Caramel"},{id:"s5",hex:"#9B5E33",label:"Mocha"},{id:"s6",hex:"#5C3317",label:"Espresso"}];
const CATEGORIES=["Gender","Hand skin","Base Style","Base color","Ombre","Chrome","Cateye","Sticker","Charm","Stone"];
const STICKERS=["Apple.glb","Ballon.glb","Butterfly.glb","Round Heart.glb","Heart Gem.glb","Diamond Gem.glb","Navette Gem.glb","Triangle Gem.glb","Teardrop Gem.glb","Polygon.glb","Square Gem.glb","Star.glb","Thunder.glb","Water Gem.glb"];
const STONES=["Jewelry Type 1.glb","Jewelry Type 2.glb","Jewelry Type 3.glb","Jewelry Type 4.glb","Jewelry Type 5.glb","Jewelry Type 6.glb","Jewelry Type 7.glb","Jewelry Type 8.glb","Jewelry Type 9.glb","Assher.glb","Baguette.glb","Cushion.glb","Emrald.glb","Heart.glb","Marguise.glb","Oval.glb","Pearl.glb","Princess.glb","Radiant.glb","Round.glb","Trillion.glb"];
const CHARMS=["Charm Type 1.glb","Charm Type 2.glb","Charm Type 3.glb","Charm Type 4.glb","Cross 1.glb","Cross 2.glb","Edge Cross.glb","Gloss FL.glb","Round GL.glb","Torus Gloss.glb","Umm.glb","Flower Accessory.glb"];
function applyColorToScene(scene,hex){if(!scene)return;const color=new THREE.Color(hex);scene.traverse(node=>{if(node.isMesh&&node.material){const mats=Array.isArray(node.material)?node.material:[node.material];mats.forEach(m=>{if(m.color){m.color.set(color);m.needsUpdate=true;}});}});}

function EdgeCrossCharm({charmData,isSelected,onSelect}){const{nodes}=useGLTF("/Edge Cross.glb");const meshNode=nodes["Thanh gia left"]||Object.values(nodes).find(n=>n.isMesh);const SF=1.5;return(<group position={charmData.position} rotation={[charmData.rotationX||0,charmData.rotationZ||0,0]} scale={charmData.scale||[SF,SF,SF]}><mesh geometry={meshNode.geometry} position={[0,0.05,0]} onPointerDown={e=>{e.stopPropagation();onSelect(charmData.id);}} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor="pointer";}} onPointerOut={e=>{e.stopPropagation();document.body.style.cursor="auto";}}><meshStandardMaterial color={isSelected?"#ffaa00":"#d4af37"} metalness={isSelected?0.4:0.8} roughness={0.2} emissive={isSelected?"#ff3300":"#000000"} emissiveIntensity={isSelected?0.3:0}/></mesh></group>);}

function HeartCharm({charmData,isSelected,onSelect}){const{nodes}=useGLTF("/Heart.glb");const rawNode=nodes["Sphere.001"]||Object.values(nodes).find(n=>n.isMesh);const centeredGeo=useMemo(()=>{if(!rawNode?.geometry)return null;const geo=rawNode.geometry.clone();geo.center();geo.computeBoundingBox();geo.computeBoundingSphere();return geo;},[rawNode]);const SF=0.13;return(<group position={charmData.position} rotation={[charmData.rotationX||0,charmData.rotationZ||0,0]} scale={charmData.scale||[SF,SF,SF]}><mesh geometry={centeredGeo} position={[0,0.5,0]} onPointerDown={e=>{e.stopPropagation();onSelect(charmData.id);}} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor="pointer";}} onPointerOut={e=>{e.stopPropagation();document.body.style.cursor="auto";}}><meshStandardMaterial color={isSelected?"#ff69b4":"#e91e8c"} metalness={isSelected?0.3:0.7} roughness={0.25} emissive={isSelected?"#ff3366":"#000000"} emissiveIntensity={isSelected?0.35:0}/></mesh></group>);}

function DynamicCharm({ charmData, isSelected, onSelect }) {
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
    <group position={charmData.position} rotation={[charmData.rotationX || 0, charmData.rotationZ || 0, 0]} scale={charmData.scale || [SF, SF, SF]}>
      <mesh 
        geometry={centeredGeo} position={[0, 0.5, 0]} 
        onPointerDown={onSelect ? e => { e.stopPropagation(); onSelect(charmData.id); } : undefined} 
        onPointerOver={onSelect ? e => { e.stopPropagation(); document.body.style.cursor="pointer"; } : undefined} 
        onPointerOut={onSelect ? e => { e.stopPropagation(); document.body.style.cursor="auto"; } : undefined}
      >
        <meshStandardMaterial 
          color={isSelected ? "#ffaa00" : (isStone ? "#e2e8f0" : "#ffffff")} 
          metalness={isSelected ? 0.4 : (isStone ? 0.9 : 0.1)} 
          roughness={isSelected ? 0.2 : (isStone ? 0.1 : 0.6)} 
          emissive={isSelected ? "#ff3300" : "#000000"} 
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
}
function HandSystem({
  activeCharmType, setActiveCharmType,
  placedCharms, setPlacedCharms,
  selectedCharmId, setSelectedCharmId,
  skinColor, baseNailColor,
  activeCategory,
  drawnMarks, setDrawnMarks,
  brushColor, brushSize,
  isDrawing, setIsDrawing,
  canRotate, baseStyle,
  nailEffects
}){
  const handData=useGLTF("/HandIDK_4.glb");
  const nailData=useGLTF(baseStyle || "/nail/NailIDK_4.glb");
  const up=useMemo(()=>new THREE.Vector3(0,1,0),[]);
  const [currentStrokeId, setCurrentStrokeId] = useState(null);

  const sharedUniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state) => {
    sharedUniforms.uTime.value = state.clock.getElapsedTime();
  });

  useEffect(()=>{applyColorToScene(handData.scene,skinColor);},[skinColor,handData.scene]);
  
  useEffect(() => {
    if (!nailData.scene) return;
    const baseColor = new THREE.Color(baseNailColor);
    const ombColor = new THREE.Color(nailEffects.ombreColor);
    const catColor = new THREE.Color(nailEffects.cateyeColor);

    nailData.scene.traverse(node => {
      if (!node.isMesh || !node.material) return;

      // --- 1) Create or reuse a MeshPhysicalMaterial ---
      if (!node.userData.baseMat) {
        node.userData.baseMat = new THREE.MeshPhysicalMaterial();
      }
      const mat = node.userData.baseMat;

      // --- 2) Reset to clean base state ---
      mat.color.copy(baseColor);
      mat.metalness = 0.1;
      mat.roughness = 0.5;
      mat.envMapIntensity = 1;
      mat.map = null;
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0;
      mat.clearcoat = 0;
      mat.clearcoatRoughness = 0;
      mat.ior = 1.5;
      mat.reflectivity = 0.5;
      // Safe noop — Three.js internally calls .toString() on this
      mat.onBeforeCompile = function() {};
      mat.customProgramCacheKey = function() { return 'base'; };
      mat.needsUpdate = true;

      // --- 3) CHROME: mirror-like gel chrome powder effect ---
      if (nailEffects.chrome) {
        mat.metalness = 0.95;
        mat.roughness = 0.05;
        mat.clearcoat = 1.0;
        mat.clearcoatRoughness = 0.0;
        mat.ior = 2.4;
        mat.reflectivity = 1.0;
        mat.envMapIntensity = 5.0;
        // Subtle emissive glow prevents pure black in shadow areas
        // Real chrome powder always has a base color glow
        mat.emissive.copy(baseColor);
        mat.emissiveIntensity = 0.15;
      }

      // --- 4) CATEYE: base material params ---
      if (nailEffects.cateye) {
        mat.clearcoat = 1.0;
        mat.clearcoatRoughness = 0.1;
        mat.roughness = 0.2;
        mat.metalness = 0.8;
      }

      // --- 5) Per-mesh gradient axis for OMBRE ---
      // Find the longest axis of this mesh's bounding box.
      // On a nail, the longest axis = base-to-tip direction.
      let gradientAxis = new THREE.Vector3(0, 1, 0);
      let gradMin = 0, gradMax = 1;
      if (node.geometry) {
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        const bb = node.geometry.boundingBox;
        const size = new THREE.Vector3();
        bb.getSize(size);
        // Pick the axis with the largest extent
        if (size.x >= size.y && size.x >= size.z) {
          gradientAxis.set(1, 0, 0);
        } else if (size.z >= size.x && size.z >= size.y) {
          gradientAxis.set(0, 0, 1);
        } else {
          gradientAxis.set(0, 1, 0);
        }

        // Compute percentile-based range from ACTUAL vertex data
        // This excludes hidden geometry underneath the skin
        const posAttr = node.geometry.attributes.position;
        const vals = [];
        for (let i = 0; i < posAttr.count; i++) {
          vals.push(
            posAttr.getX(i) * gradientAxis.x +
            posAttr.getY(i) * gradientAxis.y +
            posAttr.getZ(i) * gradientAxis.z
          );
        }
        vals.sort((a, b) => a - b);
        // Use 10th and 90th percentile for robust gradient range
        gradMin = vals[Math.floor(vals.length * 0.1)];
        gradMax = vals[Math.floor(vals.length * 0.9)];
      }

      // --- 6) SHADER INJECTION (only when ombre or cateye is active) ---
      if (nailEffects.ombre || nailEffects.cateye) {
        const _gradMin = gradMin;
        const _gradMax = gradMax;
        const _gradientAxis = gradientAxis;

        mat.onBeforeCompile = function(shader) {
          // Uniforms
          shader.uniforms.uTime = sharedUniforms.uTime;
          shader.uniforms.gradMin = { value: _gradMin };
          shader.uniforms.gradMax = { value: _gradMax };
          shader.uniforms.gradientAxis = { value: _gradientAxis };

          if (nailEffects.ombre) {
            shader.uniforms.ombreColor1 = { value: ombColor };
            shader.uniforms.ombreColor2 = { value: baseColor };
          }
          if (nailEffects.cateye) {
            shader.uniforms.catColor = { value: catColor };
          }

          // === VERTEX SHADER ===
          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
            varying vec3 vObjPos;
            varying vec3 vMyNormal;`
          );
          shader.vertexShader = shader.vertexShader.replace(
            '#include <project_vertex>',
            `#include <project_vertex>
            vObjPos = position;
            vMyNormal = normalize(normalMatrix * normal);`
          );

          // === FRAGMENT SHADER: declarations ===
          let fragDecl = `
            varying vec3 vObjPos;
            varying vec3 vMyNormal;
            uniform float uTime;
            uniform float gradMin;
            uniform float gradMax;
            uniform vec3 gradientAxis;
          `;
          if (nailEffects.ombre) {
            fragDecl += `
            uniform vec3 ombreColor1;
            uniform vec3 ombreColor2;`;
          }
          if (nailEffects.cateye) {
            fragDecl += `
            uniform vec3 catColor;`;
          }
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            '#include <common>\n' + fragDecl
          );

          // === FRAGMENT SHADER: color logic (APPENDED after color_fragment) ===
          let colorLogic = '';

          if (nailEffects.ombre) {
            colorLogic += `
              // --- OMBRE: percentile-based gradient (excludes hidden geometry) ---
              float axisPos = dot(vObjPos, gradientAxis);
              float tOmbre = clamp((axisPos - gradMin) / max(gradMax - gradMin, 0.001), 0.0, 1.0);
              diffuseColor.rgb = mix(ombreColor2, ombreColor1, tOmbre);
            `;
          }

          if (nailEffects.cateye) {
            colorLogic += `
              // --- CATEYE: magnetic band via view-space normals ---
              vec3 ceNorm = normalize(vMyNormal);
              float bandPos = ceNorm.x * 0.8 + ceNorm.y * 0.4;
              float bandOffset = sin(uTime * 2.0) * 0.7;
              float band = exp(-pow(bandPos - bandOffset, 2.0) * 30.0);
              diffuseColor.rgb += band * catColor * 1.5;
            `;
          }

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            '#include <color_fragment>\n' + colorLogic
          );
        };

        mat.customProgramCacheKey = function() {
          return 'nail_fx_'
            + (nailEffects.ombre ? '1' : '0')
            + (nailEffects.cateye ? '1' : '0')
            + '_' + ombColor.getHex()
            + '_' + baseColor.getHex()
            + '_' + catColor.getHex()
            + '_' + _gradMin.toFixed(2) + '_' + _gradMax.toFixed(2);
        };
        mat.needsUpdate = true;
      }

      node.material = mat;
    });
  }, [baseNailColor, nailEffects, nailData.scene, sharedUniforms]);

  const handlePointerDown = e => {
    e.stopPropagation();

    if (activeCategory === "Draw" && !canRotate) {
      const id = `stroke_${Date.now()}`;
      setCurrentStrokeId(id);

      const normalMatrix = new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld);
      const n = e.face.normal.clone().applyMatrix3(normalMatrix).normalize();
      const pArr = e.point.clone().add(n.clone().multiplyScalar(0.002)).toArray();

      setDrawnMarks(prev => [
        ...prev,
        {
          id,
          color: brushColor,
          size: brushSize,
          points: [pArr]
        }
      ]);

      setIsDrawing(true);
      return;
    }
    
    if(!activeCharmType){setSelectedCharmId(null);return;}
    const n=e.face.normal.clone().transformDirection(e.object.matrixWorld);
    const q=new THREE.Quaternion().setFromUnitVectors(up,n);
    const id=`charm_${Date.now()}`;
    setPlacedCharms(p=>[...p,{id,type:activeCharmType,position:[e.point.x,e.point.y,e.point.z],quaternion:[q.x,q.y,q.z,q.w],rotationZ:0}]);
    setActiveCharmType(null);
    setSelectedCharmId(id);
  };

  const handlePointerMove = e => {
    if (activeCategory === "Draw" && !canRotate && isDrawing && currentStrokeId) {
      e.stopPropagation();

      const normalMatrix = new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld);
      const n = e.face.normal.clone().applyMatrix3(normalMatrix).normalize();
      const pArr = e.point.clone().add(n.clone().multiplyScalar(0.002)).toArray();

      setDrawnMarks(prev =>
        prev.map(stroke => {
          if (stroke.id !== currentStrokeId) return stroke;

          const last = stroke.points[stroke.points.length - 1];
          const dx = last[0] - pArr[0];
          const dy = last[1] - pArr[1];
          const dz = last[2] - pArr[2];

          const distSq = dx*dx + dy*dy + dz*dz;
          // if (distSq < 0.0001) return stroke; // Removed to prevent dropping points when drawing slowly

          return {
            ...stroke,
            points: [...stroke.points, pArr]
          };
        })
      );
    }
  };

  const handlePointerUp = e => {
    if (activeCategory === "Draw") {
      setIsDrawing(false);
      setCurrentStrokeId(null);
    }
  };

  return(<group><primitive object={handData.scene}/>
    <primitive object={nailData.scene} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerOver={e=>{e.stopPropagation();if(activeCategory==="Draw"&&!canRotate)document.body.style.cursor="crosshair";else if(activeCharmType)document.body.style.cursor="crosshair";}} onPointerOut={e=>{e.stopPropagation();document.body.style.cursor="auto";if(isDrawing){setIsDrawing(false);setCurrentStrokeId(null);}}}/>
    {drawnMarks.map(stroke => (
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
    {placedCharms.map(c=>c.type==="edgecross"?(<EdgeCrossCharm key={c.id} charmData={c} isSelected={selectedCharmId===c.id} onSelect={id=>{setActiveCharmType(null);setSelectedCharmId(id);}}/>):c.type==="heart"?(<HeartCharm key={c.id} charmData={c} isSelected={selectedCharmId===c.id} onSelect={id=>{setActiveCharmType(null);setSelectedCharmId(id);}}/>):(c.type && c.type.startsWith('/'))?(<Suspense key={c.id} fallback={null}><DynamicCharm charmData={c} isSelected={selectedCharmId===c.id} onSelect={id=>{setActiveCharmType(null);setSelectedCharmId(id);}}/></Suspense>):null)}</group>);
}

function ColorFamilyRow({family,baseNailColor,setBaseNailColor,proFilter,userPlan}){const colors=proFilter===null?family.colors:family.colors.filter(c=>c.pro===proFilter);if(colors.length===0)return null;return(<div style={S.familyBlock}><span style={S.familyLabel}>{family.name}</span><div className="hscroll" style={S.hRow}>{colors.map(c=>(<div key={c.id} className="swatch-wrap"><button className={`swatch-btn${baseNailColor===c.hex?" active":""}`} style={{backgroundColor:c.hex,opacity:(c.pro&&userPlan==='FREE')?0.5:1,cursor:(c.pro&&userPlan==='FREE')?"not-allowed":"pointer"}} onClick={()=>{if(c.pro&&userPlan==='FREE'){alert("Vui lòng nâng cấp gói PRO hoặc PREMIUM để sử dụng màu này.");return;}setBaseNailColor(c.hex)}} title={c.hex}/>{c.pro&&<span className="pro-badge" style={{opacity:(c.pro&&userPlan==='FREE')?0.5:1}}>PRO</span>}</div>))}</div></div>);}

function BottomPanel({
  activeCategory, setActiveCategory,
  skinColor, setSkinColor,
  baseNailColor, setBaseNailColor,
  activeCharmType, setActiveCharmType,
  selectedCharmId, setSelectedCharmId,
  placedCharms, setPlacedCharms,
  userPlan,
  drawnMarks, setDrawnMarks,
  brushColor, setBrushColor,
  brushSize, setBrushSize,
  canRotate, setCanRotate,
  baseStyle, setBaseStyle,
  nailEffects, setNailEffects
}){const[proFilter,setProFilter]=useState(null);const selectedCharmData=placedCharms.find(c=>c.id===selectedCharmId);return(<div style={S.panel}><div style={S.pillsOuter}><div style={S.pillsCol}>{CATEGORIES.slice(0,6).map(cat=>(<button key={cat} style={{...S.pill,...(activeCategory===cat?S.pillActive:{})}} onClick={()=>setActiveCategory(activeCategory===cat?null:cat)}>{cat}</button>))}</div><div style={S.pillsCol}>{CATEGORIES.slice(6).map(cat=>(<button key={cat} style={{...S.pill,...(activeCategory===cat?S.pillActive:{})}} onClick={()=>setActiveCategory(activeCategory===cat?null:cat)}>{cat}</button>))}</div></div><div style={S.contentArea}>{activeCategory==="Hand skin"&&(<div style={S.skinRow}>{SKIN_TONES.map(t=>(<button key={t.id} title={t.label} className={`swatch-btn${skinColor===t.hex?" active":""}`} style={{backgroundColor:t.hex,width:44,height:44}} onClick={()=>setSkinColor(t.hex)}/>))}</div>)}{activeCategory==="Base Style"&&(<div style={S.skinRow}>{[{id: "/nail/NailIDK_4.glb", label: "Almond"}, {id: "/nail/R_RSquare_Nails  .glb", label: "Square"}, {id: "/nail/R_Ribbon Nails  .glb", label: "Ribbon"}, {id: "/nail/basicnail.glb", label: "Basic"}].map(style => (<button key={style.id} style={{...S.charmBtn, ...(baseStyle===style.id?S.charmBtnActive:{})}} onClick={()=>setBaseStyle(style.id)}>{style.label}</button>))}</div>)}{activeCategory==="Base color"&&(<div style={S.baseColorWrap}><div style={S.familyRows}>{PALETTE_FAMILIES.map(fam=>(<ColorFamilyRow key={fam.index} family={fam} baseNailColor={baseNailColor} setBaseNailColor={setBaseNailColor} proFilter={proFilter} userPlan={userPlan}/>))}</div><div style={S.colorSidebar}><div style={S.previewCard}><div style={{...S.previewSwatch,backgroundColor:baseNailColor}}/><div style={S.previewInfo}><span style={S.previewHex}>{baseNailColor.toUpperCase()}</span><span style={S.previewTier}>{PALETTE_FAMILIES.flatMap(f=>f.colors).find(c=>c.hex===baseNailColor)?.pro?"✦ PRO":"FREE"}</span></div></div><div style={S.filterGroup}><span style={S.filterLabel}>FILTER</span><div style={S.filterBtns}><button style={{...S.filterPill,...(proFilter===null?S.filterAll:{})}} onClick={()=>setProFilter(null)}>All</button><button style={{...S.filterPill,...(proFilter===false?S.filterFree:{})}} onClick={()=>setProFilter(proFilter===false?null:false)}>Free</button><button style={{...S.filterPill,...(proFilter===true?S.filterPro:{})}} onClick={()=>setProFilter(proFilter===true?null:true)}>✦ Pro</button></div></div><div style={S.statsRow}><span style={S.statChip}>150 Free</span><span style={{...S.statChip,background:"linear-gradient(135deg,#f59e0b44,#ef444433)",color:"#b45309"}}>150 Pro</span></div></div></div>)}

{activeCategory==="Chrome"&&(<div style={S.baseColorWrap}><div style={S.familyRows}>
  <div style={S.drawToolsHeader}>
    <button style={{...S.charmBtn, ...(nailEffects.chrome?S.charmBtnActive:{})}} onClick={()=>setNailEffects({...nailEffects, chrome: !nailEffects.chrome})}>{nailEffects.chrome?"✓ Chrome Enabled":"Enable Chrome"}</button>
  </div>
  {PALETTE_FAMILIES.map(fam=>(<ColorFamilyRow key={fam.index} family={fam} baseNailColor={baseNailColor} setBaseNailColor={setBaseNailColor} proFilter={proFilter} userPlan={userPlan}/>))}
</div></div>)}

{activeCategory==="Ombre"&&(<div style={S.baseColorWrap}><div style={S.familyRows}>
  <div style={S.drawToolsHeader}>
    <button style={{...S.charmBtn, ...(nailEffects.ombre?S.charmBtnActive:{})}} onClick={()=>setNailEffects({...nailEffects, ombre: !nailEffects.ombre})}>{nailEffects.ombre?"✓ Ombre Enabled":"Enable Ombre"}</button>
    <div style={{flex: 1}} />
    <span style={{fontSize: 12, marginRight: 8}}>Ombre Color:</span>
    <input type="color" value={nailEffects.ombreColor} onChange={e=>setNailEffects({...nailEffects, ombreColor: e.target.value})} style={{border:'none', width: 30, height: 30, cursor:'pointer', background:'transparent'}} />
  </div>
  {PALETTE_FAMILIES.map(fam=>(<ColorFamilyRow key={fam.index} family={fam} baseNailColor={baseNailColor} setBaseNailColor={setBaseNailColor} proFilter={proFilter} userPlan={userPlan}/>))}
</div></div>)}

{activeCategory==="Cateye"&&(<div style={S.baseColorWrap}><div style={S.familyRows}>
  <div style={S.drawToolsHeader}>
    <button style={{...S.charmBtn, ...(nailEffects.cateye?S.charmBtnActive:{})}} onClick={()=>setNailEffects({...nailEffects, cateye: !nailEffects.cateye})}>{nailEffects.cateye?"✓ Cateye Enabled":"Enable Cateye"}</button>
    <div style={{flex: 1}} />
    <span style={{fontSize: 12, marginRight: 8}}>Cateye Color:</span>
    <input type="color" value={nailEffects.cateyeColor} onChange={e=>setNailEffects({...nailEffects, cateyeColor: e.target.value})} style={{border:'none', width: 30, height: 30, cursor:'pointer', background:'transparent'}} />
  </div>
  {PALETTE_FAMILIES.map(fam=>(<ColorFamilyRow key={fam.index} family={fam} baseNailColor={baseNailColor} setBaseNailColor={setBaseNailColor} proFilter={proFilter} userPlan={userPlan}/>))}
</div></div>)}

{activeCategory==="Draw"&&(<div style={S.baseColorWrap}><div style={S.familyRows}>
  <div style={S.drawToolsHeader}>
    <button style={{...S.charmBtn, ...(canRotate ? S.charmBtnActive : {})}} onClick={() => setCanRotate(true)}>🔄 Rotate Camera</button>
    <button style={{...S.charmBtn, ...(!canRotate ? S.charmBtnActive : {})}} onClick={() => setCanRotate(false)}>🖌️ Draw Mode</button>
    <div style={{flex: 1}} />
    <span style={S.rotateLabel}>Size: </span>
    <input type="range" min="0.05" max="0.6" step="0.01" value={brushSize} onChange={e => setBrushSize(parseFloat(e.target.value))} style={{...S.slider, width: 100}} />
    <button style={{...S.clearBtn, marginLeft: 10}} disabled={drawnMarks.length === 0} onClick={() => setDrawnMarks([])}>🗑 Clear All ({drawnMarks.length})</button>
  </div>
  {PALETTE_FAMILIES.map(fam=>(<ColorFamilyRow key={fam.index} family={fam} baseNailColor={brushColor} setBaseNailColor={setBrushColor} proFilter={proFilter} userPlan={userPlan}/>))}
</div></div>)}
{activeCategory === "Charm" && (() => {
  const typeCount = activeCharmType ? placedCharms.filter(c => c.type === activeCharmType).length : placedCharms.filter(c => c.type === "edgecross" || c.type === "heart" || c.type?.startsWith("/charm/")).length;
  return (
    <div style={S.charmArea}>
      <div style={{ ...S.charmBtnRow, maxHeight: "100px", overflowY: "auto" }}>
        <button title="Edge Cross (Pro)" style={{ ...S.charmBtn, width: 64, height: 64, padding: 4, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...(activeCharmType === "edgecross" ? S.charmBtnActive : {}), opacity: userPlan === "FREE" ? 0.5 : 1 }} onClick={() => { if (userPlan === "FREE") { alert("Vui lòng nâng cấp gói PRO hoặc PREMIUM để sử dụng phụ kiện Edge Cross."); return; } setActiveCharmType(activeCharmType === "edgecross" ? null : "edgecross") }}><ModelIcon url="/Edge Cross.glb" alt="Edge Cross" /></button>
        <button title="Heart (Pro)" style={{ ...S.charmBtn, width: 64, height: 64, padding: 4, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...(activeCharmType === "heart" ? S.charmBtnActiveHeart : {}), opacity: userPlan === "FREE" ? 0.5 : 1 }} onClick={() => { if (userPlan === "FREE") { alert("Vui lòng nâng cấp gói PRO hoặc PREMIUM để sử dụng phụ kiện Heart."); return; } setActiveCharmType(activeCharmType === "heart" ? null : "heart") }}><ModelIcon url="/Heart.glb" alt="Heart" /></button>
        {activeCharmType && <div style={S.hint}>Click nail to place</div>}
        {CHARMS.map(s => {
          const url = `/charm/${s}`;
          return (
            <button key={s} title={s.replace(".glb", "")} style={{ ...S.charmBtn, width: 64, height: 64, padding: 4, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...(activeCharmType === url ? S.charmBtnActive : {}) }} onClick={() => { setActiveCharmType(activeCharmType === url ? null : url); useGLTF.preload(url); }}><ModelIcon url={url} alt={s.replace(".glb", "")} /></button>
          )
        })}
      </div>
      <div style={{ ...S.selectedCharmPanel, opacity: selectedCharmData ? 1 : 0.38 }}>
        <div style={S.rotateRow}>
          <span style={S.rotateLabel}>Rotation:</span>
          <input type="range" min="0" max={Math.PI * 2} step="0.1" value={selectedCharmData ? selectedCharmData.rotationZ || 0 : 0} onChange={e => { if (!selectedCharmData) return; const val = parseFloat(e.target.value); setPlacedCharms(p => p.map(c => c.id === selectedCharmData.id ? { ...c, rotationZ: val } : c)); }} disabled={!selectedCharmData} style={S.slider} />
        </div>
        <div style={S.charmActionRow}>
          <button style={{ ...S.deleteBtn, opacity: selectedCharmData ? 1 : 0.38, cursor: selectedCharmData ? "pointer" : "default" }} disabled={!selectedCharmData} onClick={() => { if (!selectedCharmData) return; setPlacedCharms(p => p.filter(c => c.id !== selectedCharmData.id)); setSelectedCharmId(null); }}>🗑 Xoá cái này</button>
          <button style={{ ...S.clearBtn, opacity: typeCount > 0 ? 1 : 0.38, cursor: typeCount > 0 ? "pointer" : "default" }} disabled={typeCount === 0} onClick={() => { if (activeCharmType) { setPlacedCharms(p => p.filter(c => c.type !== activeCharmType)); } else { setPlacedCharms(p => p.filter(c => c.type !== "edgecross" && c.type !== "heart" && !c.type?.startsWith("/charm/"))); } setSelectedCharmId(null); }}>
            🗑🗑 Clear all {activeCharmType ? "(" + typeCount + ")" : "(" + placedCharms.filter(c => c.type === "edgecross" || c.type === "heart" || c.type?.startsWith("/charm/")).length + ")"}
          </button>
        </div>
      </div>
    </div>
  );
})()}
{activeCategory === "Sticker" && (() => {
  const typeCount = activeCharmType?.startsWith("/sticker/") ? placedCharms.filter(c => c.type === activeCharmType).length : placedCharms.filter(c => c.type?.startsWith("/sticker/")).length;
  return (
    <div style={S.charmArea}>
      <div style={{ ...S.charmBtnRow, maxHeight: "100px", overflowY: "auto" }}>
        {STICKERS.map(s => {
          const url = `/sticker/${s}`;
          return (
            <button key={s} title={s.replace(".glb", "")} style={{ ...S.charmBtn, width: 64, height: 64, padding: 4, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...(activeCharmType === url ? S.charmBtnActive : {}) }} onClick={() => { setActiveCharmType(activeCharmType === url ? null : url); useGLTF.preload(url); }}><ModelIcon url={url} alt={s.replace(".glb", "")} /></button>
          )
        })}
      </div>
      <div style={{ ...S.selectedCharmPanel, opacity: selectedCharmData ? 1 : 0.38 }}>
        <div style={S.rotateRow}>
          <span style={S.rotateLabel}>Rotation:</span>
          <input type="range" min="0" max={Math.PI * 2} step="0.1" value={selectedCharmData ? selectedCharmData.rotationZ || 0 : 0} onChange={e => { if (!selectedCharmData) return; const val = parseFloat(e.target.value); setPlacedCharms(p => p.map(c => c.id === selectedCharmData.id ? { ...c, rotationZ: val } : c)); }} disabled={!selectedCharmData} style={S.slider} />
        </div>
        <div style={S.charmActionRow}>
          <button style={{ ...S.deleteBtn, opacity: selectedCharmData ? 1 : 0.38, cursor: selectedCharmData ? "pointer" : "default" }} disabled={!selectedCharmData} onClick={() => { if (!selectedCharmData) return; setPlacedCharms(p => p.filter(c => c.id !== selectedCharmData.id)); setSelectedCharmId(null); }}>🗑 Xoá cái này</button>
          <button style={{ ...S.clearBtn, opacity: typeCount > 0 ? 1 : 0.38, cursor: typeCount > 0 ? "pointer" : "default" }} disabled={typeCount === 0} onClick={() => { if (activeCharmType) { setPlacedCharms(p => p.filter(c => c.type !== activeCharmType)); } else { setPlacedCharms(p => p.filter(c => !c.type?.startsWith("/sticker/"))); } setSelectedCharmId(null); }}>
            🗑🗑 Clear all {activeCharmType ? "(" + typeCount + ")" : "(" + placedCharms.filter(c => c.type?.startsWith("/sticker/")).length + ")"}
          </button>
        </div>
      </div>
    </div>
  );
})()}
{activeCategory === "Stone" && (() => {
  const typeCount = activeCharmType?.startsWith("/stone/") ? placedCharms.filter(c => c.type === activeCharmType).length : placedCharms.filter(c => c.type?.startsWith("/stone/")).length;
  return (
    <div style={S.charmArea}>
      <div style={{ ...S.charmBtnRow, maxHeight: "100px", overflowY: "auto" }}>
        {STONES.map(s => {
          const url = `/stone/${s}`;
          return (
            <button key={s} title={s.replace(".glb", "")} style={{ ...S.charmBtn, width: 64, height: 64, padding: 4, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...(activeCharmType === url ? S.charmBtnActive : {}) }} onClick={() => { setActiveCharmType(activeCharmType === url ? null : url); useGLTF.preload(url); }}><ModelIcon url={url} alt={s.replace(".glb", "")} /></button>
          )
        })}
      </div>
      <div style={{ ...S.selectedCharmPanel, opacity: selectedCharmData ? 1 : 0.38 }}>
        <div style={S.rotateRow}>
          <span style={S.rotateLabel}>Rotation:</span>
          <input type="range" min="0" max={Math.PI * 2} step="0.1" value={selectedCharmData ? selectedCharmData.rotationZ || 0 : 0} onChange={e => { if (!selectedCharmData) return; const val = parseFloat(e.target.value); setPlacedCharms(p => p.map(c => c.id === selectedCharmData.id ? { ...c, rotationZ: val } : c)); }} disabled={!selectedCharmData} style={S.slider} />
        </div>
        <div style={S.charmActionRow}>
          <button style={{ ...S.deleteBtn, opacity: selectedCharmData ? 1 : 0.38, cursor: selectedCharmData ? "pointer" : "default" }} disabled={!selectedCharmData} onClick={() => { if (!selectedCharmData) return; setPlacedCharms(p => p.filter(c => c.id !== selectedCharmData.id)); setSelectedCharmId(null); }}>🗑 Xoá cái này</button>
          <button style={{ ...S.clearBtn, opacity: typeCount > 0 ? 1 : 0.38, cursor: typeCount > 0 ? "pointer" : "default" }} disabled={typeCount === 0} onClick={() => { if (activeCharmType) { setPlacedCharms(p => p.filter(c => c.type !== activeCharmType)); } else { setPlacedCharms(p => p.filter(c => !c.type?.startsWith("/stone/"))); } setSelectedCharmId(null); }}>
            🗑🗑 Clear all {activeCharmType ? "(" + typeCount + ")" : "(" + placedCharms.filter(c => c.type?.startsWith("/stone/")).length + ")"}
          </button>
        </div>
      </div>
    </div>
  );
})()}
{!activeCategory&&<div style={S.placeholder}>Select a category to begin</div>}{activeCategory&&!["Hand skin","Base Style","Base color","Charm","Sticker","Stone","Draw","Chrome","Ombre","Cateye"].includes(activeCategory)&&(<div style={S.placeholder}>✨ {activeCategory} — Coming soon</div>)}</div></div>);}

export default function NailConfigurator(){
  const navigate=useNavigate();const{user}=useAuth();const userPlan=user?.plan||"FREE";
  const[activeCategory,setActiveCategory]=useState("Base color");
  const[skinColor,setSkinColor]=useState("#FDDBB4");
  const[baseNailColor,setBaseNailColor]=useState(PALETTE_FAMILIES[2].colors[8].hex);
  const[activeCharmType,setActiveCharmType]=useState(null);
  const[placedCharms,setPlacedCharms]=useState([]);
  const[selectedCharmId,setSelectedCharmId]=useState(null);
  
  const[drawnMarks,setDrawnMarks]=useState([]);
  const[brushColor,setBrushColor]=useState("#ffffff");
  const[brushSize,setBrushSize]=useState(0.15);
  const[isDrawing,setIsDrawing]=useState(false);
  const[canRotate,setCanRotate]=useState(false);
  const[baseStyle,setBaseStyle]=useState("/nail/NailIDK_4.glb");
  const [nailEffects, setNailEffects] = useState({
     ombre: false,
     ombreColor: "#ffffff",
     chrome: false,
     cateye: false,
     cateyeColor: "#00ffff"
  });

  const handleApplyDesign=()=>{
    const token = localStorage.getItem('token');if (!token) {alert("Please log in to publish your design.");navigate('/login');return;}

    const designData={skinColor,baseNailColor,placedCharms,drawnMarks,baseStyle,nailEffects};
    const canvas=document.querySelector('canvas');let thumbnailBase64=null;
    if(canvas){thumbnailBase64=canvas.toDataURL("image/jpeg",0.8);}
    navigate('/create-request',{state:{designData,thumbnailBase64}});
  };
  return(<div style={S.app}><div style={S.topBar}><button style={S.backBtn} onClick={() => navigate('/')}>←</button><div style={S.fingerPill}>Right Hand {userPlan !== 'FREE' ? `(${userPlan})` : '(Free)'}</div><button style={S.applyBtn} onClick={handleApplyDesign}>↑ Apply Design</button></div><div style={S.canvasWrap}><Canvas gl={{ preserveDrawingBuffer: true }} camera={{position:[0.5,6,-45],fov:35}}><Environment preset="studio"/><ambientLight intensity={0.4}/><directionalLight position={[0,10,-10]} intensity={1.5}/><ContactShadows position={[0,-0.05,0]} opacity={0.6} scale={15} blur={2.5} far={10} color="#000"/><Suspense fallback={null}><HandSystem activeCharmType={activeCharmType} setActiveCharmType={setActiveCharmType} placedCharms={placedCharms} setPlacedCharms={setPlacedCharms} selectedCharmId={selectedCharmId} setSelectedCharmId={setSelectedCharmId} skinColor={skinColor} baseNailColor={baseNailColor} activeCategory={activeCategory} drawnMarks={drawnMarks} setDrawnMarks={setDrawnMarks} brushColor={brushColor} brushSize={brushSize} isDrawing={isDrawing} setIsDrawing={setIsDrawing} canRotate={canRotate} baseStyle={baseStyle} nailEffects={nailEffects} /></Suspense><OrbitControls makeDefault target={[0,0.5,-2]} minPolarAngle={0} maxPolarAngle={Math.PI/1.7} enableDamping dampingFactor={0.05} enabled={activeCategory!=="Draw"||canRotate} enableZoom={true} enablePan={false}/></Canvas></div><BottomPanel activeCategory={activeCategory} setActiveCategory={setActiveCategory} skinColor={skinColor} setSkinColor={setSkinColor} baseNailColor={baseNailColor} setBaseNailColor={setBaseNailColor} activeCharmType={activeCharmType} setActiveCharmType={t=>{setActiveCharmType(t);if(t)setSelectedCharmId(null);}} selectedCharmId={selectedCharmId} placedCharms={placedCharms} setPlacedCharms={setPlacedCharms} setSelectedCharmId={setSelectedCharmId} userPlan={userPlan} drawnMarks={drawnMarks} setDrawnMarks={setDrawnMarks} brushColor={brushColor} setBrushColor={setBrushColor} brushSize={brushSize} setBrushSize={setBrushSize} canRotate={canRotate} setCanRotate={setCanRotate} baseStyle={baseStyle} setBaseStyle={setBaseStyle} nailEffects={nailEffects} setNailEffects={setNailEffects} /></div>);}

useGLTF.preload("/HandIDK_4.glb");useGLTF.preload("/nail/NailIDK_4.glb");useGLTF.preload("/nail/R_RSquare_Nails  .glb");useGLTF.preload("/nail/R_Ribbon Nails  .glb");useGLTF.preload("/nail/basicnail.glb");useGLTF.preload("/Edge Cross.glb");useGLTF.preload("/Heart.glb");

const S={app:{position:"fixed",inset:0,display:"flex",flexDirection:"column",fontFamily:"'Inter','Segoe UI',sans-serif",background:"#dcdcdc",overflow:"hidden"},topBar:{position:"absolute",top:0,left:0,right:0,zIndex:30,display:"flex",alignItems:"center",padding:"12px 20px",gap:12},backBtn:{width:36,height:36,borderRadius:"50%",border:"none",background:"rgba(255,255,255,0.85)",backdropFilter:"blur(8px)",cursor:"pointer",fontSize:16},fingerPill:{padding:"8px 20px",borderRadius:999,background:"linear-gradient(135deg,#a78bfa,#818cf8)",color:"#fff",fontWeight:600,fontSize:14,boxShadow:"0 4px 14px rgba(129,140,248,0.5)"},applyBtn:{marginLeft:"auto",padding:"8px 20px",borderRadius:999,border:"none",background:"linear-gradient(135deg,#a78bfa,#60a5fa)",color:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",boxShadow:"0 4px 14px rgba(129,140,248,0.4)"},canvasWrap:{flex:1,background:"#dcdcdc"},panel:{height:180,minHeight:180,background:"rgba(205,205,215,0.97)",backdropFilter:"blur(16px)",display:"flex",flexDirection:"row",borderTop:"2px solid rgba(255,255,255,0.5)",zIndex:20,boxShadow:"0 -8px 32px rgba(0,0,0,0.12)"},pillsOuter:{display:"flex",flexDirection:"row",gap:4,padding:"10px 8px",borderRight:"1px solid rgba(0,0,0,0.1)",flexShrink:0,alignItems:"flex-start",overflowY:"auto"},pillsCol:{display:"flex",flexDirection:"column",gap:6},pill:{padding:"6px 12px",borderRadius:999,border:"none",background:"rgba(255,255,255,0.65)",color:"#333",fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.18s ease",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",letterSpacing:"0.1px"},pillActive:{background:"linear-gradient(135deg,#a78bfa,#818cf8)",color:"#fff",boxShadow:"0 3px 12px rgba(167,139,250,0.55)",fontWeight:600},contentArea:{flex:1,padding:"14px 18px",overflowY:"auto",overflowX:"hidden",display:"flex",flexDirection:"column",minWidth:0},skinRow:{display:"flex",gap:20,alignItems:"center",padding:"12px 0",flexWrap:"wrap"},baseColorWrap:{display:"flex",flexDirection:"row",gap:0,height:"100%",overflow:"hidden"},familyRows:{flex:1,overflowY:"auto",overflowX:"hidden",display:"flex",flexDirection:"column",gap:4,paddingRight:10,minWidth:0},familyBlock:{display:"flex",flexDirection:"row",alignItems:"center",gap:6,minWidth:0},familyLabel:{fontSize:10,fontWeight:700,color:"rgba(0,0,0,0.38)",width:44,minWidth:44,textAlign:"right",flexShrink:0,letterSpacing:"0.5px",textTransform:"uppercase"},hRow:{display:"flex",flexDirection:"row",alignItems:"center",flex:1},colorSidebar:{width:186,minWidth:186,display:"flex",flexDirection:"column",gap:8,paddingLeft:12,borderLeft:"1px solid rgba(0,0,0,0.1)",justifyContent:"center"},previewCard:{display:"flex",flexDirection:"row",alignItems:"center",gap:8,background:"rgba(255,255,255,0.6)",borderRadius:12,padding:"8px 10px",boxShadow:"0 2px 12px rgba(0,0,0,0.1)"},previewSwatch:{width:40,height:40,borderRadius:10,flexShrink:0,boxShadow:"inset 0 -4px 8px rgba(0,0,0,0.22),inset 0 2px 5px rgba(255,255,255,0.28),0 3px 10px rgba(0,0,0,0.22)"},previewInfo:{display:"flex",flexDirection:"column",gap:4,minWidth:0},previewHex:{fontSize:12,fontWeight:700,color:"#1a1a2e",letterSpacing:"0.6px",fontFamily:"'SF Mono','Fira Code',monospace"},previewTier:{fontSize:11,fontWeight:700,color:"#7c3aed",letterSpacing:"0.5px"},filterGroup:{display:"flex",flexDirection:"column",gap:4},filterLabel:{fontSize:10,fontWeight:700,color:"rgba(0,0,0,0.35)",letterSpacing:"1.2px"},filterBtns:{display:"flex",flexDirection:"row",gap:5},filterPill:{flex:1,padding:"6px 0",borderRadius:999,border:"1px solid rgba(0,0,0,0.12)",background:"rgba(255,255,255,0.6)",color:"#444",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.18s",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"},filterAll:{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"1px solid transparent",boxShadow:"0 2px 8px rgba(99,102,241,0.4)"},filterFree:{background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",border:"1px solid transparent",boxShadow:"0 2px 8px rgba(16,185,129,0.4)"},filterPro:{background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"#fff",border:"1px solid transparent",boxShadow:"0 2px 8px rgba(245,158,11,0.4)"},statsRow:{display:"flex",gap:6},statChip:{flex:1,padding:"5px 0",borderRadius:10,background:"rgba(99,102,241,0.12)",color:"#4f46e5",fontSize:10,fontWeight:700,textAlign:"center",letterSpacing:"0.3px"},charmArea:{display:"flex",flexDirection:"column",gap:10},charmBtnRow:{display:"flex",flexDirection:"row",gap:10,flexWrap:"wrap"},charmBtn:{padding:"10px 22px",borderRadius:999,border:"1px solid rgba(0,0,0,0.15)",background:"rgba(255,255,255,0.65)",color:"#222",fontSize:14,cursor:"pointer",fontWeight:500,transition:"all 0.18s",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"},charmBtnActive:{background:"rgba(212,175,55,0.22)",border:"1px solid #d4af37",boxShadow:"0 0 14px rgba(212,175,55,0.4)"},charmBtnActiveHeart:{background:"rgba(233,30,140,0.15)",border:"1px solid #e91e8c",boxShadow:"0 0 14px rgba(233,30,140,0.35)"},selectedCharmPanel:{display:"flex",flexDirection:"column",gap:8,padding:"10px 14px",background:"rgba(255,255,255,0.5)",borderRadius:12,border:"1px solid rgba(167,139,250,0.3)",boxShadow:"0 2px 10px rgba(0,0,0,0.07)"},rotateRow:{display:"flex",flexDirection:"column",gap:5},rotateLabel:{fontSize:12,color:"#555",fontWeight:500},slider:{width:"100%",accentColor:"#a78bfa",cursor:"pointer"},deleteBtn:{padding:"6px 14px",borderRadius:10,border:"1px solid rgba(220,50,50,0.4)",background:"rgba(255,80,80,0.09)",color:"#c00",fontSize:12,cursor:"pointer",fontWeight:600,transition:"all 0.18s"},charmActionRow:{display:"flex",flexDirection:"row",gap:8,flexWrap:"wrap"},clearBtn:{padding:"7px 16px",borderRadius:10,border:"1px solid rgba(220,50,50,0.3)",background:"rgba(255,100,100,0.07)",color:"#c00",fontSize:12,cursor:"pointer",fontWeight:600},hint:{fontSize:13,color:"#7c3aed",padding:"7px 14px",background:"rgba(167,139,250,0.12)",borderRadius:10,border:"1px solid rgba(167,139,250,0.25)",fontWeight:500},placeholder:{color:"rgba(0,0,0,0.28)",fontSize:14,fontStyle:"italic",textAlign:"center",margin:"auto"},drawToolsHeader: { display: "flex", alignItems: "center", gap: 10, padding: "0 10px 10px 10px", borderBottom: "1px solid rgba(0,0,0,0.1)", marginBottom: 10 }};
