import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";

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
const planeGeometry = new THREE.PlaneGeometry(2000, 2000, 1000, 1000);
const planeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    resolution: { value: new THREE.Vector2(1000, 500) },
    amplitude: { value: 10.0 },
    time: { value: performance.now() },
    mu: { value: -7000 },
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

plane.rotation.x = -0.9;

let val = { mu: -7000, i: 0 };

function restart(i) {
  val.mu = -7000;
  val.i = i;
  const anim = gsap.to(val, 5, {
    mu: 28000,
    ease: "power1.inOut",
    onUpdate: () => {
      console.log("upd: ", val.i, i);
      if (val.i == i) {
        planeMaterial.uniforms.mu.value = val.mu;
      } else {
        val.i = i;
        anim.kill();
      }
    },
    onComplete: () => {
      val.i = i;
    },
  });
}

let int = 0;
setInterval(() => restart(int++), 6000);
// document.addEventListener("keydown", (event) => {
//   if (event.keyCode === 32) {
//     restart(int++);
//     console.log(int);
//     return;
//   }
// });

/* Rendering */
function update() {
  // planeMaterial.uniforms.time.value = performance.now() * 0.01;

  renderer.render(scene, camera);

  requestAnimationFrame(update);
}
update();
