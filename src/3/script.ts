import * as THREE from "three";
import gsap from "gsap";

import data from "./data.js";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

import { CustomEase } from "gsap/all";

/* Set up */
const perspective = 800;
const canvas = document.getElementById("stage");
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});

let cover = document.getElementsByClassName("cover")[0];
gsap.registerPlugin(CustomEase);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const fov =
  (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
const camera = new THREE.PerspectiveCamera(
  fov,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 0, perspective);

let planes = [[], [], []];
let textures: any[] = [];
let materials: any[] = [];

const planeGeometry = new THREE.PlaneGeometry(150, 200, 1000, 1000);
const width = 150;
const height = 200;
const gap = window.innerWidth / 100;
const gapY = 60;
const marginX = (window.innerWidth - (10 * width + 9 * gap)) / 2;
const marginY = (window.innerHeight - (3 * height + 2 * gapY)) / 2;

const manager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(manager);
manager.onStart = function () {};
manager.onError = function () {};
manager.onProgress = function () {};
manager.onLoad = function () {
  setTimeout(createPlanes, 100);
};

let imgIndex = 0;
function loadImage(i) {
  if (i < data.length) {
    loader.load(
      data[i].src,
      (el: any) => {
        textures.push(el);
        imgIndex++;
        loadImage(imgIndex);
      },
      undefined,
      function () {
        loadImage(imgIndex);
      }
    );
  }
}
loadImage(imgIndex);
loader.load();

function createPlanes() {
  for (let i = 0; i < data.length; i++) {
    const imageRatio = textures[i].image.width / textures[i].image.height;
    const planeRatio = width / height;
    const planeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        resolution: { value: new THREE.Vector2(1000, 500) },
        time: { value: performance.now() },
        mu: { value: [] },
        arr_length: { value: 0 },
        u_image: { type: "t", value: textures[i] },
        imageRatio: { value: imageRatio },
        planeRatio: { value: planeRatio },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      defines: {
        PR: window.devicePixelRatio.toFixed(1),
      },
    });

    materials.push(planeMaterial);

    const plane = new THREE.Mesh(planeGeometry, materials[i]);
    const row = data[i].row - 1;
    const pos = data[i].pos - 1;

    planes[row].push(plane);
    const lastElem = planes[row].length - 1;
    scene.add(planes[row][planes[row].length - 1]);

    // Update userData
    planes[row][lastElem].userData.row = row;
    planes[row][lastElem].userData.pos = pos;

    // Set positions
    // planes[row][lastElem].position.x += marginX + pos * (width + gap) + 75;
    // planes[row][lastElem].position.y -=
    //   marginY + row * (height + gapY) + height / 2;

    planes[row][lastElem].position.x = window.innerWidth / 2 + i * 10;
    planes[row][lastElem].position.y = -window.innerHeight / 2;
  }

  setup();
}

function transitionPlanes() {
  for (let i = 0; i < planes.length; i++) {
    for (let j = 0; j < planes[i].length; j++) {
      console.log(planes[i][j]);
      planes[i][j].position.x =
        marginX + planes[i][j].userData.pos * (width + gap) + width / 2;
      const from =
        marginY +
        planes[i][j].userData.row * (height + gapY) +
        height / 2 +
        1000 +
        planes[i][j].userData.pos * 200 +
        planes[i][j].userData.row * 200;
      const to =
        marginY + planes[i][j].userData.row * (height + gapY) + height / 2;

      let val = {
        y: from,
      };
      gsap.to(val, 2, {
        y: to,
        ease: CustomEase.create(
          "custom",
          "M0,0 C0.002,0 0,0 0,0 0.285,1.073 -0.08,0.98 1,1 "
        ),
        onUpdate: () => {
          planes[i][j].position.y = -val.y;
        },
      });
    }
  }
}

// let arr = [];
// function restart() {
//   let val = {
//     mu: -5000,
//     i: arr.length,
//     m: arr.length + 1,
//   };
//   gsap.to(val, 2, {
//     mu: 25000,
//     ease: "power1.inOut",
//     onStart: () => {
//       arr.push(val.mu);
//     },
//     onUpdate: () => {
//       if (val.m < arr.length) {
//         val.m = arr.length;
//       } else if (val.m != arr.length) {
//         val.m = arr.length;
//         val.i--;
//       }

//       arr[val.i] = val.mu;
//       planeMaterial.uniforms.mu.value = arr;
//       planeMaterial.uniforms.arr_length.value = arr.length;
//     },
//     onComplete: () => {
//       arr.shift();
//       planeMaterial.uniforms.mu.value = arr;
//       planeMaterial.uniforms.arr_length.value = arr.length;
//     },
//   });
// }

document.addEventListener("click", () => {
  // restart();
});

camera.position.x += window.innerWidth / 2;
camera.position.y -= window.innerHeight / 2;

/* Rendering */

function setup() {
  renderer.render(scene, camera);
  setTimeout(() => requestAnimationFrame(transition), 100);
}

function transition() {
  console.log(cover);
  cover.style.display = "none";
  transitionPlanes();
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

function update() {
  // planeMaterial.uniforms.time.value = -performance.now() * 0.5;
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}
