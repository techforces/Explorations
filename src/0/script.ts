import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

/* Set up */
const perspective = 800;
const canvas = document.getElementById("stage");
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const fov =
  (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
const camera = new THREE.PerspectiveCamera(
  fov,
  window.innerWidth / window.innerHeight,
  1,
  5000
);
camera.position.set(0, 0, perspective);

const controls = new OrbitControls(camera, renderer.domElement);

/* Body */
const planeGeometry = new THREE.PlaneGeometry(900, 500, 1000, 1000);
const planeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    resolution: { value: new THREE.Vector2(1000, 500) },
    amplitude: { value: 10.0 },
    time: { value: performance.now() },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  defines: {
    PR: window.devicePixelRatio.toFixed(1),
  },
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const edges = new THREE.EdgesGeometry(planeGeometry);
const line = new THREE.LineSegments(
  edges,
  new THREE.LineBasicMaterial({ color: 0xff0000 })
);
scene.add(line);

plane.rotation.x = -0.5;
line.rotation.x = -0.5;

/* Rendering */
function update() {
  planeMaterial.uniforms.time.value = performance.now() * 0.01;

  renderer.render(scene, camera);

  requestAnimationFrame(update);
}
update();
