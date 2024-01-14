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

const loader = new THREE.TextureLoader();
let texture;
// load a resource
loader.load(
  // resource URL
  "/table.jpg",

  // onLoad callback
  function (el) {
    // in this example we create the material when the texture is loaded
    texture = el;
    planeMaterial.uniforms.u_image.value = el;
    console.log(texture);
  },

  // onProgress callback currently not supported
  undefined,

  // onError callback
  function (err) {
    console.error("An error happened.");
  }
);

/* Body */
const planeGeometry = new THREE.PlaneGeometry(2000, 2000, 1000, 1000);
const planeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    resolution: { value: new THREE.Vector2(1000, 500) },
    time: { value: performance.now() },
    mu: { value: [] },
    arr_length: { value: 0 },
    u_image: { type: "t", value: texture },
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

let arr = [];
function restart() {
  let val = {
    mu: -5000,
    i: arr.length,
    m: arr.length + 1,
  };
  gsap.to(val, 2, {
    mu: 25000,
    ease: "power1.inOut",
    onStart: () => {
      arr.push(val.mu);
    },
    onUpdate: () => {
      if (val.m < arr.length) {
        val.m = arr.length;
      } else if (val.m != arr.length) {
        val.m = arr.length;
        val.i--;
      }

      // console.log(arr, "m = " + val.m, "i = " + val.i);

      arr[val.i] = val.mu;
      planeMaterial.uniforms.mu.value = arr;
      planeMaterial.uniforms.arr_length.value = arr.length;
    },
    onComplete: () => {
      arr.shift();
      planeMaterial.uniforms.mu.value = arr;
      planeMaterial.uniforms.arr_length.value = arr.length;
      // console.log("complete, " + arr, "m = " + val.m, "i = " + val.i);
    },
  });
}

document.addEventListener("click", () => {
  restart();
});

/* Rendering */
function update() {
  planeMaterial.uniforms.time.value = -performance.now() * 0.5;
  renderer.render(scene, camera);

  requestAnimationFrame(update);
}
update();
