import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let sharedRenderer = null;
let sharedScene = null;
let sharedCamera = null;
const thumbnailCache = {};

function initShared() {
  if (sharedRenderer) return;
  sharedRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  sharedRenderer.setSize(128, 128);
  sharedScene = new THREE.Scene();
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  sharedScene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(10, 10, 10);
  sharedScene.add(directionalLight);
  
  sharedCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  sharedCamera.position.set(0, 0, 4);
}

const loader = new GLTFLoader();

export const generateThumbnail = async (url) => {
  if (thumbnailCache[url]) return thumbnailCache[url];
  initShared();
  
  return new Promise((resolve) => {
    loader.load(url, (gltf) => {
      const model = gltf.scene.clone();
      
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim;
      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));
      
      sharedScene.add(model);
      
      sharedRenderer.render(sharedScene, sharedCamera);
      const dataUrl = sharedRenderer.domElement.toDataURL('image/png');
      
      sharedScene.remove(model);
      
      thumbnailCache[url] = dataUrl;
      resolve(dataUrl);
    }, undefined, (err) => {
      console.error("Error loading model for thumbnail:", err);
      resolve(null);
    });
  });
};

export default function ModelIcon({ url, alt, style, className }) {
  const [imgSrc, setImgSrc] = useState(thumbnailCache[url] || null);

  useEffect(() => {
    let mounted = true;
    if (!imgSrc) {
      generateThumbnail(url).then(src => {
        if (mounted && src) setImgSrc(src);
      });
    }
    return () => { mounted = false; };
  }, [url]);

  if (imgSrc) {
    return <img src={imgSrc} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain', ...style }} className={className} />;
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888', ...style }} className={className}>
      {alt}
    </div>
  );
}
