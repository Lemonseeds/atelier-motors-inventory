import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { modelFor } from '../lib/vehicleModels.js';
import { VehicleArtwork } from './VehicleArtwork.jsx';

const cameraAngles = {
  front: [5.6, 2.7, 7.6],
  side: [9.5, 1.8, 0.1],
  rear: [-5.6, 2.7, -7.6],
  interior: [3.3, 4.6, 5.5],
};

export function VehicleModel3D({ vehicle, color, view, interior = 0, trim = 0, className = '' }) {
  const mount = useRef(null);
  const instance = useRef(null);
  const [status, setStatus] = useState('loading');
  const model = modelFor(vehicle);

  useEffect(() => {
    if (!model || !mount.current) return;
    if (typeof window.WebGLRenderingContext === 'undefined') {
      setStatus('error');
      return;
    }
    let disposed = false;
    let frame;
    let resize;
    const element = mount.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
    camera.position.set(...cameraAngles.front);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      setStatus('error');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    element.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 5.5;
    controls.maxDistance = 17;
    controls.maxPolarAngle = Math.PI * .69;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x67737c, 2.8));
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(6, 10, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd8e9ff, 2);
    rim.position.set(-6, 6, -6);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 1.2);
    fill.position.set(0, 4, -9);
    scene.add(fill);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(model.file, ({ scene: car }) => {
      if (disposed) return;
      car.traverse((object) => {
        if (!object.isMesh) return;
        object.material = Array.isArray(object.material) ? object.material.map((material) => material.clone()) : object.material.clone();
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          material.userData.originalOpacity = material.opacity;
          material.userData.originalTransparent = material.transparent;
          if (material.color) material.userData.originalColor = material.color.clone();
        }
      });
      const bounds = new THREE.Box3().setFromObject(car);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = 6.7 / Math.max(size.x, size.y, size.z);
      car.position.sub(center);
      const group = new THREE.Group();
      group.scale.setScalar(scale);
      group.rotation.y = model.yaw || 0;
      group.add(car);
      scene.add(group);
      instance.current = { car, scene, camera, controls, renderer, model, group };
      setStatus('ready');
    }, undefined, () => { if (!disposed) setStatus('error'); });

    resize = new ResizeObserver(() => {
      const width = Math.max(1, element.clientWidth);
      const height = Math.max(1, element.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resize.observe(element);
    const tick = () => {
      frame = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === element) element.removeChild(renderer.domElement);
      instance.current = null;
    };
  }, [model?.file]);

  useEffect(() => {
    const current = instance.current;
    if (!current) return;
    current.car.traverse((object) => {
      if (!object.isMesh) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (current.model.paint.includes(material.name) && material.color) {
          material.color.set(color);
          if ('metalness' in material) material.metalness = .56;
          if ('roughness' in material) material.roughness = .23;
          material.needsUpdate = true;
        }
        if (current.model.interior?.includes(material.name) && material.color) {
          material.color.set(interior ? '#d6c8ae' : '#303b43');
          material.needsUpdate = true;
        }
        if (current.model.wheel?.includes(material.name) && material.color) {
          material.color.set(trim ? '#171e24' : '#343d44');
          material.needsUpdate = true;
        }
        if (current.model.performance?.includes(material.name) && material.color) {
          if (trim) material.color.set(current.model.performanceColor || '#b73332');
          else if (material.userData.originalColor) material.color.copy(material.userData.originalColor);
          material.needsUpdate = true;
        }
      }
    });
  }, [color, interior, trim, status]);

  useEffect(() => {
    const current = instance.current;
    if (!current) return;
    const [x, y, z] = cameraAngles[view] || cameraAngles.front;
    current.controls.minDistance = view === 'interior' ? 3.5 : 5.5;
    current.camera.fov = view === 'interior' ? 42 : 33;
    current.camera.updateProjectionMatrix();
    current.camera.position.set(x, y, z);
    current.controls.target.set(0, 0, 0);
    current.car.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      object.visible = !(view === 'interior' && materials.every((material) => current.model.hideForInterior?.includes(material.name)));
      for (const material of materials) {
        if (/glass|window/i.test(material.name)) {
          material.opacity = view === 'interior' ? 0 : material.userData.originalOpacity;
          material.transparent = view === 'interior' ? true : material.userData.originalTransparent;
          material.needsUpdate = true;
        }
      }
    });
    current.controls.update();
  }, [view, status]);

  if (!model) return <VehicleArtwork vehicle={vehicle} color={color} view={view} className={className}/>;
  return <div className={`vehicle-3d ${className}`} role="img" aria-label={`${vehicle.make} ${vehicle.model}, ${view} view`}>
    <div ref={mount} className="vehicle-3d-canvas"/>
    {status !== 'ready' && <div className="vehicle-3d-fallback" aria-hidden="true"><VehicleArtwork vehicle={vehicle} color={color} view={view} className="w-full h-full"/></div>}
  </div>;
}
