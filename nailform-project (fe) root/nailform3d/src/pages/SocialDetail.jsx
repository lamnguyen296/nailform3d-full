import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SocialDetail.css';

import React, { Suspense, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// --- 3D Viewer Logic (Read-Only) ---
function applyColorToScene(scene,hex){if(!scene)return;const color=new THREE.Color(hex);scene.traverse(node=>{if(node.isMesh&&node.material){const mats=Array.isArray(node.material)?node.material:[node.material];mats.forEach(m=>{if(m.color){m.color.set(color);m.needsUpdate=true;}});}});}

function EdgeCrossCharm({charmData}){const{nodes}=useGLTF("/Edge Cross.glb");const meshNode=nodes["Thanh gia left"]||Object.values(nodes).find(n=>n.isMesh);const SF=1.5;return(<group position={charmData.position} rotation={[charmData.rotationX||0,charmData.rotationZ||0,0]} scale={charmData.scale||[SF,SF,SF]}><mesh geometry={meshNode.geometry} position={[0,0.05,0]}><meshStandardMaterial color={"#d4af37"} metalness={0.8} roughness={0.2} /></mesh></group>);}

function HeartCharm({charmData}){const{nodes}=useGLTF("/Heart.glb");const rawNode=nodes["Sphere.001"]||Object.values(nodes).find(n=>n.isMesh);const centeredGeo=useMemo(()=>{if(!rawNode?.geometry)return null;const geo=rawNode.geometry.clone();geo.center();geo.computeBoundingBox();geo.computeBoundingSphere();return geo;},[rawNode]);const SF=0.13;return(<group position={charmData.position} rotation={[charmData.rotationX||0,charmData.rotationZ||0,0]} scale={charmData.scale||[SF,SF,SF]}><mesh geometry={centeredGeo} position={[0,0.5,0]}><meshStandardMaterial color={"#e91e8c"} metalness={0.7} roughness={0.25} /></mesh></group>);}

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
    <group position={charmData.position} rotation={[charmData.rotationX || 0, charmData.rotationZ || 0, 0]} scale={charmData.scale || [SF, SF, SF]}>
      <mesh geometry={centeredGeo} position={[0, 0.5, 0]}>
        <meshStandardMaterial 
          color={isStone ? "#e2e8f0" : "#ffffff"} 
          metalness={isStone ? 0.9 : 0.1} 
          roughness={isStone ? 0.1 : 0.6} 
        />
      </mesh>
    </group>
  );
}

function ReadOnlyHand({ placedCharms, skinColor, baseNailColor, baseStyle, nailEffects }){
  const handData=useGLTF("/HandIDK_4.glb");
  const nailData=useGLTF(baseStyle || "/nail/NailIDK_4.glb");
  
  const sharedUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state) => { sharedUniforms.uTime.value = state.clock.getElapsedTime(); });

  useEffect(()=>{applyColorToScene(handData.scene,skinColor);},[skinColor,handData.scene]);
  
  useEffect(() => {
    if (!nailData.scene) return;
    const baseColor = new THREE.Color(baseNailColor);
    const effects = nailEffects || {};
    const ombColor = new THREE.Color(effects.ombreColor || "#ffffff");
    const catColor = new THREE.Color(effects.cateyeColor || "#00ffff");

    nailData.scene.traverse(node => {
      if (!node.isMesh || !node.material) return;

      if (!node.userData.baseMat) {
        node.userData.baseMat = new THREE.MeshPhysicalMaterial();
      }
      const mat = node.userData.baseMat;

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
      mat.onBeforeCompile = function() {};
      mat.customProgramCacheKey = function() { return 'base'; };
      mat.needsUpdate = true;

      if (effects.chrome) {
        mat.metalness = 0.95;
        mat.roughness = 0.05;
        mat.clearcoat = 1.0;
        mat.clearcoatRoughness = 0.0;
        mat.ior = 2.4;
        mat.reflectivity = 1.0;
        mat.envMapIntensity = 5.0;
        mat.emissive.copy(baseColor);
        mat.emissiveIntensity = 0.15;
      }

      if (effects.cateye) {
        mat.clearcoat = 1.0;
        mat.clearcoatRoughness = 0.1;
        mat.roughness = 0.2;
        mat.metalness = 0.8;
      }

      let gradientAxis = new THREE.Vector3(0, 1, 0);
      let gradMin = 0, gradMax = 1;
      if (node.geometry) {
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        const bb = node.geometry.boundingBox;
        const size = new THREE.Vector3();
        bb.getSize(size);
        if (size.x >= size.y && size.x >= size.z) {
          gradientAxis.set(1, 0, 0);
        } else if (size.z >= size.x && size.z >= size.y) {
          gradientAxis.set(0, 0, 1);
        } else {
          gradientAxis.set(0, 1, 0);
        }

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
        gradMin = vals[Math.floor(vals.length * 0.1)];
        gradMax = vals[Math.floor(vals.length * 0.9)];
      }

      if (effects.ombre || effects.cateye) {
        const _gradMin = gradMin;
        const _gradMax = gradMax;
        const _gradientAxis = gradientAxis;

        mat.onBeforeCompile = function(shader) {
          shader.uniforms.uTime = sharedUniforms.uTime;
          shader.uniforms.gradMin = { value: _gradMin };
          shader.uniforms.gradMax = { value: _gradMax };
          shader.uniforms.gradientAxis = { value: _gradientAxis };

          if (effects.ombre) {
            shader.uniforms.ombreColor1 = { value: ombColor };
            shader.uniforms.ombreColor2 = { value: baseColor };
          }
          if (effects.cateye) {
            shader.uniforms.catColor = { value: catColor };
          }

          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>\n            varying vec3 vObjPos;\n            varying vec3 vMyNormal;`
          );
          shader.vertexShader = shader.vertexShader.replace(
            '#include <project_vertex>',
            `#include <project_vertex>\n            vObjPos = position;\n            vMyNormal = normalize(normalMatrix * normal);`
          );

          let fragDecl = `\n            varying vec3 vObjPos;\n            varying vec3 vMyNormal;\n            uniform float uTime;\n            uniform float gradMin;\n            uniform float gradMax;\n            uniform vec3 gradientAxis;\n          `;
          if (effects.ombre) {
            fragDecl += `\n            uniform vec3 ombreColor1;\n            uniform vec3 ombreColor2;`;
          }
          if (effects.cateye) {
            fragDecl += `\n            uniform vec3 catColor;`;
          }
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            '#include <common>\n' + fragDecl
          );

          let colorLogic = '';
          if (effects.ombre) {
            colorLogic += `\n              float axisPos = dot(vObjPos, gradientAxis);\n              float tOmbre = clamp((axisPos - gradMin) / max(gradMax - gradMin, 0.001), 0.0, 1.0);\n              diffuseColor.rgb = mix(ombreColor2, ombreColor1, tOmbre);\n            `;
          }

          if (effects.cateye) {
            colorLogic += `\n              vec3 ceNorm = normalize(vMyNormal);\n              float bandPos = ceNorm.x * 0.8 + ceNorm.y * 0.4;\n              float bandOffset = sin(uTime * 2.0) * 0.7;\n              float band = exp(-pow(bandPos - bandOffset, 2.0) * 30.0);\n              diffuseColor.rgb += band * catColor * 1.5;\n            `;
          }

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            '#include <color_fragment>\n' + colorLogic
          );
        };

        mat.customProgramCacheKey = function() {
          return 'nail_fx_'
            + (effects.ombre ? '1' : '0')
            + (effects.cateye ? '1' : '0')
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
  
  return(
    <group>
      <primitive object={handData.scene}/>
      <primitive object={nailData.scene}/>
      {placedCharms?.map(c=>c.type==="edgecross"?(<EdgeCrossCharm key={c.id} charmData={c} />):c.type==="heart"?(<HeartCharm key={c.id} charmData={c} />):(c.type && c.type.startsWith('/'))?(<Suspense key={c.id} fallback={null}><DynamicCharm charmData={c} /></Suspense>):null)}
    </group>
  );
}
// ---------------------------------

export default function SocialDetail() {
  const location = useLocation();
  const { user } = useAuth();
  const post = location.state?.post;

  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);

  const isSalon = user && (user.role === 'SALON' || user.role === 'ROLE_SALON');

  const handleMakeOffer = async () => {
    if (!isSalon) {
      alert("Only Salons can make offers. Please login as a Salon.");
      return;
    }
    if (!offerPrice || isNaN(offerPrice)) {
      alert("Please enter a valid price");
      return;
    }

    setOfferLoading(true);
    try {
      const token = user?.token;
      const response = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8080/identity'}`}/offers`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
          requestId: post.id,
          price: parseFloat(offerPrice),
          message: offerMessage.trim() || "I can do this for you!"
        })
      });

      if (response.ok) {
        alert("Your offer has been sent to the customer!");
        setOfferPrice("");
        setOfferMessage("");
      } else if (response.status === 401 || response.status === 403) {
        alert("Session expired. Please log in again to send offers.");
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Failed to send offer. Please try again.");
      }
    } catch (error) {
      console.error("Error sending offer:", error);
      alert("Error. Make sure backend is running.");
    } finally {
      setOfferLoading(false);
    }
  };

  if (!post) {
    return <div style={{padding: 50, textAlign: 'center'}}>Post not found. Please select a post from the Social Feed.</div>;
  }

  let parsedDesign = null;
  try {
    parsedDesign = typeof post.designData === 'string' ? JSON.parse(post.designData) : post.designData;
  } catch(e) {
    console.error("Failed to parse design data", e);
  }

  return (
    <div className="socialdetail-page">
      <div className="ambient-shape-1"></div>
      <div className="ambient-shape-2"></div>

      <div className="container">
        <Navbar />

        <div className="detail-section">
          <div className="large-image-box" style={{ background: '#dcdcdc', padding: 0, overflow: 'hidden', position: 'relative' }}>
            {parsedDesign ? (
              <Canvas camera={{position:[0.5,6,-45],fov:35}} style={{width: '100%', height: '100%'}}>
                <Environment preset="studio"/>
                <ambientLight intensity={0.4}/>
                <directionalLight position={[0,10,-10]} intensity={1.5}/>
                <ContactShadows position={[0,-0.05,0]} opacity={0.6} scale={15} blur={2.5} far={10} color="#000"/>
                <Suspense fallback={null}>
                  <ReadOnlyHand placedCharms={parsedDesign.placedCharms} skinColor={parsedDesign.skinColor} baseNailColor={parsedDesign.baseNailColor} baseStyle={parsedDesign.baseStyle} nailEffects={parsedDesign.nailEffects} />
                </Suspense>
                <OrbitControls makeDefault target={[0,0.5,-2]} minPolarAngle={0} maxPolarAngle={Math.PI/1.7} enableDamping dampingFactor={0.05}/>
              </Canvas>
            ) : (
              <img src={post.thumbnailBase64 || post.img} alt="Design" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            )}
            <div style={{position: 'absolute', top: 15, left: 15, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 'bold'}}>
               ✦ Interactive 3D View
            </div>
          </div>

          <div className="detail-content">
            <h1 className="detail-title">Nail Service Request</h1>

            <div className="info-block" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <div className="detail-text" style={{fontSize: 16}}><strong>Location:</strong> {post.location || "N/A"}</div>
              <div className="detail-text" style={{fontSize: 16}}><strong>Notes:</strong> {post.description || "N/A"}</div>
              {parsedDesign && (
                <>
                  <div className="detail-text" style={{fontSize: 16}}><strong>Charms Attached:</strong> {parsedDesign.placedCharms?.length || 0} items</div>
                  <div className="detail-text" style={{display: 'flex', gap: 10, alignItems: 'center', fontSize: 16}}>
                    <strong>Colors:</strong> 
                    <span style={{display: 'inline-block', width: 24, height: 24, background: parsedDesign.skinColor, borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}} title="Skin Color"></span>
                    <span style={{display: 'inline-block', width: 24, height: 24, background: parsedDesign.baseNailColor, borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}} title="Base Color"></span>
                  </div>
                </>
              )}
            </div>

            <div className="status-row" style={{marginTop: 20, padding: '15px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee'}}>
              <div className="status-text" style={{fontWeight: 'bold', color: '#a78bfa'}}>{post.status === 'OPEN' ? 'Waiting for offers...' : post.status}</div>
            </div>

            {isSalon ? (
              <div className="interaction-block" style={{marginTop: 20}}>
                <div className="comment-input-wrapper" style={{display: 'flex', flexDirection: 'column', gap: '10px', background: 'transparent', padding: 0, border: 'none'}}>
                  <input 
                    type="number" 
                    className="comment-input" 
                    placeholder="Offer your price ($)..." 
                    value={offerPrice}
                    onChange={e => setOfferPrice(e.target.value)}
                    style={{width: '100%', boxSizing: 'border-box'}}
                  />
                  <textarea 
                    className="comment-input" 
                    placeholder="Add a message (e.g. I have the exact charms for this!)..." 
                    value={offerMessage}
                    onChange={e => setOfferMessage(e.target.value)}
                    style={{resize: 'none', height: '80px', borderRadius: '12px', padding: '15px', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', border: '1px solid #e2e8f0'}}
                  />
                </div>
                <button 
                  className="btn-chat" 
                  style={{background: 'linear-gradient(135deg, #a78bfa, #818cf8)', marginTop: '15px', width: '100%'}}
                  onClick={handleMakeOffer}
                  disabled={offerLoading}
                >
                  {offerLoading ? "Sending..." : "Make Offer"}
                </button>
              </div>
            ) : (
              <div style={{marginTop: 20, padding: 15, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b'}}>
                {user ? "Only registered Salons can make offers on this request." : "Log in as a Salon to make an offer."}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

useGLTF.preload('/nail/NailIDK_4.glb');
useGLTF.preload('/nail/R_RSquare_Nails  .glb');
useGLTF.preload('/nail/R_Ribbon Nails  .glb');
useGLTF.preload('/nail/basicnail.glb');
